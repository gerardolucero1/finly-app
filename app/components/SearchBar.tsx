import { useTheme } from '@/app/context/theme';
import { Lucide } from '@react-native-vector-icons/lucide';
import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onFilterPress }) => {
    const { colors, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.searchSection, { backgroundColor: colors.card }]}>
                <Lucide
                    name="search"
                    size={20}
                    color={colors.textSecondary}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Buscar transacciones..."
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
            <Pressable style={styles.filterButton} onPress={onFilterPress}>
                <Lucide name="sliders-horizontal" size={24} color={colors.primary} />
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
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
        fontFamily: 'Inter_400Regular',
    },
    filterButton: {
        marginLeft: 12,
        padding: 10,
    },
});