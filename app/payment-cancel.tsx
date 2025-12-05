import { useProfileStore } from '@/app/store';
import { ProfileService } from '@/services/profile';
import { Lucide } from '@react-native-vector-icons/lucide';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function PaymentCancel() {
    const router = useRouter();
    const setProfile = useProfileStore((state) => state.setProfile);

    useEffect(() => {
        const refreshAndRedirect = async () => {
            try {
                console.log('Payment cancelled - refreshing profile...');
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
                colors={['#64748B', '#94A3B8', '#CBD5E1']}
                style={styles.container}
            >
                <View style={styles.content}>
                    {/* Cancel Icon */}
                    <View style={styles.iconContainer}>
                        <Lucide name="circle-x" size={80} color="#fff" />
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Pago Cancelado</Text>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        No te preocupes, puedes intentarlo de nuevo cuando quieras
                    </Text>

                    {/* Loading Indicator */}
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.loadingText}>
                            Regresando a suscripciones...
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
