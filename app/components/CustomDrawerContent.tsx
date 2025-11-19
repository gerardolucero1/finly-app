import { Lucide } from '@react-native-vector-icons/lucide';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/auth';
import { useProfileStore } from '../store';
import { useCustomAlert } from './CustomAlert';

// Componente auxiliar para los items del menú
const MenuItem = ({ icon, label, onPress, isDestructive = false, showChevron = true }: any) => (
    <TouchableOpacity
        style={[styles.menuItem, isDestructive && styles.menuItemDestructive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.menuItemContent}>
            <Lucide
                name={icon}
                size={20}
                color={isDestructive ? "#EF4444" : "#64748B"}
            />
            <Text style={[styles.menuItemText, isDestructive && styles.menuItemTextDestructive]}>
                {label}
            </Text>
        </View>
        {showChevron && !isDestructive && (
            <Lucide name="chevron-right" size={16} color="#CBD5E1" />
        )}
    </TouchableOpacity>
);

// Separador de secciones con título opcional
const SectionSeparator = ({ title }: { title?: string }) => (
    <View style={styles.sectionSeparator}>
        {title && <Text style={styles.sectionTitle}>{title}</Text>}
    </View>
);

export function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();
    const { profile } = useProfileStore();
    const { logout } = useAuth();
    const { showAlert, hideAlert, AlertComponent } = useCustomAlert(); // Asumiendo que ya tienes tu hook

    // Funciones Mock
    const handleAction = (action: string) => {
        // Aquí iría tu lógica de navegación real
        console.log(`Navegando a: ${action}`);
        props.navigation.closeDrawer();
    };

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

    return (
        <View style={styles.container}>
            {/* 1. ScrollView Principal */}
            <DrawerContentScrollView
                {...props}
                contentContainerStyle={{ paddingTop: 0 }}
                showsVerticalScrollIndicator={false}
            >
                {/* A. Encabezado del Perfil */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: profile?.profile_photo_url || 'https://ui-avatars.com/api/?background=4F46E5&color=fff&name=' + profile?.name
                            }}
                            style={styles.avatar}
                        />
                        {/* Badge opcional "Pro" */}
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>PRO</Text>
                        </View>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName} numberOfLines={1}>{profile?.name || 'Usuario'}</Text>
                        <Text style={styles.userEmail} numberOfLines={1}>{profile?.email || 'correo@ejemplo.com'}</Text>
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
                        onPress={() => handleAction('Settings')}
                    />
                    <MenuItem
                        icon="bell"
                        label="Notificaciones"
                        onPress={() => handleAction('Notifications')}
                    />
                    <MenuItem
                        icon="moon"
                        label="Cambiar tema"
                        onPress={() => handleAction('Theme')}
                    />
                </View>

                {/* D. Sección Soporte y Legal */}
                <SectionSeparator title="SOPORTE" />

                <View style={styles.secondaryMenu}>
                    <MenuItem
                        icon="book-open"
                        label="Tutoriales y Ayuda"
                        onPress={() => handleAction('Tutorials')}
                    />
                    <MenuItem
                        icon="life-buoy"
                        label="Contacto y Soporte"
                        onPress={() => handleAction('Support')}
                    />
                    <MenuItem
                        icon="file-text"
                        label="Términos y Privacidad"
                        onPress={() => handleAction('Legal')}
                    />
                </View>

            </DrawerContentScrollView>

            {/* 2. Footer (Logout) */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.footerDivider} />
                <MenuItem
                    icon="log-out"
                    label="Cerrar Sesión"
                    onPress={handleLogout}
                    isDestructive
                    showChevron={false}
                />
                <Text style={styles.versionText}>Versión 1.0.0</Text>
            </View>
            <AlertComponent />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    // --- HEADER ---
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        backgroundColor: '#F8FAFC', // Slate 50
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
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
        backgroundColor: '#4F46E5',
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
        color: '#1E293B',
    },
    userEmail: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
    },

    // --- MAIN NAV ---
    mainNavContainer: {
        marginTop: 12,
        paddingHorizontal: 12,
        // Aquí puedes sobreescribir estilos del DrawerItemList nativo si fuera necesario
        // mediante props en el Navigator, pero este contenedor ayuda al espaciado.
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
        color: '#94A3B8', // Slate 400
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
    menuItemDestructive: {
        backgroundColor: '#FEF2F2', // Red 50
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuItemText: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#334155', // Slate 700
    },
    menuItemTextDestructive: {
        color: '#EF4444', // Red 500
        fontFamily: 'Inter_700Bold',
    },

    // --- FOOTER ---
    footer: {
        paddingHorizontal: 16,
    },
    footerDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 12,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 11,
        color: '#CBD5E1', // Slate 300
        fontFamily: 'Inter_400Regular',
        marginTop: 12,
    },
});