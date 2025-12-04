import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './context/auth';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/dashboard');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [isLoading, isAuthenticated]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: '#FFFFFF',
            }}
        >
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}
