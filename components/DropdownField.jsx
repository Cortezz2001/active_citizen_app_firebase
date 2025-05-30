import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const DropdownField = ({
    title,
    placeholder,
    value,
    options = [],
    onSelect,
    containerStyle,
    disabled = false,
    isDark = false, // Add isDark prop
}) => {
    const { t } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState("");

    const filteredOptions = searchText
        ? options.filter((item) =>
              item.toLowerCase().includes(searchText.toLowerCase())
          )
        : options;

    return (
        <View className={`mb-4 ${containerStyle}`}>
            <TouchableOpacity
                className={`border rounded-lg px-4 py-3 flex-row justify-between items-center h-12 ${
                    disabled
                        ? isDark
                            ? "bg-gray-700 opacity-50"
                            : "bg-gray-100 opacity-50"
                        : isDark
                        ? "border-gray-600"
                        : "border-gray-300"
                }`}
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
            >
                <Text
                    className={`font-mregular ${
                        !value
                            ? isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                            : isDark
                            ? "text-dark-text-primary"
                            : "text-black"
                    }`}
                >
                    {value || placeholder}
                </Text>
                <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color={disabled ? "gray" : isDark ? "#FFFFFF" : "black"}
                />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View
                    className={`flex-1 justify-end ${
                        isDark ? "bg-black/60" : "bg-black/50"
                    }`}
                >
                    <View
                        className={`rounded-t-2xl pb-8 pt-4 h-1/2 ${
                            isDark ? "bg-dark-background" : "bg-white"
                        }`}
                    >
                        <View className="flex-row justify-between items-center px-4 mb-4">
                            <Text
                                className={`text-xl font-mbold ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-black"
                                }`}
                            >
                                {t("dropdown_field.modal_title", { title })}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={isDark ? "#FFFFFF" : "black"}
                                />
                            </TouchableOpacity>
                        </View>

                        {options.length > 10 && (
                            <View className="px-4 mb-4">
                                <View
                                    className={`border rounded-lg px-4 py-2 flex-row items-center ${
                                        isDark
                                            ? "bg-dark-surface border-gray-600"
                                            : "bg-ghostwhite border-gray-300"
                                    }`}
                                >
                                    <MaterialIcons
                                        name="search"
                                        size={20}
                                        color={isDark ? "#A0A0A0" : "gray"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <TextInput
                                        placeholder={t(
                                            "dropdown_field.search_placeholder"
                                        )}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        className={`flex-1 font-mregular ${
                                            isDark
                                                ? "text-dark-text-primary"
                                                : "text-black"
                                        }`}
                                        placeholderTextColor={
                                            isDark ? "#A0A0A0" : "#6B7280"
                                        }
                                    />
                                    {searchText ? (
                                        <TouchableOpacity
                                            onPress={() => setSearchText("")}
                                        >
                                            <MaterialIcons
                                                name="clear"
                                                size={20}
                                                color={
                                                    isDark ? "#A0A0A0" : "gray"
                                                }
                                            />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        )}
                        {filteredOptions.length > 0 ? (
                            <FlatList
                                data={filteredOptions}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`py-3 px-4 border-b ${
                                            isDark
                                                ? "border-gray-600"
                                                : "border-gray-200"
                                        }`}
                                        onPress={() => {
                                            onSelect(item);
                                            setModalVisible(false);
                                            setSearchText("");
                                        }}
                                    >
                                        <Text
                                            className={`text-base font-mmedium ${
                                                isDark
                                                    ? "text-dark-text-primary"
                                                    : "text-black"
                                            }`}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center px-4">
                                <Text
                                    className={`text-center font-mmedium text-lg mb-1 ${
                                        isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {t("dropdown_field.empty_state.no_results")}
                                </Text>
                                <Text
                                    className={`text-center font-mregular ${
                                        isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {t(
                                        "dropdown_field.empty_state.search_advice"
                                    )}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default DropdownField;
