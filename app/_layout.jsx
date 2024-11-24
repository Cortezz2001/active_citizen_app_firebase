import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { AuthProvider, useAuthContext } from "@/lib/context";

function InitialLayout() {
    const { user, loading } = useAuthContext();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Отключаем анимацию для начальной навигации
            const options = {
                animation: "none",
            };

            if (user) {
                router.replace("/(tabs)/home");
            } else {
                router.replace("/", undefined, options);
            }
        }
    }, [user, loading]);

    return (
        <Stack
            screenOptions={{
                animation: "slide_from_right",
                // Добавляем настройку для предотвращения множественных переходов
                gestureEnabled: false,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    animation: "none", // Отключаем анимацию для индексной страницы
                }}
            />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
            <InitialLayout />
        </AuthProvider>
    );
}
