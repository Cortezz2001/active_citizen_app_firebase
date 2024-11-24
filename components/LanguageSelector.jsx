import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useTranslation } from "react-i18next";

// Иконки флагов
const flags = {
    ru: require("@/assets/icons/russian.png"),
    en: require("@/assets/icons/english.png"),
    kz: require("@/assets/icons/kazakh.png"),
};

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState("ru");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
        i18n.changeLanguage(lang);
        setIsDropdownOpen(false);
    };

    return (
        <View className="absolute top-4 right-4 z-10 mt-4">
            <TouchableOpacity
                className="flex-row items-center bg-white p-2 rounded-lg border border-gray-300 shadow"
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <Image
                    source={flags[selectedLanguage]}
                    className="w-6 h-4 mr-2"
                />
                <Text className="text-sm font-medium text-gray-700">▼</Text>
            </TouchableOpacity>
            {isDropdownOpen && (
                <View className="absolute top-10 right-0 bg-white rounded-lg border border-gray-300 shadow p-2 w-28">
                    {Object.keys(flags).map((lang) => (
                        <TouchableOpacity
                            key={lang}
                            className="flex-row items-center py-2"
                            onPress={() => handleLanguageChange(lang)}
                        >
                            <Image
                                source={flags[lang]}
                                className="w-6 h-4 mr-2"
                            />
                            <Text className="ml-2 text-sm font-medium text-gray-700">
                                {lang.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

export default LanguageSelector;
