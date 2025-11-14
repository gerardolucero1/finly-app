import { Account } from '@/models/account';
import { AccountsService } from '@/services/accounts';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
    type: 'credit' | 'debit' | 'cash';
    name: string;
    number: string;
    expiry_date: Date;
    bank: string;
    credit_limit: string;
    interest_rate: number;
    min_payment_rate: number;
    current_balance: string;
    available_balance: string;
    cut_off_date: Date;
    payment_due_date: Date;
}

const initialFormState: FormState = {
    type: 'credit',
    name: '',
    number: '1234',
    expiry_date: new Date(),
    bank: '',
    credit_limit: '',
    interest_rate: 4,
    min_payment_rate: 4,
    current_balance: '',
    available_balance: '',
    cut_off_date: new Date(),
    payment_due_date: new Date(),
};

interface AccountFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    editingAccount?: Account | null; // Pasa la cuenta a editar o null/undefined para crear
}

const mapAccountToFormState = (acc: Account): FormState => ({
    type: acc.type,
    name: acc.name,
    number: acc.number ?? '',
    expiry_date: acc.expiry_date ? new Date(acc.expiry_date) : new Date(),
    bank: acc.bank,
    credit_limit: acc.credit_limit?.toString() ?? '',
    interest_rate: acc.interest_rate ?? 0,
    min_payment_rate: acc.min_payment_rate ?? 0,
    current_balance: acc.current_balance?.toString() ?? '',
    available_balance: acc.available_balance?.toString() ?? '',
    cut_off_date: acc.cut_off_date ? new Date(acc.cut_off_date) : new Date(),
    payment_due_date: acc.payment_due_date ? new Date(acc.payment_due_date) : new Date(),
});

