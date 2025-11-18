// app/components/pricing/TrustBadges.tsx
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Badge = ({ icon, text, color }) => (
    <View style={styles.badge}>
        <Lucide name={icon} size={20} color={color} />
        <Text style={styles.badgeText}>{text}</Text>
    </View>
);

export const TrustBadges = () => {
    return (
        <View style={styles.container}>
            <Badge icon="shield-check" text="Pago seguro con Stripe" color="#22C55E" />
            <Badge icon="info" text="Cancela cuando quieras" color="#3B82F6" />
            <Badge icon="message-circle" text="Soporte 24/7" color="#8B5CF6" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        gap: 12,
    },
    badgeText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#475569',
    },
});