import { PLANS } from '@/constants/plans';
import { Lucide } from '@react-native-vector-icons/lucide';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/auth';
import { useTheme } from '../context/theme';
import { useProfileStore } from '../store';
import { useCustomAlert } from './CustomAlert';

// Componente auxiliar para los items del menú
const MenuItem = ({ icon, label, onPress, isDestructive = false, showChevron = true }: any) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.menuItem, isDestructive && { backgroundColor: colors.danger + '10' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemContent}>
                <Lucide
                    name={icon}
                    size={20}
                    color={isDestructive ? colors.danger : colors.textSecondary}
                />
                <Text style={[
                    styles.menuItemText,
                    { color: colors.text },
                    isDestructive && { color: colors.danger, fontFamily: 'Inter_700Bold' }
                ]}>
                    {label}
                </Text>
            </View>
            {showChevron && !isDestructive && (
                <Lucide name="chevron-right" size={16} color={colors.border} />
            )}
        </TouchableOpacity>
    );
};

// Separador de secciones con título opcional
const SectionSeparator = ({ title }: { title?: string }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.sectionSeparator}>
            {title && <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>}
        </View>
    );
};



export function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();
    const { profile } = useProfileStore();
    const { logout } = useAuth();
    const { showAlert, hideAlert, AlertComponent } = useCustomAlert();
    const { colors } = useTheme();

    const handleLogout = () => {
        props.navigation.closeDrawer();
        showAlert({
            title: "Cerrar Sesión",
            message: "¿Estás seguro de que quieres salir?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                { text: "Salir", style: "danger", onPress: () => logout() }
            ]
        });
    };

    // Get plan name from subscription or default to 'Free'
    const getPlanName = () => {
        const stripePrice = profile?.subscription?.stripe_price;
        if (!stripePrice) return 'Free';

        const plan = PLANS[stripePrice];
        return plan?.plan_name || 'Free';
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 1. ScrollView Principal */}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingTop: 0 }}
                showsVerticalScrollIndicator={false}
            >
                {/* A. Encabezado del Perfil */}
                <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: profile?.profile_photo_url || 'https://ui-avatars.com/api/?background=4F46E5&color=fff&name=' + profile?.name
                            }}
                            style={styles.avatar}
                        />
                        {/* Badge opcional "Pro" */}
                        <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                            <Text style={styles.proText}>{getPlanName().toUpperCase()}</Text>
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>{profile?.name || 'Usuario'}</Text>
                        <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>{profile?.email || 'correo@ejemplo.com'}</Text>
                    </View>
                </View>

                {/* B. Navegación Principal (Tus pantallas principales) */}
                <View style={styles.mainNavContainer}>
                    <DrawerItemList {...props} />
                </View>

                {/* C. Sección Configuración y Preferencias */}
                <SectionSeparator title="PREFERENCIAS" />

                <View style={styles.secondaryMenu}>
                    <MenuItem
                        icon="settings"
                        label="Configuración avanzada"
                        onPress={() => router.push('/(drawer)/settings')}
                    />
                    <MenuItem
                        icon="bell"
                        label="Notificaciones"
                        onPress={() => router.push('/(drawer)/edit_notifications')}
                    />
                    <MenuItem
                        icon="moon"
                        label="Cambiar tema"
                        onPress={() => router.push('/(drawer)/theme')}
                    />
                </View>

                {/* D. Sección Soporte y Legal */}
                <SectionSeparator title="SOPORTE" />

                <View style={styles.secondaryMenu}>
                    <MenuItem
                        icon="book-open"
                        label="Tutoriales y Ayuda"
                        onPress={() => router.push('/(drawer)/tutorials')}
                    />
                    <MenuItem
                        icon="life-buoy"
                        label="Contacto y Soporte"
                        onPress={() => router.push('/(drawer)/support')}
                    />
                    <MenuItem
                        icon="file-text"
                        label="Términos y Privacidad"
                        onPress={() => router.push('/(drawer)/legal')}
                    />
                </View>

            </DrawerContentScrollView>

            {/* 2. Footer (Logout) */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />
                <MenuItem
                    icon="log-out"
                    label="Cerrar Sesión"
                    onPress={handleLogout}
                    isDestructive
                    showChevron={false}
                />
                <Text style={[styles.versionText, { color: colors.textSecondary }]}>Versión 1.0.0</Text>
            </View>
            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // --- HEADER ---
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    proBadge: {
        position: 'absolute',
        bottom: -4,
        left: 40,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    proText: {
        color: '#FFF',
        fontSize: 10,
        fontFamily: 'Inter_700Bold',
    },
    userInfo: {
        marginTop: 4,
    },
    userName: {
        fontSize: 20,
        fontFamily: 'Inter_700Bold',
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
    },

    // --- MAIN NAV ---
    mainNavContainer: {
        marginTop: 12,
        paddingHorizontal: 12,
    },

    // --- SEPARATORS ---
    sectionSeparator: {
        marginTop: 24,
        marginBottom: 8,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Inter_700Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    // --- MENU ITEMS ---
    secondaryMenu: {
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuItemText: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
    },

    // --- FOOTER ---
    footer: {
        paddingHorizontal: 16,
    },
    footerDivider: {
        height: 1,
        marginBottom: 12,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
        marginTop: 12,
    },
});