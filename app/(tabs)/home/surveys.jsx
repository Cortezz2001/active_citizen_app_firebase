import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";
import { useKeyboard } from "../../../hooks/useKeyboard";

const surveysData = [
    { id: 1, title: "City Transportation Survey", votes: 256 },
    { id: 2, title: "City Transportation Bay", votes: 216 },
    // ... other surveys items (same as in the original file)
];

const SurveysTab = () => {
    const { searchText } = useContext(SearchContext);
    const { isKeyboardVisible } = useKeyboard(); // Используем контекст клавиатуры

    const getFilteredSurveys = () => {
        const search = searchText.toLowerCase();
        return surveysData.filter((item) =>
            item.title.toLowerCase().includes(search)
        );
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No surveys found for "{searchText}"
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
                {searchText && getFilteredSurveys().length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    getFilteredSurveys().map((item) => (
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
                                            name="how-to-vote"
                                            size={20}
                                            color="#006FFD"
                                        />
                                        <Text className="ml-2 text-primary font-mmedium">
                                            {item.votes} votes
                                        </Text>
                                    </View>
                                    <TouchableOpacity className="bg-ghostwhite px-3 py-1 rounded-full border border-primary">
                                        <Text className="text-primary font-mmedium">
                                            Vote
                                        </Text>
                                    </TouchableOpacity>
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
                        /* Handle create survey */
                    }}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SurveysTab;
