import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { Category } from '@/models/category';
import { SubCategory } from '@/models/subcategory';
import { CategoriesService } from '@/services/categories';
import { ExpensesService } from '@/services/expenses';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Lucide } from '@react-native-vector-icons/lucide';
import * as ImagePicker from 'expo-image-picker';
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
import { SheetManager } from 'react-native-actions-sheet';
import RNPickerSelect from 'react-native-picker-select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormState {
    name: string;
    description: string;
    type: string;
    amount: string;
    scope: string | 'personal' | 'business';
    frequency: string;
    due_date: Date;
    dispensable: boolean;
    reminder: boolean;
    is_paid: boolean;
    is_late: boolean;
    programmed: boolean;
    estimated_amount: string;
    category_id: number | string | null;
    sub_category_id: number | string | null;
    account_id: number | string | null;
    ticket_image_url: string;
    invoice_xml_url: string;
    remove_ticket_image: boolean;
    remove_invoice_xml: boolean;
    ticketImage: ImagePicker.ImagePickerAsset | null;
}

const initialFormState: FormState = {
    name: '',
    description: '',
    type: 'variable',
    amount: '',
    scope: 'personal',
    frequency: 'one-time',
    due_date: new Date(),
    dispensable: false,
    reminder: false,
    is_paid: false,
    is_late: false,
    programmed: false,
    estimated_amount: '',
    category_id: '',
    sub_category_id: '',
    account_id: '',
    ticket_image_url: '',
    invoice_xml_url: '',
    remove_ticket_image: false,
    remove_invoice_xml: false,
    ticketImage: null,
};

interface ExpenseFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    accounts: Account[];
    editingTransaction?: any; // Using any for now to avoid circular dependency or strict type issues with Transaction vs Expense
}

