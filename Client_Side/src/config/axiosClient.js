import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL, API_TIMEOUT_MS, API_ENDPOINTS } from '../constants/api.constants';
import { COOKIE_LOGGED, COOKIE_LOGGED_VALUE } from '../constants/storage.constants';

class ApiClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL:         API_BASE_URL,
      timeout:         API_TIMEOUT_MS,
      withCredentials: true, // send cookies on cross-origin requests
    });
    this.isRefreshing = false;
    this.failedQueue  = [];
    this._setupInterceptors();
  }

  _isLoggedIn() {
    // Non-httpOnly cookie set by the server; safe to read from JS
    return Cookies.get(COOKIE_LOGGED) === COOKIE_LOGGED_VALUE;
  }

  _processQueue(error) {
    this.failedQueue.forEach(({ resolve, reject }) =>
      error ? reject(error) : resolve(),
    );
    this.failedQueue = [];
  }

  _handleAuthFailure() {
    Cookies.remove(COOKIE_LOGGED);
    // Redirect to root — App renders <LoginUser> when user is null
    window.location.href = '/';
  }

  _setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          if (!this._isLoggedIn()) {
            this._handleAuthFailure();
            return Promise.reject(error);
          }

          // If a refresh is already in flight, queue this request until it resolves
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.axiosInstance(original))
              .catch((e) => Promise.reject(e));
          }

          original._retry   = true;
          this.isRefreshing = true;

          try {
            await this.axiosInstance.get(API_ENDPOINTS.REFRESH_TOKEN);
            this._processQueue(null);
            return this.axiosInstance(original);
          } catch (err) {
            this._processQueue(err);
            this._handleAuthFailure();
            return Promise.reject(err);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  get(url, config)         { return this.axiosInstance.get(url, config); }
  post(url, data, config)  { return this.axiosInstance.post(url, data, config); }
  put(url, data, config)   { return this.axiosInstance.put(url, data, config); }
  delete(url, config)      { return this.axiosInstance.delete(url, config); }
  patch(url, data, config) { return this.axiosInstance.patch(url, data, config); }
}

export const apiClient = new ApiClient();
