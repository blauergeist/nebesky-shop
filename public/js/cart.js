import axios from 'axios';
import { showAlert } from './alerts';

export const addToCart = async (productId) => {
  try {
    const data = {};
    await axios
      .post('http://127.0.0.1:3000/api/v1/cart', data, {
        withCredentials: true, // Include credentials (session cookie) in the request
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    // const cartRes = await axios({
    //   method: 'POST',
    //   url: 'http://127.0.0.1:3000/api/v1/cart',
    // });

    // console.log(cartRes);

    await axios
      .post('http://127.0.0.1:3000/api/v1/cartItem', {
        productId,
        quantity: 1,
      })
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
