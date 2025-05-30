globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import "@/i18n";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { AuthProvider, useAuthContext } from "@/lib/context";
import { ThemeProvider, useTheme } from "@/lib/themeContext"; // Импортируем провайдер темы
import Toast from "react-native-toast-message";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardProvider } from "@/hooks/useKeyboard";
import { DataProvider } from "../lib/datacontext";
import {
    registerForPushNotificationsAsync,
    setupNotificationListeners,
    checkAndUpdateToken,
} from "../lib/notifications";
import { useNavigationContainerRef } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Компонент для Toast с поддержкой темы
function ThemedToastConfig() {
    const { isDark } = useTheme();

    return {
        success: ({ text1, text2 }) => (
            <View
                className={`flex-row items-center border-l-4 border-green-500 p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3 ${
                    isDark ? "bg-dark-surface" : "bg-ghostwhite"
                }`}
            >
                <MaterialIcons name="check-circle" size={24} color="#22c55e" />
                <View className="flex-1">
                    <Text className="text-green-600 text-base font-msemibold">
                        {text1}
                    </Text>
                    {text2 ? (
                        <Text
                            className={`text-sm font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {text2}
                        </Text>
                    ) : null}
                </View>
            </View>
        ),

        error: ({ text1, text2 }) => (
            <View
                className={`flex-row items-center border-l-4 border-red-500 p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3 ${
                    isDark ? "bg-dark-surface" : "bg-ghostwhite"
                }`}
            >
                <MaterialIcons name="error" size={24} color="#ef4444" />
                <View className="flex-1">
                    <Text className="text-red-600 text-base font-msemibold">
                        {text1}
                    </Text>
                    {text2 ? (
                        <Text
                            className={`text-sm font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {text2}
                        </Text>
                    ) : null}
                </View>
            </View>
        ),

        info: ({ text1, text2 }) => (
            <View
                className={`flex-row items-center border-l-4 border-primary p-4 rounded-xl w-[90%] mx-auto shadow-md space-x-3 ${
                    isDark ? "bg-dark-surface" : "bg-ghostwhite"
                }`}
            >
                <MaterialIcons name="info" size={24} color="#3b82f6" />
                <View className="flex-1">
                    <Text className="text-primary text-base font-msemibold">
                        {text1}
                    </Text>
                    {text2 ? (
                        <Text
                            className={`text-sm font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {text2}
                        </Text>
                    ) : null}
                </View>
            </View>
        ),
    };
}

function ThemedToast() {
    const toastConfig = ThemedToastConfig();
    return <Toast config={toastConfig} />;
}

function GlobalStatusBar() {
    const { isDark } = useTheme();

    return (
        <StatusBar
            style={isDark ? "light" : "dark"}
            backgroundColor={isDark ? "#0F0F0F" : "#FFFFFF"}
        />
    );
}

function InitialLayout() {
    const { loading } = useAuthContext();

    if (loading) {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                animation: "fade",
                gestureEnabled: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name="(auth)"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    headerBackVisible: false,
                    headerLeft: () => null,
                    animation: "slide_from_right",
                }}
            />
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: "fade",
                }}
            />
            <Stack.Screen
                name="pages"
                options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: "fade",
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
        "Montserrat-Italic": require("../assets/fonts/Montserrat-Italic.ttf"),
    });
    const navigationRef = useNavigationContainerRef();

    useEffect(() => {
        if (error) throw error;
        if (fontsLoaded) {
            SplashScreen.hideAsync();

            registerForPushNotificationsAsync().then((token) => {
                if (token) {
                    console.log("Push token registered:", token);
                }
            });

            checkAndUpdateToken();

            const unsubscribe = setupNotificationListeners(navigationRef);
            return () => unsubscribe();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded || error) {
        return null;
    }

    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <KeyboardProvider>
                        <>
                            <GlobalStatusBar />
                            <InitialLayout />
                            <ThemedToast />
                        </>
                    </KeyboardProvider>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
