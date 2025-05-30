import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const SearchComponent = ({
    searchText,
    setSearchText,
    onClear,
    tabName,
    isDark,
}) => {
    const { t } = useTranslation();

    const handleTextChange = (text) => {
        setSearchText(text);
        if (!text) {
            onClear();
        }
    };

    return (
        <View
            className={`rounded-3xl p-2 shadow-md border ${
                isDark
                    ? "bg-dark-surface border-dark-border"
                    : "bg-ghostwhite border-gray-200"
            }`}
        >
            <View className="flex-row items-center">
                <MaterialIcons
                    name="search"
                    size={24}
                    color={isDark ? "#B3B3B3" : "#9CA3AF"}
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
                    className={`flex-1 pl-2 font-mregular ${
                        isDark ? "text-dark-text-primary" : "text-black"
                    }`}
                    placeholderTextColor={isDark ? "#666666" : "#9CA3AF"}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={onClear}>
                        <MaterialIcons
                            name="close"
                            size={24}
                            color={isDark ? "#B3B3B3" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default SearchComponent;
