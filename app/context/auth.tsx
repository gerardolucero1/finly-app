import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../../constants/api';
import api from '../../services/apiClient';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        loadToken();
    }, []);

    async function loadToken() {
        try {
            let storedToken;

            if (Platform.OS === 'web') {
                storedToken = await AsyncStorage.getItem('userToken');
            } else {
                storedToken = await SecureStore.getItemAsync('userToken');
            }

            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error loading token:', error);
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });

            const data = await response.data;
            const userToken = data.access_token;

            if (Platform.OS === 'web') {
                await AsyncStorage.setItem('userToken', userToken);
            } else {
                await SecureStore.setItemAsync('userToken', userToken);
            }

            setToken(userToken);
            setIsAuthenticated(true);
            router.replace('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (Platform.OS === 'web') {
                await AsyncStorage.removeItem('userToken')
            } else {
                await SecureStore.deleteItemAsync('userToken');
            }
            
            setToken(null);
            setIsAuthenticated(false);
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}