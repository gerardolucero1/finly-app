import { AccountFormModal } from '@/app/components/AccountFormModal';
import { ExpenseFormModal } from '@/app/components/ExpenseFormModal';
import { IncomeFormModal } from '@/app/components/IncomeFormModal';
import { TransferFormModal } from '@/app/components/TransferFormModal';
import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { Expense } from '@/models/expense';
import { Income } from '@/models/income';
import { Transaction } from '@/models/transaction';
import { AccountsService } from '@/services/accounts';
import { ExpensesService } from '@/services/expenses';
import { IncomesService } from '@/services/incomes';
import { SavingsService } from '@/services/savings';
import { SubaccountsService } from '@/services/subaccounts';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { RefreshControl } from 'react-native-gesture-handler';

// --- COMPONENTES VISUALES ---

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Componente de Item de Transacción
const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => {
    const amount = item.amount;
    const isPositive = item.type == 'income';

    const formattedDate = item.date
        ? DateTime.fromJSDate(item.date).setLocale('es').toFormat("d 'de' LLLL yyyy")
        : '';

    const getIconName = () => {
        if (item.sub_category?.toLowerCase().includes('comida rápida')) return 'hamburger';
        if (item.sub_category?.toLowerCase().includes('snacks')) return 'donut';
        if (item.sub_category?.toLowerCase().includes('despensa')) return 'store';
        return 'circle-dollar-sign';
    };

    return (
        <View style={styles.transactionItem}>
            <View style={[
                styles.transactionIconContainer,
                { backgroundColor: isPositive ? '#E0F2F1' : '#F1F5F9' }
            ]}>
                <Lucide name={getIconName()} size={22} color={isPositive ? '#00796B' : '#475569'} />
            </View>

            <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{item.name}</Text>
                <Text style={styles.transactionCategory}>
                    {item.category || 'Sin categoría'}
                    {item.sub_category ? ` · ${item.sub_category} ` : ''}
                </Text>
                <Text style={styles.transactionDate}>{formattedDate}</Text>
            </View>

            <Text style={[
                styles.transactionAmount,
                { color: isPositive ? '#2E7D32' : '#DC2626' }
            ]}>
                {isPositive ? `+ ${formatCurrency(amount)} ` : ` - ${formatCurrency(amount)} `}
            </Text>
        </View>
    );
};

// Componente de Tarjeta del Carrusel (sin drag)
const AccountCard = ({ item, isAddCard, onPressAccount }: { item: Account | { id: 'add' }, isAddCard: boolean, onPressAccount: () => void }) => {
    if (isAddCard) {
        return (
            <TouchableOpacity style={[styles.card, styles.addCard]} onPress={() => onPressAccount()}>
                <Lucide name="plus" size={40} color="#4F46E5" />
            </TouchableOpacity>
        );
    }
    const account = item as Account;

    let icon: any = 'card-sim';
    if (account.type == 'cash') {
        icon = 'wallet'
    }

    return (
        <Pressable onPress={() => onPressAccount()}>
            <View style={[styles.card, { backgroundColor: account.color || '#4F46E5' }]}>
                {/* Elementos decorativos */}
                <View style={styles.cardDecoration1} />
                <View style={styles.cardDecoration2} />

                <View style={styles.cardHeader}>
                    <Text style={styles.cardType}>{account.name}</Text>
                    <Lucide name={icon} size={36} color="rgba(255,255,255,0.5)" />

                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.cardBalanceLabel}>Balance</Text>
                    <Text style={styles.cardBalance}>{formatCurrency(account.available_balance)}</Text>
                </View>
                {account.type !== 'cash' && (
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardNumber}>**** **** **** {account.number}</Text>
                        <Lucide name="nfc" size={30} color="#FFF" />
                    </View>
                )}

            </View>
        </Pressable>
    );
};

