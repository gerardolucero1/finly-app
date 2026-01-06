import { GoogleSignin } from '@react-native-google-signin/google-signin';
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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GOOGLE_WEB_CLIENT_ID } from '../../constants/api';
import { useInput } from '../../hooks/useInput';
import { useAuth } from '../context/auth';

// Obtenemos las dimensiones para cálculos responsivos
const { width, height } = Dimensions.get('window');

// Configurar Google Sign-In
// webClientId es necesario para obtener el idToken
GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
});

export default function RegisterPage() {
    const name = useInput('');
    const email = useInput('');
    const password = useInput('');
    const password_confirmation = useInput('');
    const error = useInput('');
    const { register, loginWithGoogle } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] = useState(false);

    const handleGoogleRegister = async (idToken: string) => {
        try {
            await loginWithGoogle(idToken);
        } catch (err) {
            error.onChangeText('Error al registrarse con Google');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleGooglePress = async () => {
        Keyboard.dismiss();
        setIsGoogleLoading(true);
        error.onChangeText('');

        try {
            await GoogleSignin.hasPlayServices();
            // Forzar mostrar selector de cuentas
            await GoogleSignin.signOut();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;

            if (idToken) {
                await handleGoogleRegister(idToken);
            } else {
                error.onChangeText('No se pudo obtener el token de Google');
                setIsGoogleLoading(false);
            }
        } catch (err: any) {
            console.log('Google Sign-In Error:', err);
            if (err.code !== 'SIGN_IN_CANCELLED') {
                error.onChangeText('Error al registrarse con Google');
            }
            setIsGoogleLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!name.value || !email.value || !password.value || !password_confirmation.value) {
            error.onChangeText('Please fill in all fields');
            return;
        }

        Keyboard.dismiss();
        setIsLoading(true);
        error.onChangeText('');

        try {
            await register(name.value, email.value, password.value, password_confirmation.value);
        } catch (err) {
            error.onChangeText('Invalid credentials, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
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
                        {/* Altura fija relativa (25% de la pantalla) para dejar espacio al formulario largo */}
                        <View style={styles.illustrationContainer}>
                            <Image
                                source={require("../../assets/images/login.png")}
                                style={styles.illustrationImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* 2. ENCABEZADO */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Regístrate</Text>
                            <Text style={styles.subtitle}>Ingresa tus datos para registrarte.</Text>
                        </View>

                        {/* 3. FORMULARIO */}
                        <View style={styles.formContainer}>

                            {error.value ? (
                                <View style={styles.errorBadge}>
                                    <Lucide name="octagon-x" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error.value}</Text>
                                </View>
                            ) : null}

                            {/* Input Name */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre"
                                    placeholderTextColor="#94A3B8"
                                    value={name.value}
                                    onChangeText={name.onChangeText}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Input Email */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="mail" size={20} color="#94A3B8" style={styles.inputIcon} />
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

                            {/* Input Password Confirmation */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="lock" size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar Contraseña"
                                    placeholderTextColor="#94A3B8"
                                    value={password_confirmation.value}
                                    onChangeText={password_confirmation.onChangeText}
                                    secureTextEntry={!isPasswordConfirmationVisible}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsPasswordConfirmationVisible(!isPasswordConfirmationVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Lucide
                                        name={isPasswordConfirmationVisible ? "eye-off" : "eye"}
                                        size={20}
                                        color="#94A3B8"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Espacio extra en lugar de "Olvide contraseña" para separar el botón */}
                            <View style={{ marginBottom: 20 }} />

                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Registrarse</Text>
                                )}
                            </TouchableOpacity>

                            {/* Separador */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>o continua con</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Botón Google */}
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGooglePress}
                                disabled={isGoogleLoading}
                                activeOpacity={0.8}
                            >
                                {isGoogleLoading ? (
                                    <ActivityIndicator color="#1E293B" />
                                ) : (
                                    <>
                                        <Svg width={20} height={20} viewBox="0 0 24 24">
                                            <Path
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                fill="#4285F4"
                                            />
                                            <Path
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                fill="#34A853"
                                            />
                                            <Path
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                fill="#FBBC05"
                                            />
                                            <Path
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                fill="#EA4335"
                                            />
                                        </Svg>
                                        <Text style={styles.googleButtonText}>Continuar con Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* 4. FOOTER */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={styles.signUpText}>Iniciar Sesión</Text>
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
        paddingBottom: 30,
        justifyContent: 'center',
    },
    // --- ILUSTRACIÓN ---
    illustrationContainer: {
        // Altura fija: 25% de la pantalla (más pequeña que en Login porque hay más inputs)
        height: height * 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
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
        height: 54, // Mantengo 54 para ahorrar un poco de espacio vertical
        paddingHorizontal: 20,
        marginBottom: 14, // Margen ligeramente reducido entre inputs
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
    // --- SEPARADOR ---
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94A3B8',
        fontSize: 13,
        fontFamily: 'Inter_400Regular',
    },
    // --- BOTÓN GOOGLE ---
    googleButton: {
        backgroundColor: '#FFFFFF',
        height: 56,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 12,
    },
    googleButtonText: {
        color: '#1E293B',
        fontSize: 16,
        fontFamily: 'Inter_500Medium',
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