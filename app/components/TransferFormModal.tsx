import { useTheme } from '@/app/context/theme';
import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Lucide } from '@react-native-vector-icons/lucide';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomAlert } from './CustomAlert';

interface FormState {
    from_account_id: number | string | null;
    to_account_id: number | string | null;
    amount: string;
    date: Date;
    description: string;
}

const initialFormState: FormState = {
    from_account_id: '',
    to_account_id: '',
    amount: '',
    date: new Date(),
    description: '',
};

interface TransferFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    accounts: Account[];
    selectedAccount: Account | null;
    mode?: 'transfer' | 'deposit' | 'payment';
}

export const TransferFormModal = ({ visible, onClose, onSave, accounts, selectedAccount, mode = 'transfer' }: TransferFormModalProps) => {
    const { colors, isDark } = useTheme();
    const [form, setForm] = useState<FormState>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();
    const insets = useSafeAreaInsets();

    // Cuando el modal se abre, resetea el formulario y establece la cuenta origen seleccionada
    useEffect(() => {
        if (visible) {
            setForm({
                ...initialFormState,
                from_account_id: mode === 'transfer' ? (selectedAccount?.id || null) : '',
                to_account_id: (mode === 'deposit' || mode === 'payment') ? (selectedAccount?.id || null) : '',
                description: mode === 'payment' ? 'Pago tarjeta de credito' : '',
            });
        }
    }, [visible, selectedAccount, mode]);

    const handleInputChange = (field: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || form.date;
        setShowDatePicker(Platform.OS === 'ios');
        handleInputChange('date', currentDate);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Validación básica
            if (!form.from_account_id || !form.to_account_id) {
                showAlert({
                    icon: 'circle-alert',
                    title: "Error",
                    message: "Selecciona ambas cuentas.",
                    type: "danger",
                })
                return;
            }

            if (form.from_account_id === form.to_account_id) {
                showAlert({
                    icon: 'circle-alert',
                    title: "Error",
                    message: "No puedes transferir a la misma cuenta.",
                    type: "danger",
                })
                return;
            }

            if (!form.amount || parseFloat(form.amount) <= 0) {
                showAlert({
                    icon: 'circle-alert',
                    title: "Error",
                    message: "Ingresa un monto válido.",
                    type: "danger",
                })
                return;
            }

            // Crear el objeto con el formato correcto para el backend
            const transferData = {
                from_account_id: form.from_account_id,
                to_account_id: form.to_account_id,
                amount: form.amount,
                date: form.date.toISOString().substr(0, 10),
                description: form.description
            };

            if (!selectedAccount) {
                showAlert({
                    icon: 'circle-alert',
                    title: "Error",
                    message: "Cuenta no seleccionada.",
                    type: "danger",
                })
                return;
            }

            await AccountsService.transfer(selectedAccount.id, transferData);
            showAlert({
                icon: 'circle-check',
                title: "Éxito",
                message: "Transferencia realizada correctamente.",
                type: "success",
            })
            onSave();
            onClose();
        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                console.log('Errors:', error.response.data.errors);
                setErrors(error.response.data.errors);
            } else {
                console.log('Error sin respuesta:', error.message);
                showAlert({
                    icon: 'circle-alert',
                    title: "Error",
                    message: "Ocurrió un error inesperado.",
                    type: "danger",
                })
            }
        }
        finally {
            setLoading(false);
        }
    };

    // Helper to get group
    const getAccountGroup = (acc: Account) => {
        if (['cash', 'debit', 'credit'].includes(acc.type)) return 'Cuentas';
        if (['savings', 'investment'].includes(acc.type)) return 'Ahorro e Inversión';
        return 'Apartados'; // Asumimos que el resto son subcuentas o apartados
    };

    // Prepare items with grouping
    const safeAccounts = Array.isArray(accounts) ? accounts : [];

    // 1. Filter valid accounts based on mode
    const validFromAccounts = safeAccounts.filter(acc => (mode === 'deposit' || mode === 'payment') ? acc.id !== form.to_account_id : true);
    const validToAccounts = safeAccounts.filter(acc => mode === 'transfer' ? acc.id !== form.from_account_id : true);

    // 2. Function to build grouped items
    const buildGroupedItems = (filteredAccounts: Account[]) => {
        const grouped: { [key: string]: Account[] } = {
            'Cuentas': [],
            'Ahorro e Inversión': [],
            'Apartados': []
        };

        filteredAccounts.forEach(acc => {
            const group = getAccountGroup(acc);
            if (grouped[group]) {
                grouped[group].push(acc);
            } else {
                // Fallback for unknown types
                if (!grouped['Otros']) grouped['Otros'] = [];
                grouped['Otros'].push(acc);
            }
        });

        const items: any[] = [];
        Object.keys(grouped).forEach(group => {
            if (grouped[group].length > 0) {
                // Add Header
                items.push({
                    label: `--- ${group.toUpperCase()} ---`,
                    value: `HEADER_${group}`,
                    color: colors.textSecondary,
                    inputLabel: `--- ${group} ---`,
                    key: `header_${group}`
                });
                // Add Items
                grouped[group].forEach(acc => {
                    items.push({ label: acc.name, value: acc.id, key: acc.id.toString(), color: colors.text });
                });
            }
        });
        return items;
    };

    const fromAccountItems = buildGroupedItems(validFromAccounts);
    const toAccountItems = buildGroupedItems(validToAccounts);

    // Ensure selected account is present if not already (for edge cases)
    if ((mode === 'deposit' || mode === 'payment') && selectedAccount) {
        if (!toAccountItems.find(item => item.value === selectedAccount.id)) {
            toAccountItems.unshift({ label: selectedAccount.name, value: selectedAccount.id, color: colors.text });
        }
    }

    if (mode === 'transfer' && selectedAccount) {
        if (!fromAccountItems.find(item => item.value === selectedAccount.id)) {
            fromAccountItems.unshift({ label: selectedAccount.name, value: selectedAccount.id, color: colors.text });
        }
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
            presentationStyle="overFullScreen"
        >
            <View style={styles.flexEnd}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>
                            {mode === 'payment' ? 'Pagar Tarjeta' : 'Nueva Transferencia'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                        style={styles.flexEnd}
                        // En Android dentro de un Modal, a veces el cálculo del teclado se desfasa.
                        // Si sientes que sube demasiado o muy poco, ajusta este número (-100, 0, 30, etc.)
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 70}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Monto */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Monto *</Text>
                            <View style={[styles.amountContainer, { backgroundColor: colors.iconBg }]}>
                                <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: colors.text }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textSecondary + '80'}
                                    keyboardType="decimal-pad"
                                    value={form.amount}
                                    onChangeText={(value) => handleInputChange('amount', value)}
                                />
                            </View>
                            {errors.amount && (
                                <Text style={styles.errorText}>{errors.amount[0]}</Text>
                            )}

                            {/* Cuenta Origen */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Desde la cuenta *</Text>
                            <RNPickerSelect
                                value={form.from_account_id}
                                onValueChange={(value) => {
                                    if (value && typeof value === 'string' && value.startsWith('HEADER_')) return;
                                    handleInputChange('from_account_id', value);
                                    // Si la cuenta destino es la misma, limpiala
                                    if (value === form.to_account_id) {
                                        handleInputChange('to_account_id', null);
                                    }
                                }}

                                items={fromAccountItems}
                                placeholder={{ label: "Seleccionar cuenta origen", value: null, color: colors.textSecondary }}
                                style={{
                                    ...pickerSelectStyles,
                                    inputIOS: { ...pickerSelectStyles.inputIOS, backgroundColor: colors.iconBg, color: colors.text },
                                    inputAndroid: { ...pickerSelectStyles.inputAndroid, backgroundColor: colors.iconBg, color: colors.text },
                                }}
                                useNativeAndroidPickerStyle={false}
                                Icon={() => {
                                    return <Lucide name="chevron-down" size={20} color={colors.textSecondary} />;
                                }}
                                disabled={mode === 'transfer'}
                            />
                            {errors.from_account_id && (
                                <Text style={styles.errorText}>{errors.from_account_id[0]}</Text>
                            )}

                            {/* Ícono de transferencia */}
                            <View style={styles.transferIconContainer}>
                                <Lucide name="arrow-down" size={24} color={colors.primary} />
                            </View>

                            {/* Cuenta Destino */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Hacia la cuenta *</Text>
                            <RNPickerSelect
                                value={form.to_account_id}
                                onValueChange={(value) => {
                                    if (value && typeof value === 'string' && value.startsWith('HEADER_')) return;
                                    handleInputChange('to_account_id', value);
                                }}
                                items={toAccountItems}
                                placeholder={{ label: "Seleccionar cuenta destino", value: null, color: colors.textSecondary }}
                                style={{
                                    ...pickerSelectStyles,
                                    inputIOS: { ...pickerSelectStyles.inputIOS, backgroundColor: colors.iconBg, color: colors.text },
                                    inputAndroid: { ...pickerSelectStyles.inputAndroid, backgroundColor: colors.iconBg, color: colors.text },
                                }}
                                useNativeAndroidPickerStyle={false}
                                Icon={() => {
                                    return <Lucide name="chevron-down" size={20} color={colors.textSecondary} />;
                                }}
                                disabled={mode === 'deposit' || mode === 'payment' || !form.from_account_id}
                            />
                            {errors.to_account_id && (
                                <Text style={styles.errorText}>{errors.to_account_id[0]}</Text>
                            )}

                            {/* Fecha */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha *</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datePickerButton, { backgroundColor: colors.iconBg }]}>
                                <Text style={[styles.datePickerText, { color: colors.text }]}>{form.date.toLocaleDateString()}</Text>
                                <Lucide name="calendar" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={form.date}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                            {errors.date && (
                                <Text style={styles.errorText}>{errors.date[0]}</Text>
                            )}

                            {/* Descripción */}
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción (opcional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: colors.iconBg, color: colors.text }]}
                                placeholder="Ej: Transferencia para gastos mensuales..."
                                placeholderTextColor={colors.textSecondary + '80'}
                                value={form.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                            {errors.description && (
                                <Text style={styles.errorText}>{errors.description[0]}</Text>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 10, borderTopColor: colors.border }]}>
                            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onClose} disabled={loading}>
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Lucide name="save" size={18} color="#FFF" />
                                        <Text style={styles.saveButtonText}>
                                            {mode === 'payment' ? 'Pagar' : 'Transferir'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                    <AlertComponent />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexEnd: { flex: 1, justifyContent: 'flex-end' },
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
    label: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#475569',
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#1E293B'
    },
    textArea: {
        height: 80,
        paddingTop: 12,
    },
    amountContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    currencySymbol: {
        fontSize: 24,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
    },
    amountInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginLeft: 10,
    },
    transferIconContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    datePickerButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    footer: { flexDirection: 'row', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
    cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginRight: 10 },
    cancelButtonText: { color: '#475569', fontSize: 16, fontFamily: 'Inter_700Bold' },
    saveButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    errorText: {
        color: 'red',
        fontSize: 11,
        marginTop: 2,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    iconContainer: {
        top: 15,
        right: 15,
    },
});