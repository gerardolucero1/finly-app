import Lucide from '@react-native-vector-icons/lucide';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { TouchableOpacity, View } from 'react-native';
import { CustomDrawerContent } from '../components/CustomDrawerContent';


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
                        backgroundColor: 'rgba(248, 250, 252, 0.85)', // Un blanco translúcido
                    }} />
                ),
                headerBlurEffect: 'light',
                
                headerRight: () => <HeaderMenuButton />,
                headerLeft: () => navigation.canGoBack() ? <HeaderBackButton /> : null,

                // --- ESTILOS DEL DRAWER ---
                drawerStyle: {
                    width: '80%', // Un ancho más generoso
                },
                drawerActiveTintColor: '#4F46E5', // Color para el ícono y texto activo (Indigo)
                drawerInactiveTintColor: '#64748B', // Color para el ícono y texto inactivo (Slate)
                drawerActiveBackgroundColor: '#EEF2FF', // Fondo para el ítem activo (Indigo-100)

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
                name="dashboard"
                options={{
                    drawerLabel: 'Inicio',
                    drawerIcon: ({ color, size }) => <Lucide name="layout-dashboard" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="finance/accounts"
                options={{
                    drawerLabel: 'Cuentas',
                    drawerIcon: ({ color, size }) => <Lucide name="wallet" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="debts/debts"
                options={{
                    drawerLabel: 'Deudas',
                    drawerIcon: ({ color, size }) => <Lucide name="landmark" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="strategies/strategies"
                options={{
                    drawerLabel: 'Estrategias',
                    drawerIcon: ({ color, size }) => <Lucide name="target" size={size} color={color} />,
                }}
            />
            {/* Puedes añadir más pantallas aquí */}
        </Drawer>
    );
}