import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useInput } from '../../hooks/useInput';
import { Text } from '../components/themed-text';
import { useAuth } from '../context/auth';

export default function LoginPage() {
    const email = useInput('gera_conecta@hotmail.com');
    const password = useInput('Margarit@1');
    const error = useInput('');
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            error.onChangeText('')
            await login(email.value, password.value);
        } catch (err) {
            error.onChangeText('Invalid email or password')
            console.log(err);
        }
    };

  return (
    <View style={styles.container}>
        <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome to Finly</Text>
            
            {error ? <Text style={styles.error}>{error.value}</Text> : null}
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                {...email}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                {...password}
                secureTextEntry
            />
            
            <TouchableOpacity 
                style={styles.button}
                onPress={handleLogin}
            >
                <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    },
});