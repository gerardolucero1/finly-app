import Lucide from '@react-native-vector-icons/lucide';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Este es tu componente de contenido personalizado
export function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                {/* 1. Encabezado del Perfil */}
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: 'https://static.wikia.nocookie.net/kpop/images/7/75/ITZY_Lia_Tunnel_Vision_concept_photo_4.png/revision/latest?cb=20251019152524' }} // URL de avatar de ejemplo
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>Gerardo Lucero</Text>
                    <Text style={styles.userEmail}>gera_conecta@hotmail.com</Text>
                </View>

                {/* 2. Lista de Items de Navegación */}
                <View style={styles.menuList}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>

            {/* 3. Pie de Página */}
            <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 10 }]}>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.footerLink}>
                    <Lucide name="settings" size={22} color="#64748B" />
                    <Text style={styles.footerLinkText}>Configuración</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.footerLink}>
                    <Lucide name="log-out" size={22} color="#EF4444" />
                    <Text style={[styles.footerLinkText, styles.logoutText]}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    profileContainer: {
        backgroundColor: '#F8FAFC', // Un fondo muy sutil
        padding: 20,
        paddingTop: 50, // Más padding arriba para el status bar
        alignItems: 'flex-start',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    userEmail: {
        fontSize: 14,
        color: '#64748B',
    },
    menuList: {
        paddingHorizontal: 8, // Padding para que el item activo no pegue a los bordes
        marginTop: 8,
    },
    footerContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 10,
    },
    footerLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    footerLinkText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    logoutText: {
        color: '#EF4444', // Rojo para acción destructiva
    },
});