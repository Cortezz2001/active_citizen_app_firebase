import React, { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchContext } from "./_layout";
import { useRouter } from "expo-router";

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
        rejectionReason:
            "This area is not maintained by the city services. Please contact your community management.",
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
    {
        id: 6,
        title: "Graffiti on public wall",
        date: "20.05.2023",
        status: "Rejected",
        rejectionReason:
            "The wall is private property. We've notified the owner about the issue.",
    },
    {
        id: 7,
        title: "New park benches needed",
        date: "18.05.2023",
        status: "Draft",
    },
    {
        id: 8,
        title: "Sidewalk repair",
        date: "15.05.2023",
        status: "Draft",
    },
];

// Define status colors and icons similar to MyPetitionsPage
const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
    },
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
    const router = useRouter();
    const { searchText } = useContext(SearchContext);
    const [activeStatus, setActiveStatus] = useState("All");
    const [requestsData, setRequestsData] = useState(myRequestsData);
    const [filteredRequests, setFilteredRequests] = useState(myRequestsData);
    const [showRejectionReason, setShowRejectionReason] = useState(null);
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        requestId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Status filters
    const statusFilters = [
        "All",
        "Draft",
        "In progress",
        "Rejected",
        "Completed",
    ];

    // Filter requests based on search text and active status
    useEffect(() => {
        let result = [...requestsData];

        // Filter by search text
        if (searchText) {
            result = result.filter((request) =>
                request.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (activeStatus !== "All") {
            result = result.filter(
                (request) => request.status === activeStatus
            );
        }

        setFilteredRequests(result);
    }, [searchText, activeStatus, requestsData]);

    const handleEdit = (requestId) => {
        // Assuming navigation to a request editing page (similar to add-petition)
        router.push({
            pathname: "./send-request", // Update with actual path
            params: { requestId },
        });
    };

    const handleDeleteConfirm = (requestId) => {
        setDeleteAlert({
            visible: true,
            requestId,
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // Simulate API call to delete the request
            setTimeout(() => {
                setRequestsData(
                    requestsData.filter(
                        (request) => request.id !== deleteAlert.requestId
                    )
                );
                setDeleteAlert({ visible: false, requestId: null });
                setIsDeleting(false);
            }, 1000); // Simulating network request
        } catch (error) {
            console.error("Error deleting request:", error);
            setIsDeleting(false);
        }
    };

    const handleViewRejectionReason = (reasonText) => {
        setShowRejectionReason(reasonText);
    };

    const canEdit = (status) => {
        return status === "Draft";
    };

    const canDelete = (status) => {
        return status === "Draft";
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No requests found
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? "Try adjusting your search terms"
                    : "Try a different filter"}
            </Text>
        </View>
    );

    return (
        <View className="flex-1">
            {/* Status Filter */}
            <View className="mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        alignItems: "center",
                        height: 40,
                    }}
                >
                    {statusFilters.map((status) => (
                        <TouchableOpacity
                            key={status}
                            className={`mr-2 px-4 h-10 rounded-full flex items-center justify-center ${
                                activeStatus === status
                                    ? "bg-primary"
                                    : "bg-white border border-gray-300"
                            }`}
                            onPress={() => setActiveStatus(status)}
                        >
                            <Text
                                className={`font-mmedium ${
                                    activeStatus === status
                                        ? "text-white"
                                        : "text-gray-700"
                                }`}
                            >
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {filteredRequests.length === 0 ? (
                    <EmptyStateMessage />
                ) : (
                    filteredRequests.map((request) => (
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
                                            name={
                                                statusColors[request.status]
                                                    .icon
                                            }
                                            size={16}
                                            color={
                                                statusColors[request.status]
                                                    .iconColor
                                            }
                                        />
                                        <Text
                                            className={`ml-1 text-xs font-mmedium ${
                                                statusColors[request.status]
                                                    .text
                                            }`}
                                        >
                                            {request.status}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                    Created: {request.date}
                                </Text>

                                {/* Rejection reason for rejected requests */}
                                {request.status === "Rejected" &&
                                    request.rejectionReason && (
                                        <TouchableOpacity
                                            className="mb-3"
                                            onPress={() =>
                                                handleViewRejectionReason(
                                                    request.rejectionReason
                                                )
                                            }
                                        >
                                            <View className="flex-row items-center">
                                                <MaterialIcons
                                                    name="info"
                                                    size={18}
                                                    color="#EF4444"
                                                />
                                                <Text className="ml-1 text-red-500 font-mmedium">
                                                    View Rejection Reason
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                {/* Action buttons */}
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row">
                                        {/* Edit button for draft requests */}
                                        {canEdit(request.status) && (
                                            <TouchableOpacity
                                                className="mr-3"
                                                onPress={() =>
                                                    handleEdit(request.id)
                                                }
                                            >
                                                <View className="flex-row items-center">
                                                    <MaterialIcons
                                                        name="edit"
                                                        size={18}
                                                        color="#006FFD"
                                                    />
                                                    <Text className="ml-1 text-primary font-mmedium">
                                                        Edit
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        {/* Delete button for draft requests */}
                                        {canDelete(request.status) && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleDeleteConfirm(
                                                        request.id
                                                    )
                                                }
                                            >
                                                <View className="flex-row items-center">
                                                    <MaterialIcons
                                                        name="delete"
                                                        size={18}
                                                        color="#EF4444"
                                                    />
                                                    <Text className="ml-1 text-red-500 font-mmedium">
                                                        Delete
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* View details button */}
                                    <TouchableOpacity
                                        className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300"
                                        onPress={() => {
                                            console.log(
                                                `Viewing details for request ${request.id}`
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

            {/* Rejection Reason Modal */}
            <Modal
                transparent={true}
                visible={showRejectionReason !== null}
                animationType="fade"
                onRequestClose={() => setShowRejectionReason(null)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setShowRejectionReason(null)}
                >
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white rounded-xl p-5 mx-5 w-4/5 shadow-lg">
                            <Text className="text-lg font-mbold mb-2">
                                Rejection Reason
                            </Text>
                            <Text className="text-gray-600 mb-4">
                                {showRejectionReason}
                            </Text>
                            <TouchableOpacity
                                className="bg-primary rounded-full py-2 px-4 self-end"
                                onPress={() => setShowRejectionReason(null)}
                            >
                                <Text className="text-white font-mmedium">
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                transparent={true}
                visible={deleteAlert.visible}
                animationType="fade"
                onRequestClose={() =>
                    setDeleteAlert({ visible: false, requestId: null })
                }
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() =>
                        setDeleteAlert({ visible: false, requestId: null })
                    }
                >
                    <View className="flex-1 justify-center items-center">
                        <View className="bg-white rounded-xl p-5 mx-5 w-4/5 shadow-lg">
                            <Text className="text-lg font-mbold mb-2">
                                Delete Request
                            </Text>
                            <Text className="text-gray-600 mb-4">
                                Are you sure you want to delete this request?
                                This action cannot be undone.
                            </Text>
                            <View className="flex-row justify-end">
                                <TouchableOpacity
                                    className="bg-gray-200 rounded-full py-2 px-4 mr-2"
                                    onPress={() =>
                                        setDeleteAlert({
                                            visible: false,
                                            requestId: null,
                                        })
                                    }
                                    disabled={isDeleting}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-red-500 rounded-full py-2 px-4"
                                    onPress={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Text className="text-white font-mmedium">
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default MyRequestsTab;
