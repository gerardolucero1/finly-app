import { Account } from '@/models/account';
import { SavingsService } from '@/services/savings';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
import { useCustomAlert } from './CustomAlert';

interface SavingFormState {
    name: string;
    type: 'savings' | 'investment';
    bank: string;
    current_balance: string;
    interest_enabled: boolean;
    yield_rate: string;
    yield_period: 'daily' | 'monthly' | 'yearly';
    interest_type: 'fixed' | 'variable';
    goal_amount: string;
    goal_due_date: Date | null;
}

const initialFormState: SavingFormState = {
    name: '',
    type: 'savings',
    bank: '',
    current_balance: '',
    interest_enabled: false,
    yield_rate: '',
    yield_period: 'yearly',
    interest_type: 'fixed',
    goal_amount: '',
    goal_due_date: null,
};

interface SavingFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    editingAccount?: Account | null;
}

const mapAccountToFormState = (account: Account): SavingFormState => ({
    name: account.name,
    type: (account.type as 'savings' | 'investment') || 'savings',
    bank: account.bank || '',
    current_balance: account.current_balance?.toString() || '',
    interest_enabled: Boolean(account.interest_enabled),
    yield_rate: account.yield_rate?.toString() || '',
    yield_period: (account.yield_period as 'daily' | 'monthly' | 'yearly') || 'yearly',
    interest_type: (account.interest_type as 'fixed' | 'variable') || 'fixed',
    goal_amount: account.goal_amount?.toString() || '',
    goal_due_date: account.goal_due_date ? new Date(account.goal_due_date) : null,
});

