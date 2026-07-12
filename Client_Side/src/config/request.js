import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/api.constants';

// Instance axios cơ bản — không có interceptor xác thực — dùng cho login & refresh-token
// (các endpoint này không yêu cầu access token hợp lệ trong cookie)
const request = axios.create({
  baseURL:         API_BASE_URL,
  timeout:         API_TIMEOUT_MS,
  withCredentials: true, // gửi kèm cookie trong request cross-origin
});

export default request;
