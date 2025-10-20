import config from '../../config';
import axios from 'axios';

const APPLE_SHARED_SECRET = config.APPLE_SHARED_SECRET;

export const verifyReceipt = async (receipt: any, url: any) => {
  try {
    const response = await axios.post(
      url,
      {
        'receipt-data': receipt,
        password: APPLE_SHARED_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