export const AccountFormModal = ({ visible, onClose, onSave, editingAccount }: AccountFormModalProps) => {
    const [form, setForm] = useState<FormState>(
        editingAccount ? mapAccountToFormState(editingAccount) : initialFormState
    );
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [showDatePicker, setShowDatePicker] = useState<keyof FormState | null>(null);

    useEffect(() => {
        setForm(editingAccount ? mapAccountToFormState(editingAccount) : initialFormState);
    }, [editingAccount]);

    const handleInputChange = (field: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || (showDatePicker ? form[showDatePicker] as Date : new Date());
        setShowDatePicker(null);
        if (showDatePicker) {
            handleInputChange(showDatePicker, currentDate);
        }
    };

    const handleSave = async () => {
        try {
            if (editingAccount) {
                await AccountsService.update(editingAccount.id, form);
            }else{
                await AccountsService.create(form);
            }
            
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
                Alert.alert("Error", "Ocurrió un error inesperado.");
            }
        }
    };

    const renderDatePicker = () => {
        if (!showDatePicker) return null;
        return (
            <DateTimePicker
                value={form[showDatePicker] as Date}
                mode="date"
                display="default"
                onChange={handleDateChange}
            />
        );
    };

    const typeOptions = [
        { value: 'credit', label: 'Crédito', icon: 'credit-card', color: '#8B5CF6', selectedColor: '#A78BFA' },
        { value: 'debit', label: 'Débito', icon: 'credit-card', color: '#3B82F6', selectedColor: '#60A5FA' },
        { value: 'cash', label: 'Efectivo', icon: 'wallet', color: '#16A34A', selectedColor: '#4ADE80' },
    ] as const;

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
                            {editingAccount ? 'Editar Cuenta' : 'Añadir Cuenta'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* Tipo de cuenta */}
                        <Text style={styles.label}>Tipo de Cuenta <Text style={styles.required}>*</Text></Text>
                        <View style={styles.typeSelectorContainer}>
                            {typeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.typeButton,
                                        form.type === option.value && { borderColor: option.color, backgroundColor: `${option.color}1A` }
                                    ]}
                                    onPress={() => handleInputChange('type', option.value)}
                                >
                                    <Lucide name={option.icon} size={28} color={form.type === option.value ? option.color : '#94A3B8'} />
                                    <Text style={[styles.typeButtonText, form.type === option.value && { color: option.color, fontWeight: '600' }]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}


                        {/* Nombre */}
                        <Text style={styles.label}>Nombre de la cuenta <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Ej: BBVA Azul, Santander Free..."
                            value={form.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                        {/* Campos que no son para efectivo */}
                        {form.type !== 'cash' && (
                            <>
                                <View style={styles.row}>
                                    {/* Banco */}
                                    <View style={styles.col}>
                                        <Text style={styles.label}>Banco <Text style={styles.required}>*</Text></Text>
                                        <RNPickerSelect
                                            value={form.bank}
                                            onValueChange={(value) => handleInputChange('bank', value)}
                                            items={[
                                                { label: "BBVA", value: "BBVA" },
                                                { label: "Santander", value: "Santander" },
                                                { label: "Banorte", value: "Banorte" },
                                                { label: "HSBC", value: "HSBC" },
                                                { label: "Nu", value: "Nu" },
                                                { label: "Otro", value: "Otro" },
                                            ]}
                                            placeholder={{ label: "Seleccionar...", value: null }}
                                            style={pickerSelectStyles}
                                            useNativeAndroidPickerStyle={false}
                                            Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                        />
                                        {errors.bank && <Text style={styles.errorText}>{errors.bank}</Text>}
                                    </View>
                                     {/* Últimos 4 dígitos */}
                                    <View style={styles.col}>
                                        <Text style={styles.label}>4 dígitos <Text style={styles.required}>*</Text></Text>
                                        <TextInput
                                            style={[styles.input, errors.number && styles.inputError]}
                                            placeholder="1234"
                                            keyboardType="number-pad"
                                            maxLength={4}
                                            value={String(form.number ?? '')}
                                            onChangeText={(value) => handleInputChange('number', value)}
                                        />
                                        {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
                                    </View>
                                </View>

                                 {/* Fecha de vencimiento */}
                                <Text style={styles.label}>Fecha de Vencimiento</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker('expiry_date')} style={styles.datePickerButton}>
                                    <Text style={styles.datePickerText}>{form.expiry_date.toLocaleDateString()}</Text>
                                    <Lucide name="calendar" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Campos solo para crédito */}
                        {form.type === 'credit' && (
                           <>
                             <Text style={styles.label}>Límite de crédito <Text style={styles.required}>*</Text></Text>
                             <View style={styles.currencyInputContainer}>
                               <Text style={styles.currencySymbol}>$</Text>
                               <TextInput
                                 style={styles.currencyInput}
                                 placeholder="0.00"
                                 keyboardType="decimal-pad"
                                 value={form.credit_limit}
                                 onChangeText={(value) => handleInputChange('credit_limit', value)}
                               />
                             </View>
                             {errors.credit_limit && <Text style={styles.errorText}>{errors.credit_limit}</Text>}
                             <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Tasa Anual (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="18.50"
                                        keyboardType="decimal-pad"
                                        value={String(form.interest_rate ?? '')}
                                        onChangeText={(value) => handleInputChange('interest_rate', value)}
                                    />
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Pago Mínimo (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="5.00"
                                        keyboardType="decimal-pad"
                                        value={String(form.min_payment_rate ?? '')}
                                        onChangeText={(value) => handleInputChange('min_payment_rate', value)}
                                    />
                                </View>
                             </View>
                             <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Fecha de Corte</Text>
                                     <TouchableOpacity onPress={() => setShowDatePicker('cut_off_date')} style={styles.datePickerButton}>
                                         <Text style={styles.datePickerText}>{form.cut_off_date.toLocaleDateString()}</Text>
                                     </TouchableOpacity>
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Fecha de Pago</Text>
                                     <TouchableOpacity onPress={() => setShowDatePicker('payment_due_date')} style={styles.datePickerButton}>
                                         <Text style={styles.datePickerText}>{form.payment_due_date.toLocaleDateString()}</Text>
                                     </TouchableOpacity>
                                </View>
                             </View>
                           </>
                        )}
                        
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
                            {(form.type === 'debit' || form.type === 'cash') ? (
                                <Text className=' text-xs'>El saldo actual en tu cuenta</Text>
                            ) : (
                                <Text className=' text-xs'>Deuda actual de tu TDC</Text>
                            )}
                        </View>
                        {errors.current_balance && <Text style={styles.errorText}>{errors.current_balance}</Text>}

                        {/* Saldo Disponible */}
                        {(form.type === 'debit' || form.type === 'cash') && (
                            <>
                                {/* <Text style={styles.label}>Saldo Disponible</Text>
                                <View style={styles.currencyInputContainer}>
                                    <Text style={styles.currencySymbol}>$</Text>
                                    <TextInput
                                         style={[
                                            styles.currencyInput,
                                            (form.type === 'debit' || form.type === 'cash') && { opacity: 0.5 } // opcional: estilo visual
                                        ]}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        value={form.available_balance}
                                        editable={!(form.type === 'debit' || form.type === 'cash')}
                                        onChangeText={(value) => handleInputChange('available_balance', value)}
                                    />
                                </View> */}
                            </>
                        )}

                    </ScrollView>

                    {/* Botones de Acción */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Lucide name="save" size={18} color="#FFF" />
                            <Text style={styles.saveButtonText}>{editingAccount ? 'Actualizar' : 'Guardar'}</Text>
                        </TouchableOpacity>
                    </View>

                    {renderDatePicker()}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexEnd: { flex: 1, justifyContent: 'flex-end' },
    modalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
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
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B'
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    typeSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    typeButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        gap: 8,
    },
    typeButtonText: {
        fontSize: 14,
        color: '#475569',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    col: {
        flex: 1,
    },
    currencyInputContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
    },
    currencyInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 18,
        color: '#1E293B',
        marginLeft: 8,
    },
    datePickerButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: '#1E293B',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginRight: 10,
    },
    cancelButtonText: {
        color: '#475569',
        fontSize: 16,
        fontWeight: 'bold',
    },
    saveButton: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#4F46E5', // Indigo-600
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
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