// my-requests.jsx
import React, { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";
import AddRequestsButton from "../../../addFirestore/addRequests";
const myRequestsData = [
    {
        id: 1,
        title: "Street light not working",
        date: "15.06.2023",
        status: "in_progress",
    },
    {
        id: 2,
        title: "Trash on the playground",
        date: "10.06.2023",
        status: "rejected",
        rejectionReason:
            "This area is not maintained by the city services. Please contact your community management.",
    },
    {
        id: 3,
        title: "Pothole on the road",
        date: "05.06.2023",
        status: "completed",
    },
    {
        id: 4,
        title: "Broken bench in the park",
        date: "01.06.2023",
        status: "in_progress",
    },
    {
        id: 5,
        title: "Leaking drainpipe",
        date: "25.05.2023",
        status: "completed",
    },
    {
        id: 6,
        title: "Graffiti on public wall",
        date: "20.05.2023",
        status: "rejected",
        rejectionReason:
            "The wall is private property. We've notified the owner about the issue.",
    },
    {
        id: 7,
        title: "New park benches needed",
        date: "18.05.2023",
        status: "draft",
    },
    {
        id: 8,
        title: "Sidewalk repair",
        date: "15.05.2023",
        status: "draft",
    },
];

const statusColors = {
    draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
    },
    in_progress: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
    },
    rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
    },
    completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
    },
};

const MyRequestsTab = () => {
    const { t } = useTranslation();
    const router = useRouter();

    // Local state for search and filter functionality
    const [searchText, setSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [requestsData, setRequestsData] = useState(myRequestsData);
    const [filteredRequests, setFilteredRequests] = useState(myRequestsData);
    const [showRejectionReason, setShowRejectionReason] = useState(null);
    const [deleteAlert, setDeleteAlert] = useState({
        visible: false,
        requestId: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const statusFilters = ["draft", "in_progress", "rejected", "completed"];

    useEffect(() => {
        let result = [...requestsData];
        if (searchText) {
            result = result.filter((request) =>
                request.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        if (selectedStatuses.length > 0) {
            result = result.filter((request) =>
                selectedStatuses.includes(request.status)
            );
        }
        if (startDate || endDate) {
            result = result.filter((request) => {
                const requestDate = new Date(
                    request.date.split(".").reverse().join("-")
                );
                if (startDate && endDate) {
                    return requestDate >= startDate && requestDate <= endDate;
                } else if (startDate) {
                    return requestDate >= startDate;
                } else if (endDate) {
                    return requestDate <= endDate;
                }
                return true;
            });
        }
        setFilteredRequests(result);
    }, [searchText, selectedStatuses, startDate, endDate, requestsData]);

    const handleEdit = (requestId) => {
        router.push({ pathname: "./send-request", params: { requestId } });
    };

    const handleDeleteConfirm = (requestId) => {
        setDeleteAlert({ visible: true, requestId });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            setTimeout(() => {
                setRequestsData(
                    requestsData.filter(
                        (request) => request.id !== deleteAlert.requestId
                    )
                );
                setDeleteAlert({ visible: false, requestId: null });
                setIsDeleting(false);
            }, 1000);
        } catch (error) {
            console.error("Error deleting request:", error);
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

    const canEdit = (status) => status === "draft";
    const canDelete = (status) => status === "draft";

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("my_requests.empty_state.no_requests")}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {searchText
                    ? t("my_requests.empty_state.search_advice")
                    : t("my_requests.empty_state.filter_advice")}
            </Text>
        </View>
    );

    return (
        <View className="flex-1">
            {/* Search Bar */}
            <View className="bg-ghostwhite rounded-3xl p-2 mb-4 shadow-md border border-gray-200 flex-row items-center">
                <MaterialIcons name="search" size={24} color="#9CA3AF" />
                <AddRequestsButton />
                <TextInput
                    placeholder={t("request_layout.search_placeholder")}
                    value={searchText}
                    onChangeText={setSearchText}
                    className="flex-1 ml-2 font-mregular"
                />
                {searchText.length > 0 && (
                    <TouchableOpacity
                        className="mr-2"
                        onPress={() => setSearchText("")}
                    >
                        <MaterialIcons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    className="mx-1"
                    onPress={() => setShowFilterModal(true)}
                    accessibilityRole="button"
                    accessibilityLabel={
                        selectedStatuses.length > 0 || startDate || endDate
                            ? `${t("my_requests.filter_modal.title")} ${t(
                                  "my_requests.filter_modal.active"
                              )}`
                            : t("my_requests.filter_modal.title")
                    }
                >
                    <MaterialIcons
                        name="filter-list"
                        size={24}
                        color={
                            selectedStatuses.length > 0 || startDate || endDate
                                ? "#006FFD"
                                : "#9CA3AF"
                        }
                    />
                </TouchableOpacity>
            </View>

            {/* Request List */}
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
                                            {t(
                                                `my_requests.statuses.${request.status}`
                                            )}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-gray-500 text-sm mb-3 font-mmedium">
                                    {t("my_requests.created_label")}:{" "}
                                    {request.date}
                                </Text>

                                {request.status === "rejected" &&
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
                                                    {t(
                                                        "my_requests.actions.view_rejection_reason"
                                                    )}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                <View className="flex-col">
                                    <View className="flex-row flex-wrap mb-2">
                                        {canEdit(request.status) && (
                                            <TouchableOpacity
                                                className="mr-3 mb-2"
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
                                                        {t(
                                                            "my_requests.actions.edit"
                                                        )}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        {canDelete(request.status) && (
                                            <TouchableOpacity
                                                className="mb-2"
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
                                                        {t(
                                                            "my_requests.actions.delete"
                                                        )}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {request.status !== "draft" && (
                                        <View className="flex-row justify-end">
                                            <TouchableOpacity
                                                className="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300"
                                                onPress={() => {
                                                    console.log(
                                                        `Viewing details for request ${request.id}`
                                                    );
                                                }}
                                            >
                                                <Text className="text-gray-700 font-mmedium">
                                                    {t(
                                                        "my_requests.actions.view_details"
                                                    )}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

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
                                    {t("my_requests.filter_modal.title")}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
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
                                    {t("my_requests.filter_modal.status")}
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
                                            onPress={() => toggleStatus(status)}
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
                                                    `my_requests.statuses.${status}`
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Date Range Filter */}
                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("my_requests.filter_modal.date_range")}
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
                                                      "my_requests.filter_modal.from"
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
                                                      "my_requests.filter_modal.to"
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
                                        {t("my_requests.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

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
                                {t("my_requests.rejection_reason_modal.title")}
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
                                        "my_requests.rejection_reason_modal.close_button"
                                    )}
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
                                {t("my_requests.delete_modal.title")}
                            </Text>
                            <Text className="text-gray-600 mb-4">
                                {t("my_requests.delete_modal.message")}
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
                                        {t(
                                            "my_requests.delete_modal.cancel_button"
                                        )}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="bg-red-500 rounded-full py-2 px-4"
                                    onPress={handleDelete}
                                    disabled={isDeleting}
                                >
                                    <Text className="text-white font-mmedium">
                                        {isDeleting
                                            ? t(
                                                  "my_requests.delete_modal.deleting"
                                              )
                                            : t(
                                                  "my_requests.delete_modal.delete_button"
                                              )}
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
