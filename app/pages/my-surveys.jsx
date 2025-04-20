import React, { useState, useEffect, createContext, useContext } from "react";
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
import { useTranslation } from "react-i18next";

export const FilterContext = createContext({
    showFilterModal: false,
    setShowFilterModal: () => {},
});

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
    const { t } = useTranslation();
    const router = useRouter();
    const [surveysData, setSurveysData] = useState(initialSurveysData);
    const [filteredSurveys, setFilteredSurveys] = useState(initialSurveysData);
    const [searchText, setSearchText] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        surveyId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showRejectionReason, setShowRejectionReason] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Status filters using API status values
    const statusFilters = [
        "Draft",
        "Under Moderation",
        "Approved",
        "Rejected",
        "Published",
        "Completed",
    ];

    // Filter surveys based on search text and selected statuses
    useEffect(() => {
        let result = [...surveysData];

        // Filter by search text
        if (searchText) {
            result = result.filter((survey) =>
                survey.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatuses.length > 0) {
            result = result.filter((survey) =>
                selectedStatuses.includes(survey.status)
            );
        }

        setFilteredSurveys(result);
    }, [searchText, selectedStatuses, surveysData]);

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

    const toggleStatus = (status) => {
        setSelectedStatuses((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        );
    };

    const resetFilters = () => {
        setSelectedStatuses([]);
    };

    const canEdit = (status) => {
        return status === "Draft";
    };

    const canDelete = (status) => {
        return status === "Draft";
    };

    // Map API status values to translation keys
    const translationKeyMapping = {
        Draft: "draft",
        "Under Moderation": "under_moderation",
        Approved: "approved",
        Rejected: "rejected",
        Published: "published",
        Completed: "completed",
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("my_surveys.empty_state.no_surveys")}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? t("my_surveys.empty_state.search_advice")
                    : t("my_surveys.empty_state.create_advice")}
            </Text>
            {!searchText && (
                <TouchableOpacity
                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                    onPress={() => router.push("/pages/add-survey")}
                >
                    <Text className="text-white font-mmedium">
                        {t("my_surveys.create_button")}
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
                <View className="flex-1">
                    <Text
                        className="text-2xl font-mbold text-black"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                    >
                        {t("my_surveys.title")}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/pages/add-survey")}
                    className="ml-4"
                >
                    <MaterialIcons name="add" size={24} color="#006FFD" />
                </TouchableOpacity>
            </View>

            <FilterContext.Provider
                value={{ showFilterModal, setShowFilterModal }}
            >
                <View className="flex-1 px-4 mt-4">
                    {/* Search Bar */}
                    <View className="bg-ghostwhite rounded-3xl flex-row items-center px-3 p-1 mb-4 border border-gray-200">
                        <MaterialIcons
                            style={{ marginLeft: 4 }}
                            name="search"
                            size={24}
                            color="#9CA3AF"
                        />
                        <TextInput
                            className="flex-1 py-2 px-2 font-mregular"
                            placeholder={t("my_surveys.search_placeholder")}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            className="mx-2"
                            onPress={() => setShowFilterModal(true)}
                            accessibilityRole="button"
                            accessibilityLabel={
                                selectedStatuses.length > 0
                                    ? `${t(
                                          "my_surveys.filter_modal.title"
                                      )} ${t("my_surveys.filter_modal.active")}`
                                    : t("my_surveys.filter_modal.title")
                            }
                        >
                            <MaterialIcons
                                name="filter-list"
                                size={24}
                                color={
                                    selectedStatuses.length > 0
                                        ? "#006FFD"
                                        : "#9CA3AF"
                                }
                            />
                        </TouchableOpacity>
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
                                                    statusColors[survey.status]
                                                        .bg
                                                }`}
                                            >
                                                <MaterialIcons
                                                    name={
                                                        statusColors[
                                                            survey.status
                                                        ].icon
                                                    }
                                                    size={16}
                                                    color={
                                                        statusColors[
                                                            survey.status
                                                        ].iconColor
                                                    }
                                                />
                                                <Text
                                                    className={`ml-1 text-xs font-mmedium ${
                                                        statusColors[
                                                            survey.status
                                                        ].text
                                                    }`}
                                                >
                                                    {t(
                                                        `my_surveys.statuses.${
                                                            translationKeyMapping[
                                                                survey.status
                                                            ]
                                                        }`
                                                    )}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                            {t("my_surveys.created_label")}:{" "}
                                            {survey.createdDate}
                                        </Text>

                                        {(survey.status === "Published" ||
                                            survey.status === "Completed") && (
                                            <View className="flex-row items-center mb-3">
                                                <MaterialIcons
                                                    name="how-to-vote"
                                                    size={18}
                                                    color="#006FFD"
                                                />
                                                <Text className="ml-1 text-primary font-mmedium">
                                                    {survey.votes}{" "}
                                                    {t(
                                                        "my_surveys.votes_label"
                                                    )}
                                                </Text>
                                            </View>
                                        )}

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
                                                        {t(
                                                            "my_surveys.actions.view_rejection_reason"
                                                        )}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row">
                                                {canEdit(survey.status) && (
                                                    <TouchableOpacity
                                                        className="mr-3"
                                                        onPress={() =>
                                                            handleEdit(
                                                                survey.id
                                                            )
                                                        }
                                                    >
                                                        <View className="flex-row items-center">
                                                            <MaterialIcons
                                                                name="edit"
                                                                size={18}
                                                                color="#006FFD"
                                                            />
                                                            <Text className="ml-1 text-primary font-mmedium">
                                                                {t(
                                                                    "my_surveys.actions.edit"
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}

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
                                                                {t(
                                                                    "my_surveys.actions.delete"
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            {survey.status !== "Draft" && (
                                                <TouchableOpacity className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300">
                                                    <Text className="text-gray-700 font-mmedium">
                                                        {t(
                                                            "my_surveys.actions.view_details"
                                                        )}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                {/* Filter Modal */}
                <Modal
                    transparent={true}
                    visible={showFilterModal}
                    animationType="fade"
                    onRequestClose={() => setShowFilterModal(false)}
                >
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)}
                    >
                        <View className="flex-1 justify-end">
                            <View className="bg-white rounded-t-xl p-5 h-1/2">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-mbold">
                                        {t("my_surveys.filter_modal.title")}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setShowFilterModal(false)
                                        }
                                    >
                                        <MaterialIcons
                                            name="close"
                                            size={24}
                                            color="#374151"
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Status Filter */}
                                <View className="mb-6">
                                    <Text className="text-base font-mmedium mb-2">
                                        {t("my_surveys.filter_modal.status")}
                                    </Text>
                                    <View className="flex-row flex-wrap">
                                        {statusFilters.map((status) => (
                                            <TouchableOpacity
                                                key={status}
                                                className={`mr-2 mb-2 px-4 h-10 rounded-full flex items-center justify-center ${
                                                    selectedStatuses.includes(
                                                        status
                                                    )
                                                        ? "bg-primary"
                                                        : "bg-white border border-gray-300"
                                                }`}
                                                onPress={() =>
                                                    toggleStatus(status)
                                                }
                                            >
                                                <Text
                                                    className={`font-mmedium ${
                                                        selectedStatuses.includes(
                                                            status
                                                        )
                                                            ? "text-white"
                                                            : "text-gray-700"
                                                    }`}
                                                >
                                                    {t(
                                                        `my_surveys.statuses.${translationKeyMapping[status]}`
                                                    )}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Reset Button */}
                                <View className="flex-row justify-end">
                                    <TouchableOpacity
                                        className="p-3 bg-gray-200 rounded-full"
                                        onPress={resetFilters}
                                    >
                                        <Text className="text-center text-gray-700 font-mmedium">
                                            {t("my_surveys.filter_modal.reset")}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </FilterContext.Provider>

            {/* Delete Confirmation Alert */}
            <CustomAlertTwoButtons
                visible={deleteAlert.visible}
                title={t("my_surveys.delete_modal.title")}
                message={t("my_surveys.delete_modal.message")}
                primaryButtonText={t("my_surveys.delete_modal.delete_button")}
                secondaryButtonText={t("my_surveys.delete_modal.cancel_button")}
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
                                {t("my_surveys.rejection_reason_modal.title")}
                            </Text>
                            <Text className="text-gray-600 mb-4">
                                {showRejectionReason}
                            </Text>
                            <TouchableOpacity
                                className="bg-primary rounded-full py-2 px-4 self-end"
                                onPress={() => setShowRejectionReason(null)}
                            >
                                <Text className="text-white font-mmedium">
                                    {t(
                                        "my_surveys.rejection_reason_modal.close_button"
                                    )}
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
