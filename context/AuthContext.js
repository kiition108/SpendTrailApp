import React, { createContext, useEffect, useState } from 'react';
import { getToken, saveToken, removeToken } from '../utils/auth';
import API from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto login if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = await getToken();
      if (token) {
        try {
          const res = await API.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.user);
        } catch (err) {
          console.log('Auto-login failed:', err.message);
          await removeToken();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log(email);
      console.log(password);
      const res = await API.post('/auth/login', { email, password });
      console.log('Login response:', res.data);

      const { token, user } = res.data;

      if (!token) {
        throw new Error('No token received from server. Response: ' + JSON.stringify(res.data));
      }

      if (!user) {
        throw new Error('No user data received from server');
      }

      await saveToken(token);
      setUser(user);

      // Track user in Sentry for error reporting
      if (global.Sentry) {
        global.Sentry.setUser({
          id: user._id || user.id,
          email: user.email,
          username: user.name
        });
      }
    } catch (error) {
      console.log('Login error:', error);

      // Log error to Sentry
      if (global.Sentry) {
        global.Sentry.captureException(error);
      }

      // Return error details for frontend handling
      const errorData = error.response?.data || {};
      throw {
        message: errorData.message || error.message,
        isVerified: errorData.isVerified,
        userId: errorData.userId
      };
    }
  };

  const logout = async () => {
    await removeToken();
    setUser(null);

    // Clear Sentry user context
    if (global.Sentry) {
      global.Sentry.setUser(null);
    }
  };

  const register = async (email, password) => {
    try {
      const res = await API.post('/auth/register', { email, password });

      // If token provided immediately (old flow), login
      if (res.data.token && res.data.user) {
        await saveToken(res.data.token);
        setUser(res.data.user);
        return { success: true, requiresOtp: false };
      }

      // Return userId for OTP verification (works for both new and unverified re-registration)
      return {
        success: true,
        requiresOtp: true,
        userId: res.data.userId || res.data.user?._id
      };
    } catch (error) {
      console.log('Register error:', error);
      const errorData = error.response?.data || {};

      // If already registered but not verified, return userId
      if (errorData.userId) {
        return {
          success: true,
          requiresOtp: true,
          userId: errorData.userId,
          message: errorData.message
        };
      }

      alert('Registration Issue: ' + (errorData.message || error.message));
      return { success: false };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await API.post('/auth/verify-otp', { email, otp });
      const { token, user } = res.data;

      if (token && user) {
        await saveToken(token);
        setUser(user);
        return { success: true };
      }
      return { success: false, message: 'Invalid response' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const resendOtp = async (email) => {
    try {
      await API.post('/auth/resend-otp', { email });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
};
