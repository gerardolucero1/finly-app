import { useTheme } from '@/app/context/theme';
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileOptionProps {
    icon: any; // Nombre del icono de Lucide
    label: string;
    onPress: () => void;
    isDestructive?: boolean; // Para opciones como "Cerrar Sesión"
}

export const ProfileOption: React.FC<ProfileOptionProps> = ({ icon, label, onPress, isDestructive = false }) => {
    const { colors, isDark } = useTheme();

    const textColor = isDestructive ? '#DC2626' : colors.text;
    const iconColor = isDestructive ? '#DC2626' : colors.primary;

    // Adjust background color for icon container based on theme
    const iconContainerBg = isDestructive
        ? (isDark ? 'rgba(220, 38, 38, 0.1)' : '#FEE2E2')
        : (isDark ? 'rgba(79, 70, 229, 0.1)' : '#E0E7FF');

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.card }]}
            onPress={onPress}
            activeOpacity={0.6}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}>
                <Lucide name={icon} size={20} color={iconColor} />
            </View>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {!isDestructive && (
                <Lucide name="chevron-right" size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    label: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
});