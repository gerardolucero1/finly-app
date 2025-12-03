import { Inter_400Regular, Inter_500Medium, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';
import { SheetProvider, registerSheet } from 'react-native-actions-sheet';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import '../css/global.css';
import { ImagePickerSheet } from './components/ImagePickerSheet';
import { AuthProvider, useAuth } from './context/auth';

registerSheet('image-picker', ImagePickerSheet);

function RootLayoutNav() {
    const segments = useSegments();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

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

        const inAuthGroup = segments[0] === 'auth';

        if (isLoading) return;

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/auth/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/dashboard');
        }
    }, [segments, loaded, isLoading, isAuthenticated]);

    if (!loaded || isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
                name="auth/login"
                options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
                name="auth/register"
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
