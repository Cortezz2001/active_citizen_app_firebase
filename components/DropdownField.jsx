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
                className="border border-gray-300 rounded-lg px-4 py-3 flex-row justify-between items-center"
                onPress={() => setModalVisible(true)}
            >
                <Text
                    className={`text-base font-mmedium ${
                        !value ? "text-gray-500" : "text-black"
                    }`}
                >
                    {value || placeholder}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-2xl pb-8 pt-4 h-1/2">
                        <View className="flex-row justify-between items-center px-4 mb-4">
                            <Text className="text-xl font-mbold">
                                {t("dropdown_field.modal_title", { title })}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                        </View>

                        {options.length > 10 && (
                            <View className="px-4 mb-4">
                                <View className="bg-ghostwhite border border-gray-300 rounded-lg px-4 py-2 flex-row items-center">
                                    <MaterialIcons
                                        name="search"
                                        size={20}
                                        color="gray"
                                        style={{ marginRight: 8 }}
                                    />
                                    <TextInput
                                        placeholder={t(
                                            "dropdown_field.search_placeholder"
                                        )}
                                        value={searchText}
                                        onChangeText={setSearchText}
                                        className="flex-1 font-mregular"
                                    />
                                    {searchText ? (
                                        <TouchableOpacity
                                            onPress={() => setSearchText("")}
                                        >
                                            <MaterialIcons
                                                name="clear"
                                                size={20}
                                                color="gray"
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
                                        className="py-3 px-4 border-b border-gray-200"
                                        onPress={() => {
                                            onSelect(item);
                                            setModalVisible(false);
                                            setSearchText("");
                                        }}
                                    >
                                        <Text className="text-base font-mmedium">
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center px-4">
                                <Text className="text-gray-500 text-center font-mmedium text-lg mb-1">
                                    {t("dropdown_field.empty_state.no_results")}
                                </Text>
                                <Text className="text-gray-400 text-center font-mregular">
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
