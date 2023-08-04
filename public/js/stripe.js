/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Nb0sjAq6e22Bm52InkRoy7uY7ajkHCSrpQSiMuwqa6OUSbTCiARIUkkTrdIuRX09JVWMH72heNjdekbgPxH3PUw00fANCc0S1'
);

export const checkoutCart = async () => {
  try {
    // 1) get checkout session from API
    const session = await axios(
      'http://127.0.0.1:3000/api/v1/orders/checkout-session'
    );

    console.log(session);
    // 2) create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
