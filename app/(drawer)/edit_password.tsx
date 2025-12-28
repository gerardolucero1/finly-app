import { useCustomAlert } from '@/app/components/CustomAlert';
import { FormField } from '@/app/components/FormField';
import { useTheme } from '@/app/context/theme';
import { useInput } from '@/hooks/useInput';
import { ProfileService } from '@/services/profile';
import { useHeaderHeight } from '@react-navigation/elements';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface UpdatePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export default function EditPasswordScreen() {
    const { colors } = useTheme();
    const current_password = useInput('')
    const new_password = useInput('')
    const new_password_confirmation = useInput('')
    const showCurrentPassword = useInput(false)
    const showNewPassword = useInput(false)
    const showNewPasswordConfirmation = useInput(false)

    const [errors, setErrors] = useState<{ new_password?: string; current_password?: string }>({});
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();
    const { showAlert, AlertComponent } = useCustomAlert();

    const handleSave = async () => {
        try {
            let data: UpdatePasswordData = {
                current_password: current_password.value,
                new_password: new_password.value,
                new_password_confirmation: new_password_confirmation.value,
            }

            let response = await ProfileService.updatePassword(data)

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
                style={[styles.container, { backgroundColor: colors.background }]}
                contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Editar Contraseña</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Actualiza tu contraseña desde aquí.</Text>
                </View>

                <View style={styles.form}>
                    <FormField
                        label="Contraseña actual"
                        icon="lock"
                        {...current_password}
                        placeholder="Escribe tu contraseña actual"
                        error={errors.current_password}
                        keyboardType="default"
                        secureTextEntry={!showCurrentPassword.value}
                        autoCapitalize="none"
                        returnKeyType="next"
                        rightIcon={showCurrentPassword.value ? "eye" : "eye-off"}
                        onRightIconPress={() => showCurrentPassword.setValue(!showCurrentPassword.value)}
                    />

                    <FormField
                        label="Nueva contraseña"
                        icon="lock"
                        {...new_password}
                        placeholder="Escribe tu nueva contraseña"
                        error={errors.new_password}
                        keyboardType="default"
                        secureTextEntry={!showNewPassword.value}
                        autoCapitalize="none"
                        returnKeyType="next"
                        rightIcon={showNewPassword.value ? "eye" : "eye-off"}
                        onRightIconPress={() => showNewPassword.setValue(!showNewPassword.value)}
                    />

                    <FormField
                        label="Confirmar contraseña"
                        icon="lock"
                        {...new_password_confirmation}
                        placeholder="Confirma tu nueva contraseña"
                        error={errors.new_password}
                        keyboardType="default"
                        secureTextEntry={!showNewPasswordConfirmation.value}
                        autoCapitalize="none"
                        returnKeyType="done"
                        rightIcon={showNewPasswordConfirmation.value ? "eye" : "eye-off"}
                        onRightIconPress={() => showNewPasswordConfirmation.setValue(!showNewPasswordConfirmation.value)}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.saveButtonDisabled]}
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
    saveButton: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24, // Espacio entre el último campo y el botón
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
});