import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ThemeOption = ({ label, icon, selected, onSelect }: { label: string, icon: any, selected: boolean, onSelect: () => void }) => (
    <TouchableOpacity style={[styles.option, selected && styles.optionSelected]} onPress={onSelect}>
        <View style={styles.optionLeft}>
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
                <Lucide name={icon} size={24} color={selected ? "#4F46E5" : "#64748B"} />
            </View>
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
        </View>
        {selected && <Lucide name="check" size={20} color="#4F46E5" />}
    </TouchableOpacity>
);

export default function ThemeScreen() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
    const headerHeight = useHeaderHeight();

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Apariencia',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' },
            }} />

            <View style={styles.content}>
                <Text style={styles.description}>
                    Elige cómo quieres que se vea Finly. El tema del sistema se ajustará automáticamente a la configuración de tu dispositivo.
                </Text>

                <View style={styles.optionsContainer}>
                    <ThemeOption
                        label="Claro"
                        icon="sun"
                        selected={theme === 'light'}
                        onSelect={() => setTheme('light')}
                    />
                    <View style={styles.divider} />
                    <ThemeOption
                        label="Oscuro"
                        icon="moon"
                        selected={theme === 'dark'}
                        onSelect={() => setTheme('dark')}
                    />
                    <View style={styles.divider} />
                    <ThemeOption
                        label="Sistema"
                        icon="smartphone"
                        selected={theme === 'system'}
                        onSelect={() => setTheme('system')}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { padding: 20 },
    description: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        marginBottom: 24,
        lineHeight: 20,
    },
    optionsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
    },
    optionSelected: {
        backgroundColor: '#EEF2FF',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerSelected: {
        backgroundColor: '#E0E7FF',
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
    },
    optionLabelSelected: {
        color: '#4F46E5',
        fontFamily: 'Inter_500Medium',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 72,
    },
});
