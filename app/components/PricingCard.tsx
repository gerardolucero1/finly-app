// app/components/pricing/PricingCard.tsx (versión nativa)
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Plan {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    icon: string;
    accentColor: string;
    recommended: boolean;
    price_id: string;
}

interface PricingCardProps {
    plan: Plan;
    isCurrentPlan: boolean;
    isSubscribed: boolean;
    onSelectPlan: (plan: Plan) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isCurrentPlan, isSubscribed, onSelectPlan }) => {
    return (
        <View style={[styles.card, isCurrentPlan && { borderColor: plan.accentColor, borderWidth: 2 }]}>
            {plan.recommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: plan.accentColor }]}>
                    <Lucide name="star" size={14} color="#FFFFFF" />
                    <Text style={styles.recommendedText}>Más Popular</Text>
                </View>
            )}

            <View style={styles.header}>
                {/* El ícono ahora usa un color de fondo sólido */}
                <View style={[styles.iconContainer, { backgroundColor: plan.accentColor }]}>
                    <Text style={styles.icon}>{plan.icon}</Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.description}>{plan.description}</Text>
                </View>
            </View>

            <View style={styles.priceContainer}>
                <Text style={styles.price}>${plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
            </View>

            <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                        <Lucide name="check" size={16} color="#22C55E" />
                        <Text style={styles.featureText}>{feature}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[
                    styles.ctaButton,
                    isCurrentPlan
                        ? styles.ctaDisabled
                        : { backgroundColor: plan.recommended ? plan.accentColor : '#1E293B' }
                ]}
                disabled={isCurrentPlan}
                onPress={() => onSelectPlan(plan)}
            >

                <Text style={[styles.ctaText, isCurrentPlan && styles.ctaTextDisabled]}>
                    {isCurrentPlan ? 'Tu Plan Actual' : (isSubscribed ? `Cambiar a ${plan.name}` : `Comenzar con ${plan.name}`)}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// Los estilos son casi los mismos, solo se simplifican los botones y el ícono
const styles = StyleSheet.create({
    card: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginHorizontal: 10,
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        alignSelf: 'center',
        flexDirection: 'row',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
        gap: 6,
    },
    recommendedText: {
        color: '#FFFFFF',
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: { fontSize: 32 },
    titleContainer: { flex: 1, marginLeft: 16 },
    planName: {
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B'
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 48,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B'
    },
    period: {
        fontSize: 16,
        color: '#64748B',
        marginLeft: 4,
        fontFamily: 'Inter_400Regular',
    },
    featuresContainer: {
        marginBottom: 'auto',
        paddingBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
    },
    featureText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        fontFamily: 'Inter_400Regular',
    },
    ctaButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    ctaDisabled: {
        backgroundColor: '#E2E8F0'
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    ctaTextDisabled: { color: '#94A3B8' },
});