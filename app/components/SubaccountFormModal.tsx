import { Account } from '@/models/account';
import { SubaccountsService } from '@/services/subaccounts';
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

interface SubaccountFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    accountToEdit?: Account | null;
}

interface FormState {
    name: string;
    available_balance: string;
    programmed_amount: string;
}

const initialFormState: FormState = {
    name: '',
    available_balance: '',
    programmed_amount: '',
};

export const SubaccountFormModal = ({ visible, onClose, onSave, accountToEdit }: SubaccountFormModalProps) => {
    const [form, setForm] = useState<FormState>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (visible) {
            if (accountToEdit) {
                setForm({
                    name: accountToEdit.name,
                    available_balance: accountToEdit.current_balance?.toString() || '',
                    programmed_amount: accountToEdit.programmed_amount?.toString() || '',
                });
            } else {
                setForm(initialFormState);
            }
            setErrors({});
        }
    }, [visible, accountToEdit]);

    const handleInputChange = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string[] } = {};
        if (!form.name.trim()) newErrors.name = ['El nombre es obligatorio.'];

        // available_balance es opcional al crear, pero si se pone debe ser número
        if (form.available_balance && isNaN(Number(form.available_balance))) {
            newErrors.available_balance = ['Debe ser un número válido.'];
        }

        if (form.programmed_amount && isNaN(Number(form.programmed_amount))) {
            newErrors.programmed_amount = ['Debe ser un número válido.'];
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            const payload = {
                name: form.name,
                available_balance: form.available_balance ? parseFloat(form.available_balance) : 0,
                programmed_amount: form.programmed_amount ? parseFloat(form.programmed_amount) : 0,
            };

            if (accountToEdit) {
                await SubaccountsService.update(accountToEdit.id, payload);
            } else {
                await SubaccountsService.create(payload);
            }

            onSave();
            onClose();
        } catch (error: any) {
            console.error(error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Alert.alert("Error", "Ocurrió un error al guardar el apartado.");
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
                            {accountToEdit ? 'Editar Apartado' : 'Nuevo Apartado'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Lucide name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Nombre */}
                        <Text style={styles.label}>Nombre *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Vacaciones, Fondo de Emergencia"
                            value={form.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}

                        {/* Balance Actual (Solo editable al crear o si se permite ajustar manualmente) */}
                        <Text style={styles.label}>Saldo Actual {accountToEdit ? '(Ajuste manual)' : '(Opcional)'}</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={form.available_balance}
                                onChangeText={(text) => handleInputChange('available_balance', text)}
                            />
                        </View>
                        {errors.available_balance && <Text style={styles.errorText}>{errors.available_balance[0]}</Text>}

                        {/* Meta / Monto Programado */}
                        <Text style={styles.label}>Meta / Monto Programado</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={form.programmed_amount}
                                onChangeText={(text) => handleInputChange('programmed_amount', text)}
                            />
                        </View>
                        {errors.programmed_amount && <Text style={styles.errorText}>{errors.programmed_amount[0]}</Text>}

                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Guardar</Text>
                        )}
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
        height: '70%', // Ajustable según contenido
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
        fontFamily: 'Inter_500Medium',
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
    amountContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    currencySymbol: {
        fontSize: 18,
        fontFamily: 'Inter_500Medium',
        color: '#64748B',
    },
    amountInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 18,
        fontFamily: 'Inter_400Regular',
        color: '#1E293B',
        marginLeft: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonDisabled: {
        backgroundColor: '#94A3B8',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
});
