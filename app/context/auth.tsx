import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../../constants/api';
import api from '../../services/apiClient';
import { useProfileStore } from '../store';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const setProfile = useProfileStore((state) => state.setProfile);
    const clearProfile = useProfileStore((state) => state.logout);

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

                const response = await api.get(API_ENDPOINTS.PROFILE);
                const data = await response.data;

                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading token:', error);
        } finally {
            setIsLoading(false);
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

            if (data.user) {
                console.log(data.user);

                setProfile(data.user);
            }
        } catch (error: any) {
            // console.error('Login error:', error.response.data.message);
            throw error;
        }
    };

    const loginWithGoogle = async (idToken: string) => {
        try {
            const response = await api.post(API_ENDPOINTS.LOGIN_GOOGLE, { id_token: idToken });

            const data = await response.data;
            const userToken = data.access_token;

            if (Platform.OS === 'web') {
                await AsyncStorage.setItem('userToken', userToken);
            } else {
                await SecureStore.setItemAsync('userToken', userToken);
            }

            setToken(userToken);
            setIsAuthenticated(true);

            if (data.user) {
                console.log(data.user);
                setProfile(data.user);
            }
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, password_confirmation: string) => {
        try {
            const response = await api.post(API_ENDPOINTS.REGISTER, { name, email, password, password_confirmation });

            const data = await response.data;
            const userToken = data.access_token;


            if (Platform.OS === 'web') {
                await AsyncStorage.setItem('userToken', userToken);
            } else {
                await SecureStore.setItemAsync('userToken', userToken);
            }

            setToken(userToken);
            setIsAuthenticated(true);

            if (data.user) {
                console.log(data.user);

                setProfile(data.user);
            }
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post(API_ENDPOINTS.LOGOUT);
            if (Platform.OS === 'web') {
                await AsyncStorage.removeItem('userToken')
            } else {
                await SecureStore.deleteItemAsync('userToken');
            }

            setToken(null);
            setIsAuthenticated(false);
            clearProfile();
        } catch (error: any) {
            console.log('Logout error:', error.response.data);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, loginWithGoogle, logout, register }}>
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