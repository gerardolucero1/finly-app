import { BudgetFormModal } from '@/app/components/BudgetFormModal';
import { useInput } from '@/hooks/useInput';
import { Budget } from '@/models/budget';
import { BudgetsService } from '@/services/budgets';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCustomAlert } from '../components/CustomAlert';

const formatCurrency = (value: any) => {
    return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

const BudgetCard = ({ budget, onEdit, onDelete }: { budget: Budget, onEdit: (b: Budget) => void, onDelete: (id: number) => void }) => {
    const progress = Math.min((budget.spent / parseFloat(budget.amount)) * 100, 100);
    const isOverBudget = budget.spent > parseFloat(budget.amount);
    const endDate = DateTime.fromISO(budget.end_date.toString()).setLocale('es').toFormat('dd MMM yyyy');

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIconTitle}>
                    <View style={styles.iconContainer}>
                        <Lucide name="chart-pie" size={24} color="#4F46E5" />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                            {budget.name}
                        </Text>
                        <Text style={styles.cardSubtitle}>
                            {budget.period === 'monthly' ? 'Mensual' :
                                budget.period === 'weekly' ? 'Semanal' :
                                    budget.period === 'yearly' ? 'Anual' : 'Único'}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => onEdit(budget)} style={styles.editButton}>
                        <Lucide name="pencil" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(budget.id)} style={styles.deleteButton}>
                        <Lucide name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.amountLabel}>Gastado</Text>
                        <Text style={[styles.amountValue, isOverBudget && styles.overBudget]}>{formatCurrency(budget.spent)}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.amountLabel}>Límite</Text>
                        <Text style={styles.limitValue}>{formatCurrency(budget.amount)}</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                        <View style={[
                            styles.progressBarFill,
                            { width: `${progress}%`, backgroundColor: isOverBudget ? '#EF4444' : '#10B981' }
                        ]} />
                    </View>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressText}>{progress.toFixed(1)}% usado</Text>
                        <Text style={styles.remainingText}>
                            {isOverBudget ? 'Excedido' : `Quedan ${formatCurrency(parseFloat(budget.amount) - budget.spent)}`}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Lucide name="calendar" size={14} color="#64748B" />
                    <Text style={styles.dateText}> Vence: {endDate}</Text>
                </View>
                {budget.category && (
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{budget.category.name}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default function BudgetsScreen() {
    const params = useLocalSearchParams();
    const headerHeight = useHeaderHeight();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    const isBudgetModalVisible = useInput(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    const fetchBudgets = async () => {
        try {
            const response = await BudgetsService.getAll();
            setBudgets(response || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudieron cargar los presupuestos");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBudgets();
    };

    const handleCreate = () => {
        setEditingBudget(null);
        isBudgetModalVisible.setValue(true);
    };

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        isBudgetModalVisible.setValue(true);
    };

    const handleDelete = (id: number) => {
        showAlert({
            icon: 'circle-alert',
            title: "Eliminar Presupuesto",
            message: "¿Estás seguro de que deseas eliminar este presupuesto?",
            type: "danger",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Eliminar",
                    style: "danger",
                    onPress: async () => {
                        try {
                            await BudgetsService.delete(id);
                            fetchBudgets();
                        } catch (error) {
                            Alert.alert("Error", "No se pudo eliminar el presupuesto");
                        }
                    }
                }
            ]
        })
    };

    const closeBudgetModal = () => {
        isBudgetModalVisible.setValue(false);
        setEditingBudget(null);
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
                        data={budgets}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />}
                        renderItem={({ item }) => (
                            <BudgetCard
                                budget={item}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Lucide name="pie-chart" size={48} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No tienes presupuestos</Text>
                                <Text style={styles.emptySubText}>Crea uno para controlar tus gastos.</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity style={styles.fab} onPress={handleCreate}>
                        <Lucide name="plus" size={24} color="#FFF" />
                    </TouchableOpacity>
                </>
            )}
            <AlertComponent />
            <BudgetFormModal
                visible={isBudgetModalVisible.value}
                onClose={closeBudgetModal}
                onSave={fetchBudgets}
                editingBudget={editingBudget}
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
        backgroundColor: '#EEF2FF',
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
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    amountLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
        fontFamily: 'Inter_500Medium',
    },
    amountValue: {
        fontSize: 20,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
    },
    overBudget: {
        color: '#EF4444',
    },
    limitValue: {
        fontSize: 16,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    progressSection: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 12,
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
    },
    remainingText: {
        fontSize: 11,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    dateText: {
        fontSize: 12,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    categoryTag: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 11,
        color: '#475569',
        fontFamily: 'Inter_500Medium',
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
    },
});
