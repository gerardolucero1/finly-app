import { useCustomAlert } from '@/app/components/CustomAlert';
import { SubaccountFormModal } from '@/app/components/SubaccountFormModal';
import { TransferFormModal } from '@/app/components/TransferFormModal';
import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import { SubaccountsService } from '@/services/subaccounts';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// --- COMPONENTE DE TARJETA DE APARTADO ---
const SubaccountCard = ({ account, onEdit, onDelete, onTransfer }: { account: Account, onEdit: (acc: Account) => void, onDelete: (acc: Account) => void, onTransfer: (acc: Account) => void }) => {
    const formatCurrency = (value: number) => {
        return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
    };

    // Calcular progreso si hay meta
    const programmedAmount = Number(account.programmed_amount || 0);
    const currentBalance = Number(account.current_balance || 0);

    const progress = programmedAmount > 0
        ? Math.min(currentBalance / programmedAmount, 1) * 100
        : 0;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Lucide name="wallet-cards" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => onEdit(account)} style={styles.actionIcon}>
                        <Lucide name="pencil" size={18} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(account)} style={styles.actionIcon}>
                        <Lucide name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{formatCurrency(account.current_balance || 0)}</Text>

            {account.programmed_amount ? (
                <View style={styles.goalContainer}>
                    <View style={styles.goalHeader}>
                        <Text style={styles.goalText}>Cantidad programada: {formatCurrency(account.programmed_amount)}</Text>
                        {/* <Text style={styles.goalPercent}>{Math.round(progress)}%</Text> */}
                    </View>
                    {/* <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View> */}
                </View>
            ) : (
                <Text style={styles.noGoalText}>Sin meta definida</Text>
            )}

            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.transferButton} onPress={() => onTransfer(account)}>
                    <Lucide name="arrow-right-left" size={16} color="#8B5CF6" />
                    <Text style={styles.transferButtonText}>Transferir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default function SubaccountsScreen() {
    const headerHeight = useHeaderHeight();
    const { showAlert, hideAlert, AlertComponent } = useCustomAlert();

    const [subaccounts, setSubaccounts] = useState<Account[]>([]);
    const [destinationAccounts, setDestinationAccounts] = useState<Account[]>([]); // Cuentas para transferir (debit, cash, credit)
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modals state
    const [isFormModalVisible, setFormModalVisible] = useState(false);
    const [isTransferModalVisible, setTransferModalVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [subsResponse, destResponse] = await Promise.all([
                SubaccountsService.getAll(),
                AccountsService.getAll() // Traemos todas para filtrar las destinos válidos
            ]);

            // @ts-ignore: Ajuste por si getAll devuelve paginación o array directo
            const subs = Array.isArray(subsResponse) ? subsResponse : (subsResponse.data || []);
            setSubaccounts(subs);

            // @ts-ignore
            const allAccs = Array.isArray(destResponse) ? destResponse : (destResponse.data || []);
            // Filtramos para que solo sean cuentas válidas para recibir dinero (debit, cash, credit)
            // Aunque TransferFormModal ya filtra la misma cuenta, aquí aseguramos tener la lista completa
            setDestinationAccounts(allAccs);

        } catch (error) {
            console.error(error);
            showAlert({
                title: 'Error',
                message: 'No se pudieron cargar los apartados.',
                type: 'danger'
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // --- HANDLERS ---

    const handleCreate = () => {
        setSelectedAccount(null);
        setFormModalVisible(true);
    };

    const handleEdit = (account: Account) => {
        setSelectedAccount(account);
        setFormModalVisible(true);
    };

    const handleDelete = (account: Account) => {
        const balance = Number(account.current_balance || 0);
        if (balance > 0) {
            showAlert({
                icon: 'circle-alert',
                title: 'No se puede eliminar',
                message: 'El apartado debe tener saldo $0.00 para poder eliminarse. Transfiere los fondos primero.',
                type: 'warning'
            });
            return;
        }

        showAlert({
            title: 'Eliminar Apartado',
            message: `¿Estás seguro de eliminar "${account.name}"?`,
            type: 'warning',
            buttons: [
                {
                    text: 'Cancelar',
                    onPress: () => hideAlert()
                },
                {
                    text: 'Eliminar',
                    onPress: async () => {
                        try {
                            await SubaccountsService.delete(account.id);
                            fetchData();
                            showAlert({ title: 'Éxito', message: 'Apartado eliminado correctamente.', type: 'success' });
                        } catch (error) {
                            console.error(error);
                            showAlert({ title: 'Error', message: 'No se pudo eliminar el apartado.', type: 'danger' });
                        }
                    }
                }
            ]
        });
    };

    const handleTransfer = (account: Account) => {
        setSelectedAccount(account);
        setTransferModalVisible(true);
    };

    // --- RENDER ---

    if (loading && !refreshing) {
        return <View style={styles.centerLoading}><ActivityIndicator size="large" color="#8B5CF6" /></View>;
    }

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <FlatList
                data={subaccounts}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <SubaccountCard
                        account={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onTransfer={handleTransfer}
                    />
                )}
                contentContainerStyle={[styles.listContent]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B5CF6']} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Lucide name="wallet-cards" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No tienes apartados creados.</Text>
                        <Text style={styles.emptySubText}>Crea uno para organizar tu dinero.</Text>
                    </View>
                }
            />

            {/* FAB para crear (opcional, ya está en header) */}
            <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                <Lucide name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* MODALES */}
            <SubaccountFormModal
                visible={isFormModalVisible}
                onClose={() => setFormModalVisible(false)}
                onSave={fetchData}
                accountToEdit={selectedAccount}
            />

            {selectedAccount && (
                <TransferFormModal
                    visible={isTransferModalVisible}
                    onClose={() => setTransferModalVisible(false)}
                    accounts={destinationAccounts} // Pasamos todas las cuentas posibles destino
                    selectedAccount={selectedAccount} // Cuenta origen (subaccount)
                    mode="transfer" // Modo transferencia normal (Origen -> Destino)
                />
            )}

            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingBottom: 100 },

    // CARD STYLES
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
    cardActions: { flexDirection: 'row', gap: 12 },
    actionIcon: { padding: 4 },

    accountName: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#1E293B', marginBottom: 4 },
    accountBalance: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#1E293B', marginBottom: 16 },

    goalContainer: { marginBottom: 16 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    goalText: { fontSize: 12, color: '#64748B', fontFamily: 'Inter_500Medium' },
    goalPercent: { fontSize: 12, color: '#8B5CF6', fontFamily: 'Inter_700Bold' },
    progressBarBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 3 },
    noGoalText: { fontSize: 12, color: '#94A3B8', marginBottom: 16, fontStyle: 'italic' },

    cardFooter: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, alignItems: 'center' },
    transferButton: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
    transferButtonText: { color: '#8B5CF6', fontFamily: 'Inter_500Medium', fontSize: 14 },

    // EMPTY STATE
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#1E293B', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#64748B', marginTop: 4 },
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
});
