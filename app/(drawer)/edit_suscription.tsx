import { TrustBadges } from '@/app/components/TrustBadges';
import { ProfileService } from '@/services/profile';
import { SubscriptionService } from '@/services/subscription';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
// 1. Importamos el hook de Stripe
import { WEB_BASE_URL } from '@/constants/api';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';


import { PLANS_ARRAY } from '@/constants/plans';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCustomAlert } from '../components/CustomAlert';
import { useProfileStore } from '../store';

// --- CONFIGURACIÓN DE DISEÑO ---
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.80;
const SPACING = 15;
const SIDECARD_SPACING = (screenWidth - CARD_WIDTH) / 2;


interface StatusSectionProps {
    subscription: {
        planName: string;
        isOnGracePeriod: boolean;
        endsAt: string | null;
    };
    onCancel: () => void;
    onResume: () => void;
    isLoading: boolean;
}

// --- COMPONENTES VISUALES LOCALES ---

// Agregamos prop 'isLoading' para feedback visual
const PlanCard = ({ item, isCurrent, isLoading, isSubscribed, onPress }: { item: any, isCurrent: boolean, isSubscribed: boolean, isLoading: boolean, onPress: () => void }) => {
    let iconName = 'box';
    if (item.icon === 'message-circle') iconName = 'message-circle';
    if (item.icon === 'briefcase') iconName = 'briefcase';

    // LÓGICA CLAVE:
    // Solo consideramos que es el "Plan Actual" real si coincide el ID Y la suscripción es válida.
    // Si isCurrent es true pero isSubscribed es false, significa que es su "último plan" pero ya venció,
    // por lo tanto debe poder darle clic para renovar.
    const isActiveCurrentPlan = isCurrent && isSubscribed;

    // Determinamos el texto del botón
    let buttonText = item.cta; // Por defecto (ej: "Suscribirse" o "Actualizar")

    if (isActiveCurrentPlan) {
        buttonText = 'Plan Actual';
    }

    // El loading tiene prioridad visual sobre todo
    if (isLoading) buttonText = 'Procesando...';

    // Determinar si el botón debe estar deshabilitado
    // Se deshabilita si está cargando O si ya tiene este plan activo y vigente.
    // Si isCurrent es true pero !isSubscribed, NO se deshabilita (permite renovar).
    const isDisabled = isLoading || isActiveCurrentPlan;

    return (
        <Pressable
            onPress={isDisabled ? undefined : onPress}
            style={[styles.cardShadow]}
        >
            <View style={[styles.card, { backgroundColor: item.accentColor }]}>
                <View style={styles.cardDecoration1} />
                <View style={styles.cardDecoration2} />

                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardType}>{item.name}</Text>
                        {item.popular && (
                            <View style={styles.recommendedBadge}>
                                <Text style={styles.recommendedText}>Recomendado</Text>
                            </View>
                        )}
                    </View>
                    {/* Asumo que Lucide es tu componente de iconos */}
                    <Lucide name={iconName as any} size={32} color="rgba(255,255,255,0.6)" />
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.cardDescription}>{item.desc}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }}>
                        <Text style={styles.cardBalance}>${item.price}</Text>
                        <Text style={styles.cardPeriod}>{item.period}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {item.features.map((feature: string, index: number) => (
                        <View key={index} style={styles.featureRow}>
                            <Lucide name="check" size={16} color="#A5B4FC" style={{ marginTop: 2 }} />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[
                        styles.selectButton,
                        // Solo aplicamos el estilo de "botón gris/actual" si realmente está activo y vigente
                        isActiveCurrentPlan && styles.currentButton,
                        isLoading && { opacity: 0.8 }
                    ]}
                    onPress={onPress}
                    disabled={isDisabled}
                >
                    {isLoading ? (
                        <ActivityIndicator color={item.accentColor} size="small" />
                    ) : (
                        <Text style={[
                            styles.selectButtonText,
                            isActiveCurrentPlan && styles.currentButtonText
                        ]}>
                            {buttonText}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </Pressable>
    );
};

const StatusSection = ({ subscription, onCancel, onResume, isLoading }: StatusSectionProps) => {
    if (!subscription) return null;

    return (
        <View style={styles.statusContainer}>
            {/* Header de la tarjeta */}
            <View style={styles.statusHeader}>
                <View style={[styles.iconContainer, subscription.isOnGracePeriod && styles.iconContainerWarning]}>
                    <Lucide
                        name={subscription.isOnGracePeriod ? "badge-alert" : "badge-check"}
                        size={24}
                        color={subscription.isOnGracePeriod ? "#D97706" : "#4F46E5"}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.statusTitle}>
                        {subscription.isOnGracePeriod ? 'Cancelación Programada' : 'Suscripción Activa'}
                    </Text>
                    <Text style={styles.statusSubtitle}>
                        Plan {subscription.planName}
                    </Text>
                </View>
            </View>

            {/* Información de fecha */}
            {subscription.endsAt && (
                <View style={[styles.infoBox, subscription.isOnGracePeriod && styles.infoBoxWarning]}>
                    <Lucide name="calendar-clock" size={16} color={subscription.isOnGracePeriod ? "#B45309" : "#4F46E5"} />
                    <Text style={[styles.infoText, subscription.isOnGracePeriod && styles.infoTextWarning]}>
                        {subscription.isOnGracePeriod
                            ? `Acceso disponible hasta el: ${subscription.endsAt}`
                            : `Próxima renovación: ${subscription.endsAt}`
                        }
                    </Text>
                </View>
            )}

            {/* Botones de Acción */}
            <View style={styles.statusActions}>
                {subscription.isOnGracePeriod ? (
                    // Estado: Cancelado -> Mostrar REANUDAR
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={onResume}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <>
                                {/* <ActivityIndicator size="small" color="#EF4444" /> */}
                                <Text style={styles.cancelBtnText}>Ver Facturación</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    // Estado: Activo -> Mostrar CANCELAR
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={onCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                            <Text style={styles.cancelBtnText} className='text-gray-600'>Ver Facturación</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};


// --- PANTALLA PRINCIPAL ---

export default function ManageSubscriptionScreen() {
    const headerHeight = useHeaderHeight();
    const [statusLoading, setStatusLoading] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const profile = useProfileStore((state) => state.profile);
    const setProfile = useProfileStore((state) => state.setProfile);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    if (!profile) {
        return (
            <View style={[styles.centered, { paddingTop: headerHeight }]}>
                <Text style={{ fontFamily: 'Inter_500Medium' }}>Cargando información...</Text>
            </View>
        );
    }

    const fetchUserProfile = async () => {
        try {
            const response = await ProfileService.get();
            console.log('User profile:', response);
            setProfile(response);

        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    // 3. Lógica de Pago Nativa (Payment Sheet)
    const handleSelectPlanLegacy = async (plan: any) => {
        setLoadingPlanId(plan.price_id);

        try {
            console.log('1. Solicitando PaymentIntent para:', plan.price_id);

            // A. Obtener PaymentIntent del backend
            const response = await SubscriptionService.subscribe(plan.price_id);

            console.log('2. Respuesta recibida');

            const { paymentIntent, ephemeralKey, customer, priceId } = response;

            if (!paymentIntent || !ephemeralKey || !customer) {
                console.error('3. Datos incompletos:', { paymentIntent, ephemeralKey, customer });
                showAlert({
                    icon: 'x',
                    title: 'Error',
                    type: 'danger',
                    message: 'Faltan datos para procesar el pago.',
                })
                return;
            }

            console.log('3. Inicializando Payment Sheet');

            // B. Inicializar Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "Finly",
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                appearance: {
                    colors: { primary: plan.accentColor || '#007AFF' }
                },
                defaultBillingDetails: {
                    email: profile?.email
                },
                allowsDelayedPaymentMethods: true,
            });

            if (initError) {
                console.error('4. Error al inicializar:', initError);
                showAlert({
                    icon: 'x',
                    title: 'Error',
                    type: 'danger',
                    message: initError.message,
                })
                return;
            }

            console.log('4. Presentando Payment Sheet');

            // C. Presentar Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code === 'Canceled') {
                    console.log('5. Usuario canceló el pago');
                } else {
                    console.error('5. Error en el pago:', paymentError);
                    showAlert({
                        icon: 'x',
                        title: 'Error',
                        type: 'danger',
                        message: paymentError.message,
                    })
                }
                return;
            }

            console.log('5. Pago exitoso, confirmando suscripción...');

            // D. Confirmar la suscripción en el backend
            // Extraer el payment_intent_id del client_secret
            const paymentIntentId = paymentIntent.split('_secret_')[0];

            const confirmResponse = await SubscriptionService.confirmSubscription({
                price_id: priceId,
                payment_intent_id: paymentIntentId,
            });

            if (confirmResponse.success) {
                console.log('6. Suscripción activada exitosamente');
                showAlert({
                    icon: 'check',
                    title: 'Éxito',
                    type: 'success',
                    message: 'Tu suscripción se ha activado correctamente.',
                })
                // Recargar perfil del usuario
                await fetchUserProfile();
            } else {
                showAlert({
                    icon: 'x',
                    title: 'Error',
                    type: 'danger',
                    message: 'No se pudo activar la suscripción.',
                })
            }

        } catch (error: any) {
            console.error('Error completo:', error);
            console.error('Respuesta:', error.response?.data);
            showAlert({
                icon: 'x',
                title: 'Error',
                type: 'danger',
                message: error.response?.data?.error || 'Error al procesar.',
            })
        } finally {
            setLoadingPlanId(null);
        }
    };

    const handleSelectPlan = async (plan: any) => {
        if (plan.price_id === 'free_tier') return
        Linking.openURL(`${WEB_BASE_URL}/subscription/checkout/mobile/${plan.price_id}?email=${encodeURIComponent(profile?.email)}`);
    }

    const handleCancel = () => {
        showAlert({
            icon: 'x',
            title: '¿Cancelar suscripción?',
            type: 'danger',
            message: 'Seguirás teniendo acceso a los beneficios hasta el final del periodo de facturación actual.',
            buttons: [
                {
                    text: "Mantener",
                    style: "default",
                    onPress: () => {
                        showAlert({
                            icon: 'check',
                            title: 'Suscripción mantenida',
                            type: 'success',
                            message: 'Tu suscripción se mantiene activa.',
                        })
                    }
                },
                {
                    text: "Cancelar",
                    style: "danger",
                    onPress: async () => {
                        setStatusLoading(true);
                        try {
                            await SubscriptionService.cancelSubscription();
                            showAlert({
                                icon: 'check',
                                title: 'Suscripción cancelada',
                                type: 'success',
                                message: 'Tu plan no se renovará el próximo mes.',
                            })
                            await fetchUserProfile();
                        } catch (error) {
                            showAlert({
                                icon: 'x',
                                title: 'Error',
                                type: 'danger',
                                message: 'No pudimos cancelar la suscripción.',
                            })
                        } finally {
                            setStatusLoading(false);
                        }
                    }
                }
            ]
        });
    };

    // Lógica para REANUDAR
    const handleResume = () => {
        showAlert({
            icon: 'circle-question-mark',
            title: 'Reanudar suscripción',
            type: 'success',
            message: 'Tu plan volverá a renovarse automáticamente al finalizar el periodo actual.',
            buttons: [
                {
                    text: "Cancelar",
                    style: "default",
                    onPress: () => {
                        showAlert({
                            icon: 'x',
                            title: 'Suscripción cancelada',
                            type: 'danger',
                            message: 'Tu suscripción se mantiene cancelada.',
                        })
                    }
                },
                {
                    text: "Confirmar",
                    style: "success",
                    onPress: async () => {
                        setStatusLoading(true);
                        try {
                            await SubscriptionService.resumeSubscription(); // Tu llamada a API
                            showAlert({
                                icon: 'check',
                                title: 'Suscripción reanudada',
                                type: 'success',
                                message: 'Tu suscripción ha sido reactivada.',
                            })
                            await fetchUserProfile();
                        } catch (error) {
                            showAlert({
                                icon: 'x',
                                title: 'Error',
                                type: 'danger',
                                message: 'No pudimos reanudar la suscripción.',
                            })
                        } finally {
                            setStatusLoading(false);
                        }
                    }
                }
            ]
        });
    };

    const handleManageBilling = async () => {
        Linking.openURL(`${WEB_BASE_URL}/subscription/mobile/portal?email=${encodeURIComponent(profile?.email)}`);
    };

    const subscription = profile.subscription;
    const isSubscribed = subscription?.stripe_status === 'active' || subscription?.stripe_status === 'trialing';
    const currentPlanPriceId = subscription?.stripe_price;
    const currentPlanObj = PLANS_ARRAY.find(p => p.price_id === currentPlanPriceId);

    const onScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
        if (index !== activeIndex) setActiveIndex(index);
    };

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.pageTitle}>Gestionar cuenta</Text>
                    <Text style={styles.pageSubtitle}>Elige el plan perfecto para tus finanzas</Text>
                </View>

                {isSubscribed && currentPlanObj && (
                    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <StatusSection
                            subscription={{
                                planName: currentPlanObj.name,
                                isOnGracePeriod: !!subscription?.ends_at,
                                endsAt: subscription?.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : null
                            }}
                            // Pasamos las nuevas funciones y estado
                            onCancel={handleManageBilling}
                            onResume={handleManageBilling}
                            isLoading={statusLoading}
                        />
                    </View>
                )}

                <View>
                    <FlatList
                        horizontal
                        data={PLANS_ARRAY}
                        keyExtractor={(item) => item.price_id}
                        renderItem={({ item }) => (
                            <PlanCard
                                item={item}
                                isSubscribed={isSubscribed}
                                isCurrent={item.price_id === currentPlanPriceId}
                                isLoading={loadingPlanId === item.price_id} // Estado de carga individual
                                onPress={() => handleSelectPlan(item)}
                            />
                        )}
                        showsHorizontalScrollIndicator={false}
                        style={styles.carousel}
                        contentContainerStyle={{ paddingHorizontal: SIDECARD_SPACING }}
                        snapToInterval={CARD_WIDTH + SPACING}
                        decelerationRate="fast"
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                </View>

                <View style={{ marginTop: 30, paddingHorizontal: 20 }}>
                    <TrustBadges />
                </View>

            </ScrollView>
            <AlertComponent />
        </View>
    );
}

