import { Ionicons } from '@expo/vector-icons';
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
      {/* El icono de la imagen se parece a un filtro o un menú. Usemos 'menu'. */}
      <Ionicons name="menu-outline" size={28} color="#1E293B" />
    </TouchableOpacity>
  );
}

// --- Componente para el Botón de Volver a la Izquierda ---
function HeaderBackButton() {
    const navigation = useNavigation();
    return (
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
        <Ionicons name="chevron-back-outline" size={28} color="#1E293B" />
      </TouchableOpacity>
    );
}


export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={({ navigation }) => ({ // Usamos una función para acceder a navigation
        headerShown: true,

        // --- Estilos del Header ---
        headerTransparent: true,      // 1. Hace el fondo del header transparente
        headerShadowVisible: false,   // 2. Elimina la sombra en iOS
        headerElevation: 0,           // 3. Elimina la sombra en Android
        headerTitleAlign: 'center',   // 4. Centra el título como en la imagen
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#1E293B',
        },

        // --- Personalización de Botones ---
        // 5. Botón del Drawer (menú) a la derecha
        headerRight: () => <HeaderMenuButton />,
        
        // 6. Botón de "Atrás" a la izquierda
        // Por defecto, Drawer no muestra el botón de atrás. 
        // Para que aparezca automáticamente cuando navegas a otra pantalla
        // dentro de un stack, el drawer debe estar anidado en ese stack.
        // Aquí forzamos la lógica: si se puede volver atrás, muestra el botón.
        headerLeft: () => navigation.canGoBack() ? <HeaderBackButton /> : null,


        // --- Estilos del Drawer (menú lateral) ---
        drawerActiveTintColor: '#4F46E5', // Un color que combine con el diseño
        drawerInactiveTintColor: '#64748B',
        drawerLabelStyle: { 
          fontSize: 16,
          marginLeft: -20, // Ajusta el espaciado del label junto al icono
        },
      })}
    >
      <Drawer.Screen
        name="dashboard" // Este es el nombre del archivo, ej: dashboard.tsx
        options={{
            title: 'Mis Cuentas', // El título que se mostrará en el header
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
            ),
        }}
      />
      <Drawer.Screen
        name="finance" // ej: finance.tsx
        options={{
            title: 'Finanzas Personales',
            drawerLabel: 'Finanzas',
            drawerIcon: ({ color, size }) => (
                <Ionicons name="wallet-outline" size={size} color={color} />
            ),
        }}
      />
       {/* Añade aquí más pantallas del drawer */}
    </Drawer>
  );
}