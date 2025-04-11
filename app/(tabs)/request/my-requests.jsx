import React, { useContext } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";

const myRequestsData = [
    {
        id: 1,
        title: "Street light not working",
        date: "15.06.2023",
        status: "In progress",
    },
    {
        id: 2,
        title: "Trash on the playground",
        date: "10.06.2023",
        status: "Rejected",
    },
    {
        id: 3,
        title: "Pothole on the road",
        date: "05.06.2023",
        status: "Completed",
    },
    {
        id: 4,
        title: "Broken bench in the park",
        date: "01.06.2023",
        status: "In progress",
    },
    {
        id: 5,
        title: "Leaking drainpipe",
        date: "25.05.2023",
        status: "Completed",
    },
];

// Define status colors and icons similar to MySurveysPage
const statusColors = {
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
    },
};

const MyRequestsTab = () => {
    const { searchText } = useContext(SearchContext);

    const getFilteredRequests = () => {
        return myRequestsData.filter((request) =>
            request.title.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No requests found for "{searchText}"
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                Try adjusting your search terms
            </Text>
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {searchText && getFilteredRequests().length === 0 ? (
                <EmptyStateMessage />
            ) : (
                getFilteredRequests().map((request) => (
                    <View
                        key={request.id}
                        className="bg-ghostwhite rounded-lg mb-4 shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <View className="p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="font-mmedium text-lg text-gray-900 flex-1 mr-2">
                                    {request.title}
                                </Text>
                                <View
                                    className={`px-2 py-1 rounded-full flex-row items-center ${
                                        statusColors[request.status].bg
                                    }`}
                                >
                                    <MaterialIcons
                                        name={statusColors[request.status].icon}
                                        size={16}
                                        color={
                                            statusColors[request.status]
                                                .iconColor
                                        }
                                    />
                                    <Text
                                        className={`ml-1 text-xs font-mmedium ${
                                            statusColors[request.status].text
                                        }`}
                                    >
                                        {request.status}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-500 text-sm mb-3">
                                Created: {request.date}
                            </Text>

                            <View className="flex-row justify-end">
                                <TouchableOpacity
                                    className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300"
                                    onPress={() => {
                                        // Implement navigation to details if needed
                                        console.log(
                                            `View details for request ${request.id}`
                                        );
                                    }}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        View Details
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

export default MyRequestsTab;
