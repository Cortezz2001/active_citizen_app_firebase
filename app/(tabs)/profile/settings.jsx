import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../../i18n";
import { useTheme } from "../../../lib/themeContext";

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { theme, setThemeMode } = useTheme();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [themeModalVisible, setThemeModalVisible] = useState(false);

    const languages = [
        { code: "en", name: t("settings.languages.english") },
        { code: "ru", name: t("settings.languages.russian") },
        { code: "kz", name: t("settings.languages.kazakh") },
    ];

    const themes = [
        { code: "light", name: t("settings.themes.light") },
        { code: "dark", name: t("settings.themes.dark") },
        { code: "system", name: t("settings.themes.system") },
    ];

    const selectLanguage = async (langCode) => {
        await changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const selectTheme = (themeCode) => {
        setThemeMode(themeCode);
        setThemeModalVisible(false);
    };

    const profileSettingsData = [
        {
            id: "permissions_preferences",
            title: t("settings.permissions_preferences"),
            icon: "lock",
            action: () => router.push("/pages/permissions-preferences"),
        },
        {
            id: "language",
            title: t("settings.language"),
            icon: "language",
            action: () => setLanguageModalVisible(true),
        },
        {
            id: "theme",
            title: t("settings.theme"),
            icon: "color-lens",
            action: () => setThemeModalVisible(true),
        },
    ];

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View>
                {profileSettingsData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 p-4 shadow-md flex-row items-center"
                        onPress={item.action}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color="#006FFD"
                        />
                        <Text className="flex-1 ml-4 font-mmedium text-lg">
                            {item.title}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color="#006FFD"
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Language selection modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View
                        className="bg-white m-6 p-4 rounded-xl shadow-lg"
                        style={{ marginTop: 100 }}
                    >
                        <Text className="text-lg font-mbold mb-4">
                            {t("settings.select_language")}
                        </Text>
                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`p-3 rounded-lg mb-2 flex-row items-center justify-between ${
                                    i18n.language === lang.code
                                        ? "bg-primary"
                                        : "bg-ghostwhite"
                                }`}
                                onPress={() => selectLanguage(lang.code)}
                            >
                                <Text
                                    className={`font-mmedium ${
                                        i18n.language === lang.code
                                            ? "text-white"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {lang.name}
                                </Text>
                                {i18n.language === lang.code && (
                                    <MaterialIcons
                                        name="check"
                                        size={20}
                                        color="white"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Theme selection modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={themeModalVisible}
                onRequestClose={() => setThemeModalVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setThemeModalVisible(false)}
                >
                    <View
                        className="bg-white m-6 p-4 rounded-xl shadow-lg"
                        style={{ marginTop: 100 }}
                    >
                        <Text className="text-lg font-mbold mb-4">
                            {t("settings.select_theme")}
                        </Text>
                        {themes.map((themeItem) => (
                            <TouchableOpacity
                                key={themeItem.code}
                                className={`p-3 rounded-lg mb-2 flex-row items-center justify-between ${
                                    theme === themeItem.code
                                        ? "bg-primary"
                                        : "bg-ghostwhite"
                                }`}
                                onPress={() => selectTheme(themeItem.code)}
                            >
                                <Text
                                    className={`font-mmedium ${
                                        theme === themeItem.code
                                            ? "text-white"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {themeItem.name}
                                </Text>
                                {theme === themeItem.code && (
                                    <MaterialIcons
                                        name="check"
                                        size={20}
                                        color="white"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

export default Settings;
