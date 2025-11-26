import { FilterModal } from '@/app/components/FilterModal';
import { SearchBar } from '@/app/components/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';
import { Transaction } from '@/models/transaction';
import { TransactionFilters, TransactionsService } from '@/services/transactions';
import Lucide from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

// Constante para la altura fija de la fila (Crucial para getItemLayout)
const ITEM_HEIGHT = 86;

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

interface TransactionItemProps {
    item: Transaction;
}

// 1. OPTIMIZACIÓN: Usar React.memo para evitar re-renders innecesarios
// El componente solo se actualizará si 'item' cambia.
const TransactionItem = React.memo(({ item }: TransactionItemProps) => {
    const amount = item.amount;
    const isPositive = item.type == 'income';

    // Memoizar la fecha para no recalcularla si no cambia
    const formattedDate = useMemo(() => {
        return item.date
            ? DateTime.fromISO(item.date)
                .setLocale('es')
                .toFormat("d 'de' LLLL yyyy")
            : '';
    }, [item.date]);

    const getIconName = () => {
        // Nota: Para mejor performance, idealmente esto debería venir del backend o ser un mapa simple
        const sub = item.sub_category?.toLowerCase() || '';
        if (sub.includes('comida rápida')) return 'hamburger';
        if (sub.includes('snacks')) return 'donut';
        if (sub.includes('despensa')) return 'store';
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
                <Text style={styles.transactionName} numberOfLines={1}>{item.name}</Text>

                <Text style={styles.transactionCategory} numberOfLines={1}>
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
});

export default function MovementsScreen() {
    const headerHeight = useHeaderHeight();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    const fetchTransactions = async (isNewSearch = false) => {
        // Validación extra: Si está cargando y no es búsqueda nueva, no hacer nada
        if (loading && !isNewSearch) return;
        // Si no hay más datos y no es búsqueda nueva, no hacer nada
        if (!hasMore && !isNewSearch) return;

        setLoading(true);

        try {
            const currentPage = isNewSearch ? 1 : page;
            const response = await TransactionsService.getAll(currentPage, filters);

            if (response.data && response.data.length > 0) {
                setTransactions(prev => {
                    // 1. Combinamos los datos anteriores con los nuevos
                    const rawList = isNewSearch ? response.data : [...prev, ...response.data];

                    // 2. ELIMINAMOS DUPLICADOS POR ID
                    // Creamos un Map donde la clave es el ID. Si el ID se repite, el Map lo sobrescribe (dejando solo uno).
                    const uniqueList = Array.from(new Map(rawList.map(item => [item.id, item])).values());

                    return uniqueList;
                });

                // Solo aumentamos página si obtuvimos datos
                setPage(currentPage + 1);
            }

            setHasMore(response.current_page < response.last_page);

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
                if (response.data && response.data.length > 0) {
                    setTransactions(response.data);
                    setPage(2);
                    setHasMore(response.current_page < response.last_page);
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

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchTransactions();
        }
    };

    const applyFilters = (newFilters: TransactionFilters) => {
        const { search, ...restOfFilters } = newFilters;
        setFilters(restOfFilters);
        setFilterModalVisible(false);
    };

    // 2. OPTIMIZACIÓN: renderItem memoizado
    const renderItem = useCallback(({ item }: { item: Transaction }) => (
        <TransactionItem item={item} />
    ), []);

    // 3. OPTIMIZACIÓN: keyExtractor estable
    const keyExtractor = useCallback((item: Transaction) => item.id.toString(), []);

    const renderFooter = () => {
        if (!loading || transactions.length === 0) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} color="#4F46E5" />;
    };

    // 4. OPTIMIZACIÓN: getItemLayout
    // Esto permite saltar cálculos de layout costosos
    const getItemLayout = useCallback((data: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    }), []);

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFilterPress={() => setFilterModalVisible(true)}
            />

            <FlatList
                data={transactions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Lucide name="banknote-x" size={50} color="#4F46E5" />
                            <Text style={[styles.emptyText, { marginTop: 10 }]}>No se encontraron movimientos.</Text>
                            <Text style={styles.emptySubText}>Intenta ajustar tu búsqueda o filtros.</Text>
                        </View>
                    ) : null
                }

                // --- PROPIEDADES DE RENDIMIENTO CRÍTICAS ---
                getItemLayout={getItemLayout}
                initialNumToRender={10} // Renderiza pocos al inicio (lo que quepa en pantalla)
                maxToRenderPerBatch={10} // No intentes renderizar 50 a la vez al scrollear
                windowSize={11} // Reduce el área de renderizado fuera de pantalla (default es 21)
                removeClippedSubviews={true} // Desmonta vistas fuera de pantalla (Vital en Android)
            />

            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                onApply={applyFilters}
                currentFilters={filters}
            />
        </View>
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
        // 5. OPTIMIZACIÓN: Altura fija
        height: ITEM_HEIGHT, // Forzamos la altura
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12, // Ajusta esto si el contenido se corta
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
        justifyContent: 'center', // Centrar verticalmente el texto
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
});