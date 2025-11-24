import { Account } from '@/models/account';
import { Transfer } from '@/models/transfer';
import { SavingsService } from '@/services/savings';
import { Lucide } from '@react-native-vector-icons/lucide';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';

// IMPORTACIÓN NUEVA
import { LineChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get('window').width;

// Tipos
interface ChartDataPoint {
    label: string;
    raw_date: string;
    transfers_accumulated: number;
    interest_accumulated: number;
    total_growth: number;
}

const formatCurrency = (value: any) => {
    return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });
};

const TransferItem = ({ transfer }: { transfer: Transfer }) => {
    return (
        <View style={styles.transferItem}>
            <View style={styles.transferIconContainer}>
                <Lucide name="arrow-down-left" size={20} color="#10B981" />
            </View>
            <View style={styles.transferDetails}>
                <Text style={styles.transferTitle}>
                    {transfer.from_account ? `De: ${transfer.from_account.name}` : 'Depósito'}
                </Text>
                <Text style={styles.transferDate}>
                    {new Date(transfer.date).toLocaleDateString()}
                </Text>
            </View>
            <Text style={styles.transferAmount}>
                +{formatCurrency(transfer.amount)}
            </Text>
        </View>
    );
};

// Función de agrupamiento (Igual que antes)
const getWeeklyData = (data: ChartDataPoint[]) => {
    if (!data || data.length === 0) return [];
    if (data.length <= 10) return data;

    const weeklyPoints: ChartDataPoint[] = [];
    data.forEach((point, index) => {
        if (index === 0 || index % 6 === 0 || index === data.length - 1) { // Ajusté a 6 para que salgan unos 5 puntos aprox
            const exists = weeklyPoints.find(p => p.raw_date === point.raw_date);
            if (!exists) weeklyPoints.push(point);
        }
    });
    return weeklyPoints;
};

