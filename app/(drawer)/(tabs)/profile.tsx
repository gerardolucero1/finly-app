// app/screens/ProfileScreen.tsx
import { ProfileOption } from '@/app/components/ProfileOption'; // Importa el componente que creamos
import { useInput } from '@/hooks/useInput';
import { Profile } from '@/models/profile';
import { ProfileService } from '@/services/profile';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRouter } from "expo-router";
import React, { useEffect } from 'react';
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

function getAvatarUrl(url: string | null | undefined): string {
    if (!url) {
        return 'https://ui-avatars.com/api/?name=User&color=7F9CF5&background=EBF4FF';
    }
    
    // Si la URL ya tiene protocolo, codificar solo el signo +
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.replace(/\+/g, '%2B');
    }
    
    // Si es una ruta relativa
    return `${process.env.EXPO_PUBLIC_API_URL}${url}`;
}

export default function ProfileScreen() {
    const headerHeight = useHeaderHeight();
    const profile = useInput<Profile>();

    const router = useRouter();

    const handleEditProfile = () => router.push({ pathname: '/edit_profile', params: { profile: JSON.stringify(profile.value) } })
    const handleChangePassword = () => router.push('/edit_password')
    const handleEditSuscription = () => router.push({ pathname: '/edit_suscription', params: { profile: JSON.stringify(profile.value) } })
    const handleNotifications = () => Alert.alert("Navegar", "Ir a la pantalla de notificaciones.");
    const handleAppearance = () => Alert.alert("Navegar", "Ir a la pantalla de apariencia (tema oscuro/claro).");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let response = await ProfileService.get()
                profile.setValue(response)
            } catch (error) {
                console.log(error);
                
            }
        }

        fetchProfile()
    }, [])
    
    // NOTA SOBRE STRIPE: La mejor manera de manejar esto en móvil es usando el "Stripe Customer Portal".
    // Tu backend debe generar una URL única para que el usuario gestione su suscripción.
    // Luego, simplemente abres esa URL en un WebView o en el navegador del dispositivo.
    const handleManageSubscription = async () => {
        // 1. Llama a tu backend para obtener la URL del portal de Stripe
        // const { url } = await api.getStripePortalUrl();
        const url = 'https://billing.stripe.com/p/login/test_...'; // URL de ejemplo
        
        // 2. Abre la URL
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`No se puede abrir esta URL: ${url}`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar sesión?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sí, cerrar sesión", style: "destructive", onPress: logout },
            ]
        );
    };

    const logout = () => {
        console.log('logout');
        
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
            
            {/* --- Cabecera con Información del Usuario --- */}
            {profile.value && (
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: getAvatarUrl(profile.value.profile_photo_url) }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Lucide name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{profile.value.name}</Text>
                    <Text style={styles.userEmail}>{profile.value.email}</Text>
                </View>
            )}
            

            {/* --- Sección de Información y Configuración --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tu Información</Text>
                <ProfileOption icon="user" label="Editar Perfil" onPress={handleEditProfile} />
                <ProfileOption icon="lock" label="Cambiar Contraseña" onPress={handleChangePassword} />
            </View>
            
            {/* --- Sección de Suscripción --- */}
            {profile.value && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suscripción</Text>
                    <View style={styles.subscriptionCard}>
                        <View>
                            <Text style={styles.subscriptionPlan}>Plan {profile.value.stripe_id}</Text>
                            <Text style={styles.subscriptionStatus}>
                                {/* {user.subscription.status === 'active' ? 'Activa' : 'Inactiva'} */}
                            </Text>
                        </View>
                        <Lucide name="gem" size={32} color="#4F46E5" />
                    </View>
                    <ProfileOption icon="credit-card" label="Administrar Suscripción" onPress={handleEditSuscription} />
                </View>
            )}

            {/* --- Sección de Preferencias --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferencias</Text>
                <ProfileOption icon="bell" label="Notificaciones" onPress={handleNotifications} />
                <ProfileOption icon="sun-moon" label="Apariencia" onPress={handleAppearance} />
            </View>

            {/* --- Cerrar Sesión --- */}
            <View style={styles.section}>
                <ProfileOption icon="log-out" label="Cerrar Sesión" onPress={handleLogout} isDestructive />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#4F46E5',
        borderRadius: 15,
        padding: 6,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 22,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
    },
    userEmail: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 4,
        fontFamily: 'Inter_400Regular',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'Inter_500Medium',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    subscriptionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E0E7FF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 10,
    },
    subscriptionPlan: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#4338CA',
    },
    subscriptionStatus: {
        fontSize: 14,
        color: '#4F46E5',
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
    },
});