// --- ESTILOS (Sin cambios mayores, solo opacidad en loading) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    pageTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 24,
        color: '#1E293B',
        marginBottom: 4,
    },
    pageSubtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: '#64748B',
    },
    carousel: {
        paddingVertical: 10,
    },
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        marginBottom: 10,
    },
    card: {
        width: CARD_WIDTH,
        height: 520,
        borderRadius: 24,
        marginHorizontal: SPACING / 2,
        padding: 24,
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
    },
    cardDecoration1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -80,
        right: -80,
    },
    cardDecoration2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: -40,
        left: -40,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardType: {
        color: '#FFF',
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
    },
    recommendedBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    recommendedText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
        textTransform: 'uppercase',
    },
    cardBody: {
        marginTop: 10,
    },
    cardDescription: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginBottom: 4,
    },
    cardBalance: {
        color: '#FFF',
        fontSize: 42,
        fontFamily: 'Inter_700Bold',
    },
    cardPeriod: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        marginLeft: 4,
        marginBottom: 6,
    },
    cardFooter: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    featureText: {
        color: '#FFF',
        fontSize: 14,
        marginLeft: 10,
        fontFamily: 'Inter_500Medium',
        flex: 1,
    },
    selectButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
        minHeight: 50, // Altura mínima para que no salte al poner el spinner
        justifyContent: 'center'
    },
    currentButton: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    selectButtonText: {
        color: '#4F46E5',
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
    },
    currentButtonText: {
        color: '#FFF',
    },
    statusContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#EEF2FF', // Indigo muy claro
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerWarning: {
        backgroundColor: '#FFFBEB', // Ambar muy claro
    },
    statusTitle: {
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: 'Inter_400Regular',
        marginTop: 2,
    },

    // Caja de información de fecha
    infoBox: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F3FF', // Violeta muy claro
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
    },
    infoBoxWarning: {
        backgroundColor: '#FEF3C7', // Ambar claro
    },
    infoText: {
        color: '#4F46E5',
        marginLeft: 10,
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
    },
    infoTextWarning: {
        color: '#B45309',
    },

    // Botones de Acción (Cancelar / Reanudar)
    statusActions: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    resumeBtn: {
        backgroundColor: '#4F46E5', // Indigo primario
    },
    resumeBtnText: {
        color: '#FFF',
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
    },
    cancelBtn: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cancelBtnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: '#64748B',
    },

});