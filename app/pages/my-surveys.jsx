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

// Sample survey data (in a real app, this would come from an API/database)
const initialSurveysData = [
    {
        id: 1,
        title: "City Transportation Survey",
        createdDate: "20.03.2023",
        status: "Draft",
        votes: 0,
    },
    {
        id: 2,
        title: "Public Parks Improvement",
        createdDate: "15.03.2023",
        status: "Under Moderation",
        votes: 0,
    },
    {
        id: 3,
        title: "City Library Services",
        createdDate: "10.03.2023",
        status: "Approved",
        votes: 42,
    },
    {
        id: 4,
        title: "Public Transport Improvement",
        createdDate: "05.03.2023",
        status: "Rejected",
        votes: 0,
        rejectionReason: "Survey questions need clarification",
    },
    {
        id: 5,
        title: "City Center Development",
        createdDate: "01.03.2023",
        status: "Published",
        votes: 156,
    },
    {
        id: 6,
        title: "Cultural Events Planning",
        createdDate: "25.02.2023",
        status: "Completed",
        votes: 324,
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

const MySurveysPage = () => {
    const router = useRouter();
    const [surveysData, setSurveysData] = useState(initialSurveysData);
    const [filteredSurveys, setFilteredSurveys] = useState(initialSurveysData);
    const [searchText, setSearchText] = useState("");
    const [activeStatus, setActiveStatus] = useState("All");
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        surveyId: null,
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

    // Filter surveys based on search text and active status
    useEffect(() => {
        let result = [...surveysData];

        // Filter by search text
        if (searchText) {
            result = result.filter((survey) =>
                survey.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (activeStatus !== "All") {
            result = result.filter((survey) => survey.status === activeStatus);
        }

        setFilteredSurveys(result);
    }, [searchText, activeStatus, surveysData]);

    const handleEdit = (surveyId) => {
        router.push({
            pathname: "/pages/add-survey",
            params: { surveyId },
        });
    };

    const handleDeleteConfirm = (surveyId) => {
        setDeleteAlert({
            visible: true,
            surveyId,
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // In a real app, this would be an API call to delete the survey
            setTimeout(() => {
                setSurveysData(
                    surveysData.filter(
                        (survey) => survey.id !== deleteAlert.surveyId
                    )
                );
                setDeleteAlert({ visible: false, surveyId: null });
                setIsDeleting(false);
            }, 1000); // Simulating network request
        } catch (error) {
            console.error("Error deleting survey:", error);
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
                No surveys found
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? "Try adjusting your search terms"
                    : "Create your first survey"}
            </Text>
            {!searchText && (
                <TouchableOpacity
                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                    onPress={() => router.push("/pages/add-survey")}
                >
                    <Text className="text-white font-mmedium">
                        Create Survey
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
                    My Surveys
                </Text>
                <View className="flex-1 items-end">
                    <TouchableOpacity
                        onPress={() => router.push("/pages/add-survey")}
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
                            placeholder="Search surveys"
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

                {/* Survey List */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {filteredSurveys.length === 0 ? (
                        <EmptyStateMessage />
                    ) : (
                        filteredSurveys.map((survey) => (
                            <View
                                key={survey.id}
                                className="bg-ghostwhite rounded-lg mb-4 shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <View className="p-4">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="font-mmedium text-lg text-gray-900 flex-1 mr-2">
                                            {survey.title}
                                        </Text>
                                        <View
                                            className={`px-2 py-1 rounded-full flex-row items-center ${
                                                statusColors[survey.status].bg
                                            }`}
                                        >
                                            <MaterialIcons
                                                name={
                                                    statusColors[survey.status]
                                                        .icon
                                                }
                                                size={16}
                                                color={
                                                    statusColors[survey.status]
                                                        .iconColor
                                                }
                                            />
                                            <Text
                                                className={`ml-1 text-xs font-mmedium ${
                                                    statusColors[survey.status]
                                                        .text
                                                }`}
                                            >
                                                {survey.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                        Created: {survey.createdDate}
                                    </Text>

                                    {/* Vote count for published/completed surveys */}
                                    {(survey.status === "Published" ||
                                        survey.status === "Completed") && (
                                        <View className="flex-row items-center mb-3">
                                            <MaterialIcons
                                                name="how-to-vote"
                                                size={18}
                                                color="#006FFD"
                                            />
                                            <Text className="ml-1 text-primary font-mmedium">
                                                {survey.votes} votes
                                            </Text>
                                        </View>
                                    )}

                                    {/* Rejection reason for rejected surveys */}
                                    {survey.status === "Rejected" && (
                                        <TouchableOpacity
                                            className="mb-3"
                                            onPress={() =>
                                                handleViewRejectionReason(
                                                    survey.rejectionReason
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
                                            {canEdit(survey.status) && (
                                                <TouchableOpacity
                                                    className="mr-3"
                                                    onPress={() =>
                                                        handleEdit(survey.id)
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
                                            {canDelete(survey.status) && (
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleDeleteConfirm(
                                                            survey.id
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
                title="Delete Survey"
                message="Are you sure you want to delete this survey? This action cannot be undone."
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onPrimaryButtonPress={handleDelete}
                onSecondaryButtonPress={() =>
                    setDeleteAlert({ visible: false, surveyId: null })
                }
                onClose={() =>
                    setDeleteAlert({ visible: false, surveyId: null })
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

export default MySurveysPage;
