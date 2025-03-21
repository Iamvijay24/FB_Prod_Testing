import axios from 'axios';
import { getCookie } from 'cookies-next';
import refreshToken from './refreshToken';

const baseURL = `https://gnm9s3ds17.execute-api.us-east-1.amazonaws.com/dev` ;

export async function makeApiRequest(action, data) {
  const token = getCookie('accessToken');

  data.action = action;

  try {
    const response = await axios({
      baseURL: baseURL, // Use the determined base URL
      method: "POST",
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.message === 'Unauthorized' ||
      error.message === 'Request failed with status code 401'
    ){
      try {
        const newToken = await refreshToken();
        const retryResponse = await axios({
          url: baseURL,
          method: "POST",
          data: data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`
          }
        });
        return retryResponse.data;
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
}