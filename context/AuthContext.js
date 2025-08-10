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
    console.log(email)
    console.log(password)
    const res = await API.post('/auth/login', { email, password });
    console.log(res.data)
    const { token, user } = res.data;
    await saveToken(token);
    setUser(user);
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  const register = async ( email, password) => {
    const res = await API.post('/auth/register', { email, password });
    const { token, user } = res.data;
    await saveToken(token);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
