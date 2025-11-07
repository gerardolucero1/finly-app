import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🔹 Interceptor de request: agrega token automáticamente si existe
api.interceptors.request.use(async (config) => {
    let token;
    if (Platform.OS === 'web') {
        token = await AsyncStorage.getItem('userToken');
    } else {
        token = await SecureStore.getItemAsync('userToken');
    }
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 🔹 Interceptor de respuesta: manejo global de errores o sesión expirada
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Token inválido o expirado');
            // Acá podrías forzar logout si querés
        }
        return Promise.reject(error);
    }
);

export default api;
