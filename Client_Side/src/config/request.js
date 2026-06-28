import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api.constants';

// Base instance — no auth interceptor — used for login & refresh-token calls
// (those endpoints don't require a valid access token in the cookie)
const request = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         API_TIMEOUT_MS,
  withCredentials: true, // send cookies on cross-origin requests
});

export default request;
