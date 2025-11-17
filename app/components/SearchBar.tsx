import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onFilterPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchSection}>
                <Lucide name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar transacciones..."
                    placeholderTextColor="#94A3B8"
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
            <Pressable style={styles.filterButton} onPress={onFilterPress}>
                <Lucide name="sliders-horizontal" size={24} color="#4F46E5" />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#F8FAFC',
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        fontFamily: 'Inter_400Regular',
    },
    filterButton: {
        marginLeft: 12,
        padding: 10,
    },
});