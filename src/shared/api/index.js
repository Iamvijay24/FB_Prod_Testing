import axios from 'axios';
import { getCookie } from 'cookies-next';

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
    )
      throw error;
    // re-throw the error even if it's not 401, for the component to handle
    throw error;
  }
}