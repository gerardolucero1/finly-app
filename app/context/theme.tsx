import { Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    colors: typeof Colors.light;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setTheme: () => { },
    colors: Colors.light,
    isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>('system');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Load saved theme from storage
        AsyncStorage.getItem('user-theme').then((savedTheme) => {
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                setThemeState(savedTheme as Theme);
            }
            setIsReady(true);
        });
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        AsyncStorage.setItem('user-theme', newTheme);
    };

    const activeTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
    const colors = Colors[activeTheme];
    const isDark = activeTheme === 'dark';

    if (!isReady) {
        return null; // Or a splash screen
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colors, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
