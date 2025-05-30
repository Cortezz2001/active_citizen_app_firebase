import React from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import { useTheme } from "@/lib/themeContext";

const HomeLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { t, i18n } = useTranslation();
    const { isDark } = useTheme();
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "home" ? "news" : path;
    };
    const activeTab = getCurrentTab();

    const navigateToTab = (tab) => {
        const tabRoute = tab.toLowerCase();
        router.push(`/home/${tabRoute}`);
    };

    const tabs = [
        { key: "news", translationKey: "home_layout.tabs.news" },
        { key: "events", translationKey: "home_layout.tabs.events" },
        { key: "surveys", translationKey: "home_layout.tabs.surveys" },
        { key: "petitions", translationKey: "home_layout.tabs.petitions" },
    ];

    const getTitleFontSize = () => {
        const currentLanguage = i18n.language;
        if (currentLanguage === "ru") return "text-lg";
        return "text-2xl";
    };

    const getTabFontSize = () => {
        const currentLanguage = i18n.language;
        if (currentLanguage === "kz") return "text-xs";
        if (currentLanguage === "ru") return "text-sm";
        return "text-base";
    };

    return (
        <SafeAreaView
            className={`flex-1 ${
                isDark ? "bg-dark-background" : "bg-secondary"
            }`}
        >
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Image
                            source={images.logo}
                            className="w-[65px] h-[65px] mr-2"
                            resizeMode="contain"
                        />
                        <Text
                            className={`${getTitleFontSize()} font-mbold flex-1 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.6}
                            ellipsizeMode="tail"
                        >
                            {t("home_layout.app_title")}
                        </Text>
                    </View>
                    <View className="flex-shrink-0">
                        <LanguageSelector isDark={isDark} />
                    </View>
                </View>

                <View
                    className={`flex-row justify-between mb-4 rounded-full ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                >
                    {tabs.map((tab) => {
                        const isActive = activeTab.toLowerCase() === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => navigateToTab(tab.key)}
                                className={`flex-1 py-2 px-1 rounded-full ${
                                    isActive
                                        ? isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                        : "bg-transparent"
                                }`}
                            >
                                <Text
                                    className={`text-center ${getTabFontSize()} font-mmedium ${
                                        isActive
                                            ? isDark
                                                ? "text-dark-text-primary"
                                                : "text-white"
                                            : isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-600"
                                    }`}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit={
                                        i18n.language === "kz"
                                    }
                                >
                                    {t(tab.translationKey)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Slot />
            </View>
        </SafeAreaView>
    );
};

export default HomeLayout;
