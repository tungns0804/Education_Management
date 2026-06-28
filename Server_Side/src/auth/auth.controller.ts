import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import * as express from 'express';
import {
  COOKIE_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_LOGGED,
  COOKIE_LOGGED_VALUE,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from '../constants/auth.constants';

const isProd = () => process.env.NODE_ENV === 'production';

function buildCookieOptions(maxAgeMs: number, httpOnly: boolean) {
  return {
    httpOnly,
    secure:   isProd(),
    sameSite: isProd() ? ('strict' as const) : ('lax' as const),
    maxAge:   maxAgeMs,
  };
}

function setCookies(res: express.Response, token: string, refreshToken: string) {
  res.cookie(COOKIE_TOKEN,         token,        buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS,  true));
  res.cookie(COOKIE_REFRESH_TOKEN, refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, true));
  // Non-httpOnly: cho phép JavaScript phía client kiểm tra trạng thái đăng nhập mà không lộ token
  res.cookie(COOKIE_LOGGED, COOKIE_LOGGED_VALUE, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, false));
}

@Controller('api/users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { token, refreshToken, user } = await this.authService.login(
      body.email,
      body.password,
    );
    setCookies(res, token, refreshToken);
    return { success: true, message: 'success', metadata: { user } };
  }

  @Get('auth')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: express.Request) {
    const { id } = (req as express.Request & { user: { id: string } }).user;
    const data = await this.authService.getMe(id);
    return { success: true, message: 'success', metadata: data };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const { id } = (req as express.Request & { user: { id: string } }).user;
    await this.authService.logout(id);
    res.clearCookie(COOKIE_TOKEN);
    res.clearCookie(COOKIE_REFRESH_TOKEN);
    res.clearCookie(COOKIE_LOGGED);
    return { success: true, message: 'success' };
  }

  @Get('refresh-token')
  async refreshToken(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const cookies = req.cookies as Record<string, string>;
    const { token } = await this.authService.refreshAccessToken(
      cookies?.[COOKIE_REFRESH_TOKEN],
    );
    res.cookie(COOKIE_TOKEN,  token,              buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS,  true));
    res.cookie(COOKIE_LOGGED, COOKIE_LOGGED_VALUE, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, false));
    return { success: true, message: 'success', metadata: { token } };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    await this.authService.forgotPassword(body.email);
    return { success: true, message: 'OTP đã được gửi tới email của bạn' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    await this.authService.verifyOtp(body.email, body.otp);
    return { success: true, message: 'OTP hợp lệ' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    await this.authService.resetPassword(body.email, body.otp, body.newPassword);
    return { success: true, message: 'Mật khẩu đã được đặt lại thành công' };
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: express.Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const { id } = (req as express.Request & { user: { id: string } }).user;
    await this.authService.changePassword(id, body.currentPassword, body.newPassword);
    return { success: true, message: 'Đổi mật khẩu thành công' };
  }
}
