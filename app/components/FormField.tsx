import { useTheme } from '@/app/context/theme';
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
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.card,
                    borderColor: error ? '#F87171' : colors.border
                },
                error ? styles.inputError : null
            ]}>
                <Lucide
                    name={icon}
                    size={20}
                    color={error ? '#DC2626' : colors.textSecondary}
                    style={styles.icon}
                />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholderTextColor={colors.textSecondary}
                    {...props}
                />
                {rightIcon && onRightIconPress && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightButton}
                        activeOpacity={0.6}
                    >
                        <Lucide name={rightIcon} size={20} color={colors.textSecondary} />
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
        marginBottom: 8,
        fontFamily: 'Inter_500Medium',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
    },
    inputError: {
        backgroundColor: '#FEF2F2',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
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