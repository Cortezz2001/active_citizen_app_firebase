import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n"; // Путь к вашему файлу i18n.js

const LanguageSelector = () => {
    const { i18n, t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const languages = [
        { code: "en", name: t("language_selector.languages.english") },
        { code: "ru", name: t("language_selector.languages.russian") },
        { code: "kz", name: t("language_selector.languages.kazakh") },
    ];

    const selectLanguage = async (langCode) => {
        await changeLanguage(langCode);
        setModalVisible(false);
    };

    return (
        <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <MaterialIcons name="language" size={24} color="black" />
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
                        className="bg-white m-6 p-4 rounded-xl shadow-lg"
                        style={{ marginTop: 100 }}
                    >
                        <Text className="text-lg font-mbold mb-4">
                            {t("language_selector.select_language")}
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
        </>
    );
};

export default LanguageSelector;
