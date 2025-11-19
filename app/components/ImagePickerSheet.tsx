import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';

export const ImagePickerSheet = (props: any) => {
    const pickFromCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            SheetManager.hide('image-picker');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (!result.canceled && props.payload?.onSelect) {
            props.payload.onSelect(result.assets[0]);
        }
        SheetManager.hide('image-picker');
    };

    const pickFromLibrary = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            SheetManager.hide('image-picker');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
        if (!result.canceled && props.payload?.onSelect) {
            props.payload.onSelect(result.assets[0]);
        }
        SheetManager.hide('image-picker');
    };

    return (
        <ActionSheet id={props.sheetId}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.button} onPress={pickFromCamera}>
                    <Text style={styles.buttonText}>Tomar foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={pickFromLibrary}>
                    <Text style={styles.buttonText}>Elegir de galería</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => SheetManager.hide('image-picker')}
                >
                    <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </ActionSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: '#4F46E5',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Inter_700Bold',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
    },
    cancelText: {
        color: '#64748B',
    },
});