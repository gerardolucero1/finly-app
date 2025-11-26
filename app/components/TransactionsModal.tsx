import { Transaction } from '@/models/transaction';
import { Lucide } from '@react-native-vector-icons/lucide';
import { DateTime } from 'luxon';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

interface TransactionItemProps {
    item: Transaction;
}

interface TransactionsModalProps {
    visible: boolean;
    onClose: () => void;
    transactions: Transaction[];
    loading: boolean;
}

const formatCurrency = (value?: string | number): string => {
    if (value === undefined || value === null || value === '') return '';
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numberValue)) return '';
    return numberValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

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

export const TransactionsModal: React.FC<TransactionsModalProps> = ({
    visible,
    onClose,
    transactions,
    loading
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            presentationStyle="overFullScreen"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flexEnd}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Últimos Movimientos</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4F46E5" />
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => <TransactionItem item={item} />}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No hay transacciones recientes.</Text>
                            }
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.listContent}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexEnd: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
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
});
