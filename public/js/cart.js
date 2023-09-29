import axios from 'axios';
import { showAlert } from './alerts';

export const addToCart = async (productId) => {
  try {
    await axios
      .post('http://127.0.0.1:3000/api/v1/cartItem', {
        productId,
        quantity: 1,
      })
      .then(function (res) {
        console.log(res);
        if (res.status === 200) {
          showAlert('success', 'Added to cart succesfully!');
        }
      })
      .catch(function (error) {
        showAlert('error', 'Adding to cart failed!');
      });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
