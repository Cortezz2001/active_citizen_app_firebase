import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomAlertTwoButtons from "../../components/CustomAlertTwoButtons";

// Sample petition data (in a real app, this would come from an API/database)
const initialPetitionsData = [
    {
        id: 1,
        title: "Green City Initiative",
        createdDate: "20.03.2023",
        status: "Draft",
        supporters: 0,
        targetSupporters: 1000,
    },
    {
        id: 2,
        title: "Improve Bike Lanes in Downtown",
        createdDate: "15.03.2023",
        status: "Under Moderation",
        supporters: 0,
        targetSupporters: 500,
    },
    {
        id: 3,
        title: "More Public Parks",
        createdDate: "10.03.2023",
        status: "Approved",
        supporters: 128,
        targetSupporters: 800,
    },
    {
        id: 4,
        title: "Pedestrian-Friendly Streets",
        createdDate: "05.03.2023",
        status: "Rejected",
        supporters: 0,
        targetSupporters: 700,
        rejectionReason:
            "Petition description needs to be more specific about which streets should be improved",
    },
    {
        id: 5,
        title: "Community Garden Projects",
        createdDate: "01.03.2023",
        status: "Published",
        supporters: 456,
        targetSupporters: 1000,
    },
    {
        id: 6,
        title: "Public Art Initiative",
        createdDate: "25.02.2023",
        status: "Completed",
        supporters: 1024,
        targetSupporters: 1000,
    },
];

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
    },
    "Under Moderation": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
    },
    Approved: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "thumb-up",
        iconColor: "#1D4ED8",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
    },
    Published: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "public",
        iconColor: "#047857",
    },
    Completed: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: "check-circle",
        iconColor: "#6D28D9",
    },
};

