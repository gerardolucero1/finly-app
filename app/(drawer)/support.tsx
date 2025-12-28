import { useTheme } from '@/app/context/theme';
import { SupportService } from '@/services/support';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCustomAlert } from '../components/CustomAlert';


export default function SupportScreen() {
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const headerHeight = useHeaderHeight();
    const { colors, isDark } = useTheme();

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        try {
            let response = await SupportService.createTicket({ message });
            showAlert({
                icon: "send",
                title: "Mensaje enviado",
                message: "Gracias por contactarnos. Te responderemos pronto.",
                type: "success",
            })
            setMessage('');
        } catch (error: any) {
            console.log(error);
            showAlert({
                icon: "mail-x",
                title: "Error",
                message: error.response.data.error,
                type: "danger",
            })
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight, backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Soporte',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.text },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background },
            }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF' }]}>
                            <Lucide name="life-buoy" size={32} color="#4F46E5" />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>¿Cómo podemos ayudarte?</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Si tienes problemas o sugerencias, envíanos un mensaje directo.
                        </Text>
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Tu Mensaje</Text>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text
                        }]}
                        placeholder="Describe tu problema o sugerencia..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleSend}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <ActivityIndicator size="small" color="#FFF" />
                                <Text style={styles.buttonText}>Enviando...</Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Enviar Mensaje</Text>
                                <Lucide name="send" size={18} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={[styles.contactInfo, { borderTopColor: colors.border }]}>
                        <Text style={[styles.contactTitle, { color: colors.textSecondary }]}>Otros medios de contacto</Text>
                        <TouchableOpacity style={styles.contactRow}>
                            <Lucide name="mail" size={18} color={colors.textSecondary} />
                            <Text style={[styles.contactText, { color: colors.textSecondary }]}>soporte@holafinly.com</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactRow}>
                            <Lucide name="twitter" size={18} color={colors.textSecondary} />
                            <Text style={[styles.contactText, { color: colors.textSecondary }]}>@holafinly</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    card: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        borderWidth: 1,
        height: 150,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0.1,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    contactInfo: {
        marginTop: 40,
        borderTopWidth: 1,
        paddingTop: 20,
    },
    contactTitle: {
        fontSize: 12,
        fontFamily: 'Inter_700Bold',
        textTransform: 'uppercase',
        marginBottom: 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    contactText: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
    },
});