export const SavingFormModal = ({ visible, onClose, onSave, editingAccount }: SavingFormModalProps) => {
    const [form, setForm] = useState<SavingFormState>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof SavingFormState, string>>>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showAlert, AlertComponent } = useCustomAlert();

    useEffect(() => {
        if (visible) {
            setForm(editingAccount ? mapAccountToFormState(editingAccount) : initialFormState);
            setErrors({});
        }
    }, [visible, editingAccount]);

    const handleInputChange = (field: keyof SavingFormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleInputChange('goal_due_date', selectedDate);
        }
    };

    const formatForServer = (date: Date) => {
        return date.toISOString().slice(0, 10);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...form,
                interest_enabled: form.interest_enabled ? 1 : 0,
                goal_due_date: form.goal_due_date ? formatForServer(form.goal_due_date) : null,
            };

            if (editingAccount) {
                await SavingsService.update(editingAccount.id, payload);
            } else {
                await SavingsService.create(payload);
            }
            onSave();
            onClose();
        } catch (error: any) {
            console.log(error);
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                showAlert({
                    title: 'Error',
                    message: 'Ocurrió un error al guardar la cuenta.',
                    type: 'danger'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
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
                        <Text style={styles.headerTitle}>
                            {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                        {/* Nombre */}
                        <Text style={styles.label}>Nombre de la cuenta <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Ej: Ahorro Emergencia, Inversión Bolsa..."
                            value={form.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        {/* Tipo y Banco */}
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Tipo <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputContainer}>
                                    <RNPickerSelect
                                        value={form.type}
                                        onValueChange={(value) => handleInputChange('type', value)}
                                        items={[
                                            { label: "Ahorro", value: "savings" },
                                            { label: "Inversión", value: "investment" },
                                        ]}
                                        placeholder={{}}
                                        style={pickerSelectStyles}
                                        useNativeAndroidPickerStyle={false}
                                        Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                    />
                                </View>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Institución/Banco</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej: BBVA, GBM..."
                                    value={form.bank}
                                    onChangeText={(value) => handleInputChange('bank', value)}
                                />
                            </View>
                        </View>

                        {/* Saldo Actual */}
                        <Text style={styles.label}>Saldo Actual <Text style={styles.required}>*</Text></Text>
                        <View style={styles.currencyInputContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.currencyInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={form.current_balance}
                                onChangeText={(value) => handleInputChange('current_balance', value)}
                            />
                        </View>
                        {errors.current_balance && <Text style={styles.errorText}>{errors.current_balance}</Text>}

                        {/* Interés Compuesto */}
                        <View style={styles.sectionDivider} />
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => handleInputChange('interest_enabled', !form.interest_enabled)}
                        >
                            <View style={[styles.checkbox, form.interest_enabled && styles.checkboxChecked]}>
                                {form.interest_enabled && <Lucide name="check" size={12} color="#FFF" />}
                            </View>
                            <Text style={styles.checkboxLabel}>Habilitar Interés / Rendimientos</Text>
                        </TouchableOpacity>

                        {form.interest_enabled && (
                            <View style={styles.interestSection}>
                                <View style={styles.row}>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Tasa (%)</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ej: 10.5"
                                            keyboardType="decimal-pad"
                                            value={form.yield_rate}
                                            onChangeText={(value) => handleInputChange('yield_rate', value)}
                                        />
                                    </View>
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Periodo</Text>
                                        <View style={styles.inputContainer}>
                                            <RNPickerSelect
                                                value={form.yield_period}
                                                onValueChange={(value) => handleInputChange('yield_period', value)}
                                                items={[
                                                    { label: "Diario", value: "daily" },
                                                    { label: "Mensual", value: "monthly" },
                                                    { label: "Anual", value: "yearly" },
                                                ]}
                                                placeholder={{}}
                                                style={pickerSelectStyles}
                                                useNativeAndroidPickerStyle={false}
                                                Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                            />
                                        </View>
                                    </View>
                                </View>
                                <Text style={styles.label}>Tipo de Interés</Text>
                                <View style={styles.typeSelectorContainer}>
                                    {['fixed', 'variable'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeButton,
                                                form.interest_type === type && styles.typeButtonSelected
                                            ]}
                                            onPress={() => handleInputChange('interest_type', type)}
                                        >
                                            <Text style={[
                                                styles.typeButtonText,
                                                form.interest_type === type && styles.typeButtonTextSelected
                                            ]}>
                                                {type === 'fixed' ? 'Fijo' : 'Variable'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Metas (Opcional) */}
                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionTitle}>Meta de Ahorro (Opcional)</Text>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Monto Objetivo</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    value={form.goal_amount}
                                    onChangeText={(value) => handleInputChange('goal_amount', value)}
                                />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Fecha Objetivo</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                    <Text style={styles.datePickerText}>
                                        {form.goal_due_date ? form.goal_due_date.toLocaleDateString() : 'Seleccionar'}
                                    </Text>
                                    <Lucide name="calendar" size={18} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        </View>

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
                                    <Text style={styles.saveButtonText}>{editingAccount ? 'Actualizar' : 'Guardar'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={form.goal_due_date || new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
            <AlertComponent />
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexEnd: { flex: 1, justifyContent: 'flex-end' },
    modalOverlay: {
        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        height: '90%',
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
    },
    headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    label: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#475569', marginTop: 16, marginBottom: 8 },
    required: { color: '#EF4444' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#1E293B', fontFamily: 'Inter_400Regular' },
    inputError: { borderColor: '#EF4444', borderWidth: 1 },
    inputContainer: { backgroundColor: '#F1F5F9', borderRadius: 8 },
    row: { flexDirection: 'row', gap: 16 },
    col: { flex: 1 },
    currencyInputContainer: { backgroundColor: '#F1F5F9', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
    currencySymbol: { fontSize: 18, color: '#64748B', fontFamily: 'Inter_400Regular' },
    currencyInput: { flex: 1, paddingVertical: 12, fontSize: 18, color: '#1E293B', marginLeft: 8, fontFamily: 'Inter_400Regular' },

    sectionDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter_500Medium', color: '#1E293B', marginBottom: 10 },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
    checkboxLabel: { fontSize: 14, color: '#1E293B', fontFamily: 'Inter_500Medium' },

    interestSection: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },

    typeSelectorContainer: { flexDirection: 'row', gap: 10 },
    typeButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFF' },
    typeButtonSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
    typeButtonText: { fontSize: 13, color: '#64748B', fontFamily: 'Inter_500Medium' },
    typeButtonTextSelected: { color: '#4F46E5', fontFamily: 'Inter_700Bold' },

    datePickerButton: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    datePickerText: { fontSize: 16, color: '#1E293B', fontFamily: 'Inter_400Regular' },

    footer: { flexDirection: 'row', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginBottom: Platform.OS === 'ios' ? 50 : 50 },
    cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginRight: 10 },
    cancelButtonText: { color: '#475569', fontSize: 16, fontFamily: 'Inter_700Bold' },
    saveButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
    errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, fontFamily: 'Inter_400Regular' },
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
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
        paddingRight: 30,
    },
    iconContainer: {
        top: 15,
        right: 15,
    },
});
