import Lucide from '@react-native-vector-icons/lucide';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { TouchableOpacity, View } from 'react-native';
import { CustomDrawerContent } from '../components/CustomDrawerContent';
import { useTheme } from '../context/theme';


// --- Componente para el Botón de Menú a la Derecha ---
// Es una buena práctica crear un pequeño componente para esto
function HeaderMenuButton() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const openDrawer = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <TouchableOpacity onPress={openDrawer} style={{ marginRight: 15 }}>
            <Lucide name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
    );
}

// --- Componente para el Botón de Volver a la Izquierda ---
function HeaderBackButton() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
            <Lucide name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
    );
}


export default function DrawerLayout() {
    const { colors, isDark } = useTheme();

    return (
        <Drawer
            // Aquí está la magia: usamos nuestro componente personalizado
            drawerContent={(props) => <CustomDrawerContent {...props} />}

            screenOptions={({ navigation }) => ({
                headerShown: true,
                headerTransparent: true,
                headerShadowVisible: false,
                headerTitle: '', // Ocultamos el título por defecto para un look más limpio
                headerTitleAlign: 'center',

                // Efecto de blur sutil en el header
                headerBackground: () => (
                    <View style={{
                        flex: 1,
                        backgroundColor: isDark
                            ? 'rgba(15, 23, 42, 0.85)'
                            : 'rgba(248, 250, 252, 0.85)',
                    }} />
                ),
                headerBlurEffect: isDark ? 'dark' : 'light',

                headerRight: () => <HeaderMenuButton />,
                headerLeft: () => navigation.canGoBack() ? <HeaderBackButton /> : null,

                // --- ESTILOS DEL DRAWER ---
                drawerStyle: {
                    width: '80%',
                    backgroundColor: colors.background,
                },
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                drawerActiveBackgroundColor: colors.primary + '15',

                drawerLabelStyle: {
                    fontSize: 16, // Ajuste para alinear con el ícono
                    fontWeight: '500',
                },
                drawerItemStyle: {
                    borderRadius: 8,
                    marginVertical: 4, // Espacio entre items
                },
            })}
        >
            <Drawer.Screen
                name="(tabs)"
                options={{
                    drawerItemStyle: { display: 'none' },
                }}
            />

            <Drawer.Screen
                name="edit_profile"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Editar Perfil',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="edit_password"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Editar Contraseña',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="edit_notifications"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Editar Notificaciones',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="edit_suscription"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Editar Suscripcion',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="strategies"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Estrategias',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="debts"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Deudas',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="subaccounts"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Apartados',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="budgets"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Presupuestos',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="savings"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Ahorros',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Configuración',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="theme"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Apariencia',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="tutorials"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Tutoriales',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="support"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Soporte',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="legal"
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: 'Legal',
                    headerShown: true,
                }}
            />
        </Drawer>
    );
}