import { Account } from '@/models/account';
import { IncomesService } from '@/services/incomes';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Lucide } from '@react-native-vector-icons/lucide';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    source: string;
    description: string;
    type: string;
    amount: string;
    frequency: string;
    date: Date;
    reminder: boolean;
    programmed: boolean;
    account_id: number | string | null;
}

const initialFormState: FormState = {
    source: '',
    description: '',
    type: 'variable',
    amount: '',
    frequency: 'one-time',
    date: new Date(),
    reminder: false,
    programmed: false,
    account_id: '',
};

interface IncomeFormModalProps {
    visible: boolean;
    onClose: () => void;
    accounts: Account[];
    selectedAccount: Account | null;
}

export const IncomeFormModal = ({ visible, onClose, accounts, selectedAccount }: IncomeFormModalProps) => {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (visible) {
            setForm({
                ...initialFormState,
                account_id: selectedAccount?.id || null,
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
        setLoading(true);
        try {
            let response = await IncomesService.create(form);
            onClose();
        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                console.log('Errors:', error.response.data.errors);
                setErrors(error.response.data.errors);
            } else {
                console.log('Error sin respuesta:', error.response.data.message);
                Alert.alert("Error", "Ocurrió un error inesperado.");
            }
        } finally {
            setLoading(false);
        }
    };

    const accountItems = accounts.map(acc => ({ label: acc.name, value: acc.id }));

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
                        <Text style={styles.headerTitle}>Nuevo Ingreso</Text>
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

                        {/* Nombre del Gasto */}
                        <Text style={styles.label}>Fuente *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Sueldo, Pago..."
                            value={form.source}
                            onChangeText={(value) => handleInputChange('source', value)}
                        />
                        {errors.source && (
                            <Text style={styles.errorText}>{errors.source[0]}</Text>
                        )}

                        {/* Cuenta de Origen */}
                        <Text style={styles.label}>Cuenta *</Text>
                        <RNPickerSelect
                            value={form.account_id}
                            onValueChange={(value) => handleInputChange('account_id', value)}
                            items={accountItems}
                            placeholder={{ label: "Seleccionar cuenta", value: null, color: '#94A3B8' }}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Lucide name="chevron-down" size={20} color="#64748B" />;
                            }}
                        />

                        {/* Tipo */}
                        <Text style={styles.label}>Tipo *</Text>
                        <RNPickerSelect
                            value={form.type}
                            onValueChange={(value) => handleInputChange('type', value)}
                            items={[{ label: 'Fijo', value: 'fixed' }, { label: 'Variable', value: 'variable' }]}
                            placeholder={{ label: "Seleccionar tipo", value: null, color: '#94A3B8' }}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Lucide name="chevron-down" size={20} color="#64748B" />;
                            }}
                        />

                        {/* Frecuencia */}
                        <Text style={styles.label}>Frecuencia *</Text>
                        <RNPickerSelect
                            value={form.frequency}
                            onValueChange={(value) => handleInputChange('frequency', value)}
                            items={[
                                { label: 'Una vez', value: 'one-time' },
                                { label: 'Semanal', value: 'weekly' },
                                { label: 'Quincenal', value: 'biweekly' },
                                { label: 'Mensual', value: 'monthly' },
                                { label: 'Anual', value: 'yearly' },
                            ]}
                            placeholder={{ label: "Seleccionar frecuencia", value: null, color: '#94A3B8' }}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => {
                                return <Lucide name="chevron-down" size={20} color="#64748B" />;
                            }}
                        />

                        {/* Fecha */}
                        <Text style={styles.label}>Fecha</Text>
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
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Lucide name="save" size={18} color="#FFF" />
                                    <Text style={styles.saveButtonText}>Guardar</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Guardar Ingreso</Text>
                    </TouchableOpacity> */}
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
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
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
        fontFamily: 'Inter_700Bold',
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
    filePickerButton: {
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        borderStyle: 'dashed',
    },
    filePickerText: {
        fontSize: 16,
        color: '#4F46E5',
        fontFamily: 'Inter_400Regular',
        marginLeft: 10,
    },
    footer: { flexDirection: 'row', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginBottom: Platform.OS === 'ios' ? 50 : 50 },
    cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginRight: 10 },
    cancelButtonText: { color: '#475569', fontSize: 16, fontFamily: 'Inter_700Bold' },
    saveButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    errorText: {
        color: 'red',
        fontSize: 11,
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
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