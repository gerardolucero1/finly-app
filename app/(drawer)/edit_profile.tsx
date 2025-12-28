import { useCustomAlert } from '@/app/components/CustomAlert';
import { FormField } from '@/app/components/FormField';
import { useTheme } from '@/app/context/theme';
import { useProfileStore } from '@/app/store';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const COUNTRY_CODES = [
    { label: "MX (+52)", value: "52" },
    { label: "USA (+1)", value: "1" },
    { label: "CO (+57)", value: "57" },
    { label: "ES (+34)", value: "34" },
    { label: "AR (+54)", value: "54" },
    { label: "CL (+56)", value: "56" },
    { label: "PE (+51)", value: "51" },
];

export default function EditProfileScreen() {
    const { colors, isDark } = useTheme();
    const params = useLocalSearchParams();
    const profileFromStore = useProfileStore((state) => state.profile);
    const setProfileInStore = useProfileStore((state) => state.setProfile);

    const profile = useMemo(() => {
        if (!params.profile) return profileFromStore;
        return JSON.parse(params.profile as string) as Profile;
    }, [params.profile, profileFromStore]);

    if (!profile) {
        return <Text style={{ color: colors.text }}>Cargando...</Text>;
    }

    // Parse existing phone number
    const parsePhoneNumber = (fullNumber: string | null) => {
        if (!fullNumber) return { code: '52', number: '' };

        // Try to find a matching country code
        // We look for [CountryCode]1[Number]
        // So we iterate codes, check if starts with code, then check if next char is '1'

        for (const country of COUNTRY_CODES) {
            const prefix = country.value + '1';
            if (fullNumber.startsWith(prefix)) {
                return {
                    code: country.value,
                    number: fullNumber.slice(prefix.length)
                };
            }
        }

        // Fallback if format doesn't match expected pattern
        return { code: '52', number: fullNumber };
    };

    const initialPhoneData = parsePhoneNumber(profile.whatsapp_phone);

    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [timezone, setTimezone] = useState(profile.timezone || 'America/Mexico_City');
    const [whatsappNotifications, setWhatsappNotifications] = useState(profile.whatsapp_notifications_enabled);
    const [dailyTips, setDailyTips] = useState(profile.daily_tips_enabled);

    const [countryCode, setCountryCode] = useState(initialPhoneData.code);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneData.number);

    const [errors, setErrors] = useState<{ name?: string; email?: string; timezone?: string; whatsapp_phone?: string }>({});
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();
    const { showAlert, AlertComponent } = useCustomAlert();

    const handleSave = async () => {
        try {
            setLoading(true);
            setErrors({});

            // Construct full phone number
            // Format: [CountryCode]1[PhoneNumber]
            const fullWhatsappPhone = phoneNumber ? `${countryCode}1${phoneNumber}` : '';

            let response = await ProfileService.update({
                name,
                email,
                timezone,
                whatsapp_notifications_enabled: whatsappNotifications,
                daily_tips_enabled: dailyTips,
                whatsapp_phone: fullWhatsappPhone
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
        } finally {
            setLoading(false);
        }
    };

    // Dynamic styles for picker select
    const pickerSelectStyles = StyleSheet.create({
        inputIOS: {
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 15,
            backgroundColor: colors.card,
            borderRadius: 8,
            color: colors.text,
            fontFamily: 'Inter_400Regular',
            paddingRight: 30,
        },
        inputAndroid: {
            fontSize: 16,
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: colors.card,
            borderRadius: 8,
            color: colors.text,
            fontFamily: 'Inter_400Regular',
            paddingRight: 30,
        },
        iconContainer: {
            top: 15,
            right: 15,
        },
    });

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight, paddingBottom: 40 }]}
                keyboardShouldPersistTaps="handled"
            >
                {loading && (
                    <View style={[
                        styles.refreshingContainer,
                        { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF' }
                    ]}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={[styles.refreshingText, { color: colors.primary }]}>Actualizando perfil...</Text>
                    </View>
                )}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Editar Perfil</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Actualiza tu información personal aquí.</Text>
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

                    {/* WhatsApp Phone Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>WhatsApp</Text>
                        <View style={styles.phoneContainer}>
                            <View style={[styles.countryPickerContainer, { backgroundColor: colors.card }]}>
                                <RNPickerSelect
                                    value={countryCode}
                                    onValueChange={setCountryCode}
                                    items={COUNTRY_CODES}
                                    placeholder={{}}
                                    style={pickerSelectStyles}
                                    useNativeAndroidPickerStyle={false}
                                    Icon={() => <Lucide name="chevron-down" size={20} color={colors.textSecondary} />}
                                    darkTheme={isDark}
                                />
                            </View>
                            <View style={[styles.phoneNumberContainer, { backgroundColor: colors.card }]}>
                                <TextInput
                                    style={[styles.phoneInput, { color: colors.text }]}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="Número"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </View>
                        {errors.whatsapp_phone && <Text style={styles.errorText}>{errors.whatsapp_phone}</Text>}
                        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                            Ingresa tu número sin el código de país.
                        </Text>
                    </View>

                    {/* Timezone Picker */}
                    <View style={styles.fieldContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Zona Horaria</Text>
                        <View style={[styles.pickerContainer, { backgroundColor: colors.card }]}>
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
                                Icon={() => <Lucide name="chevron-down" size={20} color={colors.textSecondary} />}
                                darkTheme={isDark}
                            />
                        </View>
                        {errors.timezone && <Text style={styles.errorText}>{errors.timezone}</Text>}
                    </View>

                    {/* Preferencias Section */}
                    <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferencias</Text>

                    {/* WhatsApp Notifications Toggle */}
                    <View style={[styles.switchContainer, { backgroundColor: colors.card }]}>
                        <View style={styles.switchLeft}>
                            <View style={[
                                styles.switchIconContainer,
                                { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F1F5F9' }
                            ]}>
                                <Lucide name="message-circle" size={20} color={colors.textSecondary} />
                            </View>
                            <View style={styles.switchTextContainer}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>Notificaciones de WhatsApp</Text>
                                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>Recibe alertas por WhatsApp</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: isDark ? "#334155" : "#E2E8F0", true: "#C7D2FE" }}
                            thumbColor={whatsappNotifications ? colors.primary : "#f4f3f4"}
                            ios_backgroundColor={isDark ? "#334155" : "#E2E8F0"}
                            onValueChange={setWhatsappNotifications}
                            value={whatsappNotifications}
                        />
                    </View>

                    {/* Daily Tips Toggle */}
                    <View style={[styles.switchContainer, { backgroundColor: colors.card }]}>
                        <View style={styles.switchLeft}>
                            <View style={[
                                styles.switchIconContainer,
                                { backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F1F5F9' }
                            ]}>
                                <Lucide name="lightbulb" size={20} color={colors.textSecondary} />
                            </View>
                            <View style={styles.switchTextContainer}>
                                <Text style={[styles.switchLabel, { color: colors.text }]}>Tips Diarios</Text>
                                <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>Recibe consejos financieros diarios</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: isDark ? "#334155" : "#E2E8F0", true: "#C7D2FE" }}
                            thumbColor={dailyTips ? colors.primary : "#f4f3f4"}
                            ios_backgroundColor={isDark ? "#334155" : "#E2E8F0"}
                            onValueChange={setDailyTips}
                            value={dailyTips}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: colors.primary },
                        loading && styles.saveButtonDisabled
                    ]}
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
    },
    subtitle: {
        fontSize: 16,
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
        marginBottom: 8,
    },
    pickerContainer: {
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
        fontFamily: 'Inter_500Medium',
        marginBottom: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchTextContainer: {
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    saveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    phoneContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    countryPickerContainer: {
        flex: 0.4,
        borderRadius: 8,
        justifyContent: 'center',
    },
    phoneNumberContainer: {
        flex: 0.6,
        borderRadius: 8,
        justifyContent: 'center',
    },
    phoneInput: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontFamily: 'Inter_400Regular',
    },
    pickerIcon: {
        top: 15,
        right: 10,
    },
    helperText: {
        fontSize: 12,
        marginTop: 6,
        fontFamily: 'Inter_400Regular',
    },
    refreshingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    refreshingText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
    },
});