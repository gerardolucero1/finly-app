import { useCustomAlert } from '@/app/components/CustomAlert';
import { FormField } from '@/app/components/FormField';
import { Profile } from '@/models/profile';
import { ProfileService } from '@/services/profile';
import { useHeaderHeight } from '@react-navigation/elements';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [loading, setLoading] = useState(false);
    const headerHeight = useHeaderHeight();
    const { showAlert, AlertComponent } = useCustomAlert();

    const handleSave = async () => {
        try {
            let response = await ProfileService.update({name, email})

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
    saveButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24, // Espacio entre el último campo y el botón
    },
    saveButtonDisabled: {
        backgroundColor: '#A5B4FC', // Un color más claro para el estado deshabilitado
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
});