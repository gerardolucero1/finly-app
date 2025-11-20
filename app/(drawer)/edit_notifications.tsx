import { Notification } from '@/models/notification';
import { NotificationsService } from '@/services/notifications';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Reanimated Imports
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle
} from 'react-native-reanimated';
import { useCustomAlert } from '../components/CustomAlert';

// --- HELPER (Igual que antes) ---
const getNotificationConfig = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('payment') || lowerType.includes('invoice')) {
        return { icon: 'receipt', color: '#10B981', bg: '#ECFDF5' };
    }
    if (lowerType.includes('alert') || lowerType.includes('warning')) {
        return { icon: 'alert-triangle', color: '#F59E0B', bg: '#FFFBEB' };
    }
    if (lowerType.includes('welcome') || lowerType.includes('success')) {
        return { icon: 'party-popper', color: '#4F46E5', bg: '#EEF2FF' };
    }
    if (lowerType.includes('debt') || lowerType.includes('due')) {
        return { icon: 'clock', color: '#EF4444', bg: '#FEF2F2' };
    }
    return { icon: 'bell', color: '#64748B', bg: '#F1F5F9' };
};

// --- COMPONENTE ITEM (Actualizado con onPress) ---
const NotificationItem = ({
    item,
    onDelete,
    onPress
}: {
    item: Notification;
    onDelete: (id: number) => void;
    onPress: (item: Notification) => void;
}) => {
    const config = getNotificationConfig(item.type);
    const isUnread = item.read_at === null;

    const data = item.data || {};
    const title = data.title || 'Notificación';
    const message = data.message || data.body || data.line || data.description || 'Tienes una nueva actualización.';

    const timeAgo = item.created_at
        ? DateTime.fromISO(item.created_at.toString()).toRelative({ locale: 'es' })
        : '';

    const renderRightActions = (progress: SharedValue<number>, drag: SharedValue<number>) => {
        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(drag.value, [-80, 0], [1, 0], Extrapolation.CLAMP);
            return { transform: [{ scale }] };
        });

        return (
            <TouchableOpacity onPress={() => onDelete(item.id)} activeOpacity={0.6}>
                <View style={styles.deleteButton}>
                    <Reanimated.View style={[styles.deleteContent, animatedStyle]}>
                        <Lucide name="trash-2" size={24} color="#FFFFFF" />
                        <Text style={styles.deleteText}>Eliminar</Text>
                    </Reanimated.View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}
            containerStyle={styles.swipeableContainer}
        >
            <TouchableOpacity
                style={[styles.itemContainer, isUnread && styles.itemUnread]}
                activeOpacity={0.7}
                // Agregamos la acción al presionar
                onPress={() => onPress(item)}
            >
                {isUnread && <View style={styles.unreadDot} />}

                <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
                    <Lucide name={config.icon} size={20} color={config.color} />
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, isUnread && styles.titleBold]} numberOfLines={1}>
                            {title}
                        </Text>
                        <Text style={styles.timeText}>{timeAgo}</Text>
                    </View>
                    <Text style={styles.message} numberOfLines={2}>
                        {message}
                    </Text>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );
};

