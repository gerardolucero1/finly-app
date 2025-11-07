import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import '../css/global.css';
import { AuthProvider } from './context/auth'; // Asegúrate que tu contexto se importe correctamente

// Este componente es el núcleo de la navegación y la lógica de autenticación.
function RootLayoutNav() {
    const segments = useSegments(); // Obtiene los segmentos de la URL actual. Ej: ['(tabs)', 'home']
    const router = useRouter();     // Hook de navegación de Expo Router.

    useEffect(() => {
        const checkAuth = async () => {
            try {
                let token;
                if (Platform.OS === 'web') {
                    token = await AsyncStorage.getItem('userToken');
                } else {
                    token = await SecureStore.getItemAsync('userToken');
                }
                
                // Verifica si el usuario está en una ruta de autenticación (ej: /auth/login)
                const inAuthGroup = segments[0] === 'auth';

                // Lógica de redirección:
                if (!token && !inAuthGroup) {
                    // 1. Si NO hay token y el usuario NO está en la pantalla de login,
                    //    lo redirigimos a la pantalla de login.
                    router.replace('/auth/login');
                } else if (token && inAuthGroup) {
                    // 2. Si SÍ hay token y el usuario está intentando acceder al login/registro,
                    //    lo redirigimos a la pantalla principal de la app (dentro de las tabs).
                    router.replace('/dashboard');
                }
            } catch (e) {
                console.error("Error al verificar la autenticación:", e);
                // En caso de error, podría ser buena idea redirigir al login por seguridad.
                router.replace('/auth/login');
            }
        };

        checkAuth();
    }, [segments]); // Se ejecuta cada vez que cambia la ruta de navegación.

    return (
        <Stack>
            {/* Las rutas principales de la app, protegidas. */}
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            
            {/* La ruta de login, que se presenta como un modal. */}
            <Stack.Screen 
                name="auth/login" 
                options={{ 
                  headerShown: false,
                  presentation: 'fullScreenModal'
                }} 
            />
        </Stack>
    );
}

// El layout principal que envuelve toda la app con el proveedor de autenticación.
export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}