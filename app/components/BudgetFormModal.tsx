import { Budget } from '@/models/budget';
import { Category } from '@/models/category';
import { SubCategory } from '@/models/subcategory';
import { BudgetsService } from '@/services/budgets';
import { CategoriesService } from '@/services/categories';
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

interface BudgetFormState {
    name: string;
    amount: string;
    category_id: string;
    sub_category_id: string;
    period: 'monthly' | 'weekly' | 'yearly' | 'one_time';
    start_date: Date;
    end_date: Date;
    alert_threshold: string;
    alerts_enabled: boolean;
}

const initialFormState: BudgetFormState = {
    name: '',
    amount: '',
    category_id: '',
    sub_category_id: '',
    period: 'monthly',
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    alert_threshold: '80',
    alerts_enabled: true,
};

interface BudgetFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    editingBudget?: Budget | null;
}

const mapBudgetToFormState = (budget: Budget): BudgetFormState => ({
    name: budget.name,
    amount: budget.amount.toString(),
    category_id: budget.category_id?.toString() || '',
    sub_category_id: budget.sub_category_id?.toString() || '',
    period: (budget.period as 'monthly' | 'weekly' | 'yearly' | 'one_time') || 'monthly',
    start_date: budget.start_date ? new Date(budget.start_date) : new Date(),
    end_date: budget.end_date ? new Date(budget.end_date) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
    alert_threshold: budget.alert_threshold?.toString() || '80',
    alerts_enabled: Boolean(budget.alerts_enabled),
});

