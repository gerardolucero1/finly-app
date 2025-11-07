import { useInput } from '@/hooks/useInput';
import { Account } from '@/models/account';
import { PaginatedResponse } from '@/models/paginated_response';
import { AccountsService } from '@/services/accounts';
import { useEffect } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';

export default function AccountsScreen() {
    const accounts = useInput<Account[]>([])
    const pagination = useInput<Omit<PaginatedResponse<Account>, 'data'> | null>(null);
    const loading = useInput(true)
    const page = useInput<number>(1)

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await AccountsService.getAll(page.value)
                accounts.setValue(response.data)
                pagination.setValue(
                    {
                        current_page: response.current_page,
                        per_page: response.per_page,
                        total: response.total,
                        next_page_url: response.next_page_url,
                        prev_page_url: response.prev_page_url,
                    }
                )
            } catch (error) {
                console.log(error);
                
            } finally {
                console.log('daleeeee');
                
                loading.setValue(false)
            }
        }

        fetchAccounts()
    }, [page.value])

    if (loading.value) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <FlatList
                data={accounts.value}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#ddd' }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                    <Text>${item.available_balance}</Text>
                    <Text>{item.type}</Text>
                </View>
                )}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                <Button
                    className=' bg-red-500'
                    title="Anterior"
                    disabled={!pagination.value?.prev_page_url}
                    onPress={() => page.setValue((prev) => Math.max((prev as number) - 1, 1))}
                />
                <Text className=' text-2xl'>
                    Página {pagination.value?.current_page}
                </Text>
                <Button
                    title="Siguiente"
                    disabled={!pagination.value?.next_page_url}
                    onPress={() => page.setValue((prev) => ((prev as number) + 1))}
                />
            </View>
        </View>
    );
}