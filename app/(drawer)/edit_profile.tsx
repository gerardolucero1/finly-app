import { useCustomAlert } from '@/app/components/CustomAlert';
import { FormField } from '@/app/components/FormField';
import { Profile } from '@/models/profile';
import { ProfileService } from '@/services/profile';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

export default function EditProfileScreen() {
    const params = useLocalSearchParams();
    const profile = useMemo(() => {
        if (!params.profile) return null;
        return JSON.parse(params.profile as string) as Profile;
    }, [params.profile]);

    if (!profile) {
        return <Text>Cargando...</Text>;
    }

    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [timezone, setTimezone] = useState(profile.timezone || 'America/Mexico_City');
    const [whatsappNotifications, setWhatsappNotifications] = useState(profile.whatsapp_notifications_enabled);
    const [dailyTips, setDailyTips] = useState(profile.daily_tips_enabled);
    const [errors, setErrors] = useState<{ name?: string; email?: string; timezone?: string }>({});
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();
    const { showAlert, AlertComponent } = useCustomAlert();

    const handleSave = async () => {
        try {
            let response = await ProfileService.update({
                name,
                email,
                timezone,
                whatsapp_notifications_enabled: whatsappNotifications,
                daily_tips_enabled: dailyTips
            })

            showAlert({
                icon: 'check',
                type: 'success',
                title: '¡Éxito!',
                message: 'La operación se completó correctamente',
            });
        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                console.log('Errors:', error.response.data.errors);
                setErrors(error.response.data.errors);
            } else {
                console.log('Error sin respuesta:', error.message);
                showAlert({
                    icon: 'check',
                    type: 'danger',
                    title: 'Error',
                    message: 'Ha ocurrido un error inesperado.',
                });
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight, paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Editar Perfil</Text>
                    <Text style={styles.subtitle}>Actualiza tu información personal aquí.</Text>
                </View>

                <View style={styles.form}>
                    <FormField
                        label="Nombre Completo"
                        icon="user"
                        value={name}
                        onChangeText={setName}
                        placeholder="Escribe tu nombre completo"
                        error={errors.name}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />

                    <FormField
                        label="Correo Electrónico"
                        icon="mail"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Escribe tu correo electrónico"
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="done"
                    />

                    {/* Timezone Picker */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Zona Horaria</Text>
                        <View style={styles.pickerContainer}>
                            <RNPickerSelect
                                value={timezone}
                                onValueChange={setTimezone}
                                items={[
                                    { label: "Ciudad de México (GMT-6)", value: "America/Mexico_City" },
                                    { label: "Cancún (GMT-5)", value: "America/Cancun" },
                                    { label: "Tijuana (GMT-8)", value: "America/Tijuana" },
                                    { label: "Monterrey (GMT-6)", value: "America/Monterrey" },
                                    { label: "Chihuahua (GMT-7)", value: "America/Chihuahua" },
                                    { label: "Hermosillo (GMT-7)", value: "America/Hermosillo" },
                                    { label: "Mazatlán (GMT-7)", value: "America/Mazatlan" },
                                    { label: "Los Angeles (GMT-8)", value: "America/Los_Angeles" },
                                    { label: "New York (GMT-5)", value: "America/New_York" },
                                    { label: "Chicago (GMT-6)", value: "America/Chicago" },
                                    { label: "Denver (GMT-7)", value: "America/Denver" },
                                ]}
                                placeholder={{}}
                                style={pickerSelectStyles}
                                useNativeAndroidPickerStyle={false}
                                Icon={() => <Lucide name="chevron-down" size={20} color="#64748B" />}
                            />
                        </View>
                        {errors.timezone && <Text style={styles.errorText}>{errors.timezone}</Text>}
                    </View>

                    {/* Preferencias Section */}
                    <View style={styles.sectionDivider} />
                    <Text style={styles.sectionTitle}>Preferencias</Text>

                    {/* WhatsApp Notifications Toggle */}
                    <View style={styles.switchContainer}>
                        <View style={styles.switchLeft}>
                            <View style={styles.switchIconContainer}>
                                <Lucide name="message-circle" size={20} color="#64748B" />
                            </View>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>Notificaciones de WhatsApp</Text>
                                <Text style={styles.switchDescription}>Recibe alertas por WhatsApp</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#E2E8F0", true: "#C7D2FE" }}
                            thumbColor={whatsappNotifications ? "#4F46E5" : "#f4f3f4"}
                            ios_backgroundColor="#E2E8F0"
                            onValueChange={setWhatsappNotifications}
                            value={whatsappNotifications}
                        />
                    </View>

                    {/* Daily Tips Toggle */}
                    <View style={styles.switchContainer}>
                        <View style={styles.switchLeft}>
                            <View style={styles.switchIconContainer}>
                                <Lucide name="lightbulb" size={20} color="#64748B" />
                            </View>
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>Tips Diarios</Text>
                                <Text style={styles.switchDescription}>Recibe consejos financieros diarios</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: "#E2E8F0", true: "#C7D2FE" }}
                            thumbColor={dailyTips ? "#4F46E5" : "#f4f3f4"}
                            ios_backgroundColor="#E2E8F0"
                            onValueChange={setDailyTips}
                            value={dailyTips}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
            <AlertComponent />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
        fontFamily: 'Inter_500Medium',
    },
    form: {
        flex: 1,
    },
    fieldContainer: {
        marginTop: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#475569',
        marginBottom: 8,
    },
    pickerContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        color: '#1E293B',
        marginBottom: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    switchLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    switchIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchTextContainer: {
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
    },
    saveButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    saveButtonDisabled: {
        backgroundColor: '#A5B4FC',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
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