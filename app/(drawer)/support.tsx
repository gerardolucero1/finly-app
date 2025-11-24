import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SupportScreen() {
    const [message, setMessage] = useState('');
    const headerHeight = useHeaderHeight();

    const handleSend = () => {
        if (!message.trim()) return;
        Alert.alert("Mensaje enviado", "Gracias por contactarnos. Te responderemos pronto.");
        setMessage('');
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Soporte',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' },
            }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.iconContainer}>
                            <Lucide name="life-buoy" size={32} color="#4F46E5" />
                        </View>
                        <Text style={styles.title}>¿Cómo podemos ayudarte?</Text>
                        <Text style={styles.subtitle}>
                            Si tienes problemas o sugerencias, envíanos un mensaje directo.
                        </Text>
                    </View>

                    <Text style={styles.label}>Tu Mensaje</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe tu problema o sugerencia..."
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSend}>
                        <Text style={styles.buttonText}>Enviar Mensaje</Text>
                        <Lucide name="send" size={18} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.contactInfo}>
                        <Text style={styles.contactTitle}>Otros medios de contacto</Text>
                        <TouchableOpacity style={styles.contactRow}>
                            <Lucide name="mail" size={18} color="#64748B" />
                            <Text style={styles.contactText}>soporte@finly.app</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactRow}>
                            <Lucide name="twitter" size={18} color="#64748B" />
                            <Text style={styles.contactText}>@finlyapp</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
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
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    contactInfo: {
        marginTop: 40,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 20,
    },
    contactTitle: {
        fontSize: 12,
        fontFamily: 'Inter_700Bold',
        color: '#94A3B8',
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
        color: '#475569',
    },
});
