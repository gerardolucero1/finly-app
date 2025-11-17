import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export type AlertType = 'default' | 'primary' | 'danger' | 'success' | 'warning';

export interface CustomAlertButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'primary' | 'danger' | 'success';
}

export interface CustomAlertProps {
    visible: boolean;
    onClose?: () => void;
    type?: AlertType;
    icon?: string; // Nombre del icono de Lucide
    title: string;
    message?: string;
    buttons?: CustomAlertButton[];
    closeOnBackdropPress?: boolean;
}

// Configuración de colores por tipo
const alertTypeConfig = {
    default: {
        iconColor: '#64748B',
        iconBackgroundColor: '#F1F5F9',
        defaultIcon: 'info',
    },
    primary: {
        iconColor: '#3B82F6',
        iconBackgroundColor: '#DBEAFE',
        defaultIcon: 'info',
    },
    danger: {
        iconColor: '#EF4444',
        iconBackgroundColor: '#FEE2E2',
        defaultIcon: 'alert-circle',
    },
    success: {
        iconColor: '#10B981',
        iconBackgroundColor: '#D1FAE5',
        defaultIcon: 'check-circle',
    },
    warning: {
        iconColor: '#F59E0B',
        iconBackgroundColor: '#FEF3C7',
        defaultIcon: 'alert-triangle',
    },
};

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    onClose,
    type = 'default',
    icon,
    title,
    message,
    buttons = [],
    closeOnBackdropPress = true,
}) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;

    // Obtener configuración de colores basada en el tipo
    const config = alertTypeConfig[type];
    const finalIcon = icon || config.defaultIcon;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    const handleBackdropPress = () => {
        if (closeOnBackdropPress && onClose) {
            onClose();
        }
    };

    const getButtonStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'primary':
                return styles.buttonPrimary;
            case 'danger':
                return styles.buttonDanger;
            case 'success':
                return styles.buttonSuccess;
            default:
                return styles.buttonDefault;
        }
    };

    const getButtonTextStyle = (buttonStyle?: string) => {
        switch (buttonStyle) {
            case 'primary':
                return styles.buttonTextPrimary;
            case 'danger':
                return styles.buttonTextDanger;
            case 'success':
                return styles.buttonTextSuccess;
            default:
                return styles.buttonTextDefault;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <View style={styles.backdrop}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    transform: [{ scale: scaleAnim }],
                                },
                            ]}
                        >
                            {/* Icono */}
                            <View
                                style={[
                                    styles.iconContainer,
                                    { backgroundColor: config.iconBackgroundColor },
                                ]}
                            >
                                <Lucide name={finalIcon} size={32} color={config.iconColor} />
                            </View>

                            {/* Título */}
                            <Text style={styles.title}>{title}</Text>

                            {/* Mensaje/Subtítulo */}
                            {message && (
                                <Text style={styles.message}>{message}</Text>
                            )}

                            {/* Botones */}
                            {buttons.length > 0 && (
                                <View
                                    style={[
                                        styles.buttonContainer,
                                        buttons.length === 1 && styles.buttonContainerSingle,
                                    ]}
                                >
                                    {buttons.map((button, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.button,
                                                getButtonStyle(button.style),
                                                buttons.length === 1 && styles.buttonFull,
                                            ]}
                                            onPress={button.onPress}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                style={[
                                                    styles.buttonText,
                                                    getButtonTextStyle(button.style),
                                                ]}
                                            >
                                                {button.text}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    buttonContainerSingle: {
        flexDirection: 'column',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonFull: {
        flex: 1,
    },
    buttonDefault: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    buttonPrimary: {
        backgroundColor: '#4F46E5',
    },
    buttonDanger: {
        backgroundColor: '#EF4444',
    },
    buttonSuccess: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    buttonTextDefault: {
        color: '#475569',
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
    },
    buttonTextDanger: {
        color: '#FFFFFF',
    },
    buttonTextSuccess: {
        color: '#FFFFFF',
    },
});

// =====================================================
// HOOK PARA USAR EL ALERT FÁCILMENTE
// =====================================================

export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps>({
        visible: false,
        title: '',
    });

    const showAlert = (config: Omit<CustomAlertProps, 'visible'>) => {
        setAlertConfig({ ...config, visible: true });
    };

    const hideAlert = () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
    };

    const AlertComponent = () => (
        <CustomAlert
            {...alertConfig}
            onClose={hideAlert}
        />
    );

    return {
        showAlert,
        hideAlert,
        AlertComponent,
    };
};