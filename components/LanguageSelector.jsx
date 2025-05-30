import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { useTheme } from "../lib/themeContext";

const LanguageSelector = () => {
    const { i18n, t } = useTranslation();
    const { isDark } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const languages = [
        { code: "en", name: t("language_selector.languages.english") },
        { code: "ru", name: t("language_selector.languages.russian") },
        { code: "kz", name: t("language_selector.languages.kazakh") },
    ];

    const selectLanguage = (langCode) => {
        changeLanguage(langCode);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`p-3 rounded-full ${
                    isDark ? "bg-dark-surface" : "bg-gray-100"
                }`}
            >
                <MaterialIcons
                    name="language"
                    size={24}
                    color={isDark ? "#FFFFFF" : "black"}
                />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View
                        className={`m-6 p-4 rounded-xl shadow-lg ${
                            isDark
                                ? "bg-dark-surface border-dark-border"
                                : "bg-white border-gray-200"
                        } border`}
                        style={{ marginTop: 100 }}
                    >
                        <Text
                            className={`text-lg font-mbold mb-4 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {t("language_selector.select_language")}
                        </Text>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`p-3 rounded-lg mb-2 flex-row items-center justify-between ${
                                    i18n.language === lang.code
                                        ? isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                        : isDark
                                        ? "bg-dark-card"
                                        : "bg-ghostwhite"
                                }`}
                                onPress={() => selectLanguage(lang.code)}
                            >
                                <Text
                                    className={`font-mmedium ${
                                        i18n.language === lang.code
                                            ? "text-white"
                                            : isDark
                                            ? "text-dark-text-primary"
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
        </>
    );
};

export default LanguageSelector;