// Componente de Item para reordenar (lista vertical)
const ReorderItem = ({ item, drag, isActive }: { item: Account, drag: () => void, isActive: boolean }) => {
    return (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                style={[
                    styles.reorderItem,
                    { backgroundColor: item.color || '#4F46E5' },
                    isActive && styles.reorderItemActive
                ]}
            >
                <View style={styles.reorderItemContent}>
                    <Lucide name="grip-vertical" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.reorderItemText}>{item.name}</Text>
                </View>
                <Text style={styles.reorderItemBalance}>{formatCurrency(item.available_balance)}</Text>
            </TouchableOpacity>
        </ScaleDecorator>
    );
};

// Componente de Botón de Acción
const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.actionButtonIconContainer}>
            <Lucide name={icon} size={24} color="#4F46E5" />
        </View>
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- PANTALLA PRINCIPAL ---

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const SPACING = 10;
const SIDECARD_SPACING = (screenWidth - CARD_WIDTH) / 2;

export default function AccountsScreen() {
    const accounts = useInput<Account[]>([]);
    const loading = useInput(true);
    const [refreshing, setRefreshing] = useState(false);
    const isExpenseModalVisible = useInput(false);
    const isTransferModalVisible = useInput(false);
    const isIncomeModalVisible = useInput(false);
    const isAccountModalVisible = useInput(false);
    const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);
    const headerHeight = useHeaderHeight();
    const [activeIndex, setActiveIndex] = useState(0);

    const [transferAccounts, setTransferAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [transferMode, setTransferMode] = useState<'transfer' | 'payment'>('transfer');

    const flatListRef = useRef<FlatList>(null);

    const fetchAccounts = async () => {
        try {
            const [accountsRes, savingsRes, subaccountsRes] = await Promise.all([
                AccountsService.getAll(1),
                SavingsService.getAll(),
                SubaccountsService.getAll()
            ]);

            // Sort accounts by display_order
            const sortedAccounts = accountsRes.data.sort((a: Account, b: Account) => a.display_order - b.display_order);
            accounts.setValue(sortedAccounts);

            // Combine for transfer modal
            // @ts-ignore
            const savings = Array.isArray(savingsRes) ? savingsRes : (savingsRes.data || []);
            // @ts-ignore
            const subs = Array.isArray(subaccountsRes) ? subaccountsRes : (subaccountsRes.data || []);

            setTransferAccounts([...sortedAccounts, ...savings, ...subs]);

        } catch (error) {
            console.log(error);
        } finally {
            loading.setValue(false);
            setRefreshing(false);
        }
    };

    // useEffect para cargar las cuentas iniciales
    useEffect(() => {
        fetchAccounts();
    }, []);

    // useEffect para cargar las transacciones cuando la tarjeta activa cambia
    useEffect(() => {
        if (accounts.value.length === 0) return;

        const activeAccount = accounts.value[activeIndex];
        if (!activeAccount) return;

        const fetchData = async () => {
            setTransactionsLoading(true);
            try {
                const [expenseRes, incomeRes] = await Promise.all([
                    ExpensesService.getAll(1, activeAccount.id),
                    IncomesService.getAll(1, activeAccount.id),
                ]);

                const expenses: Transaction[] = expenseRes.data.map((e: Expense) => ({
                    id: e.id,
                    name: e.name,
                    amount: parseFloat(e.amount),
                    description: e.description,
                    date: DateTime.fromISO(e.due_date).toJSDate(),
                    category: e.category?.name,
                    sub_category: e.sub_category?.name,
                    type: "expense",
                }));

                const incomes: Transaction[] = incomeRes.data.map((i: Income) => ({
                    id: i.id,
                    name: i.source,
                    amount: parseFloat(i.amount),
                    description: i.description,
                    date: DateTime.fromISO(i.date).toJSDate(),
                    category: '',
                    sub_category: '',
                    type: "income",
                }));

                // Unimos
                const merged = [...expenses, ...incomes];

                // Ordenar por fecha descendente (más reciente primero)
                merged.sort((a, b) => b.date.getTime() - a.date.getTime());

                setTransactions(merged);

            } catch (error: any) {
                console.error("Failed to fetch movements", error.response);
            } finally {
                setTransactionsLoading(false);
            }
        };

        fetchData();
    }, [activeIndex, accounts.value]);


    const openIncomeModal = () => isIncomeModalVisible.setValue(true);
    const closeIncomeModal = () => isIncomeModalVisible.setValue(false);

    const openExpenseModal = () => isExpenseModalVisible.setValue(true);
    const closeExpenseModal = () => isExpenseModalVisible.setValue(false);

    const openTransferModal = () => isTransferModalVisible.setValue(true)
    const closeTransferModal = () => isTransferModalVisible.setValue(false);

    const openAccountModal = () => isAccountModalVisible.setValue(true)
    const closeAccountModal = () => isAccountModalVisible.setValue(false)

    const onRefresh = () => {
        setRefreshing(true);
        fetchAccounts();
    };

    const handleReorderDragEnd = async ({ data }: { data: Account[] }) => {
        accounts.setValue(data);

        // Prepare data for API call
        const reorderData = data.map((account, index) => ({
            id: account.id,
            display_order: index
        }));

        try {
            await AccountsService.reorder({ accounts: reorderData });
        } catch (error) {
            console.error('Failed to reorder accounts:', error);
            // Revert to original order on error
            fetchAccounts();
        }
    };

    const carouselData = useMemo(() => {
        return [...accounts.value, { id: 'add' }];
    }, [accounts.value]);

    const onScroll = (event: any) => {
        if (!accounts.value || accounts.value.length === 0) return;

        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + SPACING));
        // Don't select the "add" card
        const maxIndex = accounts.value.length - 1;
        const newIndex = Math.min(index, maxIndex);

        if (newIndex !== activeIndex && newIndex >= 0) {
            setActiveIndex(newIndex);
        }
    };

    if (loading.value) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>

            {/* SECCION 1: CARDS Y TITULO (1/3 de pantalla) */}
            <View style={styles.sectionContainer}>
                <View style={styles.carouselHeader}>
                    <TouchableOpacity onPress={() => setIsReorderModalVisible(true)} style={styles.reorderButton}>
                        <Lucide name="arrow-up-down" size={20} color="#4F46E5" />
                    </TouchableOpacity>
                </View>
                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        horizontal
                        data={carouselData}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <AccountCard item={item} isAddCard={item.id === 'add'} onPressAccount={openAccountModal} />
                        )}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: SIDECARD_SPACING }}
                        snapToInterval={CARD_WIDTH + SPACING}
                        decelerationRate="fast"
                        onMomentumScrollEnd={onScroll}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                        scrollEventThrottle={16}
                    />
                </View>
            </View>

            {/* SECCION 2: BOTONES DE ACCION (1/3 de pantalla) */}
            <View style={styles.sectionContainer}>
                <View style={styles.actionsContainer}>
                    <ActionButton
                        icon="banknote-arrow-up"
                        label={accounts.value[activeIndex]?.type === 'credit' ? "Pagar" : "Ingreso"}
                        onPress={() => {
                            if (accounts.value[activeIndex]?.type === 'credit') {
                                setTransferMode('payment');
                                isTransferModalVisible.setValue(true);
                            } else {
                                openIncomeModal();
                            }
                        }}
                    />
                    <ActionButton icon="banknote-arrow-down" label="Gasto" onPress={openExpenseModal} />
                    <ActionButton icon="arrow-right-left" label="Transferir" onPress={() => {
                        setTransferMode('transfer');
                        openTransferModal();
                    }} />
                </View>
            </View>

            {/* SECCION 3: ULTIMOS MOVIMIENTOS (1/3 de pantalla) */}
            <View style={[styles.sectionContainer, styles.transactionsContainer]}>
                <View style={styles.transactionHeader}>
                    <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
                </View>

                {transactionsLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#4F46E5" />
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No hay transacciones recientes.</Text>}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>

            {/* --- MODALES --- */}

            {/* Modal de Reordenar Cuentas */}
            <Modal
                visible={isReorderModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsReorderModalVisible(false)}
            >
                <View style={styles.reorderModalOverlay}>
                    <View style={styles.reorderModalContent}>
                        <View style={styles.reorderModalHeader}>
                            <Text style={styles.reorderModalTitle}>Reordenar Cuentas</Text>
                            <TouchableOpacity onPress={() => setIsReorderModalVisible(false)}>
                                <Lucide name="x" size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.reorderModalSubtitle}>Mantén presionado y arrastra para reordenar</Text>
                        <DraggableFlatList
                            data={accounts.value}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, drag, isActive }: RenderItemParams<Account>) => (
                                <ReorderItem item={item} drag={drag} isActive={isActive} />
                            )}
                            onDragEnd={handleReorderDragEnd}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal de Cuenta */}
            <AccountFormModal
                visible={isAccountModalVisible.value}
                onClose={closeAccountModal}
                onSave={fetchAccounts}
                editingAccount={accounts.value[activeIndex] || null}
            />

            {/* Modal de Ingreso */}
            <IncomeFormModal
                visible={isIncomeModalVisible.value}
                onClose={closeIncomeModal}
                onSave={fetchAccounts}
                accounts={accounts.value}
                selectedAccount={accounts.value[activeIndex] || null}
            />

            {/* Modal de Gasto */}
            <ExpenseFormModal
                visible={isExpenseModalVisible.value}
                onClose={closeExpenseModal}
                onSave={fetchAccounts}
                accounts={accounts.value}
                selectedAccount={accounts.value[activeIndex] || null}
            />

            {/* Modal de Transferencia */}
            <TransferFormModal
                visible={isTransferModalVisible.value}
                onClose={closeTransferModal}
                onSave={fetchAccounts}
                accounts={transferAccounts}
                selectedAccount={accounts.value[activeIndex] || null}
                mode={transferMode}
            />

        </View>
    );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    sectionContainer: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },
    carouselHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        marginBottom: 5,
    },
    reorderButton: {
        padding: 8,
        backgroundColor: '#E0E7FF',
        borderRadius: 8,
    },
    screenTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 15,
        color: '#1E293B'
    },
    carouselContainer: {
        height: 200,
    },
    card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: '#4F46E5',
        borderRadius: 20,
        marginHorizontal: SPACING / 2,
        padding: 20,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    addCard: {
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C7D2FE',
        borderStyle: 'dashed',
    },
    cardDecoration1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: -50,
        right: -80,
    },
    cardDecoration2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -60,
        left: -40,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardType: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    cardBody: {},
    cardBalanceLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },
    cardBalance: {
        color: '#FFF',
        fontSize: 32,
        fontFamily: 'Inter_700Bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardNumber: {
        color: '#FFF',
        fontSize: 16,
        letterSpacing: 2,
        fontFamily: 'Inter_500Medium',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
    },
    actionButtonIconContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#FFF',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    actionButtonLabel: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'Inter_400Regular',
    },
    transactionsContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        justifyContent: 'flex-start',
    },
    transactionHeader: {
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginBottom: 5,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#64748B',
        fontFamily: 'Inter_400Regular',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
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
    },
    transactionName: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
    },
    transactionCategory: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
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
    },
    reorderModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    reorderModalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    reorderModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reorderModalTitle: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    reorderModalSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        marginBottom: 20,
    },
    reorderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },
    reorderItemActive: {
        opacity: 0.8,
        transform: [{ scale: 1.02 }],
    },
    reorderItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    reorderItemText: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#FFF',
    },
    reorderItemBalance: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: 'rgba(255,255,255,0.8)',
    },
});