import { SavingFormModal } from '@/app/components/SavingFormModal';
import { TransferFormModal } from '@/app/components/TransferFormModal';
import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import { SavingsService } from '@/services/savings';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCustomAlert } from '../components/CustomAlert';

const formatCurrency = (value: any) => {
    return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const SavingCard = ({ account, onEdit, onDelete, onToggleCompound, onDeposit, onWithdraw }: {
    account: Account,
    onEdit: (a: Account) => void,
    onDelete: (id: number) => void,
    onToggleCompound: (id: number) => void,
    onDeposit: (a: Account) => void,
    onWithdraw: (a: Account) => void
}) => {
    const isInvestment = account.type === 'investment';
    const iconName = isInvestment ? 'trending-up' : 'piggy-bank';
    const iconColor = isInvestment ? '#8B5CF6' : '#10B981';
    const bgColor = isInvestment ? '#F3E8FF' : '#ECFDF5';

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIconTitle}>
                    <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                        <Lucide name={iconName} size={24} color={iconColor} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                            {account.name}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {account.bank} • {isInvestment ? 'Inversión' : 'Ahorro'}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => onEdit(account)} style={styles.editButton}>
                        <Lucide name="pencil" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(account.id)} style={styles.deleteButton}>
                        <Lucide name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.balanceLabel}>Saldo Actual</Text>
                <Text style={styles.balanceValue}>{formatCurrency(account.current_balance)}</Text>

                {account.interest_enabled && (
                    <View style={styles.interestInfo}>
                        <View style={styles.interestRow}>
                            <Text style={styles.interestLabel}>Rendimiento:</Text>
                            <Text style={styles.interestValue}>{account.yield_rate}% {account.yield_period === 'yearly' ? 'Anual' : account.yield_period === 'monthly' ? 'Mensual' : 'Diario'}</Text>
                        </View>
                        <View style={styles.compoundRow}>
                            <Text style={styles.interestLabel}>Interés Compuesto</Text>
                            <Switch
                                trackColor={{ false: "#E2E8F0", true: "#C7D2FE" }}
                                thumbColor={account.auto_compound_daily ? "#4F46E5" : "#f4f3f4"}
                                ios_backgroundColor="#E2E8F0"
                                onValueChange={() => onToggleCompound(account.id)}
                                value={account.auto_compound_daily}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>
                    </View>
                )}

                {account.goal_amount && (
                    <View style={styles.goalSection}>
                        <Text style={styles.goalText}>
                            Meta: {formatCurrency(account.goal_amount)}
                            {account.goal_due_date && ` • ${new Date(account.goal_due_date).toLocaleDateString()}`}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/savings/${account.id}`)}>
                    <Lucide name="eye" size={18} color="#64748B" />
                    <Text style={styles.actionButtonText}>Ver</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionButton} onPress={() => onDeposit(account)}>
                    <Lucide name="hand-coins" size={18} color="#4F46E5" />
                    <Text style={[styles.actionButtonText, { color: '#4F46E5' }]}>Depositar</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionButton} onPress={() => onWithdraw(account)}>
                    <Lucide name="arrow-up-right" size={18} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Retirar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function SavingsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [sourceAccounts, setSourceAccounts] = useState<Account[]>([]); // Cuentas origen para transferencias

    const isSavingModalVisible = useInput(false);
    const isTransferModalVisible = useInput(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [selectedAccountForTransfer, setSelectedAccountForTransfer] = useState<Account | null>(null);
    const [transferMode, setTransferMode] = useState<'deposit' | 'transfer'>('deposit');

    const fetchSavings = async () => {
        try {
            const response = await SavingsService.getAll();
            // @ts-ignore: Response might be wrapped or array directly depending on backend
            setAccounts(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error(error);
            showAlert({
                title: "Error",
                message: "No se pudieron cargar las cuentas de ahorro",
                type: "danger"
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchSourceAccounts = async () => {
        try {
            const response = await AccountsService.getAll();
            // Filtrar cuentas que pueden ser origen (Debit, Cash, Credit tal vez no para ahorro pero depende de la lógica)
            // Asumimos que todas las que trae AccountsService son válidas como origen por ahora
            // @ts-ignore
            setSourceAccounts(Array.isArray(response) ? response : response.data || []);
        } catch (error) {
            console.error("Error fetching source accounts", error);
        }
    };

    useEffect(() => {
        fetchSavings();
        fetchSourceAccounts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavings();
        fetchSourceAccounts();
    };

    const handleCreate = () => {
        setEditingAccount(null);
        isSavingModalVisible.setValue(true);
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        isSavingModalVisible.setValue(true);
    };

    const handleDelete = (id: number) => {
        showAlert({
            icon: 'circle-alert',
            title: "Eliminar Cuenta",
            message: "¿Estás seguro de que deseas eliminar esta cuenta?",
            type: "danger",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Eliminar",
                    style: "danger",
                    onPress: async () => {
                        try {
                            await SavingsService.delete(id);
                            fetchSavings();
                        } catch (error) {
                            showAlert({
                                title: "Error",
                                message: "No se pudo eliminar la cuenta",
                                type: "danger"
                            });
                        }
                    }
                }
            ]
        });
    };

    const handleToggleCompound = async (id: number) => {
        try {
            // Optimistic update
            setAccounts(prev => prev.map(acc =>
                acc.id === id ? { ...acc, auto_compound_daily: !acc.auto_compound_daily } : acc
            ));
            await SavingsService.toggleCompound(id);
        } catch (error: any) {
            console.error(error.response.data);
            // Revert on error
            fetchSavings();
            showAlert({
                title: "Error",
                message: "No se pudo actualizar el interés compuesto",
                type: "danger"
            });
        }
    };

    const handleDeposit = (account: Account) => {
        setSelectedAccountForTransfer(account);
        setTransferMode('deposit');
        isTransferModalVisible.setValue(true);
    };

    const handleWithdraw = (account: Account) => {
        setSelectedAccountForTransfer(account);
        setTransferMode('transfer');
        isTransferModalVisible.setValue(true);
    };

    const closeSavingModal = () => {
        isSavingModalVisible.setValue(false);
        setEditingAccount(null);
    };

    const closeTransferModal = () => {
        isTransferModalVisible.setValue(false);
        setSelectedAccountForTransfer(null);
        fetchSavings(); // Recargar saldos después de transferencia
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            {loading && !refreshing ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <>
                    <FlatList
                        data={accounts}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                        renderItem={({ item }) => (
                            <SavingCard
                                account={item}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleCompound={handleToggleCompound}
                                onDeposit={handleDeposit}
                                onWithdraw={handleWithdraw}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Lucide name="piggy-bank" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>Sin cuentas de ahorro</Text>
                                <Text style={styles.emptySubText}>Comienza a ahorrar para tu futuro.</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                        <Lucide name="plus" size={24} color="#FFF" />
                    </TouchableOpacity>
                </>
            )}

            <SavingFormModal
                visible={isSavingModalVisible.value}
                onClose={closeSavingModal}
                onSave={fetchSavings}
                editingAccount={editingAccount}
            />

            {selectedAccountForTransfer && (
                <TransferFormModal
                    visible={isTransferModalVisible.value}
                    onClose={closeTransferModal}
                    accounts={sourceAccounts} // Pasamos todas las cuentas para que elija origen/destino
                    selectedAccount={selectedAccountForTransfer} // Esta será el destino (deposit) o origen (transfer)
                    mode={transferMode}
                />
            )}

            <AlertComponent />
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
        paddingBottom: 80,
    },
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
        flexShrink: 1,
    },
    textContainer: {
        flexShrink: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        padding: 8,
    },
    deleteButton: {
        padding: 8,
    },
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
        fontSize: 24,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
        marginBottom: 12,
    },
    interestInfo: {
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    interestRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    compoundRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    interestLabel: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    interestValue: {
        fontSize: 12,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
    },
    goalSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    goalText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    divider: {
        width: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 8,
    },
    // Deprecated styles, keeping just in case or removing if unused
    depositButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    depositButtonText: {
        fontSize: 14,
        color: '#4F46E5',
        fontFamily: 'Inter_700Bold',
    },
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
});
