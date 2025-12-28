import { useCustomAlert } from '@/app/components/CustomAlert';
import { ExpenseFormModal } from '@/app/components/ExpenseFormModal';
import { FilterModal } from '@/app/components/FilterModal';
import { SearchBar } from '@/app/components/SearchBar';
import { useTheme } from '@/app/context/theme';
import { useDebounce } from '@/hooks/useDebounce';
import { Transaction } from '@/models/transaction';
import { TransactionFilters, TransactionsService } from '@/services/transactions';
import Lucide from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
// Importamos RectButton para mejor respuesta táctil en swipes (opcional, pero recomendado)
import { IncomeFormModal } from '@/app/components/IncomeFormModal';
import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

// Constante para la altura fija de la fila
const ITEM_HEIGHT = 86;

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

interface TransactionItemProps {
    item: Transaction;
    onDelete: (id: number) => void;
    onEdit: (item: Transaction) => void;
}

const TransactionItem = React.memo(({ item, onDelete, onEdit }: TransactionItemProps) => {
    // Referencia para controlar el Swipeable
    const swipeableRef = useRef<SwipeableMethods>(null);
    const { colors, isDark } = useTheme();

    const amount = item.amount;
    const isPositive = item.register_type == 'income';

    const formattedDate = useMemo(() => {
        return item.date
            ? DateTime.fromISO(item.date).setLocale('es').toFormat("d 'de' LLLL yyyy")
            : '';
    }, [item.date]);

    const getIconName = () => {
        const sub = item.sub_category?.toLowerCase() || '';
        if (sub.includes('comida rápida')) return 'hamburger';
        if (sub.includes('snacks')) return 'donut';
        if (sub.includes('despensa')) return 'store';
        if (sub.includes('cafeterías')) return 'coffee';
        if (sub.includes('gasolina')) return 'fuel';
        return 'circle-dollar-sign';
    };

    // Funciones locales para cerrar el swipe antes de la acción
    const handleLocalDelete = () => {
        swipeableRef.current?.close();
        // Pequeño timeout para que la animación de cierre se vea fluida antes de la alerta
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
                {/* Usamos TouchableOpacity con flex:1 para asegurar área de toque */}
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
            overshootRight={false} // Evita rebote excesivo que puede bloquear clicks
            overshootLeft={false}
            rightThreshold={40}
            leftThreshold={40}
            containerStyle={styles.swipeableContainer}
        >
            <View style={[styles.transactionItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={[
                    styles.transactionIconContainer,
                    { backgroundColor: isPositive ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#E0F2F1') : (isDark ? 'rgba(71, 85, 105, 0.2)' : '#F1F5F9') }
                ]}>
                    <Lucide name={getIconName()} size={22} color={isPositive ? '#10B981' : (isDark ? '#94A3B8' : '#475569')} />
                </View>

                <View style={styles.transactionDetails}>
                    <Text style={[styles.transactionName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>

                    <Text style={[styles.transactionCategory, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.category || 'Sin categoría'}
                        {item.sub_category ? ` · ${item.sub_category}` : ''}
                    </Text>

                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>{formattedDate}</Text>
                </View>

                <Text style={[
                    styles.transactionAmount,
                    { color: isPositive ? '#2E7D32' : '#DC2626' }
                ]}>
                    {isPositive ? `+${formatCurrency(amount)}` : `-${formatCurrency(amount)}`}
                </Text>
            </View>
        </Swipeable>
    );
});

export default function MovementsScreen() {
    // ... (El resto de tu lógica de MovementsScreen se mantiene igual, no necesita cambios)
    // Solo incluyo las partes necesarias para el contexto
    const { colors } = useTheme();
    const accounts = useInput<Account[]>([]);
    const headerHeight = useHeaderHeight();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [isExpenseModalVisible, setExpenseModalVisible] = useState(false);
    const [isIncomeModalVisible, setIncomeModalVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();
    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    // ... (fetchTransactions y useEffects iguales)

    const fetchTransactions = async (isNewSearch = false) => {
        if (loading && !isNewSearch) return;
        if (!hasMore && !isNewSearch) return;
        setLoading(true);
        try {
            const currentPage = isNewSearch ? 1 : page;

            const response = await TransactionsService.getAll(currentPage, filters);


            if (response.data && response.data.length > 0) {
                setTransactions(prev => {
                    const rawList = isNewSearch ? response.data : [...prev, ...response.data];
                    const uniqueList = Array.from(new Map(rawList.map(item => [item.id, item])).values());
                    return uniqueList;
                });
                setPage(currentPage + 1);
            }
            const lastPage = Math.ceil(response.total / response.per_page);
            setHasMore(response.current_page < lastPage);
        } catch (error: any) {
            console.error("Error fetching transactions:", error.response);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const allFilters = { ...filters, search: debouncedSearchTerm };
        setTransactions([]);
        setPage(1);
        setHasMore(true);
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await TransactionsService.getAll(1, allFilters);
                const accountsRes = await AccountsService.getAll(1);
                accounts.setValue(accountsRes.data);

                if (response.data && response.data.length > 0) {
                    setTransactions(response.data);
                    setPage(2);
                    const lastPage = Math.ceil(response.total / response.per_page);
                    setHasMore(response.current_page < lastPage);
                } else {
                    setHasMore(false);
                }
            } catch (error: any) {
                console.error("Error fetching transactions:", error.response);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [filters, debouncedSearchTerm]);

    const handleLoadMore = () => { if (!loading && hasMore) fetchTransactions(); };
    const applyFilters = (newFilters: TransactionFilters) => {
        const { search, ...restOfFilters } = newFilters;
        setFilters(restOfFilters);
        setFilterModalVisible(false);
    };

    const handleEdit = useCallback((item: Transaction) => {
        setEditingTransaction(item);
        if (item.register_type === 'expense') {
            setExpenseModalVisible(true);
        } else {
            setIncomeModalVisible(true);
        }
    }, []);

    const handleDelete = useCallback((id: number) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        showAlert({
            title: "Eliminar movimiento",
            message: "¿Estás seguro de que deseas eliminar este movimiento?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Eliminar",
                    style: "danger",
                    onPress: async () => {
                        try {
                            setTransactions(prev => prev.filter(t => t.id !== id));
                            if (transaction.register_type === 'expense') {
                                const { ExpensesService } = require('@/services/expenses');
                                await ExpensesService.delete(id);
                            } else {
                                const { IncomesService } = require('@/services/incomes');
                                await IncomesService.delete(id);
                            }
                            hideAlert();
                        } catch (error: any) {
                            console.error("Error deleting transaction:", error.response.data);
                            fetchTransactions(true);
                            showAlert({
                                title: "Error",
                                message: "No se pudo eliminar el movimiento.",
                            });
                        }
                    }
                }
            ]
        });
    }, [transactions, hideAlert]);

    const renderItem = useCallback(({ item }: { item: Transaction }) => (
        <TransactionItem item={item} onDelete={handleDelete} onEdit={handleEdit} />
    ), [handleDelete, handleEdit]);

    const keyExtractor = useCallback((item: Transaction) => item.id.toString(), []);

    const renderFooter = () => {
        if (!loading || transactions.length === 0) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />;
    };

    const getItemLayout = useCallback((data: any, index: number) => ({
        length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index,
    }), []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { paddingTop: headerHeight, backgroundColor: colors.background }]}>
                <SearchBar value={searchQuery} onChangeText={setSearchQuery} onFilterPress={() => setFilterModalVisible(true)} />
                <FlatList
                    data={transactions}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={!loading ? (<View style={styles.emptyContainer}><Lucide name="banknote-x" size={48} color={colors.textSecondary} /><Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron movimientos.</Text><Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Intenta ajustar tu búsqueda o filtros.</Text></View>) : null}
                    getItemLayout={getItemLayout}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={11}
                    removeClippedSubviews={true}
                />
                <FilterModal visible={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} onApply={applyFilters} currentFilters={filters} />

                <ExpenseFormModal
                    visible={isExpenseModalVisible}
                    onClose={() => { setExpenseModalVisible(false); setEditingTransaction(null); }}
                    onSave={() => fetchTransactions(true)}
                    accounts={accounts.value}
                    editingTransaction={editingTransaction} />

                <IncomeFormModal
                    visible={isIncomeModalVisible}
                    onClose={() => { setIncomeModalVisible(false); setEditingTransaction(null); }}
                    onSave={() => fetchTransactions(true)}
                    accounts={accounts.value}
                    editingTransaction={editingTransaction} />
                <AlertComponent />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#475569',
        fontFamily: 'Inter_500Medium',
    },
    emptySubText: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 8,
        fontFamily: 'Inter_400Regular',
    },
    transactionItem: {
        height: ITEM_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        // --- CAMBIO IMPORTANTE 1: COLOR DE FONDO ---
        // Esto previene que veas los botones de atrás cuando el item se cierra
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
    swipeableContainer: {
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    // Nuevos estilos para asegurar el área táctil
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