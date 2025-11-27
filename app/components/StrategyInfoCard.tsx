import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Definición de Tipos reducida para el componente
export interface Strategy {
    id: number;
    name: string;
    progress_status: {
        status: 'pending' | 'ahead' | 'on_track' | 'off_track';
        month: number;
        actual_paid: number;
        planned_amount: number;
        drift: number; // Desviación ($)
        needs_recalculation: boolean;
    };
    expected_duration_months: number;
}

type StrategyProps = {
    strategy?: Strategy | null;
    onPress?: (id: number) => void;
    onCreate?: () => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
};

// Configuración visual minimalista
const STATUS_COLORS = {
    'pending': { main: '#F59E0B', bg: '#FFFBEB', label: 'Pendiente' },
    'ahead': { main: '#10B981', bg: '#ECFDF5', label: 'Adelantado' },
    'on_track': { main: '#3B82F6', bg: '#EFF6FF', label: 'Al día' },
    'off_track': { main: '#EF4444', bg: '#FEF2F2', label: 'Desviado' }
};

export const StrategyInfoCard = ({ strategy, onPress, onCreate }: StrategyProps) => {

    // 1. Estado Vacío (Botón Compacto)
    if (!strategy || !strategy.progress_status) {
        return (
            <TouchableOpacity style={styles.emptyCard} onPress={onCreate} activeOpacity={0.7}>
                <View style={styles.emptyIcon}>
                    <Lucide name="dollar-sign" size={20} color="#7C3AED" />
                </View>
                <View>
                    <Text style={styles.emptyTitle}>Sin estrategia</Text>
                    <Text style={styles.emptySubtitle}>Activala desde la plataforma</Text>
                </View>
                {/* <Lucide name="chevron-right" size={20} color="#CBD5E1" style={{ marginLeft: 'auto' }} /> */}
            </TouchableOpacity>
        );
    }

    // 2. Estado Activo
    const { progress_status: status, expected_duration_months } = strategy;
    const config = STATUS_COLORS[status.status] || STATUS_COLORS['pending'];

    // Cálculos simples
    const percent = status.planned_amount > 0
        ? Math.min((status.actual_paid / status.planned_amount) * 100, 100)
        : 0;

    return (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: config.main }]}
            onPress={() => onPress && onPress(strategy.id)}
            activeOpacity={0.9}
        >
            {/* Header: Nombre y Mes */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.title} numberOfLines={1}>{strategy.name}</Text>
                    <Text style={styles.subtitle}>
                        Mes {status.month}/{expected_duration_months}
                    </Text>
                </View>
                {/* Badge de estado pequeño */}
                <View style={[styles.badge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.badgeText, { color: config.main }]}>{config.label}</Text>
                </View>
            </View>

            {/* Números Grandes: Pagado vs Meta */}
            <View style={styles.numbersRow}>
                <View>
                    <Text style={styles.label}>Pagado este mes</Text>
                    <Text style={styles.amountMain}>{formatCurrency(status.actual_paid)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Meta</Text>
                    <Text style={styles.amountGoal}>/ {formatCurrency(status.planned_amount)}</Text>
                </View>
            </View>

            {/* Barra de Progreso e Info Extra */}
            <View style={styles.footer}>
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: config.main }]} />
                </View>

                <View style={styles.footerMeta}>
                    {/* Desviación o Alerta */}
                    {status.needs_recalculation ? (
                        <View style={styles.alertRow}>
                            <Lucide name="circle-alert" size={12} color="#D97706" />
                            <Text style={styles.alertText}>Recalcular</Text>
                        </View>
                    ) : (
                        <Text style={[
                            styles.driftText,
                            { color: status.drift >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            {status.drift > 0 ? '+' : ''}{formatCurrency(status.drift)} vs plan
                        </Text>
                    )}
                    <Text style={styles.percentText}>{Math.round(percent)}%</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Empty State
    emptyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F3FF', // Purple 50
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DDD6FE', // Purple 200
        borderStyle: 'dashed',
        marginBottom: 16,
    },
    emptyIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
        marginRight: 12
    },
    emptyTitle: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#5B21B6' },
    emptySubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#7C3AED' },

    // Active Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20, // Espacio para el siguiente elemento
        borderLeftWidth: 4, // Indicador visual de color a la izquierda
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: { flex: 1, marginRight: 8 },
    title: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1E293B', marginBottom: 2 },
    subtitle: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#64748B' },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },

    numbersRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    label: { fontSize: 10, color: '#94A3B8', fontFamily: 'Inter_500Medium', marginBottom: 2 },
    amountMain: { fontSize: 20, color: '#1E293B', fontFamily: 'Inter_700Bold' },
    amountGoal: { fontSize: 14, color: '#64748B', fontFamily: 'Inter_500Medium', marginBottom: 2 }, // Alineado visualmente

    // Footer & Progress
    footer: {},
    progressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, marginBottom: 6 },
    progressFill: { height: '100%', borderRadius: 3 },

    footerMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    driftText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
    percentText: { fontSize: 11, color: '#64748B', fontFamily: 'Inter_500Medium' },

    alertRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    alertText: { fontSize: 11, color: '#D97706', fontFamily: 'Inter_500Medium' }
});