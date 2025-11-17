import { DashboardService } from '@/services/dashboard';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import Svg, { Circle } from 'react-native-svg';

const screenWidth = Dimensions.get("window").width;

// --- TIPOS DE DATOS DE LA API ---
interface TrendData {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    percentage: number;
}
interface UpcomingPayment {
    id: number;
    type: 'expense' | 'debt';
    name: string;
    amount: number;
    next_payment_date: string;
}
interface SpendingChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
    }[];
}
interface DashboardData {
    totalBalance: TrendData;
    totalSavings: TrendData;
    totalDebts: TrendData;
    spendingChartData: SpendingChartData;
    financialHealthScore: number;
    financialHealthLabel: string;
    financialHealthVariation: number;
    upcomingPayments: UpcomingPayment[];
    activeStrategy: { name: string } | null;
}

// --- FUNCIÓN HELPER ---
const formatCurrency = (value: any = 0) => {
    const number = Number(value) || 0;
    return number.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

// --- COMPONENTES VISUALES MEJORADOS ---

// Tarjeta principal de Salud Financiera con un anillo de progreso
const FinancialHealthCard = ({ score = 0, label = 'N/A', variation = 0 }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = score / 100;
    const strokeDashoffset = circumference - circumference * progress;

    const getScoreColor = () => {
        if (score >= 80) return '#10B981'; // Verde
        if (score >= 60) return '#F59E0B'; // Ámbar
        if (score >= 40) return '#F97316'; // Naranja
        return '#EF4444'; // Rojo
    };
    
    const TrendIndicator = () => (
        <View style={styles.healthTrend}>
            <Lucide 
                name={variation > 0 ? 'TrendingUp' : 'TrendingDown'} 
                size={16} 
                color={variation > 0 ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.healthTrendText, { color: variation > 0 ? '#10B981' : '#EF4444' }]}>
                {Math.abs(variation)}% vs mes pasado
            </Text>
        </View>
    );

    return (
        <View style={styles.healthCard}>
            <View style={styles.healthInfo}>
                <Text style={styles.healthTitle}>Salud Financiera</Text>
                <Text style={[styles.healthLabel, { backgroundColor: `${getScoreColor()}20`, color: getScoreColor() }]}>
                    {label}
                </Text>
                {variation !== 0 && <TrendIndicator />}
            </View>
            <View style={styles.healthCircleContainer}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Circle
                        stroke="#E2E8F0"
                        cx={size / 2} cy={size / 2} r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <Circle
                        stroke={getScoreColor()}
                        cx={size / 2} cy={size / 2} r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size/2} ${size/2})`}
                    />
                </Svg>
                <Text style={[styles.healthScore, { color: getScoreColor() }]}>{score}<Text style={{fontSize: 24}}>%</Text></Text>
            </View>
        </View>
    );
};

// Tarjetas para Balance, Ahorros y Deudas
const StatCard = ({ label, data, icon, color }) => {
    const isPositiveTrend = data.trend === 'up';
    const isDebt = label.toLowerCase().includes('deuda');
    
    // Para deudas, una tendencia "up" es mala (roja), y "down" es buena (verde)
    const trendColor = isDebt 
        ? (isPositiveTrend ? '#EF4444' : '#10B981')
        : (isPositiveTrend ? '#10B981' : '#EF4444');

    return (
        <View style={styles.statCard}>
            <View style={styles.statHeader}>
                <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
                    <Lucide name={icon} size={20} color={color} />
                </View>
                <Text style={styles.statLabel}>{label}</Text>
            </View>
            <Text style={styles.statValue} className=' text-xs'>{formatCurrency(data.value)}</Text>
            {data.percentage > 0 && (
                <View style={styles.statTrend}>
                    <Lucide name={data.trend === 'neutral' ? 'Minus' : (isPositiveTrend ? 'arrow-up-right' : 'arrow-down-right')} size={14} color={trendColor} />
                    <Text style={[styles.statPercentage, { color: trendColor }]}>
                        {data.percentage}%
                    </Text>
                </View>
            )}
        </View>
    );
};

// Componente para el gráfico de gastos
const SpendingChart = ({ data }) => {
    if (!data || data.datasets[0].data.length === 0) {
        return <Text style={styles.noDataText}>No hay gastos registrados este mes.</Text>;
    }

    const chartData = data.labels.map((label, index) => ({
        name: label,
        amount: data.datasets[0].data[index],
        color: data.datasets[0].backgroundColor[index] || '#94A3B8',
        legendFontColor: '#334155',
        legendFontSize: 14,
    }));

    return (
        <PieChart
            data={chartData}
            width={screenWidth - 40} // Ajustado al padding del contenedor
            height={200}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
        />
    );
};

// Componente para un item de la lista de próximos pagos
const UpcomingPaymentItem = ({ name, amount, date, type }) => {
    const formattedDate = new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const icon = type === 'debt' ? 'landmark' : 'receipt-text';
    const color = type === 'debt' ? '#EF4444' : '#3B82F6';

    return (
        <View style={styles.paymentRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.paymentIconContainer, { backgroundColor: `${color}20` }]}>
                   <Lucide name={icon} size={20} color={color} />
                </View>
               <View>
                    <Text style={styles.paymentName}>{name}</Text>
                    <Text style={styles.paymentDate}>{formattedDate}</Text>
               </View>
            </View>
            <Text style={styles.paymentAmount}>{formatCurrency(amount)}</Text>
        </View>
    );
};

// --- PANTALLA PRINCIPAL DEL DASHBOARD ---
export default function DashboardScreen() {
    const headerHeight = useHeaderHeight();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Simulación de llamada a la API
            // En una app real, reemplazarías esto con tu llamada fetch o axios
            const response = await DashboardService.getAll()
            
            const apiData = response;
            setData(apiData);
            
            // Usando tus datos de ejemplo de la API para el diseño
            // const apiData: DashboardData = {
            //     totalBalance: { value: 13250, trend: 'up', percentage: 5.2 },
            //     totalSavings: { value: 25000, trend: 'up', percentage: 10 },
            //     totalDebts: { value: 8500, trend: 'down', percentage: 2.1 },
            //     spendingChartData: {
            //         labels: ['Comida', 'Transporte', 'Ocio', 'Vivienda'],
            //         datasets: [{ data: [5200, 3800, 2400, 8500], backgroundColor: ['#f97316', '#22c55e', '#ec4899', '#3b82f6'] }]
            //     },
            //     financialHealthScore: 78,
            //     financialHealthLabel: 'Buena',
            //     financialHealthVariation: 3.5,
            //     upcomingPayments: [
            //         { id: 1, type: 'expense', name: 'Renta', amount: 8500, next_payment_date: '2023-11-30T00:00:00.000Z' },
            //         { id: 2, type: 'debt', name: 'Pago Tarjeta BBVA', amount: 1200, next_payment_date: '2023-12-05T00:00:00.000Z' },
            //         { id: 3, type: 'expense', name: 'Internet Telmex', amount: 499, next_payment_date: '2023-12-10T00:00:00.000Z' },
            //     ],
            //     activeStrategy: { name: 'Bola de Nieve' }
            // };
            // setData(apiData);

        } catch (e) {
            setError('No se pudo cargar la información.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    
    if (loading) {
        return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    if (error || !data) {
        return <View style={styles.centerContainer}><Text>{error || 'No hay datos disponibles.'}</Text></View>;
    }

    return (
        <ScrollView 
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40, paddingHorizontal: 15 }}
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <FinancialHealthCard 
                score={data.financialHealthScore}
                label={data.financialHealthLabel}
                variation={data.financialHealthVariation}
            />

            <View style={styles.statsContainer}>
                {/* Fila solo para las dos primeras tarjetas */}
                <View style={styles.topStatsRow}>
                    <StatCard label="Balance" data={data.totalBalance} icon="hand-coins" color="#4F46E5" />
                    <StatCard label="Ahorros" data={data.totalSavings} icon="piggy-bank" color="#10B981" />
                </View>
                
                {/* La tercera tarjeta va por fuera, ocupando todo el ancho disponible */}
                <StatCard label="Deudas" data={data.totalDebts} icon="landmark" color="#EF4444" />
            </View>

            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Gastos del Mes</Text>
                <SpendingChart data={data.spendingChartData} />
            </View>
            
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Próximos Pagos</Text>
                {data.upcomingPayments.slice(0, 3).map(payment => (
                    <UpcomingPaymentItem key={`${payment.type}-${payment.id}`} {...payment} />
                ))}
                {data.upcomingPayments.length > 3 && (
                    <TouchableOpacity style={styles.viewAllButton}>
                        <Text style={styles.viewAllText}>Ver todos los pagos</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            {data.activeStrategy && (
                <View style={styles.strategyCard}>
                    <Lucide name="target" size={20} color="#F59E0B" />
                    <Text style={styles.strategyText}>
                        Estrategia activa: <Text style={{fontWeight: 'bold'}}>{data.activeStrategy.name}</Text>
                    </Text>
                </View>
            )}

        </ScrollView>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Gris muy claro
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Health Card
    healthCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    healthInfo: {
        flex: 1,
    },
    healthTitle: {
        fontFamily: "Inter_400Regular" ,
        fontSize: 18,
        color: '#1E293B',
    },
    healthLabel: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    healthTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    healthTrendText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
    },
    healthCircleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    healthScore: {
        position: 'absolute',
        fontSize: 32,
        fontWeight: 'bold',
    },
    // Stats Row
    statsContainer: {
        marginBottom: 20,
        gap: 10, // Espacio vertical entre la fila superior y la tarjeta inferior
    },
    topStatsRow: {
        flexDirection: 'row', // Pone las dos primeras tarjetas una al lado de la otra
        gap: 10, // Espacio horizontal entre las dos tarjetas
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
        textAlign: 'left'
    },
    statTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statPercentage: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    // Sections
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 16,
    },
    noDataText: {
        textAlign: 'center',
        color: '#64748B',
        paddingVertical: 40,
    },
    // Upcoming Payments
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    paymentIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    paymentDate: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    paymentAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    viewAllButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    viewAllText: {
        color: '#4F46E5',
        fontSize: 14,
        fontWeight: '600',
    },
    // Strategy Card
    strategyCard: {
        backgroundColor: '#FFFBEB', // Amber-50
        borderColor: '#FDE68A', // Amber-200
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    strategyText: {
        marginLeft: 12,
        color: '#B45309', // Amber-700
        fontSize: 14,
    },
});