import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import images from "@/constants/images";
import { createContext } from "react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import { DataProvider } from "../../../lib/datacontext"; // Импортируйте DataProvider

export const SearchContext = createContext({
    searchText: "",
    setSearchText: () => {},
});

const HomeLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [searchText, setSearchText] = useState("");
    const { t, i18n } = useTranslation();

    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "home" ? "news" : path;
    };
    const activeTab = getCurrentTab();

    useEffect(() => {
        setSearchText("");
    }, [pathname]);

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
        <SafeAreaView className="bg-secondary flex-1">
            <DataProvider>
                {/* Оборачиваем в DataProvider */}
                <View className="px-4 pt-4 flex-1">
                    <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center flex-1">
                            <Image
                                source={images.logo}
                                className="w-[65px] h-[65px] mr-2"
                                resizeMode="contain"
                            />
                            <Text
                                className={`${getTitleFontSize()} font-mbold flex-shrink-1`}
                                numberOfLines={1}
                            >
                                {t("home_layout.app_title")}
                            </Text>
                        </View>
                        <LanguageSelector />
                    </View>

                    <View className="flex-row justify-between mb-4 bg-white rounded-full">
                        {tabs.map((tab) => {
                            const isActive =
                                activeTab.toLowerCase() === tab.key;
                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => navigateToTab(tab.key)}
                                    className={`flex-1 py-2 px-1 rounded-full ${
                                        isActive
                                            ? "bg-primary"
                                            : "bg-transparent"
                                    }`}
                                >
                                    <Text
                                        className={`text-center ${getTabFontSize()} font-mmedium ${
                                            isActive
                                                ? "text-white"
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

                    <View className="bg-ghostwhite rounded-3xl p-2 mb-4 shadow-md border border-gray-200">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="search"
                                size={24}
                                color="#9CA3AF"
                                style={{ marginLeft: 2 }}
                            />
                            <TextInput
                                placeholder={t(
                                    "home_layout.search_placeholder",
                                    {
                                        item: t(
                                            `home_layout.tabs.${activeTab.toLowerCase()}`
                                        ),
                                    }
                                )}
                                value={searchText}
                                onChangeText={setSearchText}
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="flex-1 pl-2 font-mregular"
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSearchText("")}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <SearchContext.Provider
                        value={{ searchText, setSearchText }}
                    >
                        <Slot />
                    </SearchContext.Provider>
                </View>
            </DataProvider>
        </SafeAreaView>
    );
};

export default HomeLayout;
