import { Inter_400Regular, Inter_500Medium, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Platform, TextInput } from 'react-native';
import { SheetProvider, registerSheet } from 'react-native-actions-sheet';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import '../css/global.css';
import { ImagePickerSheet } from './components/ImagePickerSheet';
import { AuthProvider } from './context/auth';

registerSheet('image-picker', ImagePickerSheet);

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();

    const [loaded] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    useEffect(() => {
        if (!loaded) return;
        // @ts-ignore
        Text.defaultProps = Text.defaultProps || {};
        // @ts-ignore
        Text.defaultProps.style = { fontFamily: 'Inter_400Regular' };

        // @ts-ignore
        TextInput.defaultProps = TextInput.defaultProps || {};
        // @ts-ignore
        TextInput.defaultProps.style = { fontFamily: 'Inter_400Regular' };

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
                router.replace('/auth/login');
            }
        };

        checkAuth();
    }, [segments, loaded]);

    if (!loaded) return null; // <-- el return va al FINAL de los hooks

    return (
        <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
                name="auth/login"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
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
                    <StripeProvider publishableKey="pk_test_51SLR5b6dZB8Inoh7iIyYyPFmtzg8yVMCPzyLH6iBfFETyyaae2uXosMLs6zd4xJOKJsrzUcfyp0Z574qJXa2LAVy00FTClFY6S">
                        <RootLayoutNav />
                    </StripeProvider>
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
