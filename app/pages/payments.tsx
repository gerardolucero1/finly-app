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
import { useTheme } from '@/app/context/theme';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
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
    // Referencia para controlar el Swipeable
    const swipeableRef = React.useRef<any>(null);
    const { colors, isDark } = useTheme();

    const date = DateTime.fromISO(item.paid_at.toString()).setLocale('es').toFormat('dd MMM yyyy');

    const handleLocalDelete = () => {
        swipeableRef.current?.close();
        setTimeout(() => onDelete(item.id), 100);
    };

    const handleLocalEdit = () => {
        swipeableRef.current?.close();
        onEdit(item);
    };

    const renderRightActions = (progress: SharedValue<number>, drag: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(drag.value, [-80, 0], [1, 0], Extrapolation.CLAMP);
            return { transform: [{ scale }] };
        });

        return (
            <View style={styles.actionButtonContainer}>
                <RectButton onPress={handleLocalDelete} style={styles.rightActionBtn}>
                    <View style={styles.deleteButton}>
                        <Reanimated.View style={[styles.deleteContent, animatedStyle]}>
                            <Lucide name="trash-2" size={24} color="#FFFFFF" />
                            <Text style={styles.deleteText}>Eliminar</Text>
                        </Reanimated.View>
                    </View>
                </RectButton>
            </View>
        );
    };

    const renderLeftActions = (progress: SharedValue<number>, drag: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(drag.value, [0, 80], [0, 1], Extrapolation.CLAMP);
            return { transform: [{ scale }] };
        });

        return (
            <View style={styles.actionButtonContainer}>
                <RectButton onPress={handleLocalEdit} style={styles.leftActionBtn}>
                    <View style={styles.editButton}>
                        <Reanimated.View style={[styles.deleteContent, animatedStyle]}>
                            <Lucide name="pencil" size={24} color="#FFFFFF" />
                            <Text style={styles.deleteText}>Editar</Text>
                        </Reanimated.View>
                    </View>
                </RectButton>
            </View>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            renderLeftActions={renderLeftActions}
            friction={2}
            overshootRight={false}
            overshootLeft={false}
            rightThreshold={40}
            leftThreshold={40}
            containerStyle={styles.swipeableContainer}
        >
            <View style={[styles.transactionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={[
                    styles.transactionIconContainer,
                    { backgroundColor: item.is_extra_payment ? (isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFF7ED') : (isDark ? 'rgba(16, 185, 129, 0.2)' : '#E0F2F1') }
                ]}>
                    <Lucide
                        name={item.is_extra_payment ? "zap" : "check"}
                        size={20}
                        color={item.is_extra_payment ? "#F59E0B" : "#10B981"}
                    />
                </View>

                <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionName, { color: colors.text }]}>{item.is_extra_payment ? 'Abono a Capital' : 'Pago Regular'}</Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{date}</Text>

                    {(Number(item.interest_amount) > 0 || Number(item.principal_amount) > 0) && (
                        <View style={styles.breakdown}>
                            <Text style={styles.bdText}>Cap: {formatCurrency(item.principal_amount)}</Text>
                            <Text style={[styles.bdDivider, { color: colors.textSecondary }]}>•</Text>
                            <Text style={[styles.bdText, { color: '#EF4444' }]}>Int: {formatCurrency(item.interest_amount)}</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.transactionAmount, { color: colors.text }]}>
                    {formatCurrency(item.amount)}
                </Text>
            </View>
        </Swipeable>
    );
};

export default function DebtPaymentsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();
    const { colors } = useTheme();
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
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{
                    headerShown: true,
                    headerTitle: debtName ? `Pagos: ${debtName}` : 'Historial',
                    headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.text },
                    headerTintColor: colors.primary,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background }
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
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
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
                                <Lucide name="receipt" size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyTxt, { color: colors.textSecondary }]}>No hay pagos registrados aún.</Text>
                            </View>
                        }
                    />
                )}

                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleCreate}>
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
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    list: { paddingHorizontal: 16, paddingBottom: 20 },
    // Removed old card styles (item, iconBox, itemTitle, itemDate, itemAmount)

    // New Flat List Styles
    transactionItem: {
        height: 86,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    transactionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionDetails: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    transactionName: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
    },
    transactionDate: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 1,
        fontFamily: 'Inter_400Regular',
    },
    transactionAmount: {
        fontSize: 15,
        fontFamily: 'Inter_700Bold',
        minWidth: 80,
        textAlign: 'right',
        color: '#1E293B',
    },

    // Breakdown styles (kept)
    breakdown: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
    bdText: { fontSize: 10, color: '#10B981', fontFamily: 'Inter_500Medium' },
    bdDivider: { fontSize: 10, color: '#CBD5E1', marginHorizontal: 4 },

    // Empty state
    empty: { alignItems: 'center', marginTop: 100 },
    emptyTxt: { marginTop: 10, color: '#64748B', fontFamily: 'Inter_500Medium' },

    // FAB
    fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', shadowColor: "#4F46E5", shadowOpacity: 0.4, elevation: 8 },

    // Action Buttons
    actionButtonContainer: {
        width: 80,
    },
    rightActionBtn: {
        flex: 1,
        backgroundColor: '#EF4444',
    },
    leftActionBtn: {
        flex: 1,
        backgroundColor: '#10B981',
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteContent: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        marginTop: 4,
    },
});