import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    icon: any; // Nombre del icono de Lucide
    error?: string;
    rightIcon?: string; // Icono del botón derecho (opcional)
    onRightIconPress?: () => void; // Callback cuando se presiona el botón derecho
}

export const FormField: React.FC<FormFieldProps> = ({ 
    label, 
    icon, 
    error, 
    rightIcon,
    onRightIconPress,
    ...props 
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                <Lucide name={icon} size={20} color={error ? '#DC2626' : '#94A3B8'} style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#94A3B8"
                    {...props}
                />
                {rightIcon && onRightIconPress && (
                    <TouchableOpacity 
                        onPress={onRightIconPress}
                        style={styles.rightButton}
                        activeOpacity={0.6}
                    >
                        <Lucide name={rightIcon} size={20} color="#94A3B8" />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        fontFamily: 'Inter_500Medium',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
    },
    inputError: {
        borderColor: '#F87171',
        backgroundColor: '#FEF2F2',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    rightButton: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#DC2626',
        marginTop: 4,
    },
});