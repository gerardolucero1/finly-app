import { DebtPayment } from '@/models/debt_payment';
import { DebtPaymentsService } from '@/services/payments';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useLocalSearchParams } from 'expo-router';
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
// 1. IMPORT GESTURE HANDLER ROOT VIEW
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useCustomAlert } from '../components/CustomAlert';
import { DebtPaymentFormModal } from '../components/DebtPaymentFormModal';

// Helper moneda
const formatCurrency = (val: any) => Number(val).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

// 2. FIX PROPS: Added onDelete to props definition
const PaymentItem = ({
    item,
    onEdit,
    onDelete
}: {
    item: DebtPayment,
    onEdit: (p: DebtPayment) => void,
    onDelete: (id: number) => void
}) => {
    const date = DateTime.fromISO(item.paid_at.toString()).setLocale('es').toFormat('dd MMM yyyy');

    const renderRightActions = (progress: SharedValue<number>, drag: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(drag.value, [-80, 0], [1, 0], Extrapolation.CLAMP);
            return { transform: [{ scale }] };
        });

        return (
            <TouchableOpacity onPress={() => onDelete(item.id)} activeOpacity={0.6}>
                <View style={styles.deleteButton}>
                    <Reanimated.View style={[styles.deleteContent, animatedStyle]}>
                        <Lucide name="trash-2" size={24} color="#FFFFFF" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </Reanimated.View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}
            containerStyle={styles.swipeableContainer}
        >
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
        </Swipeable>
    );
};

export default function DebtPaymentsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();
    const debtId = Number(params.debtId);
    const debtName = params.debtName as string;

    const [payments, setPayments] = useState<DebtPayment[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState<DebtPayment | null>(null);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    const fetchPayments = async () => {
        setLoading(true);
        try {
            if (!debtId) return;

            const response = await DebtPaymentsService.getAll(1, debtId);
            const allPayments = response.data || [];

            const filtered = allPayments.filter(p => Number(p.debt_id) === debtId);
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

    const handleDelete = (id: number) => {
        showAlert({
            title: "Eliminar pago",
            message: "¿Estás seguro?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Eliminar",
                    style: "danger",
                    onPress: async () => {
                        const previous = [...payments];
                        try {
                            setPayments(prev => prev.filter(n => n.id !== id));
                            await DebtPaymentsService.delete(id);
                            hideAlert()
                        } catch (error) {
                            setPayments(previous);
                            showAlert({
                                title: "Error",
                                message: "No se pudo eliminar",
                                buttons: [
                                    { text: "OK", onPress: () => hideAlert() }
                                ]
                            });
                        }
                    }
                }
            ]
        });
    };

    return (
        // 3. WRAP EVERYTHING IN GESTUREHANDLERROOTVIEW
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container]}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: debtName ? `Pagos: ${debtName}` : 'Historial',
                    headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                    headerTintColor: '#4F46E5',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#F8FAFC' }
                }} />
                {/* <Stack.Screen
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
                /> */}
                {loading ? (
                    <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={payments}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <PaymentItem
                                item={item}
                                onEdit={handleEdit}
                                onDelete={handleDelete} // This is passed correctly now
                            />
                        )}
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

            <AlertComponent />
            {/* Assuming AlertComponent is rendered here if needed, usually works better as a Portal or Overlay */}
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    swipeableContainer: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    // ... rest of your styles remain exactly the same
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1E293B', textAlign: 'center' },
    headerSub: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_400Regular', textAlign: 'center' },
    list: { padding: 20 },
    item: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    itemTitle: { fontSize: 15, fontFamily: 'Inter_500Medium', color: '#1E293B' },
    itemDate: { fontSize: 12, color: '#94A3B8', fontFamily: 'Inter_400Regular', marginTop: 2 },
    itemAmount: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#1E293B' },
    breakdown: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    bdText: { fontSize: 10, color: '#10B981', fontFamily: 'Inter_500Medium' },
    bdDivider: { fontSize: 10, color: '#CBD5E1', marginHorizontal: 4 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyTxt: { marginTop: 10, color: '#64748B', fontFamily: 'Inter_500Medium' },
    fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', shadowColor: "#4F46E5", shadowOpacity: 0.4, elevation: 8 },
    deleteButton: {
        backgroundColor: '#EF4444',
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        marginLeft: -16,
        paddingLeft: 8,
    },
    deleteContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        marginTop: 4,
    },
});