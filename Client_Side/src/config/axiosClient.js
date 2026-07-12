import axios from 'axios';
import Cookies from 'js-cookie';
import { API_BASE_URL, API_TIMEOUT_MS, API_ENDPOINTS } from '../constants/api.constants';
import { COOKIE_LOGGED, COOKIE_LOGGED_VALUE } from '../constants/storage.constants';

class ApiClient {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL:         API_BASE_URL,
      timeout:         API_TIMEOUT_MS,
      withCredentials: true, // gửi kèm cookie trong request cross-origin
    });
    this.isRefreshing = false;
    this.failedQueue  = [];
    this._setupInterceptors();
  }

  _isLoggedIn() {
    // Cookie không httpOnly do server set; JS đọc được an toàn
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
    // Chuyển về trang gốc — App sẽ hiển thị <LoginUser> khi user là null
    window.location.href = '/';
  }

  _isAccountLocked(error) {
    return (
      error?.response?.status === 403 &&
      error?.response?.data?.errorCode === 'ACCOUNT_LOCKED'
    );
  }

  _handleAccountLocked(message) {
    if (this._lockedOut) return;
    this._lockedOut = true;
    Cookies.remove(COOKIE_LOGGED);
    window.dispatchEvent(
      new CustomEvent('auth:account-locked', {
        detail: { message: message || 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' },
      }),
    );
  }

  _setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config;

        // Tài khoản bị khóa — hiện modal rồi đăng xuất
        if (this._isAccountLocked(error)) {
          this._handleAccountLocked(error.response.data.message);
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !original._retry) {
          if (!this._isLoggedIn()) {
            this._handleAuthFailure();
            return Promise.reject(error);
          }

          // Nếu đang có một lượt refresh token chạy dở, xếp request này vào hàng đợi chờ kết quả
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
            // Refresh token cũng bị từ chối vì tài khoản bị khóa
            if (this._isAccountLocked(err)) {
              this._handleAccountLocked(err.response?.data?.message);
            } else {
              this._handleAuthFailure();
            }
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
