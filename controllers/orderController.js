const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');
const factory = require('./handlerFactory');

// Create a new order
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { cartId } = req.session;
  const email = req.user ? req.user.email : req.body.contactEmail;

  // Check if the user has a cart
  if (!cartId) {
    return res.status(400).json({ message: 'Cart not found.' });
  }

  // Find the cart with the provided cartId
  const cart = await Cart.findById(cartId);

  // Check if the cart is empty
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty!' });
  }

  // Calculate the total amount of the order
  const totalPrice = parseFloat(
    cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    )
  ).toFixed(2);

  // STRIPE INTEGRATION
  let line_items = cart.items.map(function (item) {
    console.log(item.product.price.toFixed(2));
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.imageUrl],
        },
        unit_amount: parseInt((item.product.price * 100).toFixed(2)),
      },
      quantity: item.quantity,
    };
  });

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/?totalPrice=${totalPrice}&email=${email}&session_id={CHECKOUT_SESSION_ID}`, //this is temporary and not secure. When preparing for production, use Stripe's webhooks to create a new booking.
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: email,
    client_reference_id: req.session.cartId,
    line_items,
    shipping_address_collection: {
      allowed_countries: ['BA', 'HR', 'RS'],
    },
    mode: 'payment',
  });

  res.status(201).json({ message: 'Order created successfully.', session });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { totalPrice } = req.query;

  if (!totalPrice) return next();

  const userId = req.user ? req.user.id : null;
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  console.log(session);
  const shippingAddress = formatShippingAddress(
    session.customer_details.address
  );
  const contactEmail = session.customer_details.email;
  const paymentStatus = session.payment_status;

  console.log(totalPrice, shippingAddress, contactEmail);

  const cart = await Cart.findById(req.session.cartId);

  // Create the order
  await Order.create({
    user: userId,
    items: cart.items,
    totalPrice,
    shippingAddress,
    contactEmail,
    paymentStatus,
  });

  // Clear the cart after the order is created and set it to inactive
  cart.isActive = false;
  await cart.save();
  delete req.session.cartId;

  res.redirect(req.originalUrl.split('?')[0]);
});

// Get all orders for a user
//exports.getAllOrders = factory.getAll(Order, { path: 'user' });

//Controller function to handle pagination logic
// exports.getAllOrders = async (req, res, next) => {
//   const page = req.query.page ? parseInt(req.query.page, 10) : 1;
//   const pageSize = process.env.PAGE_SIZE; // Define your page size constant

//   try {
//     const totalCount = await Order.countDocuments(); // Get total count of orders

//     const totalPages = Math.ceil(totalCount / pageSize);
//     const skip = (page - 1) * pageSize;

//     const orders = await Order.find()
//       .skip(skip)
//       .limit(pageSize)
//       .populate('user')
//       // Add any other sorting or projection logic if needed
//       .exec();

//     res.json({
//       orders,
//       totalPages,
//       currentPage: page,
//       totalCount,
//     });
//   } catch (err) {
//     // Handle any errors that occur during the process
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

exports.getAllOrders = async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const pageSize = process.env.PAGE_SIZE; // Define your page size constant

  try {
    let query = Order.find();

    // Filtering by status
    const orderStatus = req.query.orderStatus;
    if (orderStatus && orderStatus !== 'all') {
      let orderStatusBool = orderStatus === 'fulfilled' ? true : false;
      query = query.where('fulfilled').equals(orderStatusBool);
    } else if (orderStatus === 'all') {
      // If 'orderStatus' is 'all', do not apply any status filter
      // Clear any previously applied status filters
      query = query.where('fulfilled'); // This condition will match all (true/false)
    }

    // Sorting by date or amount
    const sortBy = req.query.sortBy;
    if (sortBy) {
      const [field, order] = sortBy.split('-');
      query = query.sort({ [field]: order === 'desc' ? -1 : 1 });
    }

    const totalCount = await Order.countDocuments(query); // Get total count of orders based on the query

    const totalPages = Math.ceil(totalCount / pageSize);
    const skip = (page - 1) * pageSize;

    const orders = await query
      .skip(skip)
      .limit(pageSize)
      .populate('user')
      // Add any other projection logic if needed
      .exec();

    res.json({
      orders,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (err) {
    // Handle any errors that occur during the process
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Find orders per user
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { user } = req;

  // Find all orders associated with the user
  const orders = await Order.find({ user: user.id }).populate('items');

  res.status(200).json(orders);
});

exports.getOrdersAfterDate = catchAsync(async (req, res, next) => {
  try {
    const { startDate } = req.query;

    const fromDate = new Date(startDate);

    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const orders = await Order.find({ orderDate: { $gte: fromDate } });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single order by ID
// exports.getOrderById = catchAsync(async (req, res, next) => {
//   // Get order ID from request body
//   const { orderId } = req.body;

//   // Match the order by ID
//   const order = await Order.find({ user: user.id, id: orderId }).populate(
//     'items.product'
//   );

//   res.status(200).json(order);
// });

exports.getOrderById = factory.getOne(Order, 'items.product');

const formatShippingAddress = (shippingDetails) => {
  const address = shippingDetails;
  let addressString = address.line1;

  if (address.line2) {
    addressString += ', ' + address.line2;
  }

  addressString += ', ' + address.postal_code;
  addressString += ', ' + address.city;
  addressString += ', ' + address.country;

  return addressString;
};

// Helper function to get today's date at midnight
const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper function to get tomorrow's date at midnight
const getTomorrowStart = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

// Function to fetch today's orders activity
exports.getTodaysOrdersActivity = async (req, res, next) => {
  try {
    const todayStart = getTodayStart();
    const tomorrowStart = getTomorrowStart();

    const todaysOrders = await Order.find({
      $or: [
        {
          orderDate: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        },
        {
          fulfillmentDate: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        },
      ],
    }).populate({
      path: 'items.product',
      model: 'Product',
      select: 'name', // Adjust if you need more fields from the Product
    });

    // Sending response back to the client
    res.status(200).json({
      status: 'success',
      results: todaysOrders.length,
      data: {
        orders: todaysOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching today's orders:", error);
    // Passing error to Express error handling middleware
    next(error);
  }
};

// Update an order
exports.updateOrder = factory.updateOne(Order);

// Delete an order
exports.deleteOrder = factory.deleteOne(Order);
