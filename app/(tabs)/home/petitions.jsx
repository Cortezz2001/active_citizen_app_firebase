import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useKeyboard } from "../../../hooks/useKeyboard";
import CustomButton from "../../../components/CustomButton";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import SearchComponent from "../../../components/SearchComponent";

// Обновленные данные с датой создания и целевым количеством сторонников
const petitionsData = [
    {
        id: 1,
        title: "Green City Initiative",
        supporters: 1500,
        createdDate: "20.03.2023",
        targetSupporters: 2000,
    },
    // ... другие элементы петиций
];

const PetitionsTab = () => {
    const [searchText, setSearchText] = useState("");
    const { isKeyboardVisible } = useKeyboard();
    const router = useRouter();
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const { t } = useTranslation();

    const getFilteredPetitions = () => {
        if (!searchText) return petitionsData;
        const search = searchText.toLowerCase();
        return petitionsData.filter((item) =>
            item.title.toLowerCase().includes(search)
        );
    };

    const handleCreatePress = () => {
        setShowOptionsModal(true);
    };

    const navigateToAddPetition = () => {
        setShowOptionsModal(false);
        router.push("/pages/add-petition");
    };

    const navigateToMyPetitions = () => {
        setShowOptionsModal(false);
        router.push("/pages/my-petitions");
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("no_petitions_found", { search: searchText })}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {t("adjust_search")}
            </Text>
        </View>
    );

    return (
        <View className="flex-1">
            <SearchComponent
                searchText={searchText}
                setSearchText={setSearchText}
                tabName="petitions"
            />

            {/* Content Scroll View */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {searchText && getFilteredPetitions().length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    getFilteredPetitions().map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="bg-ghostwhite rounded-lg mb-4 shadow-md border border-gray-200 overflow-hidden"
                        >
                            <View className="p-4">
                                <Text className="font-mmedium text-lg text-gray-900 mb-2">
                                    {item.title}
                                </Text>
                                <Text className="text-gray-500 text-sm mb-3">
                                    Created: {item.createdDate}
                                </Text>
                                <View className="mb-3">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <View className="flex-row items-center">
                                            <MaterialIcons
                                                name="people"
                                                size={18}
                                                color="#006FFD"
                                            />
                                            <Text className="ml-1 text-primary font-mmedium">
                                                {item.supporters} supporters
                                            </Text>
                                        </View>
                                        <Text className="text-gray-500 font-mregular">
                                            Target: {item.targetSupporters}
                                        </Text>
                                    </View>
                                    {/* Progress bar */}
                                    <View className="h-2 bg-gray-200 rounded-full w-full mt-1">
                                        <View
                                            className="h-2 bg-primary rounded-full"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    (item.supporters /
                                                        item.targetSupporters) *
                                                        100
                                                )}%`,
                                            }}
                                        />
                                    </View>
                                </View>
                                <View className="flex-row items-center justify-end">
                                    <CustomButton
                                        title="Sign"
                                        handlePress={() => {
                                            /* Handle sign */
                                        }}
                                        containerStyles="bg-ghostwhite px-3 py-1 rounded-full border border-primary shadow-lg"
                                        textStyles="text-primary font-mmedium text-sm"
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Create Button - скрываем при появлении клавиатуры */}
            {!isKeyboardVisible && (
                <TouchableOpacity
                    className="absolute bottom-5 right-4 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
                    onPress={handleCreatePress}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}

            {/* Options Modal */}
            <Modal
                visible={showOptionsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOptionsModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setShowOptionsModal(false)}
                >
                    <View className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg">
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-gray-100"
                            onPress={navigateToAddPetition}
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                {t("create_new_petition")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={navigateToMyPetitions}
                        >
                            <MaterialIcons
                                name="list"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                {t("my_petitions")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default PetitionsTab;