export const ExpenseFormModal = ({ visible, onClose, onSave, accounts, selectedAccount, editingTransaction }: ExpenseFormModalProps) => {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const all_categories = useInput<Category[]>([]);
    const all_subcategories = useInput<SubCategory[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            if (editingTransaction) {
                // Populate form with existing transaction data
                setForm({
                    name: editingTransaction.name || '',
                    description: editingTransaction.description || '',
                    type: editingTransaction.type || 'variable',
                    amount: editingTransaction.amount ? editingTransaction.amount.toString() : '',
                    scope: editingTransaction.scope || 'personal',
                    frequency: editingTransaction.frequency || 'one-time',
                    due_date: editingTransaction.date ? new Date(editingTransaction.date) : new Date(),
                    dispensable: editingTransaction.dispensable || false,
                    reminder: editingTransaction.reminder || false,
                    is_paid: editingTransaction.is_paid || false,
                    is_late: editingTransaction.is_late || false,
                    programmed: editingTransaction.programmed || false,
                    estimated_amount: editingTransaction.estimated_amount ? editingTransaction.estimated_amount.toString() : '',
                    category_id: editingTransaction.category_id || null,
                    sub_category_id: editingTransaction.sub_category_id || null,
                    account_id: editingTransaction.account_id || selectedAccount?.id || null,
                    ticket_image_url: editingTransaction.ticket_image_url || '',
                    invoice_xml_url: editingTransaction.invoice_xml_url || '',
                    remove_ticket_image: false,
                    remove_invoice_xml: false,
                    ticketImage: null,
                });
            } else {
                // Reset form for new expense
                setForm({
                    ...initialFormState,
                    account_id: selectedAccount?.id || null,
                });
            }
            setErrors({});
        }
    }, [visible, selectedAccount, editingTransaction]);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const { categories, subcategories } = await CategoriesService.getAll();
                all_categories.setValue(categories);
                all_subcategories.setValue(subcategories);
            } catch (error) {
                console.log(error);
            }
        };
        getCategories();
    }, []);

    const handleInputChange = (field: keyof FormState, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || form.due_date;
        setShowDatePicker(Platform.OS === 'ios');
        handleInputChange('due_date', currentDate);
    };

    const handlePickImage = () => {
        SheetManager.show('image-picker', {
            payload: {
                onSelect: (asset: ImagePicker.ImagePickerAsset) => {
                    handleInputChange('ticketImage', asset);
                }
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (editingTransaction) {
                await ExpensesService.update(editingTransaction.id, form);
            } else {
                await ExpensesService.create(form);
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
        } finally {
            setLoading(false);
        }
    };

    const accountItems = accounts.map(acc => ({ label: acc.name, value: acc.id }));
    const categoryItems = all_categories.value.map(acc => ({ label: acc.name, value: acc.id }));
    const filteredSubCategoryItems = all_subcategories.value.filter(acc => acc.category_id == form.category_id);
    const subCategoryItems = filteredSubCategoryItems.map(acc => ({ label: acc.name, value: acc.id }));

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

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{editingTransaction ? 'Editar Gasto' : 'Nuevo Gasto'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
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
                            <Text style={styles.label}>Nombre del Gasto *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Renta, Comida, Netflix..."
                                value={form.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                            />
                            {errors.name && (
                                <Text style={styles.errorText}>{errors.name[0]}</Text>
                            )}

                            {/* Cuenta de Origen */}
                            <Text style={styles.label}>Cuenta de origen *</Text>
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

                            {/* Categoría */}
                            <Text style={styles.label}>Categoría *</Text>
                            <RNPickerSelect
                                value={form.category_id}
                                onValueChange={(value) => handleInputChange('category_id', value)}
                                items={categoryItems}
                                placeholder={{ label: "Seleccionar categoría", value: null, color: '#94A3B8' }}
                                style={pickerSelectStyles}
                                useNativeAndroidPickerStyle={false}
                                Icon={() => {
                                    return <Lucide name="chevron-down" size={20} color="#64748B" />;
                                }}
                            />

                            {/* Subcategoria */}
                            <Text style={styles.label}>Subcategoria *</Text>
                            <RNPickerSelect
                                value={form.sub_category_id}
                                onValueChange={(value) => handleInputChange('sub_category_id', value)}
                                items={subCategoryItems}
                                placeholder={{ label: "Seleccionar subcategoría", value: null, color: '#94A3B8' }}
                                style={pickerSelectStyles}
                                useNativeAndroidPickerStyle={false}
                                Icon={() => {
                                    return <Lucide name="chevron-down" size={20} color="#64748B" />;
                                }}
                            />
                            {errors.sub_category_id && (
                                <Text style={styles.errorText}>{errors.sub_category_id[0]}</Text>
                            )}

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

                            {/* Etiqueta */}
                            <Text style={styles.label}>Etiqueta *</Text>
                            <View style={styles.radioGroup}>
                                {/* Opción: Personal */}
                                <TouchableOpacity
                                    style={[
                                        styles.radioOption,
                                        form.scope === 'personal' && styles.radioOptionSelected
                                    ]}
                                    onPress={() => handleInputChange('scope', 'personal')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        form.scope === 'personal' && styles.radioCircleSelected
                                    ]}>
                                        {form.scope === 'personal' && <View style={styles.radioInnerCircle} />}
                                    </View>
                                    <Text style={[
                                        styles.radioText,
                                        form.scope === 'personal' && styles.radioTextSelected
                                    ]}>Personal</Text>
                                </TouchableOpacity>

                                {/* Opción: Negocio */}
                                <TouchableOpacity
                                    style={[
                                        styles.radioOption,
                                        form.scope === 'business' && styles.radioOptionSelected
                                    ]}
                                    onPress={() => handleInputChange('scope', 'business')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        form.scope === 'business' && styles.radioCircleSelected
                                    ]}>
                                        {form.scope === 'business' && <View style={styles.radioInnerCircle} />}
                                    </View>
                                    <Text style={[
                                        styles.radioText,
                                        form.scope === 'business' && styles.radioTextSelected
                                    ]}>Negocio</Text>
                                </TouchableOpacity>
                            </View>

                            {errors.scope && (
                                <Text style={styles.errorText}>{errors.scope[0]}</Text>
                            )}

                            {/* Fecha */}
                            <Text style={styles.label}>Fecha</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                <Text style={styles.datePickerText}>{form.due_date.toLocaleDateString()}</Text>
                                <Lucide name="calendar" size={20} color="#64748B" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={form.due_date}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}

                            {/* Imagen del Ticket */}
                            <Text style={styles.label}>Imagen del ticket</Text>
                            <TouchableOpacity onPress={handlePickImage} style={styles.filePickerButton}>
                                <Lucide name="camera" size={20} color="#4F46E5" />
                                <Text style={styles.filePickerText}>
                                    {form.ticketImage ? form.ticketImage.fileName || 'Imagen seleccionada' : 'Adjuntar ticket'}
                                </Text>
                            </TouchableOpacity>
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
                                        <Text style={styles.saveButtonText}>{editingTransaction ? 'Actualizar' : 'Guardar'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
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
        color: '#1E293B',
        marginLeft: 10,
        fontFamily: 'Inter_700Bold',
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
        fontWeight: '500',
        marginLeft: 10,
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
        fontFamily: 'Inter_400Regular',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    radioOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    radioOptionSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#94A3B8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioCircleSelected: {
        borderColor: '#4F46E5',
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4F46E5',
    },
    radioText: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Inter_500Medium',
    },
    radioTextSelected: {
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
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