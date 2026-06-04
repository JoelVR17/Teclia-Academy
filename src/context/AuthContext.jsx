import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api.js';
import { getStoredAvatar, storeAvatar } from '../utils/avatar.js';

const AuthContext = createContext();

const enrichUser = (user) => {
  if (!user) return null;
  const storedAvatar = getStoredAvatar(user.id);
  return {
    ...user,
    avatar_url: user.avatar_url || storedAvatar || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authService
        .getCurrentUser()
        .then((res) => {
          const enriched = enrichUser(res.data.user);
          if (enriched?.avatar_url) {
            storeAvatar(enriched.id, enriched.avatar_url);
          }
          setUser(enriched);
          setError(null);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await authService.login(normalizedEmail, password);
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('lastLoginEmail', normalizedEmail);
      const enriched = enrichUser(res.data.user);
      if (enriched?.avatar_url) {
        storeAvatar(enriched.id, enriched.avatar_url);
      }
      setUser(enriched);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signup = async (email, password, name) => {
    try {
      setError(null);
      const normalizedEmail = email.trim().toLowerCase();
      const res = await authService.signup(normalizedEmail, password, name);
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('lastLoginEmail', normalizedEmail);
      const enriched = enrichUser(res.data.user);
      setUser(enriched);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (name, avatarUrl) => {
    try {
      setError(null);
      const res = await authService.updateProfile(name, avatarUrl);
      const enriched = enrichUser(res.data.user);
      if (enriched?.avatar_url) {
        storeAvatar(enriched.id, enriched.avatar_url);
      }
      setUser(enriched);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Profile update failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
