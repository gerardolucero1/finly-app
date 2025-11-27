import { Debt } from '@/models/debt';
import { DebtsService } from '@/services/debts';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomAlert } from './CustomAlert';

interface DebtFormState {
    name: string;
    total_amount: string;
    remaining_amount: string;
    interest_rate: string;
    debt_payment: string; // Pago fijo periódico
    frequency: 'monthly' | 'biweekly' | 'weekly';
    start_date: Date;
    next_payment_date: Date;
    notes: string;
    due_day: string;
    type: 'loan' | 'mortgage' | 'financing' | 'other';
}

const initialFormState: DebtFormState = {
    name: '',
    total_amount: '',
    remaining_amount: '',
    interest_rate: '',
    debt_payment: '',
    frequency: 'monthly',
    start_date: new Date(),
    next_payment_date: new Date(),
    notes: '',
    due_day: '1',
    type: 'loan',
};

interface DebtFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    editingDebt?: Debt | null;
}

// Mapear el objeto Debt que viene del backend al estado del formulario
const mapDebtToFormState = (debt: Debt): DebtFormState => ({
    name: debt.name,
    total_amount: debt.total_amount.toString(),
    remaining_amount: debt.remaining_amount.toString(),
    interest_rate: debt.interest_rate.toString(),
    debt_payment: debt.debt_payment.toString(),
    frequency: (debt.frequency as 'monthly' | 'biweekly' | 'weekly') || 'monthly',
    start_date: debt.start_date ? new Date(debt.start_date) : new Date(),
    next_payment_date: debt.next_payment_date ? new Date(debt.next_payment_date) : new Date(),
    notes: debt.notes || '',
    due_day: debt.due_day.toString() || '1',
    type: (debt.type as 'loan' | 'mortgage' | 'financing' | 'other') || 'loan',
});

