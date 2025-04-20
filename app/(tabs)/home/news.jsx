import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";

const newsData = [
    {
        id: 1,
        title: "City park renovation starts next month",
        image: "https://picsum.photos/300/200",
    },
    {
        id: 2,
        title: "City park renovation starts next month",
        image: "https://picsum.photos/300/100",
    },
];

const NewsTab = () => {
    const { searchText } = useContext(SearchContext);

    const getFilteredNews = () => {
        const search = searchText.toLowerCase();
        return newsData.filter((item) =>
            item.title.toLowerCase().includes(search)
        );
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No news found for "{searchText}"
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
                {searchText && getFilteredNews().length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    getFilteredNews().map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="rounded-lg mb-4 shadow-md bg-ghostwhite border border-gray-200"
                        >
                            <Image
                                source={{ uri: item.image }}
                                className="w-full h-48 rounded-t-lg"
                            />
                            <View className="p-4">
                                <Text className="font-mmedium text-lg">
                                    {item.title}
                                </Text>
                                <View className="flex-row items-center mt-2">
                                    <MaterialIcons
                                        name="access-time"
                                        size={16}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-500 ml-1 text-sm">
                                        Just now
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default NewsTab;
