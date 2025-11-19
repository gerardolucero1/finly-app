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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useInput } from '../../hooks/useInput';
import { useAuth } from '../context/auth';

// Obtenemos las dimensiones para cálculos responsivos
const { width, height } = Dimensions.get('window');

export default function LoginPage() {
    const email = useInput('gera_conecta@hotmail.com');
    const password = useInput('Margarit@1');
    const error = useInput('');
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.contentContainer}>

                        {/* 1. SECCIÓN DE ILUSTRACIÓN (Flexible) */}
                        {/* Usamos flex: 1 para que ocupe el espacio disponible arriba */}
                        <View style={styles.illustrationContainer}>
                            <Image
                                source={require("../../assets/images/login.png")}
                                style={styles.illustrationImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* 2. ENCABEZADO */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Login</Text>
                            <Text style={styles.subtitle}>Please sign in to continue.</Text>
                        </View>

                        {/* 3. FORMULARIO (Espacio Fijo) */}
                        <View style={styles.formContainer}>

                            {error.value ? (
                                <View style={styles.errorBadge}>
                                    <Lucide name="alert-circle" size={16} color="#EF4444" />
                                    <Text style={styles.errorText}>{error.value}</Text>
                                </View>
                            ) : null}

                            {/* Input Email */}
                            <View style={styles.inputWrapper}>
                                <Lucide name="user" size={20} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username or Email"
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
                                    placeholder="Password"
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
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
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
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* 4. FOOTER */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have account? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.signUpText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 30,
        paddingBottom: 20, // Un poco de espacio abajo para seguridad
        justifyContent: 'center',
    },
    // --- ILUSTRACIÓN ---
    illustrationContainer: {
        flex: 1, // Esto hace que la imagen ocupe todo el espacio libre vertical
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 150, // Altura mínima para que no desaparezca del todo
        marginBottom: 10,
    },
    illustrationImage: {
        width: '100%', // Ocupa el ancho disponible del contenedor
        height: '90%', // Deja un pequeño margen
    },
    // --- HEADER ---
    headerContainer: {
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 32,
        fontFamily: 'Inter_700Bold',
        color: '#1E293B',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 15, // Reduje un poco para ahorrar espacio
        fontFamily: 'Inter_400Regular',
        color: '#64748B',
    },
    // --- FORMULARIO ---
    formContainer: {
        width: '100%',
        // No ponemos flex aquí para que el formulario tenga su altura natural
    },
    errorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        padding: 8, // Reduje un poco el padding
        borderRadius: 10,
        marginBottom: 12,
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
        height: 54, // Reduje de 58 a 54 para ganar espacio vertical
        paddingHorizontal: 20,
        marginBottom: 14,
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
        marginBottom: 20, // Reduje el margen
    },
    forgotText: {
        color: '#1E293B',
        fontSize: 13,
        fontFamily: 'Inter_600SemiBold',
    },
    // --- BOTÓN ---
    loginButton: {
        backgroundColor: '#1E293B',
        height: 54, // Coincide con el input
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
        marginTop: 20, // Reduje el margen
    },
    footerText: {
        color: '#94A3B8',
        fontFamily: 'Inter_400Regular',
    },
    signUpText: {
        color: '#1E293B',
        fontFamily: 'Inter_700Bold',
        marginLeft: 4,
    },
});