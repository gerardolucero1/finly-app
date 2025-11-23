import { Strategy, StrategyInfoCard } from '@/app/components/StrategyInfoCard';
import { DashboardService } from '@/services/dashboard';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get("window");

// ... (MISMAS INTERFACES DE TIPOS QUE ANTES) ...

interface TrendData { value: number; trend: 'up' | 'down' | 'neutral'; percentage: number; }
interface UpcomingPayment { id: number; type: 'expense' | 'debt'; name: string; amount: number; next_payment_date: string; }
interface SpendingChartData { labels: string[]; datasets: { data: number[]; backgroundColor: string[]; }[]; }
interface DashboardData {
    totalBalance: TrendData;
    totalSavings: TrendData;
    // totalInvestments: TrendData;
    totalDebts: TrendData;
    totalBudgets: TrendData;
    totalBudgetsSpent: number;
    spendingChartData: SpendingChartData;
    financialHealthScore: number;
    financialHealthLabel: string;
    financialHealthVariation: number;
    upcomingPayments: UpcomingPayment[];
    activeStrategy: Strategy | null;
}

const formatCurrency = (value: any = 0) => {
    const number = Number(value) || 0;
    return number.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
};

// --- NUEVO COMPONENTE: SALUD FINANCIERA REDISEÑADO ---
const FinancialHealthCard = ({ score, label, variation }: { score: number, label: string, variation: number }) => {
    // Determinar color según puntaje
    let color = '#EF4444'; // Rojo (Pobre)
    let message = "Requiere atención urgente";

    if (score >= 80) {
        color = '#10B981'; // Emerald (Excelente)
        message = "¡Tus finanzas están sólidas!";
    } else if (score >= 60) {
        color = '#F59E0B'; // Amber (Regular)
        message = "Vas por buen camino, sigue así.";
    } else if (score >= 40) {
        color = '#F97316'; // Orange (Cuidado)
        message = "Hay oportunidades de mejora.";
    }

    return (
        <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.healthIconBg, { backgroundColor: `${color}15` }]}>
                        <Lucide name="activity" size={20} color={color} />
                    </View>
                    <View>
                        <Text style={styles.healthTitle}>Salud Financiera</Text>
                        <Text style={styles.healthSubtitle}>{message}</Text>
                    </View>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, { color }]}>{score}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                </View>
            </View>

            {/* Barra de Progreso Moderna */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${score}%`, backgroundColor: color }]} />
            </View>

            {/* Footer con Tendencia */}
            <View style={styles.healthFooter}>
                <Text style={[styles.healthLabel, { color }]}>{label}</Text>
                {variation !== 0 && (
                    <View style={styles.trendBadge}>
                        <Lucide
                            name={variation > 0 ? "trending-up" : "trending-down"}
                            size={14}
                            color={variation > 0 ? "#10B981" : "#EF4444"}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: variation > 0 ? "#10B981" : "#EF4444" }
                        ]}>
                            {Math.abs(variation)}% vs mes pasado
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// --- COMPONENTES PREVIOS (QuickAction, SectionCard, DebtItem) ---
const QuickAction = ({ icon, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionContainer} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
            <Lucide name={icon} size={24} color={color} />
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
);

const SectionCard = ({ title, value, subtitle, icon, color, buttonText, onPress, progress }: any) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
                <Lucide name={icon} size={20} color={color} />
            </View>
            {progress !== undefined && (
                <View style={styles.miniProgressContainer}>
                    <Text style={[styles.miniProgressText, { color }]}>{progress}%</Text>
                </View>
            )}
        </View>
        <View style={styles.sectionBody}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardValue}>{value}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            {progress !== undefined && (
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
                </View>
            )}
        </View>
        <TouchableOpacity style={styles.cardButton} onPress={onPress}>
            <Text style={[styles.cardButtonText, { color }]}>{buttonText}</Text>
            <Lucide name="arrow-right" size={14} color={color} />
        </TouchableOpacity>
    </View>
);

const ActiveDebtItem = ({ name, amount, date }: { name: string, amount: number, date: string }) => {
    const daysLeft = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const isUrgent = daysLeft <= 3;
    return (
        <View style={styles.debtItem}>
            <View style={styles.debtIcon}>
                <Lucide name="file-warning" size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.debtName}>{name}</Text>
                <Text style={[styles.debtDate, isUrgent && { color: '#EF4444', fontWeight: 'bold' }]}>
                    {daysLeft < 0 ? 'Vencido' : (daysLeft === 0 ? 'Vence hoy' : `Vence en ${daysLeft} días`)}
                </Text>
            </View>
            <Text style={styles.debtAmount}>{formatCurrency(amount)}</Text>
        </View>
    );
};

export default function DashboardScreen() {
    const headerHeight = useHeaderHeight();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const handleNavigate = (section: string) => Alert.alert("Próximamente", `Módulo: ${section}`);
    const handleQuickAction = (action: string) => Alert.alert("Nuevo", `Crear ${action}`);

    const fetchData = useCallback(async () => {
        try {
            const response = await DashboardService.getAll();
            setData(response);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    useFocusEffect(
        useCallback(() => { fetchData(); }, [fetchData])
    );

    if (loading && !data) return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    if (!data) return null;

    const totalSpent = data.spendingChartData?.datasets[0]?.data.reduce((a, b) => a + b, 0) || 0;
    const budgetLimit = 15000;
    const budgetProgress = Math.round((totalSpent / budgetLimit) * 100);
    const activeDebts = data.upcomingPayments.filter(p => p.type === 'debt');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingTop: headerHeight + 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
        >
            <View style={styles.contentPadding}>

                {/* 1. HERO CARD (Balance) */}
                <View style={styles.heroCard}>
                    <View>
                        <Text style={styles.heroLabel}>Balance Total</Text>
                        <Text style={styles.heroValue}>{formatCurrency(data.totalBalance.value)}</Text>
                        <View style={styles.heroTrend}>
                            <Lucide name={data.totalBalance.trend === 'up' ? "trending-up" : "trending-down"} size={16} color="#FFF" />
                            <Text style={styles.heroTrendText}> {data.totalBalance.percentage}% vs mes anterior</Text>
                        </View>
                    </View>
                    <View style={styles.walletIcon}>
                        <Lucide name="wallet" size={24} color="rgba(255,255,255,0.8)" />
                    </View>
                </View>

                {/* 2. NUEVA SALUD FINANCIERA */}
                {/* Se inserta aquí para dar contexto antes de las acciones */}
                <FinancialHealthCard
                    score={data.financialHealthScore}
                    label={data.financialHealthLabel}
                    variation={data.financialHealthVariation}
                />

                {/* 3. ATAJOS RÁPIDOS */}
                {/* <View style={styles.quickActionsRow}>
                    <QuickAction icon="banknote-arrow-up" label="Ingreso" color="#10B981" onPress={() => handleQuickAction('Ingreso')} />
                    <QuickAction icon="banknote-arrow-down" label="Gasto" color="#EF4444" onPress={() => handleQuickAction('Gasto')} />
                    <QuickAction icon="arrow-right-left" label="Transferir" color="#3B82F6" onPress={() => handleQuickAction('Transferencia')} />
                </View> */}

                {/* 3. ESTRATEGIA */}

                <StrategyInfoCard strategy={data.activeStrategy ?? undefined} />

                <Text style={styles.sectionHeaderTitle}>Gestión</Text>

                {/* 4. GRID */}
                <View style={styles.gridContainer}>
                    <SectionCard
                        title="Presupuesto"
                        value={formatCurrency(data.totalBudgetsSpent)}
                        subtitle={`de ${formatCurrency(data.totalBudgets.value)}`}
                        icon="chart-pie"
                        color="#F59E0B"
                        buttonText="Ver todo"
                        progress={budgetProgress}
                        onPress={() => router.push({ pathname: '/budgets' })}
                    />
                    <SectionCard
                        title="Deudas"
                        value={formatCurrency(data.totalDebts.value)}
                        subtitle="Total pendiente"
                        icon="credit-card"
                        color="#EF4444"
                        buttonText="Gestionar"
                        onPress={() => router.push({ pathname: '/debts' })}
                    />
                    <SectionCard
                        title="Ahorros e Inversiones"
                        value={formatCurrency(data.totalSavings.value)}
                        subtitle="Fondo activo"
                        icon="piggy-bank"
                        color="#10B981"
                        buttonText="Entrar"
                        onPress={() => handleNavigate('Ahorros')}
                    />
                    {/* <SectionCard
                        title="Inversiones"
                        value={formatCurrency(data.totalInvestments.value)}
                        subtitle="Portafolio"
                        icon="chart-area"
                        color="#8B5CF6"
                        buttonText="Ver panel"
                        onPress={() => handleNavigate('Inversiones')}
                    /> */}
                </View>

                {/* 5. DEUDAS ACTIVAS */}
                {activeDebts.length > 0 && (
                    <View style={styles.debtsSection}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionHeaderTitle}>Proximos Pagos</Text>
                            <TouchableOpacity onPress={() => handleNavigate('Deudas')}>
                                <Text style={styles.linkText}>Ver todas</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.debtList}>
                            {activeDebts.slice(0, 3).map((debt) => (
                                <ActiveDebtItem key={debt.id} name={debt.name} amount={debt.amount} date={debt.next_payment_date} />
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    contentPadding: { paddingHorizontal: 20 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // HERO
    heroCard: {
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16, // Reducido porque ahora hay health card abajo
        shadowColor: "#1E293B", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8,
    },
    heroLabel: { color: '#94A3B8', fontSize: 14, fontFamily: 'Inter_500Medium', marginBottom: 8 },
    heroValue: { color: '#FFFFFF', fontSize: 32, fontFamily: 'Inter_700Bold', marginBottom: 8 },
    heroTrend: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    heroTrendText: { color: '#FFF', fontSize: 12, fontFamily: 'Inter_500Medium' },
    walletIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

    // NUEVO: HEALTH CARD STYLES
    healthCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    healthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    healthIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    healthTitle: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    healthSubtitle: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_400Regular',
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreText: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
    },
    scoreMax: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: 'Inter_500Medium',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    healthFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    healthLabel: {
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
    },

    // QUICK ACTIONS
    quickActionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32, backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    quickActionContainer: { alignItems: 'center' },
    quickActionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    quickActionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: '#475569' },

    // GENERAL TITLES
    sectionHeaderTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1E293B', marginBottom: 16 },

    // GRID
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 32 },
    sectionCard: { width: (width - 52) / 2, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, justifyContent: 'space-between', minHeight: 160 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    miniProgressContainer: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    miniProgressText: { fontSize: 10, fontWeight: 'bold' },
    sectionBody: { marginBottom: 12 },
    cardTitle: { fontSize: 14, color: '#64748B', fontFamily: 'Inter_500Medium', marginBottom: 4 },
    cardValue: { fontSize: 18, color: '#1E293B', fontFamily: 'Inter_700Bold', marginBottom: 2 },
    cardSubtitle: { fontSize: 11, color: '#94A3B8', fontFamily: 'Inter_400Regular' },
    progressBarBg: { height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 8, width: '100%', overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 2 },
    cardButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardButtonText: { fontSize: 12, fontFamily: 'Inter_400Regular' },

    // DEBTS
    debtsSection: { marginBottom: 20 },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    linkText: { color: '#4F46E5', fontSize: 14, fontFamily: 'Inter_500Medium' },
    debtList: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 8 },
    debtItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
    debtIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
    debtName: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    debtDate: { fontSize: 12, color: '#64748B', marginTop: 2, fontFamily: 'Inter_400Regular' },
    debtAmount: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#1E293B' },
});