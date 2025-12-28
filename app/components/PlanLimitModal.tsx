import { useTheme } from '@/app/context/theme';
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import {
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export interface PlanLimitModalProps {
    visible: boolean;
    onClose?: () => void;
    type?: 'limit_reached' | 'feature_unavailable';
    title?: string;
    message: string;
    currentCount?: number;
    limit?: number;
    onUpgrade?: () => void;
    closeOnBackdropPress?: boolean;
}

export const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
    visible,
    onClose,
    type = 'limit_reached',
    title,
    message,
    currentCount,
    limit,
    onUpgrade,
    closeOnBackdropPress = true,
}) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    const handleBackdropPress = () => {
        if (closeOnBackdropPress && onClose) {
            onClose();
        }
    };

    const defaultTitle = type === 'limit_reached'
        ? '¡Límite Alcanzado!'
        : '¡Mejora tu Plan!';

    const benefits = [
        { text: 'Recursos ilimitados', icon: 'circle-check' as const },
        { text: 'WhatsApp Bot inteligente', icon: 'circle-check' as const },
        { text: 'Estrategias financieras con IA', icon: 'circle-check' as const },
    ];

    const { colors, isDark } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.container,
                                {
                                    transform: [{ scale: scaleAnim }],
                                    backgroundColor: colors.card,
                                },
                            ]}
                        >
                            {/* Gradient Header */}
                            <View style={styles.gradientHeader} />

                            {/* Close Button */}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Lucide name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {/* Icon */}
                                <View style={styles.iconContainer}>
                                    <View style={styles.iconCircle}>
                                        <Lucide name="zap" size={40} color="#FFFFFF" />
                                    </View>
                                </View>

                                {/* Title */}
                                <Text style={[styles.title, { color: colors.text }]}>
                                    {title || defaultTitle}
                                </Text>

                                {/* Description */}
                                <Text style={[styles.description, { color: colors.textSecondary }]}>
                                    {message}
                                </Text>

                                {/* Limit Info */}
                                {type === 'limit_reached' && currentCount !== undefined && limit !== undefined && (
                                    <View style={styles.limitInfoContainer}>
                                        <View style={[styles.limitInfo, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <Text style={[styles.limitLabel, { color: colors.textSecondary }]}>Límite actual:</Text>
                                            <Text style={[styles.limitValue, { color: colors.text }]}>
                                                {currentCount} / {limit}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                {/* Benefits */}
                                <View style={styles.benefitsContainer}>
                                    <Text style={[styles.benefitsTitle, { color: colors.textSecondary }]}>
                                        Con un plan superior obtienes:
                                    </Text>
                                    <View style={styles.benefitsList}>
                                        {benefits.map((benefit, index) => (
                                            <View key={index} style={styles.benefitItem}>
                                                <Lucide
                                                    name={benefit.icon}
                                                    size={20}
                                                    color="#10B981"
                                                />
                                                <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                                                    {benefit.text}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.actionsContainer}>
                                    <TouchableOpacity
                                        style={styles.upgradeButton}
                                        onPress={onUpgrade}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.upgradeButtonText}>
                                            Ver Planes Disponibles
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.continueButton, { backgroundColor: isDark ? colors.border : '#F3F4F6' }]}
                                        onPress={onClose}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.continueButtonText, { color: isDark ? colors.textSecondary : '#4B5563' }]}>
                                            Entendido
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
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
        padding: 16,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 448,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
    },
    gradientHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        backgroundColor: '#6366F1',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 32,
        paddingTop: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    limitInfoContainer: {
        marginBottom: 24,
    },
    limitInfo: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    limitLabel: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
    },
    limitValue: {
        fontSize: 14,
        fontFamily: 'Inter_700Bold',
        color: '#1F2937',
    },
    benefitsContainer: {
        marginBottom: 24,
    },
    benefitsTitle: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#374151',
        marginBottom: 12,
    },
    benefitsList: {
        gap: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    benefitText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#6B7280',
        lineHeight: 20,
    },
    actionsContainer: {
        gap: 12,
    },
    upgradeButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    upgradeButtonText: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#FFFFFF',
    },
    continueButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#4B5563',
    },
});

// =====================================================
// HOOK PARA USAR EL PLAN LIMIT MODAL FÁCILMENTE
// =====================================================

export const usePlanLimitModal = () => {
    const [modalConfig, setModalConfig] = React.useState<PlanLimitModalProps>({
        visible: false,
        message: '',
    });

    const showPlanLimit = (config: Omit<PlanLimitModalProps, 'visible'>) => {
        setModalConfig({ ...config, visible: true });
    };

    const hidePlanLimit = () => {
        setModalConfig((prev) => ({ ...prev, visible: false }));
    };

    const PlanLimitComponent = () => (
        <PlanLimitModal
            {...modalConfig}
            onClose={hidePlanLimit}
        />
    );

    return {
        showPlanLimit,
        hidePlanLimit,
        PlanLimitComponent,
    };
};