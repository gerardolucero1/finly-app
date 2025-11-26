// app/components/FilterModal.tsx

import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { Category } from '@/models/category';
import { SubCategory } from '@/models/subcategory';
import { AccountsService } from '@/services/accounts';
import { CategoriesService } from '@/services/categories';
import { TransactionFilters } from '@/services/transactions';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Lucide } from '@react-native-vector-icons/lucide';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: TransactionFilters) => void;
    currentFilters: TransactionFilters;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<TransactionFilters>({});

    // Estado para los datos de los selectores
    const [accounts, setAccounts] = useState<{ label: string; value: number }[]>([]);
    const all_categories = useInput<Category[]>([]);
    const all_subcategories = useInput<SubCategory[]>([]);

    // Estado para controlar los selectores de fecha
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [dateMode, setDateMode] = useState<'single' | 'range'>('range');

    // Sincroniza los filtros locales cuando el modal se abre
    useEffect(() => {
        if (visible) {
            setLocalFilters(currentFilters);
        }
    }, [visible, currentFilters]);

    // Carga los datos necesarios para los filtros cuando el modal se hace visible
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar Cuentas
                const accountResponse = await AccountsService.getAll(1);
                const formattedAccounts = accountResponse.data.map((acc: Account) => ({
                    label: acc.name,
                    value: acc.id,
                }));
                setAccounts(formattedAccounts);

                // Cargar Categorías
                const { categories, subcategories } = await CategoriesService.getAll();
                all_categories.setValue(categories);
                all_subcategories.setValue(subcategories);

            } catch (error) {
                console.error("Failed to fetch filter data:", error);
            }
        };
        if (visible) {
            fetchData();
        }
    }, [visible]);

    const updateFilter = (key: keyof TransactionFilters, value: any) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev };
            if (value === null || value === undefined) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }
            return newFilters;
        });
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined, type: 'start' | 'end') => {
        if (type === 'start') setShowStartDatePicker(false);
        if (type === 'end') setShowEndDatePicker(false);

        if (event.type === 'set' && selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            updateFilter(type === 'start' ? 'start_date' : 'end_date', formattedDate);

            // Si estamos en modo single y se selecciona una fecha de inicio,
            // también establecer la fecha final igual para búsqueda de un solo día
            if (dateMode === 'single' && type === 'start') {
                updateFilter('end_date', formattedDate);
            }
        }
    };

    const formatDateForDisplay = (dateString?: string) => {
        if (!dateString) return "Seleccionar";
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters({});
        onApply({});
        onClose();
    };

    const handleDateModeChange = (mode: 'single' | 'range') => {
        setDateMode(mode);
        if (mode === 'single') {
            // Si cambiamos a modo single y hay una fecha de inicio, igualar la final
            if (localFilters.start_date) {
                updateFilter('end_date', localFilters.start_date);
            }
        }
    };

    const pickerSelectStyles = StyleSheet.create({
        inputIOS: styles.pickerInput,
        inputAndroid: styles.pickerInput,
        iconContainer: { top: 18, right: 15 },
    });

    const categoryItems = all_categories.value.map(acc => ({ label: acc.name, value: acc.id }));
    const filteredSubCategoryItems = all_subcategories.value.filter(acc => acc.category_id == localFilters.category_id);
    const subCategoryItems = filteredSubCategoryItems.map(acc => ({ label: acc.name, value: acc.id }));

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Filtros</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Lucide name="x" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Selector de Tipo */}
                                <Text style={styles.label}>Tipo de movimiento</Text>
                                <View style={styles.segmentContainer}>
                                    {['income', 'expense'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[styles.segmentButton, localFilters.type === type && styles.segmentActive]}
                                            onPress={() => updateFilter('type', localFilters.type === type ? null : type)}
                                        >
                                            <Text style={[styles.segmentText, localFilters.type === type && styles.segmentActiveText]}>
                                                {type === 'income' ? 'Ingreso' : 'Gasto'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Selector de Cuenta */}
                                <Text style={styles.label}>Cuenta</Text>
                                <RNPickerSelect
                                    onValueChange={(value) => updateFilter('account_id', value)}
                                    items={accounts}
                                    value={localFilters.account_id}
                                    placeholder={{ label: 'Todas las cuentas', value: null }}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => <Lucide name="chevron-down" size={20} color="#94A3B8" />}
                                />

                                {/* Selector de Categoría (Solo si es un gasto) */}
                                {localFilters.type === 'expense' && (
                                    <>
                                        <Text style={styles.label}>Categoría</Text>
                                        <RNPickerSelect
                                            onValueChange={(value) => updateFilter('category_id', value)}
                                            items={categoryItems}
                                            value={localFilters.category_id}
                                            placeholder={{ label: 'Todas las categorías', value: null }}
                                            style={pickerSelectStyles}
                                            useNativeAndroidPickerStyle={false}
                                            Icon={() => <Lucide name="chevron-down" size={20} color="#94A3B8" />}
                                        />

                                        <Text style={styles.label}>Subcategoría</Text>
                                        <RNPickerSelect
                                            onValueChange={(value) => updateFilter('sub_category_id', value)}
                                            items={subCategoryItems}
                                            value={localFilters.sub_category_id}
                                            placeholder={{ label: 'Todas las subcategorías', value: null }}
                                            style={pickerSelectStyles}
                                            useNativeAndroidPickerStyle={false}
                                            Icon={() => <Lucide name="chevron-down" size={20} color="#94A3B8" />}
                                        />
                                    </>
                                )}

                                {/* Selector de Fecha con Toggle */}
                                <Text style={styles.label}>Filtro de Fechas</Text>

                                {/* Toggle para modo de fecha */}
                                <View style={styles.modeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.modeButton,
                                            dateMode === 'single' && styles.modeButtonActive
                                        ]}
                                        onPress={() => handleDateModeChange('single')}
                                    >
                                        <Text style={[
                                            styles.modeButtonText,
                                            dateMode === 'single' && styles.modeButtonTextActive
                                        ]}>
                                            Fecha específica
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.modeButton,
                                            dateMode === 'range' && styles.modeButtonActive
                                        ]}
                                        onPress={() => handleDateModeChange('range')}
                                    >
                                        <Text style={[
                                            styles.modeButtonText,
                                            dateMode === 'range' && styles.modeButtonTextActive
                                        ]}>
                                            Rango de fechas
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Selector de fechas */}
                                {dateMode === 'single' ? (
                                    // Modo fecha única
                                    <TouchableOpacity
                                        style={styles.singleDateCard}
                                        onPress={() => setShowStartDatePicker(true)}
                                    >
                                        <View style={styles.dateCardHeader}>
                                            <Lucide name="calendar" size={20} color="#3B82F6" />
                                            <Text style={styles.dateCardLabel}>Fecha seleccionada</Text>
                                        </View>
                                        <Text style={styles.dateCardValue}>
                                            {formatDateForDisplay(localFilters.start_date)}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    // Modo rango de fechas
                                    <View style={styles.dateRangeWrapper}>
                                        <TouchableOpacity
                                            style={styles.dateCard}
                                            onPress={() => setShowStartDatePicker(true)}
                                        >
                                            <View style={styles.dateCardHeader}>
                                                <Lucide name="calendar" size={18} color="#3B82F6" />
                                                <Text style={styles.dateCardLabel}>Desde</Text>
                                            </View>
                                            <Text style={styles.dateCardValue}>
                                                {formatDateForDisplay(localFilters.start_date)}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={styles.arrowContainer}>
                                            <Lucide name="arrow-right" size={20} color="#94A3B8" />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.dateCard}
                                            onPress={() => setShowEndDatePicker(true)}
                                        >
                                            <View style={styles.dateCardHeader}>
                                                <Lucide name="calendar" size={18} color="#3B82F6" />
                                                <Text style={styles.dateCardLabel}>Hasta</Text>
                                            </View>
                                            <Text style={styles.dateCardValue}>
                                                {formatDateForDisplay(localFilters.end_date)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleClear}>
                                    <Text style={styles.cancelButtonText}>Limpiar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleApply}>
                                    <Lucide name="save" size={18} color="#FFF" />
                                    <Text style={styles.saveButtonText}>Aplicar</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Botones de Acción */}
                            {/* <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                                    <Text style={styles.clearButtonText}>Limpiar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                    <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                                </TouchableOpacity>
                            </View> */}

                            {/* Modales de DatePicker */}
                            {showStartDatePicker && (
                                <DateTimePicker
                                    value={localFilters.start_date ? new Date(localFilters.start_date + 'T00:00:00') : new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => handleDateChange(event, date, 'start')}
                                />
                            )}
                            {showEndDatePicker && (
                                <DateTimePicker
                                    value={localFilters.end_date ? new Date(localFilters.end_date + 'T00:00:00') : new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => handleDateChange(event, date, 'end')}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        minHeight: '60%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    closeButton: {
        padding: 4,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    // Segmented Control Styles
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    segmentActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#475569',
    },
    segmentActiveText: {
        color: '#4F46E5',
    },
    // Picker Styles
    pickerInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: Platform.OS === 'ios' ? 16 : 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#1E293B',
    },
    // Date Mode Selector
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    modeButtonText: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#64748B',
    },
    modeButtonTextActive: {
        color: '#1E293B',
        fontWeight: '600',
    },
    // Single Date Card
    singleDateCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E0E7FF',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    // Date Range Wrapper
    dateRangeWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingBottom: 20,
    },
    dateCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    dateCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    dateCardLabel: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateCardValue: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginTop: 4,
    },
    arrowContainer: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
    },
    // Date Range Styles (legacy, kept for compatibility)
    dateRangeContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    dateInput: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 16,
        gap: 8,
    },
    dateText: {
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    // Action Buttons
    buttonRow: {
        flexDirection: 'row',
        marginTop: 'auto',
        paddingTop: 24,
        gap: 12,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#475569',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    footer: { flexDirection: 'row', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginBottom: Platform.OS === 'ios' ? 50 : 50 },
    cancelButton: { flex: 1, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, alignItems: 'center', marginRight: 10 },
    cancelButtonText: { color: '#475569', fontSize: 16, fontFamily: 'Inter_700Bold' },
    saveButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' },
    saveButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
});