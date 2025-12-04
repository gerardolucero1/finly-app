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
                <Text style={[styles.paragraph, { fontFamily: 'Inter_700Bold', marginBottom: 24 }]}>
                    Última actualización: Octubre 2025
                </Text>

                <Text style={styles.heading}>1. ACEPTACIÓN</Text>
                <Text style={styles.paragraph}>
                    Al registrarte en Finly (Web, App o WhatsApp), aceptas estos términos incondicionalmente. Si no estás de acuerdo, por favor no uses el servicio.
                </Text>

                <Text style={styles.heading}>2. DESCRIPCIÓN DEL SERVICIO</Text>
                <Text style={styles.paragraph}>
                    Finly es una herramienta de gestión y organización financiera personal.
                    {'\n\n'}• NO somos asesores financieros certificados: Las "Estrategias de Deuda" y consejos de la IA son sugerencias basadas en algoritmos, no consejos de inversión profesional.
                    {'\n'}• NO somos contadores: Aunque ayudamos a organizar tickets, el usuario es responsable de su contabilidad fiscal ante el SAT.
                </Text>

                <Text style={styles.heading}>3. USO DEL CHATBOT Y LA IA</Text>
                <Text style={styles.paragraph}>
                    Finly utiliza Inteligencia Artificial (GPT-4o-mini) para interpretar tus mensajes.
                    {'\n\n'}• Posibles Errores: La IA puede alucinar (cometer errores de lectura o cálculo). Es tu responsabilidad verificar que los montos registrados en la App sean correctos antes de tomar decisiones financieras.
                    {'\n'}• Disponibilidad: Dependemos de la API de WhatsApp y OpenAI. No garantizamos un uptime del 100% (aunque trabajamos duro para lograrlo).
                </Text>

                <Text style={styles.heading}>4. PLANES Y PAGOS</Text>
                <Text style={styles.paragraph}>
                    • Plan Gratis: Uso limitado según se indica en la App.
                    {'\n'}• Suscripciones (Plus/Pro): Se cobran mensualmente. Puedes cancelar en cualquier momento desde tu perfil.
                    {'\n'}• Reembolsos: No ofrecemos reembolsos por meses parciales no utilizados, salvo fallas críticas del sistema atribuibles a nosotros.
                </Text>

                <Text style={styles.heading}>5. PROPIEDAD INTELECTUAL</Text>
                <Text style={styles.paragraph}>
                    Todo el software, marca "Finly" y algoritmos son propiedad exclusiva de nosotros. No puedes realizar ingeniería inversa ni revender nuestro servicio.
                </Text>

                <Text style={styles.heading}>6. LIMITACIÓN DE RESPONSABILIDAD</Text>
                <Text style={styles.paragraph}>
                    Finly no se hace responsable por decisiones financieras tomadas basadas en la información de la App, ni por pérdidas de datos causadas por fallas en servicios de terceros (AWS, OpenAI, Hostinger).
                </Text>

                <Text style={styles.heading}>7. JURISDICCIÓN</Text>
                <Text style={styles.paragraph}>
                    Para cualquier disputa, nos regimos por las leyes vigentes en la Ciudad de México.
                </Text>

                <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 32 }} />

                <Text style={styles.heading}>Aviso de Privacidad</Text>
                <Text style={[styles.paragraph, { fontFamily: 'Inter_700Bold', marginBottom: 24 }]}>
                    Última actualización: Octubre 2025
                </Text>

                <Text style={styles.heading}>1. RESPONSABLE DE LOS DATOS</Text>
                <Text style={styles.paragraph}>
                    "Finly" (en adelante, "La Plataforma"), operada bajo el dominio holafinly.com, con domicilio en México, es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).
                </Text>

                <Text style={styles.heading}>2. DATOS QUE RECOPILAMOS</Text>
                <Text style={styles.paragraph}>
                    Para brindarte el servicio de gestión financiera e IA, recopilamos:
                    {'\n\n'}• Identificación: Nombre, correo electrónico, número de teléfono (WhatsApp).
                    {'\n'}• Financieros: Registros de gastos, ingresos, presupuestos, fotos de tickets y archivos PDF de estados de cuenta bancarios (solo si usas el Plan Pro).
                    {'\n'}• Uso: Metadatos de tus conversaciones con nuestro Chatbot.
                </Text>

                <Text style={styles.heading}>3. FINALIDAD DEL TRATAMIENTO</Text>
                <Text style={styles.paragraph}>
                    Usamos tus datos para:
                    {'\n\n'}• Procesar y categorizar tus finanzas automáticamente.
                    {'\n'}• Enviarte reportes y alertas vía WhatsApp.
                    {'\n'}• Entrenar modelos de IA internos (de forma anónima) para mejorar la precisión.
                    {'\n'}• Gestionar tu suscripción (Cobros).
                </Text>

                <Text style={styles.heading}>4. TRANSFERENCIA DE DATOS (USO DE IA)</Text>
                <Text style={styles.paragraph}>
                    Finly utiliza servicios de terceros para funcionar. Al usar la app, aceptas que fragmentos de tu información (texto de gastos, fotos de tickets) sean procesados por:
                    {'\n\n'}• OpenAI (GPT-4): Para el procesamiento de lenguaje natural.
                    {'\n'}• Meta (WhatsApp): Para la mensajería.
                    {'\n'}• Hostinger: Para el alojamiento de bases de datos.
                    {'\n\n'}NO vendemos tus datos a terceros para publicidad.
                </Text>

                <Text style={styles.heading}>5. TUS DERECHOS ARCO</Text>
                <Text style={styles.paragraph}>
                    Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos enviando un correo a soporte@holafinly.com.
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
