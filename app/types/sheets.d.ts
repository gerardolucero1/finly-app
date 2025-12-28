import { SheetDefinition } from 'react-native-actions-sheet';

declare module 'react-native-actions-sheet' {
    interface Sheets {
        'image-picker': SheetDefinition<{
            payload: {
                onSelect: (image: any) => void;
            };
        }>;
    }
}

export { };

