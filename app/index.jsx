import Swiper from "react-native-swiper";
import CustomButton from "@/components/CustomButton";
import { router, Redirect, useNavigationContainerRef } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "@/lib/context";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LanguageSelector from "../components/LanguageSelector";
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { checkInitialNotification } from "../lib/notifications";
import { useTheme } from "../lib/themeContext";
import ThemeToggleButton from "../components/ThemeToggleButton";

export default function Index() {
    const { t } = useTranslation();
    const { user, loading, hasProfile } = useAuthContext();
    const swiperRef = useRef(null);
    const navigationRef = useNavigationContainerRef();
    const initialNotificationCheckedRef = useRef(false);
    const { isDark } = useTheme();

    // Проверка уведомления при запуске приложения (когда было закрыто)
    useEffect(() => {
        if (
            user &&
            hasProfile &&
            !loading &&
            !initialNotificationCheckedRef.current
        ) {
            initialNotificationCheckedRef.current = true;

            // Небольшая задержка для завершения всех переходов
            setTimeout(() => {
                checkInitialNotification(navigationRef);
            }, 500);
        }
    }, [user, hasProfile, loading, navigationRef]);

    // Если пользователь залогинен - сразу редиректим на home
    if (user && hasProfile && !loading) {
        return <Redirect href="/(tabs)/home" />;
    }
    if (user && hasProfile === false) {
        return <Redirect href="/complete-registration" />;
    }

    // Если все еще идет загрузка - возвращаем null
    if (loading) {
        return null;
    }

    // Если пользователь не залогинен - показываем стартовый экран
    return (
        <SafeAreaView className="bg-secondary h-full">
            <Swiper
                loop={false}
                dot={<View className="w-2 h-2 rounded-full bg-gray-300 mx-1" />}
                activeDotStyle={
                    <View className="w-2 h-2 rounded-full bg-primary mx-1" />
                }
                showsButtons={false}
                ref={swiperRef}
            >
                {/* Первая страница */}
                <View
                    className={`flex-1 justify-center items-center px-4 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="absolute top-4 right-4 z-10 flex-row">
                        <View className="mr-2">
                            <LanguageSelector isDark={isDark} />
                        </View>
                        <ThemeToggleButton isDark={isDark} />
                    </View>
                    <LottieView
                        source={require("../assets/animations/welcome_logo.json")}
                        autoPlay
                        loop
                        style={{ width: 300, height: 230, marginBottom: 32 }}
                    />
                    <Text
                        className={`text-3xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.welcome.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-4 ${
                            isDark ? "text-dark-text-secondary" : "text-black"
                        }`}
                    >
                        {t("index.slides.welcome.description")}
                    </Text>
                    <View className="px-6 pt-10 flex-row mb-2">
                        <TouchableOpacity
                            onPress={() => swiperRef.current.scrollTo(5)}
                            className="flex-row items-center"
                            accessibilityLabel={t("index.slides.welcome.skip")}
                        >
                            <Text
                                className={`ml-1 font-msemibold ${
                                    isDark
                                        ? "text-dark-primary"
                                        : "text-primary"
                                }`}
                            >
                                {t("index.slides.welcome.skip")}
                            </Text>
                            <MaterialIcons
                                name="arrow-forward"
                                size={16}
                                color={isDark ? "#0066E6" : "#3b82f6"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Вторая страница */}
                <View
                    className={`flex-1 justify-center items-center px-6 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("@/assets/animations/report.json")}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text
                        className={`text-2xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.report_issues.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-3 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {t("index.slides.report_issues.description")}
                    </Text>
                </View>

                {/* Третья страница */}
                <View
                    className={`flex-1 justify-center items-center px-6 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/news.json")}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text
                        className={`text-2xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.city_news.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-3 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {t("index.slides.city_news.description")}
                    </Text>
                </View>

                {/* Четвертая страница */}
                <View
                    className={`flex-1 justify-center items-center px-6 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/join-community.json")}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text
                        className={`text-2xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.community_events.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-3 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {t("index.slides.community_events.description")}
                    </Text>
                </View>

                {/* Пятая страница */}
                <View
                    className={`flex-1 justify-center items-center px-6 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/vote.json")}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text
                        className={`text-2xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.vote_influence.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-3 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {t("index.slides.vote_influence.description")}
                    </Text>
                </View>

                {/* Шестая страница */}
                <View
                    className={`flex-1 justify-center items-center px-4 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("@/assets/animations/login.json")}
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text
                        className={`text-3xl font-mbold text-center ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("index.slides.get_started.title")}
                    </Text>
                    <Text
                        className={`text-sm font-mmedium text-center leading-relaxed mt-4 ${
                            isDark ? "text-dark-text-secondary" : "text-black"
                        }`}
                    >
                        {t("index.slides.get_started.description")}
                    </Text>
                    <CustomButton
                        title={t("index.slides.get_started.continue")}
                        handlePress={() => router.push("/sign-in")}
                        containerStyles={`w-full mt-7 min-h-[62px]`}
                        textStyles="text-white"
                        isDark={isDark}
                    />
                </View>
            </Swiper>
        </SafeAreaView>
    );
}
