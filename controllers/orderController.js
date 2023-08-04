const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const catchAsync = require('../utils/catchAsync');
const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const CartItem = require('../models/cartItemModel');

// Create a new order
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { shippingAddress } = req.body;
  const { user } = req;
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
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const { user } = req;

  // Find all orders associated with the user
  const orders = await Order.find({ user: user.id }).populate('items.product');

  res.status(200).json({ orders });
});

// Get a single order by ID
exports.getOrderById = catchAsync(async (req, res, next) => {
  // Get order ID from request body
  const { orderId } = req.body;

  // Match the order by ID
  const order = await Order.find({ id: orderId });

  res.status(200).json(order);
});

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
