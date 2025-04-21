import React, { useState, useEffect, createContext } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";

export const FilterContext = createContext({
    showFilterModal: false,
    setShowFilterModal: () => {},
    selectedStatuses: [],
    setSelectedStatuses: () => {},
    startDate: null,
    setStartDate: () => {},
    endDate: null,
    setEndDate: () => {},
});

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
    const { t } = useTranslation();
    const router = useRouter();
    const [petitionsData, setPetitionsData] = useState(initialPetitionsData);
    const [filteredPetitions, setFilteredPetitions] =
        useState(initialPetitionsData);
    const [searchText, setSearchText] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        petitionId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showRejectionReason, setShowRejectionReason] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Status filters using API status values
    const statusFilters = [
        "Draft",
        "Under Moderation",
        "Approved",
        "Rejected",
        "Published",
        "Completed",
    ];

    // Filter petitions based on search text, selected statuses, and date range
    useEffect(() => {
        let result = [...petitionsData];

        // Filter by search text
        if (searchText) {
            result = result.filter((petition) =>
                petition.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by status
        if (selectedStatuses.length > 0) {
            result = result.filter((petition) =>
                selectedStatuses.includes(petition.status)
            );
        }

        // Filter by date range
        if (startDate || endDate) {
            result = result.filter((petition) => {
                const petitionDate = new Date(
                    petition.createdDate.split(".").reverse().join("-")
                );
                if (startDate && endDate) {
                    return petitionDate >= startDate && petitionDate <= endDate;
                } else if (startDate) {
                    return petitionDate >= startDate;
                } else if (endDate) {
                    return petitionDate <= endDate;
                }
                return true;
            });
        }

        setFilteredPetitions(result);
    }, [searchText, selectedStatuses, startDate, endDate, petitionsData]);

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

    const toggleStatus = (status) => {
        setSelectedStatuses((prev) =>
            prev.includes(status)
                ? prev.filter((s) => s !== status)
                : [...prev, status]
        );
    };

    const resetFilters = () => {
        setSelectedStatuses([]);
        setStartDate(null);
        setEndDate(null);
    };

    const canEdit = (status) => {
        return status === "Draft";
    };

    const canDelete = (status) => {
        return status === "Draft";
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
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
                {t("my_petitions.empty_state.no_petitions")}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? t("my_petitions.empty_state.search_advice")
                    : t("my_petitions.empty_state.create_advice")}
            </Text>
            {!searchText && (
                <TouchableOpacity
                    className="mt-4 bg-primary px-4 py-2 rounded-full"
                    onPress={() => router.push("/pages/add-petition")}
                >
                    <Text className="text-white font-mmedium">
                        {t("my_petitions.create_button")}
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
                        {t("my_petitions.title")}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/pages/add-petition")}
                    className="ml-4"
                >
                    <MaterialIcons name="add" size={24} color="#006FFD" />
                </TouchableOpacity>
            </View>

            <FilterContext.Provider
                value={{
                    showFilterModal,
                    setShowFilterModal,
                    selectedStatuses,
                    setSelectedStatuses,
                    startDate,
                    setStartDate,
                    endDate,
                    setEndDate,
                }}
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
                            placeholder={t("my_petitions.search_placeholder")}
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
                                selectedStatuses.length > 0 ||
                                startDate ||
                                endDate
                                    ? `${t(
                                          "my_petitions.filter_modal.title"
                                      )} ${t(
                                          "my_petitions.filter_modal.active"
                                      )}`
                                    : t("my_petitions.filter_modal.title")
                            }
                        >
                            <MaterialIcons
                                name="filter-list"
                                size={24}
                                color={
                                    selectedStatuses.length > 0 ||
                                    startDate ||
                                    endDate
                                        ? "#006FFD"
                                        : "#9CA3AF"
                                }
                            />
                        </TouchableOpacity>
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
                                    className="bg-ghostwhite rounded-lg mb-4 shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    <View className="p-4">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text className="font-mmedium text-lg text-gray-900 flex-1 mr-2">
                                                {petition.title}
                                            </Text>
                                            <View
                                                className={`px-2 py-1 rounded-full flex-row items-center ${
                                                    statusColors[
                                                        petition.status
                                                    ].bg
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
                                                    {t(
                                                        `my_petitions.statuses.${
                                                            translationKeyMapping[
                                                                petition.status
                                                            ]
                                                        }`
                                                    )}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                            {t("my_petitions.created_label")}:{" "}
                                            {petition.createdDate}
                                        </Text>

                                        {(petition.status === "Published" ||
                                            petition.status === "Approved" ||
                                            petition.status ===
                                                "Completed") && (
                                            <View className="mb-3">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <View className="flex-row items-center">
                                                        <MaterialIcons
                                                            name="people"
                                                            size={18}
                                                            color="#006FFD"
                                                        />
                                                        <Text className="ml-1 text-primary font-mmedium">
                                                            {
                                                                petition.supporters
                                                            }{" "}
                                                            {t(
                                                                "my_petitions.supporters_label"
                                                            )}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-gray-500 font-mregular">
                                                        {t(
                                                            "my_petitions.target_label"
                                                        )}
                                                        :{" "}
                                                        {
                                                            petition.targetSupporters
                                                        }
                                                    </Text>
                                                </View>
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
                                                        {t(
                                                            "my_petitions.actions.view_rejection_reason"
                                                        )}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-row">
                                                {canEdit(petition.status) && (
                                                    <TouchableOpacity
                                                        className="mr-3"
                                                        onPress={() =>
                                                            handleEdit(
                                                                petition.id
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
                                                                    "my_petitions.actions.edit"
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}

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
                                                                {t(
                                                                    "my_petitions.actions.delete"
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            {petition.status !== "Draft" && (
                                                <TouchableOpacity className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300">
                                                    <Text className="text-gray-700 font-mmedium">
                                                        {t(
                                                            "my_petitions.actions.view_details"
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
                            <View className="bg-white rounded-t-xl p-5 h-3/4">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-mbold">
                                        {t("my_petitions.filter_modal.title")}
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
                                        {t("my_petitions.filter_modal.status")}
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
                                                        `my_petitions.statuses.${translationKeyMapping[status]}`
                                                    )}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Date Range Filter */}
                                <View className="mb-6">
                                    <Text className="text-base font-mmedium mb-2">
                                        {t(
                                            "my_petitions.filter_modal.date_range"
                                        )}
                                    </Text>
                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            className="flex-1 mr-2 p-3 bg-white border border-gray-300 rounded-lg"
                                            onPress={() =>
                                                setShowStartDatePicker(true)
                                            }
                                        >
                                            <Text className="text-gray-700 font-mmedium">
                                                {startDate
                                                    ? formatDate(startDate)
                                                    : t(
                                                          "my_petitions.filter_modal.from"
                                                      )}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="flex-1 ml-2 p-3 bg-white border border-gray-300 rounded-lg"
                                            onPress={() =>
                                                setShowEndDatePicker(true)
                                            }
                                        >
                                            <Text className="text-gray-700 font-mmedium">
                                                {endDate
                                                    ? formatDate(endDate)
                                                    : t(
                                                          "my_petitions.filter_modal.to"
                                                      )}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {showStartDatePicker && (
                                        <DateTimePicker
                                            value={startDate || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowStartDatePicker(false);
                                                if (selectedDate) {
                                                    setStartDate(selectedDate);
                                                }
                                            }}
                                        />
                                    )}
                                    {showEndDatePicker && (
                                        <DateTimePicker
                                            value={endDate || new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowEndDatePicker(false);
                                                if (selectedDate) {
                                                    setEndDate(selectedDate);
                                                }
                                            }}
                                        />
                                    )}
                                </View>

                                {/* Reset Button */}
                                <View className="flex-row justify-end">
                                    <TouchableOpacity
                                        className="p-3 bg-gray-200 rounded-full"
                                        onPress={resetFilters}
                                    >
                                        <Text className="text-center text-gray-700 font-mmedium">
                                            {t(
                                                "my_petitions.filter_modal.reset"
                                            )}
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
                title={t("my_petitions.delete_modal.title")}
                message={t("my_petitions.delete_modal.message")}
                primaryButtonText={t("my_petitions.delete_modal.delete_button")}
                secondaryButtonText={t(
                    "my_petitions.delete_modal.cancel_button"
                )}
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
                                {t("my_petitions.rejection_reason_modal.title")}
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
                                        "my_petitions.rejection_reason_modal.close_button"
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

export default MyPetitionsPage;
