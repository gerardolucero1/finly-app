// app/components/pricing/SubscriptionStatusCard.tsx (versión nativa)
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionStatusCardProps {
    subscription?: {
        planName: string;
        icon: string;
        accentColor: string; // Recibimos el color de acento
        endsAt?: string;
        isOnGracePeriod: boolean;
    };
    onManageBilling: () => void;
    onCancel: () => void;
    onResume: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ subscription, onManageBilling, onCancel, onResume }) => {
    if (!subscription) {
        return (
            <View style={[styles.card, styles.noSubscriptionCard]}>
                <View style={[styles.iconContainer, { backgroundColor: '#CBD5E1' }]}>
                    <Text style={styles.icon}>🔒</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.planName}>Sin Plan Activo</Text>
                    <Text style={styles.description}>Elige un plan para desbloquear todo el potencial de la app.</Text>
                </View>
            </View>
        );
    }
    
    return (
        // Usamos un color de fondo sólido en lugar del gradiente
        <View style={[styles.card, { backgroundColor: '#EEF2FF' }]}>
            <View style={styles.header}>
                {/* El ícono ahora usa el color de acento del plan */}
                <View style={[styles.iconContainer, { backgroundColor: subscription.accentColor }]}>
                    <Text style={styles.icon}>{subscription.icon}</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.planName}>Plan {subscription.planName}</Text>
                    {subscription.isOnGracePeriod ? (
                        <View style={[styles.statusBadge, styles.graceBadge]}>
                            <View style={[styles.statusDot, styles.graceDot]} />
                            <Text style={[styles.statusText, styles.graceText]}>Termina el {subscription.endsAt}</Text>
                        </View>
                    ) : (
                        <View style={[styles.statusBadge, styles.activeBadge]}>
                            <View style={[styles.statusDot, styles.activeDot]} />
                            <Text style={[styles.statusText, styles.activeText]}>Suscripción Activa</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={onManageBilling}>
                    <Lucide name="credit-card" size={20} color="#475569" />
                    <Text style={styles.actionButtonText}>Gestionar Facturación</Text>
                </TouchableOpacity>
                {subscription.isOnGracePeriod ? (
                    <TouchableOpacity style={[styles.actionButton, styles.resumeButton]} onPress={onResume}>
                        <Lucide name="refresh-cw" size={20} color="#16A34A" />
                        <Text style={[styles.actionButtonText, {color: '#16A34A'}]}>Reanudar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
                        <Lucide name="x" size={20} color="#DC2626" />
                        <Text style={[styles.actionButtonText, {color: '#DC2626'}]}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// Los estilos no cambian mucho, solo quitamos lo relacionado al gradiente.
const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    noSubscriptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: { 
        fontSize: 32 
    },
    textContainer: { 
        flex: 1, 
        marginLeft: 16 
    },
    planName: { 
        fontSize: 20, 
        fontFamily: 'Inter_700Bold', 
        color: '#1E293B' 
    },
    description: { 
        fontSize: 14, 
        color: '#64748B', 
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 4, 
        paddingHorizontal: 8, 
        borderRadius: 20, 
        marginTop: 8, 
        alignSelf: 'flex-start' 
    },
    statusDot: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        marginRight: 6 
    },
    statusText: { 
        fontSize: 12, 
        fontFamily: 'Inter_500Medium',
    },
    activeBadge: { 
        backgroundColor: '#DCFCE7' 
    },
    activeDot: { 
        backgroundColor: '#22C55E' 
    },
    activeText: { 
        color: '#166534',
    },
    graceBadge: { 
        backgroundColor: '#FEF9C3' 
    },
    graceDot: { 
        backgroundColor: '#F59E0B' 
    },
    graceText: { 
        color: '#854D0E' 
    },
    actionsContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingTop: 16, 
        borderTopWidth: 1, 
        borderTopColor: '#E2E8F0' 
    },
    actionButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 8, 
        borderRadius: 8, 
        gap: 8 
    },
    actionButtonText: { 
        fontSize: 14, 
        fontFamily: 'Inter_500Medium', 
        color: '#475569' 
    },
    cancelButton: { 
        backgroundColor: '#FEE2E2' 
    },
    resumeButton: { 
        backgroundColor: '#DCFCE7' 
    },
});