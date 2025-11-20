import { Account } from '@/models/account';
import { DebtPayment } from '@/models/debt_payment';
import { AccountsService } from '@/services/accounts';
import { DebtPaymentsService } from '@/services/payments';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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

interface PaymentFormState {
    amount: string;
    account_id: number | null;
    paid_at: Date;
    is_extra_payment: boolean;
    notes: string;
}

const initialFormState: PaymentFormState = {
    amount: '',
    account_id: null,
    paid_at: new Date(),
    is_extra_payment: false,
    notes: ''
};

interface DebtPaymentFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    debtId: number; // ID de la deuda a la que pertenece el pago
    editingPayment?: DebtPayment | null;
}

export const DebtPaymentFormModal = ({ visible, onClose, onSave, debtId, editingPayment }: DebtPaymentFormModalProps) => {
    const [form, setForm] = useState<PaymentFormState>(initialFormState);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Cargar cuentas al abrir
    useEffect(() => {
        if (visible) {
            fetchAccounts();
            if (editingPayment) {
                setForm({
                    amount: editingPayment.amount,
                    account_id: editingPayment.account_id,
                    paid_at: new Date(editingPayment.paid_at),
                    is_extra_payment: Boolean(editingPayment.is_extra_payment),
                    notes: editingPayment.notes || ''
                });
            } else {
                setForm(initialFormState);
            }
        }
    }, [visible, editingPayment]);

    const fetchAccounts = async () => {
        try {
            const response = await AccountsService.getAll(1);
            setAccounts(response.data || []);
        } catch (error) {
            console.error("Error fetching accounts", error);
        }
    };

    const handleSave = async () => {
        if (!form.amount || !form.account_id) {
            Alert.alert("Error", "Monto y Cuenta son obligatorios");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                debt_id: debtId,
                is_extra_payment: form.is_extra_payment ? 1 : 0
            };

            if (editingPayment) {
                await DebtPaymentsService.update(editingPayment.id, payload);
            } else {
                await DebtPaymentsService.create(payload);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo registrar el pago.");
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setForm(prev => ({ ...prev, paid_at: selectedDate }));
        }
    };

    const accountItems = accounts.map(acc => ({
        label: `${acc.name} (${acc.bank}) - $${acc.current_balance}`,
        value: acc.id
    }));

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexEnd}>
                <TouchableWithoutFeedback onPress={onClose}><View style={styles.overlay} /></TouchableWithoutFeedback>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{editingPayment ? 'Editar Pago' : 'Registrar Pago'}</Text>
                        <TouchableOpacity onPress={onClose}><Lucide name="x" size={24} color="#64748B" /></TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

                        {/* Monto */}
                        <Text style={styles.label}>Monto del Pago <Text style={styles.req}>*</Text></Text>
                        <View style={styles.moneyInput}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput
                                style={styles.inputCurrency}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={form.amount}
                                onChangeText={(t) => setForm({ ...form, amount: t })}
                            />
                        </View>

                        {/* Cuenta */}
                        <Text style={styles.label}>Pagar desde <Text style={styles.req}>*</Text></Text>
                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                onValueChange={(val) => setForm({ ...form, account_id: val })}
                                items={accountItems}
                                value={form.account_id}
                                placeholder={{ label: "Selecciona una cuenta...", value: null }}
                                style={pickerStyles}
                                Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" style={{ top: 15, right: 15 }} />}
                            />
                        </View>

                        {/* Fecha */}
                        <Text style={styles.label}>Fecha de Pago</Text>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{form.paid_at.toLocaleDateString()}</Text>
                            <Lucide name="calendar" size={20} color="#64748B" />
                        </TouchableOpacity>

                        {/* Switch Extra */}
                        <TouchableOpacity
                            style={[styles.switchRow, form.is_extra_payment && styles.switchActive]}
                            onPress={() => setForm(prev => ({ ...prev, is_extra_payment: !prev.is_extra_payment }))}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.switchTitle, form.is_extra_payment && { color: '#4F46E5' }]}>Pago a Capital (Extra)</Text>
                                <Text style={styles.switchSub}>Se aplicará directo al capital reduciendo intereses futuros.</Text>
                            </View>
                            <Lucide
                                name={form.is_extra_payment ? "check-circle-2" : "circle"}
                                size={24}
                                color={form.is_extra_payment ? "#4F46E5" : "#CBD5E1"}
                            />
                        </TouchableOpacity>

                        {/* Notas */}
                        <Text style={styles.label}>Notas</Text>
                        <TextInput
                            style={[styles.input, { height: 60 }]}
                            multiline
                            value={form.notes}
                            onChangeText={(t) => setForm({ ...form, notes: t })}
                        />

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
                            <Text style={styles.txtCancel}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Lucide name="check" size={18} color="#FFF" />
                                    <Text style={styles.txtSave}>Guardar Pago</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker value={form.paid_at} mode="date" onChange={onDateChange} />
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    flexEnd: { flex: 1, justifyContent: 'flex-end' },
    overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
    content: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: '80%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderColor: '#F1F5F9', paddingBottom: 15 },
    title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    label: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#475569', marginTop: 16, marginBottom: 8 },
    req: { color: '#EF4444' },
    moneyInput: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, alignItems: 'center', paddingHorizontal: 15 },
    currencySymbol: { fontSize: 20, color: '#64748B', marginRight: 8 },
    inputCurrency: { flex: 1, paddingVertical: 14, fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1E293B' },
    pickerContainer: { backgroundColor: '#F1F5F9', borderRadius: 10 },
    dateBtn: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F1F5F9', padding: 15, borderRadius: 10, alignItems: 'center' },
    dateText: { fontSize: 16, color: '#1E293B' },
    input: { backgroundColor: '#F1F5F9', borderRadius: 10, padding: 12, fontSize: 15, color: '#1E293B' },
    switchRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12 },
    switchActive: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
    switchTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1E293B' },
    switchSub: { fontSize: 12, color: '#64748B', marginTop: 2, paddingRight: 10 },
    footer: { flexDirection: 'row', marginTop: 20, gap: 10 },
    btnCancel: { flex: 1, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12 },
    txtCancel: { color: '#475569', fontFamily: 'Inter_600SemiBold' },
    btnSave: { flex: 1, padding: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, backgroundColor: '#4F46E5', borderRadius: 12 },
    txtSave: { color: '#FFF', fontFamily: 'Inter_600SemiBold' },
});

const pickerStyles = StyleSheet.create({
    inputIOS: { fontSize: 16, padding: 15, color: '#1E293B' },
    inputAndroid: { fontSize: 16, padding: 15, color: '#1E293B' },
});