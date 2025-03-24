globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true; // Отключение предупреждений о переходе Firebase на SDK v22
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { AuthProvider, useAuthContext } from "@/lib/context";
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const toastConfig = {
    success: ({ text1, text2 }) => (
        <View className="flex-row items-center bg-neutral-50 border-l-4 border-green-500 p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3">
            <MaterialIcons name="check-circle" size={24} color="#22c55e" />
            <View className="flex-1">
                <Text className="text-green-600 text-base font-msemibold">
                    {text1}
                </Text>
                {text2 ? (
                    <Text className="text-gray-700 text-sm font-mregular">
                        {text2}
                    </Text>
                ) : null}
            </View>
        </View>
    ),

    error: ({ text1, text2 }) => (
        <View className="flex-row items-center bg-neutral-50 border-l-4 border-red-500 p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3">
            <MaterialIcons name="error" size={24} color="#ef4444" />
            <View className="flex-1">
                <Text className="text-red-600 text-base font-msemibold">
                    {text1}
                </Text>
                {text2 ? (
                    <Text className="text-gray-700 text-sm font-mregular">
                        {text2}
                    </Text>
                ) : null}
            </View>
        </View>
    ),

    info: ({ text1, text2 }) => (
        <View className="flex-row items-center bg-neutral-50 border-l-4 border-primary p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3">
            <MaterialIcons name="info" size={24} color="#3b82f6" />
            <View className="flex-1">
                <Text className="text-primary text-base font-msemibold">
                    {text1}
                </Text>
                {text2 ? (
                    <Text className="text-gray-700 text-sm font-mregular">
                        {text2}
                    </Text>
                ) : null}
            </View>
        </View>
    ),
};

function InitialLayout() {
    const { loading } = useAuthContext();

    if (loading) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                animation: "slide_from_right",
                gestureEnabled: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    animation: "none",
                }}
            />
            <Stack.Screen
                name="(auth)"
                options={{
                    headerShown: false,
                    // Запрещаем жест возврата назад
                    gestureEnabled: false,
                    // Запрещаем возврат назад через кнопку устройства
                    headerBackVisible: false,
                    // Делаем невозможным программный возврат назад
                    headerLeft: () => null,
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded, error] = useFonts({
        "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
        "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
        "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
        "Montserrat-ExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
        "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
        "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
        "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
        "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
        "Montserrat-Thin": require("../assets/fonts/Montserrat-Thin.ttf"),
    });

    useEffect(() => {
        if (error) throw error;
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded || error) {
        return null;
    }

    return (
        <AuthProvider>
            <>
                <InitialLayout />
                <Toast config={toastConfig} />
            </>
        </AuthProvider>
    );
}
