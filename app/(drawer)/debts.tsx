import { useInput } from '@/hooks/useInput';
import { Debt } from '@/models/debt'; // Asegúrate de que tu modelo coincida con el JSON
import { DebtsService } from '@/services/debts';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DebtFormModal } from '../components/DebtFormModal';

// --- HELPER: Formato de Moneda ---
const formatCurrency = (value: any) => {
    return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

// --- COMPONENTE: MODAL DE TABLA DE AMORTIZACIÓN ---
const AmortizationModal = ({ visible, onClose, schedule, debtName }: any) => (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tabla de Amortización</Text>
                <Text style={styles.modalSubtitle}>{debtName}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Lucide name="x" size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* Encabezados de Tabla */}
            <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { width: 40 }]}>#</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pago</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Interés</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Capital</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Balance</Text>
            </View>

            <FlatList
                data={schedule}
                keyExtractor={(item) => item.payment_number.toString()}
                renderItem={({ item }) => (
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: 40, color: '#64748B' }]}>{item.payment_number}</Text>
                        <Text style={[styles.tableCell, { flex: 1, fontWeight: '600' }]}>{formatCurrency(item.payment)}</Text>
                        <Text style={[styles.tableCell, { flex: 1, color: '#EF4444' }]}>{formatCurrency(item.interest)}</Text>
                        <Text style={[styles.tableCell, { flex: 1, color: '#10B981' }]}>{formatCurrency(item.principal)}</Text>
                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(item.balance)}</Text>
                    </View>
                )}
            />
        </View>
    </Modal>
);

// --- COMPONENTE: TARJETA DE DEUDA ---
const DebtCard = ({ debt, onEdit, onPay, onViewTable }: { debt: Debt, onEdit: (d: Debt) => void, onPay: (d: Debt) => void, onViewTable: (d: Debt) => void }) => {
    // Icono dinámico según nombre o tipo
    const getIcon = () => {
        const lowerName = debt.name.toLowerCase();
        if (lowerName.includes('auto') || lowerName.includes('coche')) return 'car';
        if (lowerName.includes('casa') || lowerName.includes('hipoteca')) return 'home';
        if (lowerName.includes('tarjeta') || lowerName.includes('visa')) return 'credit-card';
        if (lowerName.includes('prestamo') || lowerName.includes('personal')) return 'banknote';
        return 'file-minus';
    };

    const progress = parseFloat(debt.progress_percentage);
    const nextDate = DateTime.fromISO(debt.next_payment_date).setLocale('es').toFormat('dd MMM yyyy');

    // Calcular días restantes para urgencia
    const daysLeft = DateTime.fromISO(debt.next_payment_date).diffNow('days').days;
    const isUrgent = daysLeft <= 3;

    return (
        <View style={styles.card}>
            {/* Header de Tarjeta */}
            <View style={styles.cardHeader}>
                <View style={styles.cardIconTitle}>
                    <View style={styles.iconContainer}>
                        <Lucide name={getIcon()} size={24} color="#EF4444" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>{debt.name}</Text>
                        <Text style={styles.cardSubtitle}>
                            {debt.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => onEdit(debt)} style={styles.editButton}>
                    <Lucide name="pencil" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>

            {/* Cuerpo Principal */}
            <View style={styles.cardBody}>
                <Text style={styles.balanceLabel}>Deuda Restante</Text>
                <Text style={styles.balanceValue}>{formatCurrency(debt.remaining_amount)}</Text>

                {/* Barra de Progreso */}
                <View style={styles.progressSection}>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressText}>Progreso de pago</Text>
                        <Text style={styles.progressPercentage}>{progress.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.remainingPayments}>Faltan {debt.remaining_payments} pagos</Text>
                </View>
            </View>

            {/* Footer con Info de Pago y Botones */}
            <View style={styles.cardFooter}>
                <View style={styles.paymentInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Lucide name="calendar" size={14} color={isUrgent ? '#EF4444' : '#64748B'} />
                        <Text style={[styles.dateText, isUrgent && styles.urgentText]}> {nextDate}</Text>
                    </View>
                    <Text style={styles.paymentAmount}>{formatCurrency(debt.debt_payment)}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.tableBtn} onPress={() => onViewTable(debt)}>
                        <Lucide name="table-2" size={20} color="#64748B" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.payBtn} onPress={() => onPay(debt)}>
                        <Text style={styles.payBtnText}>Pagar</Text>
                        <Lucide name="arrow-right" size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// --- PANTALLA PRINCIPAL ---
