import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";
import { useKeyboard } from "../../../hooks/useKeyboard";
import CustomButton from "../../../components/CustomButton";
const petitionsData = [
    { id: 1, title: "Green City Initiative", supporters: 1500 },
    // ... other petitions items (same as in the original file)
];

const PetitionsTab = () => {
    const { searchText } = useContext(SearchContext);
    const { isKeyboardVisible } = useKeyboard(); // Используем контекст клавиатуры

    const getFilteredPetitions = () => {
        const search = searchText.toLowerCase();
        return petitionsData.filter((item) =>
            item.title.toLowerCase().includes(search)
        );
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No petitions found for "{searchText}"
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                Try adjusting your search terms
            </Text>
        </View>
    );

    return (
        <View className="flex-1">
            {/* Content Scroll View */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {searchText && getFilteredPetitions().length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    getFilteredPetitions().map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="bg-ghostwhite rounded-lg mb-4 shadow-md border-2 border-gray-200 overflow-hidden"
                        >
                            <View className="p-4">
                                <Text className="font-mmedium text-lg text-gray-900 mb-2">
                                    {item.title}
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <MaterialIcons
                                            name="people"
                                            size={20}
                                            color="#006FFD"
                                        />
                                        <Text className="ml-2 text-primary font-mmedium">
                                            {item.supporters} supporters
                                        </Text>
                                    </View>
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
                    onPress={() => {
                        /* Handle create petition */
                    }}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default PetitionsTab;
