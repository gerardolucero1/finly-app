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
    const textColor = isDestructive ? '#DC2626' : '#1E293B';
    const iconColor = isDestructive ? '#DC2626' : '#4F46E5';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.6}>
            <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#FEE2E2' : '#E0E7FF' }]}>
                <Lucide name={icon} size={20} color={iconColor} />
            </View>
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {!isDestructive && (
                <Lucide name="chevron-right" size={20} color="#94A3B8" />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
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