export const DebtFormModal = ({ visible, onClose, onSave, editingDebt }: DebtFormModalProps) => {
    const [form, setForm] = useState<DebtFormState>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof DebtFormState, string>>>({});
    const [showDatePicker, setShowDatePicker] = useState<keyof DebtFormState | null>(null);
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    // Efecto para cargar datos si es edición o limpiar si es nuevo
    useEffect(() => {
        if (visible) {
            setForm(editingDebt ? mapDebtToFormState(editingDebt) : initialFormState);
            setErrors({});
        }
    }, [visible, editingDebt]);

    const handleInputChange = (field: keyof DebtFormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || (showDatePicker ? form[showDatePicker] as Date : new Date());
        setShowDatePicker(null);
        if (selectedDate) { // Solo actualizar si el usuario seleccionó algo (no canceló)
            handleInputChange(showDatePicker!, currentDate);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingDebt) {
                console.log(1111);

                await DebtsService.update(editingDebt.id, form);
            } else {
                await DebtsService.create(form);
            }
            onSave(); // Recargar lista
            onClose(); // Cerrar modal
        } catch (error: any) {
            // Si no hay response, probablemente es un error de red o Axios cortó
            if (!error.response) {
                console.log("Network error:", error);
                showAlert({
                    title: "Error",
                    message: "No se pudo conectar con el servidor.",
                    type: "danger",
                });
                return;
            }

            const status = error.response.status;
            const data = error.response.data;

            // Validaciones 422 típicas de Laravel
            if (status === 422 && data.errors) {
                console.log(data.errors);
                setErrors(data.errors);
                return;
            }

            // Mensaje genérico
            const message =
                data?.message ||
                data?.error ||
                "Ocurrió un error inesperado.";

            console.log("Error:", message);

            showAlert({
                title: "Error",
                message,
                type: "danger",
            });
        } finally {
            setLoading(false);
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

    const frequencyOptions = [
        { value: 'monthly', label: 'Mensual' },
        { value: 'biweekly', label: 'Quincenal' },
        { value: 'weekly', label: 'Semanal' },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.flexEnd}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {editingDebt ? 'Editar Deuda' : 'Nueva Deuda'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                            {/* Nombre */}
                            <Text style={styles.label}>Nombre de la deuda <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="Ej: Préstamo Auto, Hipoteca..."
                                value={form.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                            {/* Tipo de deuda */}
                            <Text style={styles.label}>Tipo de deuda <Text style={styles.required}>*</Text></Text>
                            <View style={styles.col}>
                                <RNPickerSelect
                                    value={form.type}
                                    onValueChange={(value) => handleInputChange('type', value)}
                                    items={[
                                        { label: "Prestamo", value: "loan" },
                                        { label: "Hipoteca", value: "mortgage" },
                                        { label: "Financiamiento", value: "financing" },
                                        { label: "Otro", value: "other" },
                                    ]}
                                    placeholder={{ label: "Seleccionar...", value: null }}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                />
                                {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                            </View>


                            {/* Monto Total */}
                            <Text style={styles.label}>Monto Total Original <Text style={styles.required}>*</Text></Text>
                            <View style={styles.currencyInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.currencyInput}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    value={form.total_amount}
                                    onChangeText={(value) => handleInputChange('total_amount', value)}
                                />
                            </View>
                            {errors.total_amount && <Text style={styles.errorText}>{errors.total_amount}</Text>}

                            {/* Fila: Monto pendiente y Pago Fijo */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Monto Pendiente <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.currencyInputContainer}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={[styles.input, errors.remaining_amount && styles.inputError]}
                                            placeholder="0.00"
                                            keyboardType="decimal-pad"
                                            value={form.remaining_amount}
                                            onChangeText={(value) => handleInputChange('remaining_amount', value)}
                                        />
                                    </View>
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Pago Fijo <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.currencyInputContainer}>
                                        <Text style={styles.currencySymbol}>$</Text>
                                        <TextInput
                                            style={[styles.input, errors.debt_payment && styles.inputError]}
                                            placeholder="0.00"
                                            keyboardType="decimal-pad"
                                            value={form.debt_payment}
                                            onChangeText={(value) => handleInputChange('debt_payment', value)}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Fila: Tasa Interés y Pago Fijo */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Tasa Anual (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: 15.5"
                                        keyboardType="decimal-pad"
                                        value={form.interest_rate}
                                        onChangeText={(value) => handleInputChange('interest_rate', value)}
                                    />
                                </View>

                                <View style={styles.col}>
                                    <Text style={styles.label}>Dia de pago*</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: 1"
                                        keyboardType="decimal-pad"
                                        value={form.due_day}
                                        onChangeText={(value) => handleInputChange('due_day', value)}
                                    />
                                </View>
                            </View>



                            {/* Frecuencia */}
                            <Text style={styles.label}>Frecuencia de Pagos</Text>
                            <View style={styles.typeSelectorContainer}>
                                {frequencyOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.typeButton,
                                            form.frequency === option.value && styles.typeButtonSelected
                                        ]}
                                        onPress={() => handleInputChange('frequency', option.value)}
                                    >
                                        <Text style={[
                                            styles.typeButtonText,
                                            form.frequency === option.value && styles.typeButtonTextSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Fechas */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Fecha Inicio</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker('start_date')} style={styles.datePickerButton}>
                                        <Text style={styles.datePickerText}>{form.start_date.toLocaleDateString()}</Text>
                                        <Lucide name="calendar" size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Próximo Pago</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker('next_payment_date')} style={styles.datePickerButton}>
                                        <Text style={styles.datePickerText}>{form.next_payment_date.toLocaleDateString()}</Text>
                                        <Lucide name="calendar" size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Notas */}
                            <Text style={styles.label}>Notas (Opcional)</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Detalles adicionales..."
                                multiline
                                numberOfLines={3}
                                value={form.notes}
                                onChangeText={(value) => handleInputChange('notes', value)}
                            />

                        </ScrollView>

                        {/* Botones de Acción */}
                        <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <>
                                        <Lucide name="save" size={18} color="#FFF" />
                                        <Text style={styles.saveButtonText}>{editingDebt ? 'Actualizar' : 'Guardar'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {renderDatePicker()}
                        <AlertComponent />
                    </KeyboardAvoidingView>
                </View>
            </View>
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
        height: '85%', // Altura del modal
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0'
    },
    headerTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    label: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#475569', marginTop: 16, marginBottom: 8 },
    required: { color: '#EF4444' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#1E293B', fontFamily: 'Inter_400Regular' },
    inputError: { borderColor: '#EF4444', borderWidth: 1 },
    row: { flexDirection: 'row', gap: 16 },
    col: { flex: 1 },
    currencyInputContainer: { backgroundColor: '#F1F5F9', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
    currencySymbol: { fontSize: 18, color: '#64748B', fontFamily: 'Inter_400Regular' },
    currencyInput: { flex: 1, paddingVertical: 12, fontSize: 18, color: '#1E293B', marginLeft: 8, fontFamily: 'Inter_400Regular' },

    // Selectors
    typeSelectorContainer: { flexDirection: 'row', gap: 10 },
    typeButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFF' },
    typeButtonSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
    typeButtonText: { fontSize: 14, color: '#64748B', fontFamily: 'Inter_500Medium' },
    typeButtonTextSelected: { color: '#4F46E5', fontFamily: 'Inter_700Bold' },

    datePickerButton: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    datePickerText: { fontSize: 16, color: '#1E293B', fontFamily: 'Inter_400Regular' },

    footer: { flexDirection: 'row', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
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