import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LegalScreen() {
    const headerHeight = useHeaderHeight();

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Legal',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' },
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.heading}>Términos y Condiciones</Text>
                <Text style={styles.paragraph}>
                    Bienvenido a Finly. Al usar nuestra aplicación, aceptas cumplir con estos términos de servicio.
                    Esta es una versión de demostración y los términos reales aparecerían aquí.
                </Text>
                <Text style={styles.paragraph}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </Text>

                <Text style={styles.heading}>Política de Privacidad</Text>
                <Text style={styles.paragraph}>
                    Tu privacidad es importante para nosotros. En Finly, nos comprometemos a proteger tu información personal.
                </Text>
                <Text style={styles.paragraph}>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </Text>

                <Text style={styles.heading}>Licencias</Text>
                <Text style={styles.paragraph}>
                    Finly utiliza librerías de código abierto. Agradecemos a la comunidad por su contribución.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 20, paddingBottom: 40 },
    heading: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginTop: 20,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#475569',
        lineHeight: 22,
        marginBottom: 16,
        textAlign: 'justify',
    },
});