const MyPetitionsPage = () => {
    const router = useRouter();
    const [petitionsData, setPetitionsData] = useState(initialPetitionsData);
    const [filteredPetitions, setFilteredPetitions] =
        useState(initialPetitionsData);
    const [searchText, setSearchText] = useState("");
    const [activeStatus, setActiveStatus] = useState("All");
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        petitionId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showRejectionReason, setShowRejectionReason] = useState(null);

    // Status filters
    const statusFilters = [
        "All",
        "Draft",
        "Under Moderation",
        "Approved",
        "Rejected",
        "Published",
        "Completed",
    ];

    // Filter petitions based on search text and active status
    useEffect(() => {
        let result = [...petitionsData];

        // Filter by search text
        if (searchText) {
            result = result.filter((petition) =>
                petition.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (activeStatus !== "All") {
            result = result.filter(
                (petition) => petition.status === activeStatus
            );
        }

        setFilteredPetitions(result);
    }, [searchText, activeStatus, petitionsData]);

    const handleEdit = (petitionId) => {
        router.push({
            pathname: "/pages/add-petition",
            params: { petitionId },
        });
    };

    const handleDeleteConfirm = (petitionId) => {
        setDeleteAlert({
            visible: true,
            petitionId,
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // In a real app, this would be an API call to delete the petition
            setTimeout(() => {
                setPetitionsData(
                    petitionsData.filter(
                        (petition) => petition.id !== deleteAlert.petitionId
                    )
                );
                setDeleteAlert({ visible: false, petitionId: null });
                setIsDeleting(false);
            }, 1000); // Simulating network request
        } catch (error) {
            console.error("Error deleting petition:", error);
            setIsDeleting(false);
        }
    };

    const handleViewRejectionReason = (reasonText) => {
        setShowRejectionReason(reasonText);
    };

    const canEdit = (status) => {
        return status === "Draft" || status === "Rejected";
    };

    const canDelete = (status) => {
        return status === "Draft" || status === "Rejected";
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No petitions found
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? "Try adjusting your search terms"
                    : "Create your first petition"}
            </Text>
            {!searchText && (
                <TouchableOpacity
                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                    onPress={() => router.push("/pages/add-petition")}
                >
                    <Text className="text-white font-mmedium">
                        Create Petition
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    My Petitions
                </Text>
                <View className="flex-1 items-end">
                    <TouchableOpacity
                        onPress={() => router.push("/pages/add-petition")}
                    >
                        <MaterialIcons name="add" size={24} color="#006FFD" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 px-4 mt-4">
                {/* Search Bar */}
                <View className="bg-ghostwhite rounded-3xl flex-row items-center px-3 mb-4 border border-gray-200">
                    <View className="flex-row items-center">
                        <MaterialIcons
                            name="search"
                            size={20}
                            color="#9CA3AF"
                        />
                        <TextInput
                            className="flex-1 py-2 px-2 font-mregular"
                            placeholder="Search petitions"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText ? (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <MaterialIcons
                                    name="close"
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

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

                {/* Petition List */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {filteredPetitions.length === 0 ? (
                        <EmptyStateMessage />
                    ) : (
                        filteredPetitions.map((petition) => (
                            <View
                                key={petition.id}
                                className="bg-white rounded-lg mb-4 shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <View className="p-4">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="font-mmedium text-lg text-gray-900 flex-1 mr-2">
                                            {petition.title}
                                        </Text>
                                        <View
                                            className={`px-2 py-1 rounded-full flex-row items-center ${
                                                statusColors[petition.status].bg
                                            }`}
                                        >
                                            <MaterialIcons
                                                name={
                                                    statusColors[
                                                        petition.status
                                                    ].icon
                                                }
                                                size={16}
                                                color={
                                                    statusColors[
                                                        petition.status
                                                    ].iconColor
                                                }
                                            />
                                            <Text
                                                className={`ml-1 text-xs font-mmedium ${
                                                    statusColors[
                                                        petition.status
                                                    ].text
                                                }`}
                                            >
                                                {petition.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                        Created: {petition.createdDate}
                                    </Text>

                                    {/* Supporter count and progress for published/completed petitions */}
                                    {(petition.status === "Published" ||
                                        petition.status === "Approved" ||
                                        petition.status === "Completed") && (
                                        <View className="mb-3">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <View className="flex-row items-center">
                                                    <MaterialIcons
                                                        name="people"
                                                        size={18}
                                                        color="#006FFD"
                                                    />
                                                    <Text className="ml-1 text-primary font-mmedium">
                                                        {petition.supporters}{" "}
                                                        supporters
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-500 font-mregular">
                                                    Target:{" "}
                                                    {petition.targetSupporters}
                                                </Text>
                                            </View>
                                            {/* Progress bar */}
                                            <View className="h-2 bg-gray-200 rounded-full w-full mt-1">
                                                <View
                                                    className="h-2 bg-primary rounded-full"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (petition.supporters /
                                                                petition.targetSupporters) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    )}

                                    {/* Rejection reason for rejected petitions */}
                                    {petition.status === "Rejected" && (
                                        <TouchableOpacity
                                            className="mb-3"
                                            onPress={() =>
                                                handleViewRejectionReason(
                                                    petition.rejectionReason
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
                                            {/* Edit button for draft and rejected */}
                                            {canEdit(petition.status) && (
                                                <TouchableOpacity
                                                    className="mr-3"
                                                    onPress={() =>
                                                        handleEdit(petition.id)
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

                                            {/* Delete button for draft and rejected */}
                                            {canDelete(petition.status) && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleDeleteConfirm(
                                                            petition.id
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
                                        <TouchableOpacity className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300">
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
            </View>

            {/* Delete Confirmation Alert */}
            <CustomAlertTwoButtons
                visible={deleteAlert.visible}
                title="Delete Petition"
                message="Are you sure you want to delete this petition? This action cannot be undone."
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onPrimaryButtonPress={handleDelete}
                onSecondaryButtonPress={() =>
                    setDeleteAlert({ visible: false, petitionId: null })
                }
                onClose={() =>
                    setDeleteAlert({ visible: false, petitionId: null })
                }
                isLoading={isDeleting}
            />

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
        </SafeAreaView>
    );
};

export default MyPetitionsPage;
