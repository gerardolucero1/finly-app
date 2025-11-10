import Lucide from '@react-native-vector-icons/lucide';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { TouchableOpacity } from 'react-native';

// --- Componente para el Botón de Menú a la Derecha ---
// Es una buena práctica crear un pequeño componente para esto
function HeaderMenuButton() {
    const navigation = useNavigation();
    const openDrawer = () => {
        // Usamos DrawerActions para despachar la acción de abrir el drawer
        navigation.dispatch(DrawerActions.openDrawer());
    };

    return (
        <TouchableOpacity onPress={openDrawer} style={{ marginRight: 15 }}>
            <Lucide name="menu" size={28} color="#1E293B" />
        </TouchableOpacity>
    );
}

// --- Componente para el Botón de Volver a la Izquierda ---
function HeaderBackButton() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
        <Lucide name="chevron-left" size={28} color="#1E293B" />
      </TouchableOpacity>
    );
}


export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={({ navigation }) => ({
                headerShown: true,
                headerTransparent: true,
                headerShadowVisible: false,
                headerBlurEffect: 'light',
                // headerBackground: () => (
                //     <View style={{
                //         flex: 1,
                //         backgroundColor: 'rgba(248, 250, 252, 0.8)',
                //     }} />
                // ),
                headerElevation: 1,
                headerTitleAlign: 'center',
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#1E293B',
                },

                headerRight: () => <HeaderMenuButton />,
                headerLeft: () => navigation.canGoBack() ? <HeaderBackButton /> : null,

                drawerActiveTintColor: '#4F46E5',
                drawerInactiveTintColor: '#64748B',
                drawerLabelStyle: { 
                    fontSize: 16,
                },
            })}
        >
        <Drawer.Screen
            name="dashboard" // Este es el nombre del archivo, ej: dashboard.tsx
            options={{
                title: '', // El título que se mostrará en el header
                drawerLabel: 'Inicio',
                drawerIcon: ({ color, size }) => (
                    <Lucide name="house" size={size} color={color} />
                ),
            }}
        />
        <Drawer.Screen
            name="finance/accounts"
            options={{
                title: '',
                drawerLabel: 'Cuentas',
                drawerIcon: ({ color, size }) => (
                    <Lucide name="wallet" size={size} color={color} />
                ),
            }}
        />
        </Drawer>
    );
}