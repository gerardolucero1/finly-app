// app/components/pricing/TrustBadges.tsx
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
    icon: any; // Nombre del icono de Lucide
    text: string;
    color: string;
    bgColor: string;
}

const Badge = ({ icon, text, color, bgColor }: BadgeProps) => (
    <View style={styles.badge}>
        {/* Contenedor del icono estilo "TransactionItem" */}
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Lucide name={icon} size={20} color={color} />
        </View>
        <Text style={styles.badgeText}>{text}</Text>
    </View>
);

export const TrustBadges = () => {
    return (
        <View style={styles.container}>
            {/* Título opcional pequeño para dar contexto */}
            <Text style={styles.title}>Tu tranquilidad es primero</Text>

            <View style={styles.badgesWrapper}>
                <Badge
                    icon="shield-check"
                    text="Pagos seguros vía Stripe (SSL)"
                    color="#059669" // Green 600
                    bgColor="#ECFDF5" // Green 50
                />
                <Badge
                    icon="calendar-off"
                    text="Cancela o cambia de plan cuando quieras"
                    color="#2563EB" // Blue 600
                    bgColor="#EFF6FF" // Blue 50
                />
                <Badge
                    icon="headphones"
                    text="Soporte técnico humano 24/7"
                    color="#7C3AED" // Violet 600
                    bgColor="#F5F3FF" // Violet 50
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 30,
        // Eliminamos el borde y fondo blanco para que se integre en el scroll
    },
    title: {
        textAlign: 'center',
        fontSize: 12,
        fontFamily: 'Inter_700Bold',
        color: '#94A3B8', // Slate 400
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    badgesWrapper: {
        gap: 12, // Espacio entre badges
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        // Fondo blanco sutil y redondeado para cada item
        backgroundColor: '#FFFFFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        // Sombra muy suave (estilo Accounts)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    badgeText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium', // Un poco más de peso para legibilidad
        color: '#334155', // Slate 700
        flex: 1, // Para que el texto se ajuste si es largo
    },
});