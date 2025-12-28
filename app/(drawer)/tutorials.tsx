import { Lucide } from '@react-native-vector-icons/lucide';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tutorials = [
    { id: '1', title: 'Cómo crear un presupuesto', duration: '2 min', icon: 'chart-pie' },
    { id: '2', title: 'Gestionando tus ahorros', duration: '3 min', icon: 'piggy-bank' },
    { id: '3', title: 'Entendiendo tus reportes', duration: '5 min', icon: 'chart-column-big' },
    { id: '4', title: 'Conectando cuentas bancarias', duration: '4 min', icon: 'landmark' },
    { id: '5', title: 'Tips para ahorrar más', duration: '3 min', icon: 'trending-up' },
];

const TutorialItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
        <View style={styles.iconContainer}>
            <Lucide name={item.icon as any} size={24} color="#4F46E5" />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.metaContainer}>
                <Lucide name="clock" size={12} color="#94A3B8" />
                <Text style={styles.duration}>{item.duration}</Text>
            </View>
        </View>
        <Lucide name={"play-circle" as any} size={24} color="#CBD5E1" />
    </TouchableOpacity>
);

export default function TutorialsScreen() {
    const headerHeight = useHeaderHeight();

    return (
        <View style={[styles.container, { paddingTop: headerHeight }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Tutoriales',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: '#1E293B' },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#F8FAFC' },
            }} />

            <FlatList
                data={tutorials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TutorialItem item={item} />}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <Text style={styles.headerText}>
                        Aprende a sacar el máximo provecho de Finly con estos videos rápidos.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    list: { padding: 20 },
    headerText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
        marginBottom: 20,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
        color: '#1E293B',
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    duration: {
        fontSize: 12,
        fontFamily: 'Inter_500Medium',
        color: '#94A3B8',
    },
});