export default function SavingsDetailScreen() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [account, setAccount] = useState<Account | null>(null);
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [monthSummary, setMonthSummary] = useState({ transfers: 0, interest: 0 });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchData = async (pageNum = 1, shouldRefresh = false) => {
        try {
            if (pageNum === 1) setLoading(true);
            const response = await SavingsService.show(Number(id), pageNum);
            setAccount(response.account);

            if (Array.isArray(response.chart_data)) {
                setChartData(response.chart_data);
                const lastPoint = response.chart_data[response.chart_data.length - 1];
                if (lastPoint) {
                    setMonthSummary({
                        transfers: lastPoint.transfers_accumulated,
                        interest: lastPoint.interest_accumulated
                    });
                }
            }

            if (shouldRefresh || pageNum === 1) {
                setTransfers(response.transfers.data);
            } else {
                setTransfers(prev => [...prev, ...response.transfers.data]);
            }
            setHasMore(response.transfers.next_page_url !== null);
            setPage(pageNum);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => { if (id) fetchData(1); }, [id]);

    const onRefresh = () => { setRefreshing(true); fetchData(1, true); };
    const loadMore = () => { if (!hasMore || loadingMore || loading) return; setLoadingMore(true); fetchData(page + 1); };

    // --- PREPARACIÓN DE DATOS PARA GIFTED CHARTS ---
    const weeklyChartData = React.useMemo(() => getWeeklyData(chartData), [chartData]);

    const line1Data = weeklyChartData.map(d => ({ value: d.interest_accumulated, label: d.label }));
    const line2Data = weeklyChartData.map(d => ({ value: d.transfers_accumulated, label: d.label }));

    // 1. CALCULAR EL VALOR MÁXIMO (TECHO) PARA EL EJE Y
    // Buscamos el valor más alto entre intereses y depósitos
    const maxVal = Math.max(
        ...weeklyChartData.map(d => Math.max(d.transfers_accumulated, d.interest_accumulated, 100)) // Mínimo 100 para que no se vea vacía si todo es 0
    );

    // Redondeamos hacia arriba al siguiente 100 o 500 (ej: si es 320 -> 400)
    // Esto hace que los números del eje Y sean limpios (0, 100, 200...)
    const chartMaxValue = Math.ceil(maxVal / 100) * 100;

    const chartSpacing = weeklyChartData.length > 1
        ? (screenWidth - 115) / (weeklyChartData.length - 1)
        : screenWidth;


    if (loading && !refreshing && page === 1) return <ActivityIndicator size="large" color="#4F46E5" style={styles.centerContainer} />;
    if (!account) return <Text style={styles.errorText}>Cuenta no encontrada</Text>;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerShown: true,
                headerTitle: account.name,
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' }
            }} />

            <FlatList
                data={transfers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <TransferItem transfer={item} />}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={() => (
                    <View>
                        {/* Header Saldo */}
                        <View style={styles.headerCard}>
                            <Text style={styles.balanceLabel}>Saldo Total</Text>
                            <Text style={styles.balanceValue}>{formatCurrency(account.current_balance)}</Text>
                            <View style={styles.badgesContainer}>
                                <View style={styles.badge}><Text style={styles.badgeText}>{account.bank || 'Sin Banco'}</Text></View>
                            </View>
                        </View>

                        {/* Gráfica */}
                        {chartData.length > 0 && (
                            <View style={styles.chartSection}>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryItem}>
                                        <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                                        <View>
                                            <Text style={styles.summaryLabel}>Interés</Text>
                                            <Text style={styles.summaryValue}>{formatCurrency(monthSummary.interest)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.summaryItem}>
                                        <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
                                        <View>
                                            <Text style={styles.summaryLabel}>Depósitos</Text>
                                            <Text style={styles.summaryValue}>{formatCurrency(monthSummary.transfers)}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.chartContainer}>
                                    <LineChart
                                        data={line1Data}
                                        data2={line2Data}
                                        height={220}
                                        spacing={chartSpacing}
                                        initialSpacing={10}

                                        // --- ESTILO DE OLA / ÁREA ---
                                        areaChart // <--- ESTO CREA EL EFECTO RELLENO
                                        curved // <--- ESTO SUAVIZA LOS PICOS
                                        isAnimated

                                        // Configuración Línea 1 (Interés - Verde)
                                        color1="#10B981"
                                        startFillColor1="#10B981"
                                        endFillColor1="#10B981"
                                        startOpacity1={0.2} // Transparencia arriba
                                        endOpacity1={0.0}   // Transparencia abajo

                                        // Configuración Línea 2 (Depósitos - Azul)
                                        color2="#3B82F6"
                                        startFillColor2="#3B82F6"
                                        endFillColor2="#3B82F6"
                                        startOpacity2={0.2}
                                        endOpacity2={0.0}


                                        // Puntos (ocultamos los puntos normales para que se vea más limpio, solo salen al tocar)
                                        hideDataPoints={false}
                                        dataPointsRadius={4}
                                        dataPointsColor1="#10B981"
                                        dataPointsColor2="#3B82F6"

                                        // --- EJE Y MEJORADO ---
                                        maxValue={chartMaxValue} // Usamos el techo calculado
                                        noOfSections={4} // Forzamos 4 líneas horizontales exactas
                                        noOfSectionsBelowXAxis={1}
                                        yAxisLabelWidth={40}
                                        yAxisLabelPrefix="$"
                                        // Esta función elimina los decimales (.0)
                                        formatYLabel={(label) => parseInt(label).toString()}

                                        // Estilos Generales
                                        yAxisColor="transparent" // Ocultar línea vertical del eje
                                        xAxisColor="#F1F5F9"
                                        yAxisTextStyle={{ color: '#94A3B8', fontSize: 11 }}
                                        xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 11 }}
                                        rulesType="solid"
                                        rulesColor="#F1F5F9"

                                        // Tooltip (Igual que antes)
                                        pointerConfig={{
                                            pointerStripHeight: 160,
                                            pointerStripColor: '#CBD5E1',
                                            pointerStripWidth: 2,
                                            pointerColor: '#CBD5E1',
                                            radius: 3,
                                            pointerLabelWidth: 100,
                                            pointerLabelHeight: 90,
                                            activatePointersOnLongPress: false,
                                            autoAdjustPointerLabelPosition: false,
                                            pointerLabelComponent: items => {
                                                return (
                                                    <View style={{ height: 90, width: 100, justifyContent: 'center', marginTop: -30, marginLeft: -40, backgroundColor: 'white', borderRadius: 8, padding: 4, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 }}>
                                                        <Text style={{ fontSize: 10, color: '#64748B', textAlign: 'center' }}>Día {items[0].label}</Text>
                                                        <Text style={{ fontSize: 12, color: '#10B981', fontWeight: 'bold', textAlign: 'center' }}>+{items[0].value}</Text>
                                                        <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: 'bold', textAlign: 'center' }}>+{items[1].value}</Text>
                                                    </View>
                                                );
                                            },
                                        }}
                                    />
                                </View>
                            </View>
                        )}
                        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 10 }]}>Historial</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20 },
    headerCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    balanceLabel: { fontSize: 13, color: '#64748B', fontFamily: 'Inter_500Medium', marginBottom: 8, textTransform: 'uppercase' },
    balanceValue: { fontSize: 36, color: '#1E293B', fontFamily: 'Inter_700Bold', marginBottom: 16 },
    badgesContainer: { flexDirection: 'row', gap: 8 },
    badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { fontSize: 12, color: '#475569', fontFamily: 'Inter_500Medium' },

    chartSection: { marginBottom: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
    summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 2 },
    summaryLabel: { fontSize: 11, color: '#64748B', fontFamily: 'Inter_500Medium' },
    summaryValue: { fontSize: 15, color: '#1E293B', fontFamily: 'Inter_700Bold' },

    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingVertical: 20,
        paddingRight: 0, // Solo padding derecho, el izquierdo lo maneja la librería
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'scroll'
    },

    sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1E293B', marginBottom: 12 },
    transferItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
    transferIconContainer: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    transferDetails: { flex: 1 },
    transferTitle: { fontSize: 14, color: '#1E293B', fontFamily: 'Inter_500Medium', marginBottom: 3 },
    transferDate: { fontSize: 12, color: '#94A3B8', fontFamily: 'Inter_400Regular' },
    transferAmount: { fontSize: 16, color: '#10B981', fontFamily: 'Inter_700Bold' },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 50,
        fontFamily: 'Inter_700Bold'
    },
});