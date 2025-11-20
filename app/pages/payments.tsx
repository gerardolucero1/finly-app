import { DebtPayment } from '@/models/debt_payment';
import { DebtPaymentsService } from '@/services/payments';
import { Ionicons } from '@expo/vector-icons';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DebtPaymentFormModal } from '../components/DebtPaymentFormModal';

// Helper moneda
const formatCurrency = (val: any) => Number(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// Item de Lista de Pago
const PaymentItem = ({ item, onEdit }: { item: DebtPayment, onEdit: (p: DebtPayment) => void }) => {
    const date = DateTime.fromISO(item.paid_at.toString()).setLocale('es').toFormat('dd MMM yyyy');

    return (
        <TouchableOpacity style={styles.item} onPress={() => onEdit(item)} activeOpacity={0.7}>
            <View style={styles.iconBox}>
                <Lucide
                    name={item.is_extra_payment ? "zap" : "check"}
                    size={20}
                    color={item.is_extra_payment ? "#F59E0B" : "#10B981"}
                />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.itemTitle}>{item.is_extra_payment ? 'Abono a Capital' : 'Pago Regular'}</Text>
                <Text style={styles.itemDate}>{date}</Text>

                {/* Desglose Interés/Capital (Si el backend lo devuelve calculado) */}
                {(Number(item.interest_amount) > 0 || Number(item.principal_amount) > 0) && (
                    <View style={styles.breakdown}>
                        <Text style={styles.bdText}>Cap: {formatCurrency(item.principal_amount)}</Text>
                        <Text style={styles.bdDivider}>•</Text>
                        <Text style={[styles.bdText, { color: '#EF4444' }]}>Int: {formatCurrency(item.interest_amount)}</Text>
                    </View>
                )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
                <Lucide name="chevron-right" size={16} color="#CBD5E1" style={{ marginTop: 4 }} />
            </View>
        </TouchableOpacity>
    );
};

export default function DebtPaymentsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();
    const debtId = Number(params.debtId);
    const debtName = params.debtName as string;

    const [payments, setPayments] = useState<DebtPayment[]>([]);
    const [loading, setLoading] = useState(true);

    // Estado Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState<DebtPayment | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            if (!debtId) return;

            const response = await DebtPaymentsService.getAll(1, debtId);
            const allPayments = response.data || [];

            // Filtrar solo los de esta deuda
            const filtered = allPayments.filter(p => Number(p.debt_id) === debtId);
            // Ordenar por fecha descendente
            filtered.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

            setPayments(filtered);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cargar el historial.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debtId) fetchPayments();
    }, [debtId]);

    const handleCreate = () => {
        setEditingPayment(null);
        setModalVisible(true);
    };

    const handleEdit = (payment: DebtPayment) => {
        setEditingPayment(payment);
        setModalVisible(true);
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            {/* <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { marginTop: headerHeight + 40 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Lucide name="arrow-left" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Historial de Pagos</Text>
                    <Text style={styles.headerSub}>{debtName}</Text>
                </View>
                <View style={{ width: 24 }} />
            </View> */}
            {/* 2. CONFIGURACIÓN DEL HEADER NATIVO */}
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: debtName ? `Pagos: ${debtName}` : 'Historial',
                    headerTransparent: true,
                    headerTintColor: '#1E293B',
                    headerShadowVisible: false,
                    headerTitleStyle: {
                        fontFamily: 'Inter_700Bold',
                    },
                    headerBackVisible: false,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ paddingHorizontal: 0, marginRight: 16 }}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={28}
                                color="#1E293B"
                            />
                        </TouchableOpacity>
                    ),
                }}
            />
            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => <PaymentItem item={item} onEdit={handleEdit} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Lucide name="receipt" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyTxt}>No hay pagos registrados aún.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                <Lucide name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <DebtPaymentFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={fetchPayments}
                debtId={debtId}
                editingPayment={editingPayment}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1E293B', textAlign: 'center' },
    headerSub: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_400Regular', textAlign: 'center' },
    list: { padding: 20 },
    item: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#1E293B' },
    itemDate: { fontSize: 12, color: '#94A3B8', fontFamily: 'Inter_400Regular', marginTop: 2 },
    itemAmount: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    breakdown: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    bdText: { fontSize: 10, color: '#10B981', fontFamily: 'Inter_500Medium' },
    bdDivider: { fontSize: 10, color: '#CBD5E1', marginHorizontal: 4 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyTxt: { marginTop: 10, color: '#64748B', fontFamily: 'Inter_500Medium' },
    fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', shadowColor: "#4F46E5", shadowOpacity: 0.4, elevation: 8 },
});