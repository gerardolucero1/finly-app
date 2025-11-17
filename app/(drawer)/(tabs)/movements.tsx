import { FilterModal } from '@/app/components/FilterModal';
import { SearchBar } from '@/app/components/SearchBar';
import { useDebounce } from '@/hooks/useDebounce';
import { Transaction } from '@/models/transaction';
import { TransactionFilters, TransactionsService } from '@/services/transactions';
import Lucide from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

interface TransactionItemProps {
    item: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ item }) => {
    const amount = item.amount;
    const isPositive = item.type == 'income';

    // Formatear fecha
    const formattedDate = item.date
        ? DateTime.fromISO(item.date)
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

export default function MovementsScreen() {
    const headerHeight = useHeaderHeight();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // Estado para los filtros
    const [filters, setFilters] = useState<TransactionFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const debouncedSearchTerm = useDebounce(searchQuery, 500);

    const fetchTransactions = async (isNewSearch = false) => {
        if (loading && !isNewSearch) return; // Evita llamadas duplicadas
        if (!hasMore && !isNewSearch) return;

        setLoading(true);

        try {
            const currentPage = isNewSearch ? 1 : page;
            const response = await TransactionsService.getAll(currentPage, filters);
            
            if (response.data && response.data.length > 0) {                
                setTransactions(prev => isNewSearch ? response.data : [...prev, ...response.data]);
                setPage(currentPage + 1);
            }
            // Si la página actual es la última, hasMore será false
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
                    setPage(2); // Preparamos para la siguiente página
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

    const renderFooter = () => {
        if (!loading || transactions.length === 0) return null;
        return <ActivityIndicator style={{ marginVertical: 20 }} color="#4F46E5" />;
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFilterPress={() => setFilterModalVisible(true)}
            />
            
            {/* Aquí podrías mostrar los filtros activos "chips" */}

            <FlatList
                data={transactions}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => <TransactionItem item={item} />}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No se encontraron movimientos.</Text>
                            <Text style={styles.emptySubText}>Intenta ajustar tu búsqueda o filtros.</Text>
                        </View>
                    ) : null
                }
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
});