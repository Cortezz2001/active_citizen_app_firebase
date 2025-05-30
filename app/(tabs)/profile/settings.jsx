import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../../../i18n";

const Settings = () => {
    const { t, i18n } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const languages = [
        { code: "en", name: t("settings.languages.english") },
        { code: "ru", name: t("settings.languages.russian") },
        { code: "kz", name: t("settings.languages.kazakh") },
    ];

    const selectLanguage = async (langCode) => {
        await changeLanguage(langCode);
        setModalVisible(false);
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
            action: () => setModalVisible(true),
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

            {/* Модальное окно для выбора языка */}
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
        </ScrollView>
    );
};

export default Settings;
