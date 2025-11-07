import { useState } from 'react';

export function useInput<T>(initialValue: T) {
    const [value, setValue] = useState<T>(initialValue);

    return {
        value,
        setValue,
        onChangeText: (val: any) => setValue(val),
    };
}