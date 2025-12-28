import { useTheme } from '@/app/context/theme';
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

const TutorialItem = ({ item }: { item: any }) => {
    const { colors, isDark } = useTheme();

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, shadowOpacity: isDark ? 0.05 : 0.05 }]}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF' }]}>
                <Lucide name={item.icon as any} size={24} color="#4F46E5" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <View style={styles.metaContainer}>
                    <Lucide name="clock" size={12} color={colors.textSecondary} />
                    <Text style={[styles.duration, { color: colors.textSecondary }]}>{item.duration}</Text>
                </View>
            </View>
            <Lucide name={"play-circle" as any} size={24} color={isDark ? colors.border : "#CBD5E1"} />
        </TouchableOpacity>
    );
};

export default function TutorialsScreen() {
    const headerHeight = useHeaderHeight();
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { paddingTop: headerHeight, backgroundColor: colors.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Tutoriales',
                headerTitleStyle: { fontFamily: 'Inter_700Bold', color: colors.text },
                headerTintColor: '#4F46E5',
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background },
            }} />

            <FlatList
                data={tutorials}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <TutorialItem item={item} />}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                        Aprende a sacar el máximo provecho de Finly con estos videos rápidos.
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 20 },
    headerText: {
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        marginBottom: 20,
        lineHeight: 20,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
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
    },
});
