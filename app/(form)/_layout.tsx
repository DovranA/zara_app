import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";

export default function FormLayout() {
    const theme = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.onPrimary,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShown: true,
                animation: Platform.select({
                    android: "fade_from_bottom",
                    ios: "default"
                }),
            }}
        />
    );
}