// --- PANTALLA PRINCIPAL ---
export default function NotificationsScreen() {
    const headerHeight = useHeaderHeight();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();

    const fetchNotifications = useCallback(async (pageToFetch: number, shouldRefresh = false) => {
        try {
            if (shouldRefresh) setLoading(true);

            const response = await NotificationsService.getAll(pageToFetch);
            const newItems = response.data || [];

            if (shouldRefresh) {
                setNotifications(newItems);
            } else {
                setNotifications(prev => [...prev, ...newItems]);
            }

            setHasMore(response.current_page < response.last_page);
            setPage(response.current_page);

        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications(1, true);
    }, [fetchNotifications]);

    // 1. Función para marcar UNA como leída
    const handlePressNotification = async (item: Notification) => {
        // Si ya está leída, no hacemos nada (o podrías navegar a un detalle)
        if (item.read_at) return;

        // Optimistic Update: Actualizamos la UI inmediatamente
        setNotifications(prevNotifications =>
            prevNotifications.map(n =>
                n.id === item.id
                    ? { ...n, read_at: new Date().toISOString() } // Simulamos fecha actual
                    : n
            )
        );

        try {
            // Llamada a la API en segundo plano
            await NotificationsService.markAsRead(item.id);
        } catch (error) {
            console.error("Error marking as read:", error);
            // Opcional: Revertir cambios si falla
        }
    };

    // 2. Función para marcar TODAS como leídas
    const handleMarkAllAsRead = () => {
        // Verificar si hay algo no leído para evitar llamadas innecesarias
        const hasUnread = notifications.some(n => n.read_at === null);

        if (!hasUnread) {
            showAlert({
                title: "Info",
                message: "Todas las notificaciones ya están leídas.",
            });
            return;
        }

        showAlert({
            title: "Marcar todo como leído",
            message: "¿Deseas marcar todas las notificaciones visibles como leídas?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Sí, marcar",
                    style: "primary",
                    onPress: async () => {
                        // Optimistic Update masivo
                        setNotifications(prev =>
                            prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
                        );

                        try {
                            // Llamada a la API en segundo plano
                            await NotificationsService.markAllAsRead();
                            hideAlert()
                        } catch (error) {
                            console.error("Error marking all as read:", error);
                            // Opcional: Revertir cambios si falla
                        }
                    },
                },
            ]
        });
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchNotifications(1, true);
    };

    const handleLoadMore = () => {
        if (!hasMore || loadingMore || loading) return;
        setLoadingMore(true);
        fetchNotifications(page + 1, false);
    };

    const handleDelete = (id: number) => {
        showAlert({
            title: "Eliminar notificación",
            message: "¿Estás seguro?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                {
                    text: "Eliminar",
                    style: "danger",
                    onPress: async () => {
                        try {
                            const previous = [...notifications];
                            setNotifications(prev => prev.filter(n => n.id !== id));
                            await NotificationsService.delete(id);
                        } catch (error) {
                            setNotifications(previous); // Revert
                            showAlert({
                                title: "Error",
                                message: "No se pudo eliminar",
                                buttons: [
                                    { text: "OK", onPress: () => hideAlert() }
                                ]
                            });
                        }
                    }
                }
            ]
        });
    };

    // Header Component: Título y Botón de Marcar Todos
    const renderHeader = () => {
        // No mostramos header si está cargando inicialmente o está vacío
        if (loading && !refreshing) return null;
        if (notifications.length === 0) return null;

        return (
            <View style={styles.listHeaderContainer}>
                <Text style={styles.listTitle}>Tus notificaciones</Text>
                <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    style={styles.markAllButton}
                    activeOpacity={0.6}
                >
                    <Lucide name="check-check" size={16} color="#4F46E5" style={{ marginRight: 4 }} />
                    <Text style={styles.markAllText}>Marcar todas</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#4F46E5" />
            </View>
        );
    };

    const renderEmpty = () => (
        !loading ? (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                    <Lucide name="bell-off" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyText}>Sin notificaciones</Text>
                <Text style={styles.emptySubText}>Estás al día con todas tus novedades.</Text>
            </View>
        ) : null
    );

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            {loading && !refreshing && notifications.length === 0 ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <NotificationItem
                            item={item}
                            onDelete={handleDelete}
                            onPress={handlePressNotification}
                        />
                    )}
                    ListHeaderComponent={renderHeader} // Agregado aquí
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4F46E5']} />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                />
            )}

            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    // --- LIST HEADER ---
    listHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16, // Separación del top
        paddingBottom: 12, // Separación de la lista
        marginBottom: 4,
    },
    listTitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#0F172A',
    },
    markAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF', // Fondo suave Indigo
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    markAllText: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#4F46E5',
    },
    // --- ESTILOS DE ITEM ---
    swipeableContainer: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    itemUnread: {
        backgroundColor: '#F0F9FF',
        borderColor: '#E0F2FE',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    contentContainer: {
        flex: 1,
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
        flex: 1,
        marginRight: 8,
    },
    titleBold: {
        fontFamily: 'Inter_700Bold',
        color: '#0F172A',
    },
    timeText: {
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        color: '#94A3B8',
    },
    message: {
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        lineHeight: 18,
    },
    // --- EMPTY STATE ---
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconBg: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: '#334155',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        fontFamily: 'Inter_400Regular',
        lineHeight: 20,
    },
    // --- BOTÓN ELIMINAR ---
    deleteButton: {
        backgroundColor: '#EF4444',
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        marginLeft: -16,
        paddingLeft: 8,
    },
    deleteContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        marginTop: 4,
    },
});