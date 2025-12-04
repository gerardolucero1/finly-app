import { useUserFeatures } from '@/hooks/useUserFeatures';
import { Account } from '@/models/account';
import { Project } from '@/models/project';
import { IncomesService } from '@/services/incomes';
import { ProjectsService } from '@/services/projects';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormState {
    source: string;
    description: string;
    type: string;
    amount: string;
    scope: string | 'personal' | 'business';
    frequency: string;
    date: Date;
    reminder: boolean;
    programmed: boolean;
    account_id: number | string | null;
    project_id: number | string | null;
}

const initialFormState: FormState = {
    source: '',
    description: '',
    type: 'variable',
    amount: '',
    scope: 'personal',
    frequency: 'one-time',
    date: new Date(),
    reminder: false,
    programmed: false,
    account_id: '',
    project_id: '',
};

interface IncomeFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    accounts: Account[];
    selectedAccount: Account | null;
    editingTransaction?: any;
}

export const IncomeFormModal = ({ visible, onClose, onSave, accounts, selectedAccount, editingTransaction }: IncomeFormModalProps) => {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const insets = useSafeAreaInsets();
    const [projects, setProjects] = useState<Project[]>([]);
    const { hasFeature, getFeatureLimit } = useUserFeatures();

    useEffect(() => {
        if (visible) {
            if (editingTransaction) {
                setForm({
                    source: editingTransaction.name,
                    description: editingTransaction.description,
                    type: editingTransaction.type,
                    amount: editingTransaction.amount ? editingTransaction.amount.toString() : '',
                    scope: editingTransaction.scope || 'personal',
                    frequency: editingTransaction.frequency,
                    date: new Date(editingTransaction.date),
                    reminder: editingTransaction.reminder,
                    programmed: editingTransaction.programmed,
                    account_id: editingTransaction.account_id,
                    project_id: editingTransaction.project_id,
                })
            } else {
                setForm({
                    ...initialFormState,
                    account_id: selectedAccount?.id || null,
                });
            }
        }
    }, [visible, selectedAccount]);

    useEffect(() => {
        const getProjects = async () => {
            try {
                const response = await ProjectsService.getAll();
                setProjects(response);
            } catch (error) {
                console.log(error);
            }
        };
        getProjects();
    }, []);

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
            onSave();
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
    const projectItems = projects.map(acc => ({ label: acc.name, value: acc.id }));
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                style={styles.flexEnd}
                // En Android dentro de un Modal, a veces el cálculo del teclado se desfasa.
                // Si sientes que sube demasiado o muy poco, ajusta este número (-100, 0, 30, etc.)
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -150}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View
                    style={styles.modalContent}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Nuevo Ingreso</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
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

                        {/* Fuente */}
                        <Text style={styles.label}>Fuente de Ingreso <Text style={styles.errorText}>*</Text></Text>
                        <TextInput
                            style={[styles.input, errors.source && styles.errorText]}
                            placeholder="Ej: Nómina, Venta de Garage..."
                            value={form.source}
                            onChangeText={(value) => handleInputChange('source', value)}
                        />
                        {errors.source && <Text style={styles.errorText}>{errors.source[0]}</Text>}

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

                        {/* Tipo y Frecuencia */}
                        <Text style={styles.label}>Tipo</Text>
                        <RNPickerSelect
                            value={form.type}
                            onValueChange={(value) => handleInputChange('type', value)}
                            items={[
                                { label: "Fijo", value: "fixed" },
                                { label: "Variable", value: "variable" },
                            ]}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                        />

                        <Text style={styles.label}>Frecuencia</Text>
                        <RNPickerSelect
                            value={form.frequency}
                            onValueChange={(value) => handleInputChange('frequency', value)}
                            items={[
                                { label: "Una vez", value: "one-time" },
                                { label: "Semanal", value: "weekly" },
                                { label: "Quincenal", value: "biweekly" },
                                { label: "Mensual", value: "monthly" },
                            ]}
                            style={pickerSelectStyles}
                            useNativeAndroidPickerStyle={false}
                            Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                        />

                        {/* Proyecto */}
                        <Text style={styles.label}>Proyecto</Text>
                        <RNPickerSelect
                            value={form.project_id}
                            disabled={!hasFeature('freelancer_mode')}
                            onValueChange={(value) => handleInputChange('project_id', value)}
                            items={projectItems}
                            placeholder={{ label: "Seleccionar proyecto", value: null, color: '#94A3B8' }}
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
                                disabled={!hasFeature('freelancer_mode')}
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