export default function DebtsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [debts, setDebts] = useState<Debt[]>([]);

    // --- CAMBIO 1: Gestión de estado para el Modal de Formulario ---
    const isDebtModalVisible = useInput(false);
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null); // Estado para la deuda a editar

    // Estado para el Modal de Amortización
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [isTableVisible, setTableVisible] = useState(false);

    const fetchDebts = async () => {
        try {
            const response = await DebtsService.getAll(1);
            setDebts(response.data || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar las deudas");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDebts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDebts();
    };

    // --- ACCIONES ---

    // Crear: Limpiamos editingDebt y abrimos modal
    const handleCreate = () => {
        setEditingDebt(null);
        isDebtModalVisible.setValue(true);
    };

    // Editar: Guardamos la deuda seleccionada y abrimos modal
    const handleEdit = (debt: Debt) => {
        setEditingDebt(debt);
        isDebtModalVisible.setValue(true);
    };

    // Pagar (Sin cambios)
    const handlePay = (debt: Debt) => {
        router.push({
            pathname: '/pages/payments',
            params: {
                debtId: debt.id,
                debtName: debt.name
            }
        });
    };

    const handleViewTable = (debt: Debt) => {
        setSelectedDebt(debt);
        setTableVisible(true);
    };

    // Cerrar Modal: Limpiamos estado
    const closeDebtModal = () => {
        isDebtModalVisible.setValue(false);
        setEditingDebt(null); // Buenas práctica limpiar al cerrar
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            {/* ... (Misma lógica de loading y FlatList que tenías) */}

            {loading && !refreshing ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <>
                    <FlatList
                        data={debts}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                        renderItem={({ item }) => (
                            <DebtCard
                                debt={item}
                                onEdit={handleEdit} // Ahora pasa la función correcta
                                onPay={handlePay}
                                onViewTable={handleViewTable}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Lucide name="thumbs-up" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>¡Estás libre de deudas!</Text>
                                <Text style={styles.emptySubText}>O quizás necesitas registrar una nueva.</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                        <Lucide name="plus" size={24} color="#FFF" />
                    </TouchableOpacity>
                </>
            )}

            {/* Modal de Amortización */}
            {selectedDebt && (
                <AmortizationModal
                    visible={isTableVisible}
                    onClose={() => setTableVisible(false)}
                    schedule={selectedDebt.amortization_schedule}
                    debtName={selectedDebt.name}
                />
            )}

            {/* --- CAMBIO 2: Modal de Formulario Configurado --- */}
            <DebtFormModal
                visible={isDebtModalVisible.value}
                onClose={closeDebtModal}
                onSave={fetchDebts} // Recargar lista al guardar
                editingDebt={editingDebt} // Pasamos la deuda a editar (o null)
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 80, // Espacio para el FAB
    },
    // --- DEBT CARD ---
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FEF2F2', // Rojo muy claro
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    cardSubtitle: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        textTransform: 'capitalize',
    },
    editButton: {
        padding: 8,
    },
    // Body
    cardBody: {
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
        fontFamily: 'Inter_500Medium',
    },
    balanceValue: {
        fontSize: 28,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
        marginBottom: 16,
    },
    progressSection: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    progressPercentage: {
        fontSize: 12,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981', // Verde progreso
        borderRadius: 3,
    },
    remainingPayments: {
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'right',
    },
    // Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    paymentInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    urgentText: {
        color: '#EF4444',
        fontFamily: 'Inter_700Bold',
    },
    paymentAmount: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    tableBtn: {
        padding: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
    },
    payBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B', // Dark
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        gap: 6,
    },
    payBtnText: {
        color: '#FFF',
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
    },

    // --- FAB ---
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },

    // --- EMPTY STATE ---
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#334155',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },

    // --- MODAL ---
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingTop: 50,
    },
    modalHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    modalSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#64748B',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 0,
        padding: 4,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        paddingTop: 10,
    },
    tableHeaderCell: {
        fontSize: 12,
        fontFamily: 'Inter_700Bold',
        color: '#475569',
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tableCell: {
        fontSize: 12,
        fontFamily: 'Inter_400Regular',
        color: '#334155',
    },
});