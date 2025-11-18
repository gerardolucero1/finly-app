// app/screens/ManageSubscriptionScreen.tsx
import { PricingCard } from '@/app/components/PricingCard';
import { SubscriptionStatusCard } from '@/app/components/SubscriptionStatusCard';
import { TrustBadges } from '@/app/components/TrustBadges';
import { Profile } from '@/models/profile';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

// Mock de datos, deberías obtenerlos de tu API o tenerlos como constantes
const PLANS = [
    {
        name: 'Básico',
        price: '10',
        period: '/Mes',
        description: 'Ideal para iniciar tu control financiero.',
        features: [ 'Registro ilimitado de Gastos e Ingresos', 'Dashboard financiero básico', 'Gestión de Cuentas', 'Soporte estándar por email' ],
        icon: '🚀',
        accentColor: '#3B82F6',
        recommended: false,
        price_id: 'price_1SLR9U6dZB8Inoh7jLDAgJIu',
    },
    {
        name: 'Premium',
        price: '25',
        period: '/Mes',
        description: 'El más popular para un control avanzado.',
        features: [ 'Todo lo del plan Básico', 'Análisis y reportes detallados', 'Gestión completa de Deudas', 'IA para análisis de tickets', 'Soporte prioritario 24/7' ],
        icon: '⭐',
        accentColor: '#6366F1',
        recommended: true,
        price_id: 'price_1SLREL6dZB8Inoh7YDQn09BA',
    },
    {
        name: 'VIP',
        price: '60',
        period: '/Mes',
        description: 'El mejor valor para una optimización total.',
        features: [ 'Todo lo del plan Premium', 'Generación ilimitada de Estrategias IA', 'Chat con IA para consultas', 'Consultoría financiera mensual', 'Soporte VIP dedicado' ],
        icon: '👑',
        accentColor: '#8B5CF6',
        recommended: false,
        price_id: 'price_1SLRANUAL6dZB8Inoh7XXXXX',
    },
];

export default function ManageSubscriptionScreen() {

    const params = useLocalSearchParams();
    const profile = useMemo(() => {
        if (!params.profile) return null;
        return JSON.parse(params.profile as string) as Profile;
    }, [params.profile]);

    if (!profile) {
        return <Text>Cargando...</Text>;
    }

    const [user, setUser] = useState<Profile>(profile);
    const headerHeight = useHeaderHeight();

    // Lógica para manejar la selección de planes
    const handleSelectPlan = (plan) => {
        Alert.alert(
            `Confirmar cambio a ${plan.name}`,
            `Serás redirigido a Stripe para completar tu suscripción.`,
            [
                { text: 'Cancelar' },
                { text: 'Continuar', onPress: () => console.log('Redirigiendo a Stripe con price_id:', plan.price_id) },
            ]
        );
    };

    const handleCancel = () => Alert.alert('Cancelar Suscripción', 'Serás redirigido para confirmar la cancelación.');
    const handleResume = () => Alert.alert('Reanudar Suscripción', 'Serás redirigido para reanudar tu plan.');
    const handleManageBilling = () => Alert.alert('Gestionar Facturación', 'Serás redirigido al portal de Stripe.');

    const subscription = user.subscription;
    const isSubscribed = subscription?.stripe_status === 'active';
    const isOnGracePeriod = !!subscription?.ends_at;
    const currentPlanPriceId = subscription?.stripe_price;

    const currentPlan = PLANS.find(p => p.price_id === currentPlanPriceId);

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight }]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Suscripción</Text>
                <Text style={styles.subtitle}>Actualiza tu suscripcion desde aquí.</Text>
            </View>
            
            <SubscriptionStatusCard
                subscription={isSubscribed && currentPlan ? {
                    planName: currentPlan.name,
                    icon: currentPlan.icon,
                    accentColor: currentPlan.accentColor,
                    isOnGracePeriod: isOnGracePeriod,
                    endsAt: isOnGracePeriod ? new Date(subscription.ends_at).toLocaleDateString('es-ES') : undefined,
                } : undefined}
                onManageBilling={handleManageBilling}
                onCancel={handleCancel}
                onResume={handleResume}
            />

            <FlatList
                horizontal
                data={PLANS}
                keyExtractor={(item) => item.price_id}
                renderItem={({ item }) => (
                    <PricingCard 
                        plan={item} 
                        isCurrentPlan={item.price_id === currentPlanPriceId}
                        isSubscribed={isSubscribed}
                        onSelectPlan={handleSelectPlan}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContainer}
                snapToInterval={width * 0.90}
                decelerationRate="fast"
            />
            
            <TrustBadges />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
        fontFamily: 'Inter_500Medium',
    },
    carouselContainer: {
        paddingHorizontal: 0,
    },
});