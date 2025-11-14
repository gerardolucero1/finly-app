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
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface TransactionItemProps {
    item: Transaction;
}

// --- COMPONENTES VISUALES ---

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Componente de Tarjeta del Carrusel
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
            <View style={styles.card}>
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

// Componente de Botón de Acción
const ActionButton = ({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.actionButtonIconContainer}>
            <Lucide name={icon} size={24} color="#4F46E5" />
        </View>
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
);

// Componente de Item de Transacción
const TransactionItem: React.FC<TransactionItemProps> = ({ item }) => {
    const amount = item.amount;
    const isPositive = item.type == 'income';

    // Formatear fecha
    const formattedDate = item.date
        ? DateTime.fromJSDate(item.date)
            .setLocale('es')
            .toFormat("d 'de' LLLL yyyy")
        : '';

    // Icono según categoría (opcional)
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
                    {item.sub_category ? ` · ${item.sub_category}` : ''}
                </Text>

                <Text style={styles.transactionDate}>{formattedDate}</Text>
            </View>

            <Text style={[
                styles.transactionAmount,
                { color: isPositive ? '#2E7D32' : '#DC2626' }
            ]}>
                {isPositive ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`}
            </Text>
        </View>
    );
};


// --- PANTALLA PRINCIPAL ---

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const SPACING = 10;
const SIDECARD_SPACING = (screenWidth - CARD_WIDTH) / 2;

// Posiciones del Bottom Sheet
const COLLAPSED_HEIGHT = 300; // Altura cuando está colapsado
const EXPANDED_HEIGHT = screenHeight * 0.85; // 85% de la pantalla cuando está expandido

export default function AccountsScreen() {
    const accounts = useInput<Account[]>([]);
    const loading = useInput(true);
    const isExpenseModalVisible = useInput(false);
    const isTransferModalVisible = useInput(false);
    const isIncomeModalVisible = useInput(false);
    const isAccountModalVisible = useInput(false);
    const headerHeight = useHeaderHeight();
    const [activeIndex, setActiveIndex] = useState(0);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Animación del Bottom Sheet
    const bottomSheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);

    // PanResponder para manejar gestos
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Solo activar si el movimiento es vertical
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                // Limitar el movimiento
                const newHeight = isExpanded 
                    ? EXPANDED_HEIGHT - gestureState.dy 
                    : COLLAPSED_HEIGHT - gestureState.dy;
                
                if (newHeight >= COLLAPSED_HEIGHT && newHeight <= EXPANDED_HEIGHT) {
                    bottomSheetHeight.setValue(newHeight);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // Determinar si expandir o colapsar basado en la velocidad y dirección
                if (gestureState.dy < -50 || gestureState.vy < -0.5) {
                    // Arrastrar hacia arriba
                    expandBottomSheet();
                } else if (gestureState.dy > 50 || gestureState.vy > 0.5) {
                    // Arrastrar hacia abajo
                    collapseBottomSheet();
                } else {
                    // Volver al estado actual
                    if (isExpanded) {
                        expandBottomSheet();
                    } else {
                        collapseBottomSheet();
                    }
                }
            },
        })
    ).current;

    const expandBottomSheet = () => {
        setIsExpanded(true);
        Animated.parallel([
            Animated.spring(bottomSheetHeight, {
                toValue: EXPANDED_HEIGHT,
                useNativeDriver: false,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();
    };

    const collapseBottomSheet = () => {
        setIsExpanded(false);
        Animated.parallel([
            Animated.spring(bottomSheetHeight, {
                toValue: COLLAPSED_HEIGHT,
                useNativeDriver: false,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Scroll al inicio cuando colapse
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
        });
    };

    const fetchAccounts = async () => {
        try {
            const response = await AccountsService.getAll(1);
            accounts.setValue(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            loading.setValue(false);
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

    const carouselData = useMemo(() => {
        return [...accounts.value, { id: 'add' }];
    }, [accounts.value]);

    const onScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };
    
    if (loading.value) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: headerHeight - 20}]}>
            <View> 
                <Text className=' text-center text-2xl font-bold py-6'>Mis Cuentas</Text>
            </View>

            {/* Carrusel de Tarjetas */}
            <FlatList
                horizontal
                data={carouselData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <AccountCard item={item} isAddCard={item.id === 'add'} onPressAccount={openAccountModal} />
                )}
                showsHorizontalScrollIndicator={false}
                style={styles.carousel}
                contentContainerStyle={{ paddingHorizontal: SIDECARD_SPACING }}
                snapToInterval={CARD_WIDTH + SPACING}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
            />

            {/* Botones de Acción */}
            <View style={styles.actionsContainer}>
                <ActionButton icon="banknote-arrow-up" label="Ingreso" onPress={() => openIncomeModal()} />
                <ActionButton icon="banknote-arrow-down" label="Gasto" onPress={openExpenseModal} />
                <ActionButton icon="arrow-right-left" label="Transferir" onPress={openTransferModal} />
            </View>

            {/* Overlay oscuro */}
            <Animated.View 
                style={[
                    styles.overlay,
                    {
                        opacity: overlayOpacity,
                        pointerEvents: isExpanded ? 'auto' : 'none',
                    }
                ]}
                onTouchEnd={collapseBottomSheet}
            />

            {/* Bottom Sheet Expandible de Transacciones */}
            <Animated.View 
                style={[
                    styles.transactionsSection,
                    { height: bottomSheetHeight }
                ]}
            >
                {/* Handle del Bottom Sheet */}
                <View {...panResponder.panHandlers} style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>

                {/* Header con título y botón de expansión */}
                <View style={styles.transactionHeader}>
                    <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
                    <TouchableOpacity 
                        onPress={isExpanded ? collapseBottomSheet : expandBottomSheet}
                        style={styles.expandButton}
                    >
                        <Lucide 
                            name={isExpanded ? "chevron-down" : "chevron-up"} 
                            size={24} 
                            color="#64748B" 
                        />
                    </TouchableOpacity>
                </View>

                {/* Lista de Transacciones */}
                {transactionsLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#4F46E5" />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={transactions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No hay transacciones recientes.</Text>}
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={isExpanded} // Solo scroll cuando está expandido
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </Animated.View>

            {/* Modal de Gasto */}
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
                accounts={accounts.value}
                selectedAccount={accounts.value[activeIndex] || null}
            />

            {/* Modal de Gasto */}
            <ExpenseFormModal
                visible={isExpenseModalVisible.value}
                onClose={closeExpenseModal}
                accounts={accounts.value}
                selectedAccount={accounts.value[activeIndex] || null}
            />

            {/* Modal de Transferencia */}
            <TransferFormModal
                visible={isTransferModalVisible.value}
                onClose={closeTransferModal}
                accounts={accounts.value}
                selectedAccount={accounts.value[activeIndex] || null}
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
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        alignItems: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    carousel: {
        maxHeight: 220,
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
        fontWeight: '600' 
    },
    cardBody: {},
    cardBalanceLabel: { 
        color: 'rgba(255,255,255,0.7)', 
        fontSize: 14 
    },
    cardBalance: { 
        color: '#FFF', 
        fontSize: 32, 
        fontWeight: 'bold' 
    },
    cardFooter: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    cardNumber: { 
        color: '#FFF', 
        fontSize: 16, 
        letterSpacing: 2 
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionButtonIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    actionButtonLabel: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '500',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    transactionsSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 2,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#CBD5E1',
        borderRadius: 2,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    expandButton: {
        padding: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#64748B',
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
        fontWeight: '600',
        color: '#1E293B',
    },
    transactionCategory: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 1,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '700',
        minWidth: 80,
        textAlign: 'right',
    },
});