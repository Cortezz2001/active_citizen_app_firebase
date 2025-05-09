import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useKeyboard } from "../../../hooks/useKeyboard";
import SearchComponent from "../../../components/SearchComponent";

const eventsData = [
    {
        id: 1,
        title: "Community Cleanup",
        date: "June 15",
        image: "https://picsum.photos/300/400",
    },
    {
        id: 2,
        title: "Test",
        date: "June 30",
        image: "https://picsum.photos/200/400",
    },
    // ... other events items
];

const EventsTab = () => {
    const [searchText, setSearchText] = useState("");
    const { isKeyboardVisible } = useKeyboard();

    const getFilteredEvents = () => {
        if (!searchText) return eventsData;
        const search = searchText.toLowerCase();
        return eventsData.filter(
            (item) =>
                item.title.toLowerCase().includes(search) ||
                item.date.toLowerCase().includes(search)
        );
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No events found for "{searchText}"
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                Try adjusting your search terms
            </Text>
        </View>
    );

    return (
        <View className="flex-1">
            <SearchComponent
                searchText={searchText}
                setSearchText={setSearchText}
                tabName="events"
            />

            {/* Content Scroll View */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {searchText && getFilteredEvents().length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    getFilteredEvents().map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="rounded-lg mb-4 shadow-md flex-row items-center bg-ghostwhite border border-gray-200"
                        >
                            <Image
                                source={{ uri: item.image }}
                                className="w-24 h-24 rounded-l-lg"
                            />
                            <View className="p-4 flex-1">
                                <Text className="font-mmedium text-lg">
                                    {item.title}
                                </Text>
                                <View className="flex-row items-center mt-2">
                                    <MaterialIcons
                                        name="event"
                                        size={16}
                                        color="#006FFD"
                                    />
                                    <Text className=" font-mmedium ml-1 text-primary">
                                        {item.date}
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

export default EventsTab;
