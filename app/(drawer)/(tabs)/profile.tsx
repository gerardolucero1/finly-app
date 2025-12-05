// app/screens/ProfileScreen.tsx
import { useCustomAlert } from '@/app/components/CustomAlert';
import { ProfileOption } from '@/app/components/ProfileOption'; // Importa el componente que creamos
import { useAuth } from '@/app/context/auth';
import { useProfileStore } from '@/app/store';
import { ProfileService } from '@/services/profile';
import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';

const PLANS = [
    {
        name: 'Básico',
        price: '10',
        period: '/Mes',
        description: 'Ideal para iniciar tu control.',
        price_id: 'price_1SLR9U6dZB8Inoh7jLDAgJIu',
    },
    {
        name: 'Premium',
        price: '25',
        period: '/Mes',
        description: 'Control total y avanzado.',
        price_id: 'price_1SLREL6dZB8Inoh7YDQn09BA',
    },
    {
        name: 'VIP',
        price: '60',
        period: '/Mes',
        description: 'Optimización financiera total.',
        price_id: 'price_1SVEmr6dZB8Inoh78F9Cojsm',
    },
];

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
    const profile = useProfileStore((state) => state.profile);
    const updateProfilePicture = useProfileStore((state) => state.updateProfilePicture);
    const { showAlert, AlertComponent, hideAlert } = useCustomAlert();
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const { logout } = useAuth();

    const handleEditProfile = () => router.push({ pathname: '/edit_profile', params: { profile: JSON.stringify(profile) } })
    const handleChangePassword = () => router.push('/edit_password')
    const handleEditSuscription = () => router.push('/edit_suscription')
    const handleNotifications = () => router.push('/edit_notifications')
    const handleAppearance = () => Alert.alert("Navegar", "Ir a la pantalla de apariencia (tema oscuro/claro).");

    useEffect(() => {
        if (profile) {
            let plan = PLANS.find((plan) => plan.price_id === profile.subscription?.stripe_price);
            setCurrentPlan(plan);
        }
    }, [profile])

    const handleLogout = () => {
        showAlert({
            title: "Cerrar Sesión",
            message: "¿Estás seguro de que quieres cerrar sesión?",
            buttons: [
                { text: "Cancelar", style: "default", onPress: () => hideAlert() },
                { text: "Cerrar sesión", style: "danger", onPress: logout },
            ]
        });
    };

    const handlePickImage = () => {
        SheetManager.show('image-picker', {
            payload: {
                onSelect: (asset: ImagePicker.ImagePickerAsset) => {
                    handleInputChange(asset);
                }
            }
        });
    };

    const handleInputChange = async (asset: ImagePicker.ImagePickerAsset) => {
        try {
            const formData = new FormData();
            formData.append("profile_picture", {
                uri: asset.uri,
                name: asset.fileName ?? "profile.jpg",
                type: asset.mimeType ?? "image/jpeg",
            } as any);

            let response = await ProfileService.updateProfilePicture(formData);
            console.log('Esta es la URL: ', response);

            updateProfilePicture(response);
            showAlert({
                title: "Éxito",
                message: "Foto de perfil actualizada.",
            });

        } catch (error: any) {
            if (error.response?.status === 422) {
                console.log('Status:', error.response.status);
                console.log('Data:', error.response.data);
                console.log('Errors:', error.response.data.errors);
                showAlert({
                    icon: 'x',
                    type: 'danger',
                    title: 'Error',
                    message: error.response.data.message,
                });
            } else {
                console.log('Error sin respuesta:', error.message);
                showAlert({
                    icon: 'x',
                    type: 'danger',
                    title: 'Error',
                    message: 'Ha ocurrido un error inesperado.',
                });
            }

        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >

            {/* --- Cabecera con Información del Usuario --- */}
            {profile && (
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: getAvatarUrl(profile.profile_photo_url) }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarButton} onPress={() => handlePickImage()}>
                            <Lucide name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{profile.name}</Text>
                    <Text style={styles.userEmail}>{profile.email}</Text>
                </View>
            )}


            {/* --- Sección de Información y Configuración --- */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tu Información</Text>
                <ProfileOption icon="user" label="Editar Perfil" onPress={handleEditProfile} />
                <ProfileOption icon="lock" label="Cambiar Contraseña" onPress={handleChangePassword} />
            </View>

            {/* --- Sección de Suscripción --- */}
            {profile && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Plan</Text>
                    <View style={styles.subscriptionCard}>
                        <View>
                            <Text style={styles.subscriptionPlan}>{currentPlan ? `Plan ${currentPlan.name}` : 'Sin plan activo'}</Text>
                            <Text style={styles.subscriptionStatus}>{profile.subscription?.stripe_status === 'active' ? 'Activa' : 'Inactiva'}</Text>
                        </View>
                        <Lucide name="gem" size={32} color="#4F46E5" />
                    </View>
                    <ProfileOption icon="settings" label="Gestionar Cuenta" onPress={handleEditSuscription} />
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

            <AlertComponent />
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