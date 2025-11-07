import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    icon: string;
}

const mockTransactions: { [key: number]: Transaction[] } = {
    1: [
        { id: 't1', description: 'Netflix', amount: -15.99, date: 'Hoy, 10:30 AM', icon: 'movie-open' },
        { id: 't2', description: 'Starbucks', amount: -7.50, date: 'Ayer, 4:15 PM', icon: 'coffee' },
        { id: 't3', description: 'Salario', amount: 1500.00, date: '28 Nov, 9:00 AM', icon: 'cash-plus' },
    ],
    2: [
        { id: 't4', description: 'Amazon', amount: -124.50, date: 'Hoy, 1:00 PM', icon: 'amazon' },
        { id: 't5', description: 'Uber Eats', amount: -22.30, date: '29 Nov, 8:00 PM', icon: 'food' },
    ],
    // Añade más mocks si tienes más cuentas de prueba
};

const TransactionsService = {
    getByAccountId: (accountId: number): Promise<Transaction[]> => {
        console.log(`Fetching transactions for account ID: ${accountId}`);
        return new Promise(resolve =>
            setTimeout(() => resolve(mockTransactions[accountId] || []), 1000)
        );
    }
};


// --- COMPONENTES VISUALES ---

const formatCurrency = (value: string | number): string => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Componente de Tarjeta del Carrusel
const AccountCard = ({ item, isAddCard }: { item: Account | { id: 'add' }, isAddCard: boolean }) => {
    if (isAddCard) {
        return (
            <TouchableOpacity style={[styles.card, styles.addCard]}>
                <Icon name="plus" size={40} color="#4F46E5" />
            </TouchableOpacity>
        );
    }
    const account = item as Account;
    return (
        <View style={styles.card}>
            {/* Elementos decorativos */}
            <View style={styles.cardDecoration1} />
            <View style={styles.cardDecoration2} />
            
            <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{account.type}</Text>
                <Icon name="integrated-circuit-chip" size={36} color="rgba(255,255,255,0.5)" />
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardBalanceLabel}>Balance</Text>
                <Text style={styles.cardBalance}>{formatCurrency(account.available_balance)}</Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.cardNumber}>**** **** **** {account.name.slice(-4)}</Text>
                <Icon name="credit-card-wireless-outline" size={30} color="#FFF" style={{transform: [{rotate: '90deg'}]}}/>
            </View>
        </View>
    );
};

// Componente de Botón de Acción
const ActionButton = ({ icon, label, onPress }: { icon: string, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <View style={styles.actionButtonIconContainer}>
            <Icon name={icon} size={24} color="#4F46E5" />
        </View>
        <Text style={styles.actionButtonLabel}>{label}</Text>
    </TouchableOpacity>
);

// Componente de Item de Transacción
const TransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
        <View style={[styles.transactionIconContainer, { backgroundColor: item.amount > 0 ? '#E0F2F1' : '#F1F5F9' }]}>
            <Icon name={item.icon} size={22} color={item.amount > 0 ? '#00796B' : '#475569'} />
        </View>
        <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: item.amount > 0 ? '#2E7D32' : '#1E293B' }]}>
            {item.amount > 0 ? `+${formatCurrency(item.amount)}` : formatCurrency(item.amount)}
        </Text>
    </View>
);


// --- PANTALLA PRINCIPAL ---

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const SPACING = 10;
const SIDECARD_SPACING = (screenWidth - CARD_WIDTH) / 2;

export default function AccountsScreen() {
    const accounts = useInput<Account[]>([]);
    const loading = useInput(true);
    const headerHeight = useHeaderHeight();
    const [activeIndex, setActiveIndex] = useState(0);
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    // useEffect para cargar las cuentas iniciales
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                // Suponemos que getAll(1) trae todas las cuentas sin paginar por ahora
                // para la simplicidad del carrusel. Si necesitas paginación aquí,
                // la lógica se complica un poco más.
                const response = await AccountsService.getAll(1);
                accounts.setValue(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                loading.setValue(false);
            }
        };
        fetchAccounts();
    }, []);

    // useEffect para cargar las transacciones cuando la tarjeta activa cambia
    useEffect(() => {
        if (accounts.value.length === 0) return;
        
        const activeAccount = accounts.value[activeIndex];
        if (!activeAccount) return;

        const fetchTransactions = async () => {
            setTransactionsLoading(true);
            try {
                const response = await TransactionsService.getByAccountId(activeAccount.id);
                setTransactions(response);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setTransactionsLoading(false);
            }
        };

        fetchTransactions();
    }, [activeIndex, accounts.value]);

    const carouselData = useMemo(() => {
        // Añadimos un item placeholder para el botón "Añadir"
        return [{ id: 'add' }, ...accounts.value];
    }, [accounts.value]);

    const onScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
        // El índice real de la cuenta es `index - 1` porque el primer item es el botón de añadir.
        if (index - 1 !== activeIndex && index > 0) {
            setActiveIndex(index - 1);
        }
    };
    
    if (loading.value) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#4F46E5" /></View>;
    }

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: headerHeight + 10 }]}> 
                <Text style={styles.headerTitle}>Mis Cuentas</Text>
            </View>

            {/* Carrusel de Tarjetas */}
            <FlatList
                horizontal
                data={carouselData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => <AccountCard item={item} isAddCard={index === 0} />}
                showsHorizontalScrollIndicator={false}
                style={styles.carousel}
                contentContainerStyle={{ paddingHorizontal: SIDECARD_SPACING }}
                snapToInterval={CARD_WIDTH + SPACING}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16} // Para un onScroll más fluido
            />

            {/* Botones de Acción */}
            <View style={styles.actionsContainer}>
                <ActionButton icon="arrow-down-bold-circle-outline" label="Ingreso" onPress={() => {}} />
                <ActionButton icon="arrow-up-bold-circle-outline" label="Gasto" onPress={() => {}} />
                <ActionButton icon="swap-horizontal" label="Transferir" onPress={() => {}} />
            </View>

            {/* Lista de Transacciones */}
            <View style={styles.transactionsSection}>
                <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
                {transactionsLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#4F46E5" />
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => <TransactionItem item={item} />}
                        ListEmptyComponent={<Text style={styles.emptyText}>No hay transacciones recientes.</Text>}
                    />
                )}
            </View>
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    carousel: {
        maxHeight: 220, // Altura del carrusel
    },
    // Estilos de la tarjeta
    card: {
        width: CARD_WIDTH,
        height: 200,
        backgroundColor: '#4F46E5', // Color principal indigo
        borderRadius: 20,
        marginHorizontal: SPACING / 2,
        padding: 20,
        justifyContent: 'space-between',
        overflow: 'hidden', // Importante para que las decoraciones no se salgan
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardType: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    cardBody: {},
    cardBalanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    cardBalance: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardNumber: { color: '#FFF', fontSize: 16, letterSpacing: 2 },
    // Estilos de botones de acción
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
    // Estilos de la sección de transacciones
    transactionsSection: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        paddingTop: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 15,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    transactionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    transactionDate: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#64748B',
    },
});