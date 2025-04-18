import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";
import { useKeyboard } from "../../../hooks/useKeyboard";
import { useRouter } from "expo-router";

const surveysData = [
    { id: 1, title: "City Transportation Survey", votes: 256 },
    { id: 2, title: "City Transportation Bay", votes: 216 },
    // ... other surveys items (same as in the original file)
];

const SurveysTab = () => {
    const { searchText } = useContext(SearchContext);
    const { isKeyboardVisible } = useKeyboard();
    const router = useRouter();
    const [showOptionsModal, setShowOptionsModal] = React.useState(false);

    const getFilteredSurveys = () => {
        const search = searchText.toLowerCase();
        return surveysData.filter((item) =>
            item.title.toLowerCase().includes(search)
        );
    };

    const handleCreatePress = () => {
        setShowOptionsModal(true);
    };

    const navigateToAddSurvey = () => {
        setShowOptionsModal(false);
        router.push("/pages/add-survey");
    };

    const navigateToMySurveys = () => {
        setShowOptionsModal(false);
        router.push("/pages/my-surveys");
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
                            className="bg-ghostwhite rounded-lg mb-4 shadow-md border border-gray-200 overflow-hidden"
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
                            onPress={navigateToAddSurvey}
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                Create New Survey
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={navigateToMySurveys}
                        >
                            <MaterialIcons
                                name="list"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                My Surveys
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default SurveysTab;
