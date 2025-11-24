import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

const SettingItem = ({ icon, label, value, onValueChange }: { icon: any, label: string, value: boolean, onValueChange: (val: boolean) => void }) => (
    <View style={styles.item}>
        <View style={styles.itemLeft}>
            <View style={styles.iconContainer}>
                <Lucide name={icon} size={20} color="#64748B" />
            </View>
            <Text style={styles.itemLabel}>{label}</Text>
        </View>
        <Switch
            trackColor={{ false: "#E2E8F0", true: "#C7D2FE" }}
            thumbColor={value ? "#4F46E5" : "#f4f3f4"}
            ios_backgroundColor="#E2E8F0"
            onValueChange={onValueChange}
            value={value}
        />
    </View>
);

export default function SettingsScreen() {
    const [biometrics, setBiometrics] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [dataSaver, setDataSaver] = useState(false);
    const headerHeight = useHeaderHeight();

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Configuración',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' },
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Seguridad</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="fingerprint"
                        label="Biometría (FaceID / TouchID)"
                        value={biometrics}
                        onValueChange={setBiometrics}
                    />
                </View>

                <Text style={styles.sectionTitle}>Notificaciones</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="bell"
                        label="Notificaciones Push"
                        value={notifications}
                        onValueChange={setNotifications}
                    />
                    <View style={styles.divider} />
                    <SettingItem
                        icon="mail"
                        label="Alertas por Correo"
                        value={emailAlerts}
                        onValueChange={setEmailAlerts}
                    />
                </View>

                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="wifi"
                        label="Ahorro de Datos"
                        value={dataSaver}
                        onValueChange={setDataSaver}
                    />
                </View>

                <Text style={styles.version}>Finly v1.0.0 (Build 1024)</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 20 },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#94A3B8',
        marginBottom: 10,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 8,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 56,
    },
    version: {
        textAlign: 'center',
        color: '#CBD5E1',
        marginTop: 20,
        fontFamily: 'Inter_400Regular',
    },
});
