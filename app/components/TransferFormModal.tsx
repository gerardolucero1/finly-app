import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Lucide } from '@react-native-vector-icons/lucide';
import React, { useEffect, useState } from 'react';
import {
    Alert,
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
    accounts: Account[];
    selectedAccount: Account;
}

export const TransferFormModal = ({ visible, onClose, accounts, selectedAccount }: TransferFormModalProps) => {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    // Cuando el modal se abre, resetea el formulario y establece la cuenta origen seleccionada
    useEffect(() => {
        if (visible) {
            setForm({
                ...initialFormState,
                from_account_id: selectedAccount?.id || null,
            });
        }
    }, [visible, selectedAccount]);

    const handleInputChange = (field: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || form.date;
        setShowDatePicker(Platform.OS === 'ios');
        handleInputChange('date', currentDate);
    };

    const handleSave = async () => {
        try {
            // Validación básica
            if (!form.from_account_id || !form.to_account_id) {
                Alert.alert("Error", "Selecciona ambas cuentas.");
                return;
            }

            if (form.from_account_id === form.to_account_id) {
                Alert.alert("Error", "No puedes transferir a la misma cuenta.");
                return;
            }

            if (!form.amount || parseFloat(form.amount) <= 0) {
                Alert.alert("Error", "Ingresa un monto válido.");
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

            await AccountsService.transfer(selectedAccount.id, transferData);
            Alert.alert("Éxito", "Transferencia realizada correctamente.");
            onClose();
        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                console.log('Errors:', error.response.data.errors);
                setErrors(error.response.data.errors);
            } else {
                console.log('Error sin respuesta:', error.message);
                Alert.alert("Error", "Ocurrió un error inesperado.");
            }
        }
    };

    // Filtra las cuentas para que no aparezca la cuenta origen en el destino y viceversa
    const fromAccountItems = accounts.map(acc => ({ label: acc.name, value: acc.id }));
    const toAccountItems = accounts
        .filter(acc => acc.id !== form.from_account_id)
        .map(acc => ({ label: acc.name, value: acc.id }));

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
                        <Text style={styles.headerTitle}>Nueva Transferencia</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Monto */}
                        <Text style={styles.label}>Monto *</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={form.amount}
                                onChangeText={(value) => handleInputChange('amount', value)}
                            />
                        </View>
                        {errors.amount && (
                            <Text style={styles.errorText}>{errors.amount[0]}</Text>
                        )}

                        {/* Cuenta Origen */}
                        <Text style={styles.label}>Desde la cuenta *</Text>
                        <RNPickerSelect
                            value={form.from_account_id}
                            onValueChange={(value) => {
                                handleInputChange('from_account_id', value);
                                // Si la cuenta destino es la misma, limpiala
                                if (value === form.to_account_id) {
                                    handleInputChange('to_account_id', null);
                                }
                            }}
                            items={fromAccountItems}
                            placeholder={{ label: "Seleccionar cuenta origen", value: null, color: '#94A3B8' }}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Lucide name="chevron-down" size={20} color="#64748B" />;
                            }}
                        />
                        {errors.from_account_id && (
                            <Text style={styles.errorText}>{errors.from_account_id[0]}</Text>
                        )}

                        {/* Ícono de transferencia */}
                        <View style={styles.transferIconContainer}>
                            <Lucide name="arrow-down" size={24} color="#4F46E5" />
                        </View>

                        {/* Cuenta Destino */}
                        <Text style={styles.label}>Hacia la cuenta *</Text>
                        <RNPickerSelect
                            value={form.to_account_id}
                            onValueChange={(value) => handleInputChange('to_account_id', value)}
                            items={toAccountItems}
                            placeholder={{ label: "Seleccionar cuenta destino", value: null, color: '#94A3B8' }}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Lucide name="chevron-down" size={20} color="#64748B" />;
                            }}
                            disabled={!form.from_account_id}
                        />
                        {errors.to_account_id && (
                            <Text style={styles.errorText}>{errors.to_account_id[0]}</Text>
                        )}

                        {/* Fecha */}
                        <Text style={styles.label}>Fecha *</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerText}>{form.date.toLocaleDateString()}</Text>
                            <Lucide name="calendar" size={20} color="#64748B" />
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
                        <Text style={styles.label}>Descripción (opcional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Ej: Transferencia para gastos mensuales..."
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

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Realizar Transferencia</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        fontWeight: 'bold',
        color: '#1E293B',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
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
        fontWeight: 'bold',
        color: '#64748B',
    },
    amountInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 24,
        fontWeight: 'bold',
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
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
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
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#1E293B',
    },
    iconContainer: {
        top: 15,
        right: 15,
    },
});