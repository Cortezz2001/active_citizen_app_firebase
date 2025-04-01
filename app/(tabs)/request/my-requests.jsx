import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";

const myRequestsData = [
    {
        id: 1,
        title: "Street light not working",
        date: "15.06.2023",
        status: "In progress",
        statusIcon: "pending",
    },
    {
        id: 2,
        title: "Trash on the playground",
        date: "10.06.2023",
        status: "Rejected",
        statusIcon: "cancel",
    },
    {
        id: 3,
        title: "Pothole on the road",
        date: "05.06.2023",
        status: "Completed",
        statusIcon: "check-circle",
    },
    {
        id: 4,
        title: "Broken bench in the park",
        date: "01.06.2023",
        status: "In progress",
        statusIcon: "pending",
    },
    {
        id: 5,
        title: "Leaking drainpipe",
        date: "25.05.2023",
        status: "Completed",
        statusIcon: "check-circle",
    },
];

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
        <View className="flex-1">
            {searchText && getFilteredRequests().length === 0 ? (
                <EmptyStateMessage />
            ) : (
                getFilteredRequests().map((request) => (
                    <TouchableOpacity
                        key={request.id}
                        className="bg-white rounded-lg p-4 mb-4 flex-row items-center"
                    >
                        <View className="flex-1">
                            <Text className="font-mmedium text-lg mb-2">
                                {request.title}
                            </Text>
                            <Text className="text-gray-500">
                                {request.date}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name={
                                    request.statusIcon === "pending"
                                        ? "pending"
                                        : request.statusIcon === "cancel"
                                        ? "cancel"
                                        : "check-circle"
                                }
                                color={
                                    request.statusIcon === "pending"
                                        ? "orange"
                                        : request.statusIcon === "cancel"
                                        ? "red"
                                        : "green"
                                }
                                size={24}
                            />
                            <Text className="ml-2">{request.status}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );
};

export default MyRequestsTab;
