// SearchComponent.jsx
import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const SearchComponent = ({ searchText, setSearchText, onClear, tabName }) => {
    const { t } = useTranslation();

    const handleTextChange = (text) => {
        setSearchText(text);
        if (!text) {
            onClear(); // Вызываем onClear, если текст стал пустым
        }
    };

    return (
        <View className="bg-ghostwhite rounded-3xl p-2  shadow-md border border-gray-200">
            <View className="flex-row items-center">
                <MaterialIcons
                    name="search"
                    size={24}
                    color="#9CA3AF"
                    style={{ marginLeft: 2 }}
                />
                <TextInput
                    placeholder={t("home_layout.search_placeholder", {
                        item: t(`home_layout.tabs.${tabName.toLowerCase()}`),
                    })}
                    value={searchText}
                    onChangeText={handleTextChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    multiline={false}
                    numberOfLines={1}
                    className="flex-1 pl-2 font-mregular"
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={onClear}>
                        <MaterialIcons name="close" size={24} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default SearchComponent;
