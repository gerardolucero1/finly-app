import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/theme';

const ThemeOption = ({
    label,
    icon,
    selected,
    onSelect,
    colors
}: {
    label: string;
    icon: any;
    selected: boolean;
    onSelect: () => void;
    colors: any;
}) => (
    <TouchableOpacity style={[styles.option, selected && { backgroundColor: colors.primary + '15' }]} onPress={onSelect}>
        <View style={styles.optionLeft}>
            <View style={[
                styles.iconContainer,
                { backgroundColor: colors.iconBg },
                selected && { backgroundColor: colors.primary + '25' }
            ]}>
                <Lucide name={icon} size={24} color={selected ? colors.primary : colors.textSecondary} />
            </View>
            <Text style={[
                styles.optionLabel,
                { color: colors.text },
                selected && { color: colors.primary }
            ]}>{label}</Text>
        </View>
        {selected && <Lucide name="check" size={20} color={colors.primary} />}
    </TouchableOpacity>
);

export default function ThemeScreen() {
    const { theme, setTheme, colors } = useTheme();
    const headerHeight = useHeaderHeight();

    return (
        <View style={[styles.container, { paddingTop: headerHeight, backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Apariencia',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.text },
                headerTintColor: colors.primary,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background },
            }} />

            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Elige cómo quieres que se vea Finly. El tema del sistema se ajustará automáticamente a la configuración de tu dispositivo.
                </Text>

                <View style={[styles.optionsContainer, { backgroundColor: colors.card }]}>
                    <ThemeOption
                        label="Claro"
                        icon="sun"
                        selected={theme === 'light'}
                        onSelect={() => setTheme('light')}
                        colors={colors}
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <ThemeOption
                        label="Oscuro"
                        icon="moon"
                        selected={theme === 'dark'}
                        onSelect={() => setTheme('dark')}
                        colors={colors}
                    />
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <ThemeOption
                        label="Sistema"
                        icon="smartphone"
                        selected={theme === 'system'}
                        onSelect={() => setTheme('system')}
                        colors={colors}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    description: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginBottom: 24,
        lineHeight: 20,
    },
    optionsContainer: {
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
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
    },
    divider: {
        height: 1,
        marginLeft: 72,
    },
});
