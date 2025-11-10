// import { Ionicons } from '@expo/vector-icons';
// import { Tabs } from 'expo-router';
// import { Platform, StyleSheet } from 'react-native';

// export default function FinanceTabs() {
//     return (
//         <Tabs 
//             screenOptions={{ 
//                 headerShown: false,
//                 tabBarActiveTintColor: '#667eea',
//                 tabBarInactiveTintColor: '#adb5bd',
//                 tabBarStyle: styles.tabBar,
//                 tabBarLabelStyle: styles.tabBarLabel,
//                 tabBarItemStyle: styles.tabBarItem,
//                 tabBarIconStyle: styles.tabBarIcon,
//                 tabBarShowLabel: true,
//             }}
//         >
//         <Tabs.Screen 
//             name="accounts" 
//             options={{ 
//                 title: 'Cuentas',
//                 tabBarIcon: ({ color, focused, size }) => (
//                     <Ionicons 
//                     name={focused ? 'wallet' : 'wallet-outline'} 
//                     size={size} 
//                     color={color} 
//                     />
//                 ),
//             }} 
//         />
//         <Tabs.Screen 
//             name="statements" 
//             options={{ 
//                 title: 'Movimientos',
//                 tabBarIcon: ({ color, focused, size }) => (
//                     <Ionicons 
//                     name={focused ? 'list' : 'list-outline'} 
//                     size={size} 
//                     color={color} 
//                     />
//                 ),
//             }} 
//         />
//         <Tabs.Screen 
//             name="incomes" 
//             options={{ 
//                 title: 'Ingresos',
//                 tabBarIcon: ({ color, focused, size }) => (
//                     <Ionicons 
//                     name={focused ? 'arrow-down-circle' : 'arrow-down-circle-outline'} 
//                     size={size} 
//                     color={color} 
//                     />
//                 ),
//             }} 
//         />
//         <Tabs.Screen 
//             name="expenses" 
//                 options={{ 
//                 title: 'Gastos',
//                 tabBarIcon: ({ color, focused, size }) => (
//                     <Ionicons 
//                     name={focused ? 'arrow-up-circle' : 'arrow-up-circle-outline'} 
//                     size={size} 
//                     color={color} 
//                     />
//                 ),
//             }} 
//         />
//         </Tabs>
//     );
//     }

// const styles = StyleSheet.create({
//     tabBar: {
//         backgroundColor: '#fff',
//         borderTopWidth: 1,
//         borderTopColor: '#e9ecef',
//         height: Platform.OS === 'ios' ? 88 : 65,
//         paddingBottom: Platform.OS === 'ios' ? 28 : 8,
//         paddingTop: 8,
//         elevation: 8,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: -2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//     },
//     tabBarLabel: {
//         fontSize: 12,
//         fontWeight: '600',
//         marginTop: 0,
//     },
//     tabBarItem: {
//         paddingVertical: 4,
//     },
//     tabBarIcon: {
//         marginBottom: -4,
//     },
// });