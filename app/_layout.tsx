import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SheetProvider, registerSheet } from 'react-native-actions-sheet';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import '../css/global.css';
import { ImagePickerSheet } from './components/ImagePickerSheet';
import { AuthProvider } from './context/auth';

registerSheet('image-picker', ImagePickerSheet);

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                let token;
                if (Platform.OS === 'web') {
                    token = await AsyncStorage.getItem('userToken');
                } else {
                    token = await SecureStore.getItemAsync('userToken');
                }

                const inAuthGroup = segments[0] === 'auth';

                if (!token && !inAuthGroup) {
                    router.replace('/auth/login');
                } else if (token && inAuthGroup) {
                    router.replace('/dashboard');
                }
            } catch (e) {
                console.error("Error al verificar la autenticación:", e);
                router.replace('/auth/login');
            }
        };

        checkAuth();
    }, [segments]);

    return (
        <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
                name="auth/login"
                options={{
                    headerShown: false,
                    presentation: 'fullScreenModal',
                }}
            />
        </Stack>
    );
}

function RootLayoutInner() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView
            style={{
                paddingTop: -insets.top,
                flex: 1,
                backgroundColor: '#FFF',
            }}
        >
            <SheetProvider>
                <AuthProvider>
                    <RootLayoutNav />
                </AuthProvider>
            </SheetProvider>
        </SafeAreaView>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <RootLayoutInner />
        </SafeAreaProvider>
    );
}