export const BudgetFormModal = ({ visible, onClose, onSave, editingBudget }: BudgetFormModalProps) => {
    const [form, setForm] = useState<BudgetFormState>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormState, string>>>({});
    const [showDatePicker, setShowDatePicker] = useState<keyof BudgetFormState | null>(null);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategory[]>([]);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            setForm(editingBudget ? mapBudgetToFormState(editingBudget) : initialFormState);
            setErrors({});
            fetchCategories();
        }
    }, [visible, editingBudget]);

    useEffect(() => {
        if (form.category_id) {
            const filtered = subcategories.filter(sub => sub.category_id.toString() === form.category_id);
            setFilteredSubcategories(filtered);
        } else {
            setFilteredSubcategories([]);
        }
    }, [form.category_id, subcategories]);

    const fetchCategories = async () => {
        try {
            const response = await CategoriesService.getAll();
            setCategories(response.categories || []);
            setSubcategories(response.subcategories || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showAlert({
                icon: 'circle-alert',
                title: "Error",
                message: "No se pudieron cargar las categorías",
                type: "danger",
            })
        }
    };

    const handleInputChange = (field: keyof BudgetFormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || (showDatePicker ? form[showDatePicker] as Date : new Date());
        setShowDatePicker(null);
        if (selectedDate) {
            handleInputChange(showDatePicker!, currentDate);
        }
    };

    const formatForServer = (date: Date) => {
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...form,
                alerts_enabled: form.alerts_enabled ? 1 : 0,
                start_date: formatForServer(form.start_date),
                end_date: formatForServer(form.end_date),
            };

            if (editingBudget) {
                await BudgetsService.update(editingBudget.id, payload);
            } else {
                await BudgetsService.create(payload);
            }
            onSave();
            onClose();
        } catch (error: any) {
            console.log(error.response.data);
            if (error.response?.status === 422) {
                console.log(error.response.data.errors);

                setErrors(error.response.data.errors);
            } else {
                showAlert({
                    title: 'Error',
                    message: 'Ocurrió un error al guardar el presupuesto.',
                    type: 'danger'
                })
            }
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

    const periodOptions = [
        { value: 'monthly', label: 'Mensual' },
        { value: 'weekly', label: 'Semanal' },
        { value: 'yearly', label: 'Anual' },
        { value: 'one_time', label: 'Único' },
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
                            {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
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
                            <Text style={styles.label}>Nombre del presupuesto <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="Ej: Comida, Transporte..."
                                value={form.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                            {/* Monto */}
                            <Text style={styles.label}>Monto Límite <Text style={styles.required}>*</Text></Text>
                            <View style={styles.currencyInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.currencyInput}
                                    placeholder="0.00"
                                    keyboardType="decimal-pad"
                                    value={form.amount}
                                    onChangeText={(value) => handleInputChange('amount', value)}
                                />
                            </View>
                            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

                            {/* Categoría */}
                            <Text style={styles.label}>Categoría</Text>
                            <View style={styles.inputContainer}>
                                <RNPickerSelect
                                    value={form.category_id}
                                    onValueChange={(value) => handleInputChange('category_id', value)}
                                    items={categories.map(cat => ({ label: cat.name, value: cat.id.toString() }))}
                                    placeholder={{ label: "Seleccionar categoría...", value: null }}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                />
                            </View>
                            {errors.sub_category_id && <Text style={styles.errorText}>{errors.sub_category_id}</Text>}

                            {/* Subcategoría */}
                            {filteredSubcategories.length > 0 && (
                                <>
                                    <Text style={styles.label}>Subcategoría</Text>
                                    <View style={styles.inputContainer}>
                                        <RNPickerSelect
                                            value={form.sub_category_id}
                                            onValueChange={(value) => handleInputChange('sub_category_id', value)}
                                            items={filteredSubcategories.map(sub => ({ label: sub.name, value: sub.id.toString() }))}
                                            placeholder={{ label: "Seleccionar subcategoría...", value: null }}
                                            style={pickerSelectStyles}
                                            useNativeAndroidPickerStyle={false}
                                            Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                                        />
                                    </View>
                                    {errors.sub_category_id && <Text style={styles.errorText}>{errors.sub_category_id}</Text>}
                                </>
                            )}

                            {/* Periodo */}
                            <Text style={styles.label}>Periodo</Text>
                            <View style={styles.typeSelectorContainer}>
                                {periodOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.typeButton,
                                            form.period === option.value && styles.typeButtonSelected
                                        ]}
                                        onPress={() => handleInputChange('period', option.value)}
                                    >
                                        <Text style={[
                                            styles.typeButtonText,
                                            form.period === option.value && styles.typeButtonTextSelected
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
                                {errors.start_date && <Text style={styles.errorText}>{errors.start_date}</Text>}
                                <View style={styles.col}>
                                    <Text style={styles.label}>Fecha Fin</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker('end_date')} style={styles.datePickerButton}>
                                        <Text style={styles.datePickerText}>{form.end_date.toLocaleDateString()}</Text>
                                        <Lucide name="calendar" size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                                {errors.end_date && <Text style={styles.errorText}>{errors.end_date}</Text>}
                            </View>

                            {/* Alertas */}
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Alerta al (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ej: 80"
                                        keyboardType="decimal-pad"
                                        value={form.alert_threshold}
                                        onChangeText={(value) => handleInputChange('alert_threshold', value)}
                                    />
                                </View>
                                <View style={[styles.col, { justifyContent: 'center', paddingTop: 30 }]}>
                                    <TouchableOpacity
                                        style={[styles.checkboxContainer, form.alerts_enabled && styles.checkboxActive]}
                                        onPress={() => handleInputChange('alerts_enabled', !form.alerts_enabled)}
                                    >
                                        <View style={[styles.checkbox, form.alerts_enabled && styles.checkboxChecked]}>
                                            {form.alerts_enabled && <Lucide name="check" size={12} color="#FFF" />}
                                        </View>
                                        <Text style={styles.checkboxLabel}>Activar alertas</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </ScrollView>

                        {/* Footer */}
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
                                        <Text style={styles.saveButtonText}>{editingBudget ? 'Actualizar' : 'Guardar'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>

                    {renderDatePicker()}
                </View>
            </View>

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
        height: '85%',
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

    typeSelectorContainer: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    typeButton: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFF' },
    typeButtonSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
    typeButtonText: { fontSize: 13, color: '#64748B', fontFamily: 'Inter_500Medium' },
    typeButtonTextSelected: { color: '#4F46E5', fontFamily: 'Inter_700Bold' },

    datePickerButton: { backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    datePickerText: { fontSize: 16, color: '#1E293B', fontFamily: 'Inter_400Regular' },

    checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
    checkboxActive: { opacity: 1 },
    checkboxLabel: { fontSize: 14, color: '#1E293B', fontFamily: 'Inter_500Medium' },

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
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    iconContainer: {
        top: 15,
        right: 15,
    },
});
