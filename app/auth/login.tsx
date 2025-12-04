import { Lucide } from '@react-native-vector-icons/lucide';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView, // Importamos ScrollView
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInput } from '../../hooks/useInput';
import { useAuth } from '../context/auth';

// Obtenemos las dimensiones para cálculos responsivos
const { width, height } = Dimensions.get('window');

export default function LoginPage() {
    const email = useInput('');
    const password = useInput('');
    const error = useInput('');
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const handleLogin = async () => {
        if (!email.value || !password.value) {
            error.onChangeText('Please fill in all fields');
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        error.onChangeText('');

        try {
            await login(email.value, password.value);
        } catch (err) {
            error.onChangeText('Invalid credentials, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Ajuste: behavior en Android a veces funciona mejor como 'height' o undefined dependiendo de la config de Expo, pero con ScrollView 'padding' suele ir bien en iOS */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                style={styles.flexEnd}
                // En Android dentro de un Modal, a veces el cálculo del teclado se desfasa.
                // Si sientes que sube demasiado o muy poco, ajusta este número (-100, 0, 30, etc.)
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -150}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >

                        {/* 1. SECCIÓN DE ILUSTRACIÓN */}
                        {/* Ya no usamos flex: 1, sino una altura fija proporcional a la pantalla */}
                        <View style={styles.illustrationContainer}>
                            <Image
                                source={require("../../assets/images/login.png")}
                                style={styles.illustrationImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* 2. ENCABEZADO */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Iniciar Sesión</Text>
                            <Text style={styles.subtitle}>Ingresa tus datos para iniciar sesión.</Text>
                        </View>

                        {/* 3. FORMULARIO */}
                        <View style={styles.formContainer}>

                            {error.value ? (
                                <View style={styles.errorBadge}>
                                    <Lucide name="octagon-x" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error.value}</Text>
                                </View>
                            ) : null}

                            {/* Input Email */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo Electrónico"
                                    placeholderTextColor="#94A3B8"
                                    value={email.value}
                                    onChangeText={email.onChangeText}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Input Password */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="lock" size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    placeholderTextColor="#94A3B8"
                                    value={password.value}
                                    onChangeText={password.onChangeText}
                                    secureTextEntry={!isPasswordVisible}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Lucide
                                        name={isPasswordVisible ? "eye-off" : "eye"}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.optionsRow}>
                                <View style={{ flex: 1 }} />
                                <TouchableOpacity>
                                    <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* 4. FOOTER */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.signUpText}>Regístrate</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flexEnd: { flex: 1, justifyContent: 'flex-end' },
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingBottom: 20,
        justifyContent: 'center', // Centra el contenido si la pantalla es alta
    },
    // --- ILUSTRACIÓN ---
    illustrationContainer: {
        // CAMBIO CLAVE: Usamos altura fija relativa a la pantalla en lugar de flex: 1
        height: height * 0.35, // Ocupa el 35% de la altura de la pantalla siempre
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    illustrationImage: {
        width: '100%',
        height: '100%',
    },
    // --- HEADER ---
    headerContainer: {
        marginBottom: 25,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
    },
    // --- FORMULARIO ---
    formContainer: {
        width: '100%',
    },
    errorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 10,
        borderRadius: 10,
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        marginLeft: 8,
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        height: 56,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Añadí un borde sutil para mejor definición
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        color: '#1E293B',
        fontSize: 15,
        fontFamily: 'Inter_500Medium',
    },
    eyeIcon: {
        padding: 8,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: '#4F46E5', // Color primario para el enlace
        fontSize: 13,
        fontFamily: 'Inter_500Medium',
    },
    // --- BOTÓN ---
    loginButton: {
        backgroundColor: '#1E293B',
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    // --- FOOTER ---
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 10,
    },
    footerText: {
        color: '#64748B',
        fontFamily: 'Inter_400Regular',
    },
    signUpText: {
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
        marginLeft: 4,
    },
});