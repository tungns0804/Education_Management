import request from './request';
import { apiClient } from './axiosClient';
import { API_ENDPOINTS } from '../constants/api.constants';

// Unauthenticated calls — use the bare `request` instance (no auth interceptor)
export const requestLogin          = (data) => request.post(API_ENDPOINTS.LOGIN,           data).then((r) => r.data);
export const requestRefreshToken   = ()     => request.get(API_ENDPOINTS.REFRESH_TOKEN)        .then((r) => r.data);
export const requestForgotPassword = (data) => request.post(API_ENDPOINTS.FORGOT_PASSWORD, data).then((r) => r.data);

// Authenticated calls — use `apiClient` (has 401 → auto-refresh interceptor)
export const requestAuth           = ()     => apiClient.get(API_ENDPOINTS.AUTH)                       .then((r) => r.data);
export const requestLogout         = ()     => apiClient.post(API_ENDPOINTS.LOGOUT)                    .then((r) => r.data);
export const requestResetPassword  = (data) => apiClient.post(API_ENDPOINTS.RESET_PASSWORD,  data)     .then((r) => r.data);
export const requestChangePassword = (data) => apiClient.put(API_ENDPOINTS.CHANGE_PASSWORD,  data)     .then((r) => r.data);
