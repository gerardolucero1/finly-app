import { View } from 'react-native';
import { Text } from '../../components/themed-text';

export default function ExpensesScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Gastos</Text>
        </View>
    );
}