import { Notification } from '@/models/notification';
import { NotificationsService } from '@/services/notifications';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { DateTime } from 'luxon'; // Usamos Luxon como en tus otras vistas
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

// Helper para mapear tipos de notificaciones de Laravel a Iconos/Colores
const getNotificationConfig = (type: string) => {
    // Laravel envía algo como "App\Notifications\PaymentReceived"
    // Simplificamos para buscar palabras clave
    const lowerType = type.toLowerCase();

    if (lowerType.includes('payment') || lowerType.includes('invoice')) {
        return { icon: 'receipt', color: '#10B981', bg: '#ECFDF5' }; // Verde
    }
    if (lowerType.includes('alert') || lowerType.includes('warning')) {
        return { icon: 'alert-triangle', color: '#F59E0B', bg: '#FFFBEB' }; // Ambar
    }
    if (lowerType.includes('welcome') || lowerType.includes('success')) {
        return { icon: 'party-popper', color: '#4F46E5', bg: '#EEF2FF' }; // Indigo
    }
    if (lowerType.includes('debt') || lowerType.includes('due')) {
        return { icon: 'clock', color: '#EF4444', bg: '#FEF2F2' }; // Rojo
    }

    // Default (Info)
    return { icon: 'bell', color: '#64748B', bg: '#F1F5F9' }; // Slate
};

// Componente de Item Individual
// Componente de Item Individual Corregido
const NotificationItem = ({ item }: { item: Notification }) => {
    const config = getNotificationConfig(item.type);
    const isUnread = item.read_at === null;

    // --- CORRECCIÓN AQUÍ ---
    // 1. Aseguramos que 'data' no sea null. Si es null, usamos un objeto vacío {}.
    const data = item.data || {};

    // 2. Ahora podemos acceder a las propiedades seguramente
    const title = data.title || 'Notificación';

    // 3. Buscamos diferentes llaves comunes en Laravel Notifications
    const message = data.message || data.body || data.line || data.description || 'Tienes una nueva actualización.';

    // Manejo de fecha seguro (asumiendo que viene como string ISO del backend)
    const timeAgo = item.created_at
        ? DateTime.fromISO(item.created_at.toString()).toRelative({ locale: 'es' })
        : '';

    return (
        <TouchableOpacity
            style={[styles.itemContainer, isUnread && styles.itemUnread]}
            activeOpacity={0.7}
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
    );
};

export default function NotificationsScreen() {
    const headerHeight = useHeaderHeight();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchNotifications = useCallback(async (pageToFetch: number, shouldRefresh = false) => {
        try {
            if (shouldRefresh) setLoading(true);

            const response = await NotificationsService.getAll(pageToFetch);
            const newItems = response.data || [];

            if (shouldRefresh) {
                console.log(newItems);

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

    // Carga inicial
    useEffect(() => {
        fetchNotifications(1, true);
    }, [fetchNotifications]);

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
                <Text style={styles.emptySubText}>Te avisaremos cuando haya novedades importantes.</Text>
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
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <NotificationItem item={item} />}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate 50
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        flexGrow: 1,
    },
    // --- ESTILOS DE ITEM ---
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'flex-start',
        // Sombra sutil
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'transparent', // Placeholder para borde
    },
    itemUnread: {
        backgroundColor: '#F0F9FF', // Sky 50 muy sutil para no leídos
        borderColor: '#E0F2FE',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6', // Blue 500 indicator
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
        marginRight: 8, // Espacio para el dot o la hora
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
});