import { Ionicons } from '@expo/vector-icons';
import Lucide from '@react-native-vector-icons/lucide';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

export default function FinanceTabs() {
    return (
        <Tabs 
            screenOptions={{ 
                headerShown: false,
                tabBarActiveTintColor: '#667eea',
                tabBarInactiveTintColor: '#adb5bd',
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarItemStyle: styles.tabBarItem,
                tabBarIconStyle: styles.tabBarIcon,
                tabBarShowLabel: true,
            }}
        >
        <Tabs.Screen 
            name="dashboard" 
            options={{ 
                title: 'Inicio',
                tabBarIcon: ({ color, focused, size }) => (
                    <Lucide 
                        name={'layout-dashboard'} 
                        size={size} 
                        color={color} 
                    />
                ),
            }} 
        />
        <Tabs.Screen 
            name="accounts" 
            options={{ 
                title: 'Cuentas',
                tabBarIcon: ({ color, focused, size }) => (
                    <Lucide 
                        name={'wallet'} 
                        size={size} 
                        color={color} 
                    />
                ),
            }} 
        />
        <Tabs.Screen 
            name="movements" 
                options={{ 
                title: 'Movimientos',
                tabBarIcon: ({ color, focused, size }) => (
                    <Lucide 
                        name={'arrow-left-right'} 
                        size={size} 
                        color={color} 
                    />
                ),
            }} 
        />
        <Tabs.Screen 
            name="profile" 
                options={{ 
                title: 'Perfil',
                tabBarIcon: ({ color, focused, size }) => (
                    <Ionicons 
                        name={'person'} 
                        size={size} 
                        color={color} 
                    />
                ),
            }} 
        />
        </Tabs>
    );
    }

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        height: Platform.OS === 'ios' ? 88 : 65,
        paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        paddingTop: 4,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 0,
        fontFamily: 'Inter_400Regular',
    },
    tabBarItem: {
        paddingVertical: 4,
    },
    tabBarIcon: {
        marginBottom: -4,
    },
});