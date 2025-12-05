import { useProfileStore } from '@/app/store';
import { ProfileService } from '@/services/profile';
import { Lucide } from '@react-native-vector-icons/lucide';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function PaymentPortal() {
    const router = useRouter();
    const setProfile = useProfileStore((state) => state.setProfile);

    useEffect(() => {
        const refreshAndRedirect = async () => {
            try {
                console.log('Payment portal - refreshing profile...');
                const updatedProfile = await ProfileService.get();
                setProfile(updatedProfile);
                console.log('Profile refreshed successfully');
            } catch (error) {
                console.error('Error refreshing profile:', error);
            } finally {
                // Redirect to subscription management screen
                router.replace('/(drawer)/edit_suscription');
            }
        };

        refreshAndRedirect();
    }, []);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#4F46E5', '#6366F1', '#818CF8']}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <Lucide name="refresh-ccw" size={80} color="#fff" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>¡Regresando del Portal de Facturación!</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Regresando al menú de suscripción...
                    </Text>

                    {/* Loading Indicator */}
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loadingText}>
                            Regresando al menú de suscripción...
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Inter_700Bold',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        fontFamily: 'Inter_400Regular',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 100,
    },
    loadingText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Inter_500Medium',
    },
});
