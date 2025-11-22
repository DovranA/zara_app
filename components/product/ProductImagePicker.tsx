import React from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Paragraph, Button, IconButton, MD3Theme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

interface ProductImagePickerProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    theme: MD3Theme;
}

export default function ProductImagePicker({ images, onImagesChange, theme }: ProductImagePickerProps) {
    const pickImage = async (useCamera: boolean) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your camera/gallery.');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })
            : await ImagePicker.launchImageLibraryAsync({
                quality: 0.8,
                allowsMultipleSelection: true,
            });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            onImagesChange([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onImagesChange(newImages);
    };

    return (
        <View>
            <Paragraph style={styles.label}>Images</Paragraph>
            <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageListContent}>
                {images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri }} style={styles.image} />
                        <IconButton
                            icon="close-circle"
                            size={20}
                            style={styles.removeButton}
                            onPress={() => removeImage(index)}
                        />
                    </View>
                ))}
                <TouchableOpacity style={[styles.addImageButton, { borderColor: theme.colors.primary }]} onPress={() => pickImage(false)}>
                    <IconButton icon="plus" iconColor={theme.colors.primary} />
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.imageButtons}>
                <Button
                    mode="outlined"
                    icon="camera"
                    onPress={() => pickImage(true)}
                    style={styles.imageButton}
                >
                    Take Photo
                </Button>
                <Button
                    mode="outlined"
                    icon="image-multiple"
                    onPress={() => pickImage(false)}
                    style={styles.imageButton}
                >
                    Add Photos
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    imageList: {
        marginBottom: 16,
    },
    imageListContent: {
        alignItems: 'center',
    },
    imageContainer: {
        marginRight: 8,
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        margin: 0,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    imageButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});
