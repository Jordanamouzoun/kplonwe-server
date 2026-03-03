import { asyncHandler } from '../../middlewares/error.middleware.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user.id);
  res.json({ success: true, message: 'Déconnexion réussie' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  res.json({ success: true, data: user });
});

export const acceptTerms = asyncHandler(async (req, res) => {
  await authService.acceptTerms(req.user.id, req.body.version);
  res.json({ success: true, message: 'CGU acceptées' });
});