import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
            title: 'Inicio',
            drawerLabel: 'Home',
            drawerIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
            ),
        }}
      />
      <Drawer.Screen
        name="finance"
        options={{
            title: 'Finanzas Personales',
            drawerLabel: 'Finanzas Personales',
            drawerIcon: ({ color, size }) => (
                <Ionicons name="wallet-outline" size={size} color={color} />
            ),
        }}
      />
    </Drawer>
  );
}
