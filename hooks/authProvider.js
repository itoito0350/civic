import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [modoSimplificado, setModoSimplificado] = useState(false);
  const router = useRouter();

  const login = async (username, password) => {
    try {
      const response = await fetch(`${BASE_URL}:8000/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Credenciales inválidas');

      const data = await response.json();

      await AsyncStorage.setItem('accessToken', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      setAccessToken(data.access);
      setIsAuthenticated(true);

      // Obtener perfil para modoSimplificado
      const profileRes = await fetch(`${BASE_URL}:8000/profile/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (!profileRes.ok) throw new Error('No se pudo obtener perfil');
      const userData = await profileRes.json();

      setModoSimplificado(userData.modo_simplificado === true);

      router.replace('/');
    } catch (error) {
      throw error;
    }
  };

  const refresh = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}:8000/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!res.ok) throw new Error('Error refrescando token');

      const data = await res.json();
      await AsyncStorage.setItem('accessToken', data.access);
      setAccessToken(data.access);
      setIsAuthenticated(true);

      // Actualizar modoSimplificado tras refresh
      const profileRes = await fetch(`${BASE_URL}:8000/profile/`, {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (!profileRes.ok) throw new Error('No se pudo obtener perfil');
      const userData = await profileRes.json();

      setModoSimplificado(userData.modo_simplificado === true);

      return data.access;
    } catch {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      setIsAuthenticated(false);
      setAccessToken(null);
      setModoSimplificado(false);
      router.replace('/auth/login');
      return null;
    }
  };

  const checkAuth = async () => {
    let token = await AsyncStorage.getItem('accessToken');
    if (!token) token = await refresh();

    if (token) {
      try {
        const res = await fetch(`${BASE_URL}:8000/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Token inválido');

        const userData = await res.json();

        setIsAuthenticated(true);
        setAccessToken(token);
        setModoSimplificado(userData.modo_simplificado === true);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        setIsAuthenticated(false);
        setAccessToken(null);
        setModoSimplificado(false);
        router.replace('/auth/login');
      }
    } else {
      setIsAuthenticated(false);
      setAccessToken(null);
      setModoSimplificado(false);
      router.replace('/auth/login');
    }
    setLoading(false);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    setIsAuthenticated(false);
    setAccessToken(null);
    setModoSimplificado(false);
    router.replace('/auth/login');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, login, refresh, logout, loading, modoSimplificado }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};
