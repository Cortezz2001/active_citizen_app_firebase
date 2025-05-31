import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useData } from "../../../lib/datacontext";
import LoadingIndicator from "../../../components/LoadingIndicator";
import SearchComponent from "../../../components/SearchComponent";
import { ActivityIndicator } from "react-native";
import { useKeyboard } from "../../../hooks/useKeyboard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { firestore, storage } from "../../../lib/firebase";
import Toast from "react-native-toast-message";
import CustomButton from "../../../components/CustomButton";
import { useTheme } from "../../../lib/themeContext";
import FilterButton from "../../../components/FilterButton";

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
        dark: {
            bg: "bg-gray-700",
            text: "text-gray-300",
            icon: "edit",
            iconColor: "#A0A0A0",
        },
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
        dark: {
            bg: "bg-yellow-900",
            text: "text-yellow-300",
            icon: "pending",
            iconColor: "#FBBF24",
        },
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
        dark: {
            bg: "bg-red-900",
            text: "text-red-300",
            icon: "cancel",
            iconColor: "#F87171",
        },
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
        dark: {
            bg: "bg-green-900",
            text: "text-green-300",
            icon: "check-circle",
            iconColor: "#34D399",
        },
    },
};

const EmptyStateMessage = ({ searchText, isDark }) => {
    const { t } = useTranslation();
    return (
        <View
            className={`flex-1 items-center justify-center py-10 ${
                isDark ? "bg-dark-background" : "bg-secondary"
            }`}
        >
            <MaterialIcons
                name="search-off"
                size={64}
                color={isDark ? "#A0A0A0" : "#9CA3AF"}
            />
            <Text
                className={`text-lg font-mmedium mt-4 text-center ${
                    isDark ? "text-dark-text-secondary" : "text-gray-400"
                }`}
            >
                {t("my_requests.empty_state.no_requests")}
            </Text>
            <Text
                className={`mt-2 text-center ${
                    isDark ? "text-dark-text-secondary" : "text-gray-400"
                }`}
            >
                {searchText
                    ? t("my_requests.empty_state.search_advice")
                    : t("my_requests.empty_state.filter_advice")}
            </Text>
        </View>
    );
};

const RequestCard = ({
    item,
    onPress,
    i18n,
    onViewRejection,
    onDelete,
    isDark,
}) => {
    const { t } = useTranslation();
    const router = useRouter();

    const statusColor = isDark
        ? statusColors[item.status]?.dark || statusColors.Draft.dark
        : statusColors[item.status] || statusColors.Draft;

    const canEdit = item.status === "Draft";
    const canDelete = item.status === "Draft";

    return (
        <View
            className={`rounded-lg mb-4 shadow-sm border overflow-hidden min-h-[180px] flex flex-col ${
                isDark
                    ? "bg-dark-surface border-gray-600"
                    : "bg-ghostwhite border-gray-200"
            }`}
        >
            <View className="p-4 flex-1">
                <View className="flex-row justify-between items-start mb-2">
                    <Text
                        className={`font-msemibold text-lg flex-1 mr-2 ${
                            isDark ? "text-dark-text-primary" : "text-gray-900"
                        }`}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {item.title[i18n.language] || item.title.en}
                    </Text>
                    <View
                        className={`px-2 py-1 rounded-full flex-row items-center ${statusColor.bg}`}
                    >
                        <MaterialIcons
                            name={statusColor.icon}
                            size={16}
                            color={statusColor.iconColor}
                        />
                        <Text
                            className={`ml-1 text-xs font-mmedium ${statusColor.text}`}
                        >
                            {t(
                                `my_requests.statuses.${item.status.toLowerCase()}`
                            )}
                        </Text>
                    </View>
                </View>

                <Text
                    className={`text-sm mb-3 font-mmedium ${
                        isDark ? "text-dark-text-secondary" : "text-gray-500"
                    }`}
                >
                    {t("my_requests.created_label")}:{" "}
                    {item.createdAt.toDate().toLocaleDateString(i18n.language)}
                </Text>

                {item.status === "Rejected" && (
                    <TouchableOpacity
                        className="mb-3"
                        onPress={() => onViewRejection(item.rejectionReason)}
                    >
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="info"
                                size={18}
                                color={isDark ? "#F87171" : "#EF4444"}
                            />
                            <Text
                                className={`ml-1 font-mmedium ${
                                    isDark ? "text-red-400" : "text-red-500"
                                }`}
                            >
                                {t("my_requests.actions.view_rejection_reason")}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View className="flex-col flex-1 justify-end">
                    <View className="flex-row justify-end mb-2">
                        {canEdit && (
                            <TouchableOpacity
                                className={`mr-3 px-3 py-1 rounded-full border ${
                                    isDark
                                        ? "border-blue-600"
                                        : "border-blue-500"
                                }`}
                                onPress={() =>
                                    router.push({
                                        pathname: "./send-request",
                                        params: { requestId: item.id },
                                    })
                                }
                            >
                                <View className="flex-row items-center">
                                    <MaterialIcons
                                        name="edit"
                                        size={18}
                                        color={isDark ? "#0066E6" : "#006FFD"}
                                    />
                                    <Text
                                        className={`ml-1 font-mmedium ${
                                            isDark
                                                ? "text-dark-primary"
                                                : "text-primary"
                                        }`}
                                    >
                                        {t("my_requests.actions.edit")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        {canDelete && (
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-full border ${
                                    isDark ? "border-red-600" : "border-red-400"
                                }`}
                                onPress={() => onDelete(item.id)}
                            >
                                <View className="flex-row items-center">
                                    <MaterialIcons
                                        name="delete"
                                        size={18}
                                        color={isDark ? "#F87171" : "#EF4444"}
                                    />
                                    <Text
                                        className={`ml-1 font-mmedium ${
                                            isDark
                                                ? "text-red-400"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {t("my_requests.actions.delete")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {item.status !== "Draft" && (
                        <View className="flex-row justify-end mb-2">
                            <TouchableOpacity
                                className={`px-3 py-1 rounded-full border ${
                                    isDark
                                        ? "bg-dark-surface border-dark-border"
                                        : "bg-ghostwhite border-gray-300"
                                }`}
                                onPress={() =>
                                    router.push(
                                        `/pages/requests-details/${item.id}`
                                    )
                                }
                            >
                                <Text
                                    className={`font-mmedium ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {t("my_requests.actions.view_details")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const MyRequestsTab = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const {
        paginatedRequests,
        paginatedRequestSearchResults,
        requestsLoading,
        requestsError,
        fetchRequests,
        searchRequests,
        requestSearchLoading,
        requestSearchError,
        resetRequestSearch,
        isRequestSearchActive,
        requestFilters,
        updateRequestFilters,
        loadMoreRequests,
        isRequestsLoadingMore,
    } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        startDate: null,
        endDate: null,
        categories: [],
        statuses: [],
    });
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isKeyboardVisible } = useKeyboard();
    const { isDark } = useTheme();

    const statusOptions = [
        { id: "Draft", name: t("my_requests.statuses.draft") },
        { id: "In progress", name: t("my_requests.statuses.in progress") },
        { id: "Completed", name: t("my_requests.statuses.completed") },
        { id: "Rejected", name: t("my_requests.statuses.rejected") },
    ];

    const categories = [
        {
            id: "uj7l8cQo1NzvhzfQKr7O",
            name: {
                en: "Infrastructure",
                kz: "Инфрақұрылым",
                ru: "Инфраструктура",
            },
        },
        {
            id: "F7fMlRJ02xWqzwf6vbTl",
            name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
        },
        {
            id: "4NWS6iYzOUo8QYQ5T6Wh",
            name: { en: "Ecology", kz: "Экология", ru: "Экология" },
        },
        {
            id: "o1Qkp7bsftywM0HMPE9K",
            name: { en: "Education", kz: "Білім", ru: "Образование" },
        },
        {
            id: "7YFanloSft2EHysC6RTs",
            name: {
                en: "Healthcare",
                kz: "Денсаулық сақтау",
                ru: "Здравоохранение",
            },
        },
        {
            id: "rhhlNwHIpJrirppw0lVP",
            name: {
                en: "Social Sphere",
                kz: "Әлеуметтік сала",
                ru: "Социальная сфера",
            },
        },
        {
            id: "A7w1JDqEOudc8JtoFxej",
            name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
        },
        {
            id: "YOux0PN6COA06UlDASCI",
            name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
        },
        {
            id: "qjf29OawC67mOmavWVlH",
            name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
        },
        {
            id: "qDRdPCpSFfiWiFEHG3D0",
            name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
        },
        {
            id: "hwEaCVk6K1V77erNwjOR",
            name: { en: "Other", kz: "Басқа", ru: "Другое" },
        },
    ];

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const handleViewRejection = (reason) => {
        setRejectionReason(reason);
        setShowRejectionModal(true);
    };

    const handleDeleteRequest = (requestId) => {
        setRequestToDelete(requestId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!requestToDelete) return;

        setIsDeleting(true);
        try {
            const docRef = doc(firestore, "requests", requestToDelete);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const requestData = docSnap.data();
                const mediaFiles = requestData.mediaFiles || [];

                const deleteFilePromises = mediaFiles.map(async (file) => {
                    if (file.url) {
                        try {
                            const fileRef = ref(storage, file.url);
                            await deleteObject(fileRef);
                            console.log(
                                `File ${file.name} deleted from storage`
                            );
                        } catch (error) {
                            console.error(
                                `Error deleting file ${file.name}:`,
                                error
                            );
                        }
                    }
                });

                await Promise.all(deleteFilePromises);
                await deleteDoc(docRef);
                console.log(
                    `Request ${requestToDelete} deleted from Firestore`
                );
            } else {
                Toast.show({
                    type: "error",
                    text1: t("my_requests.delete_modal.error_title"),
                    text2: t("my_requests.delete_modal.error_not_found"),
                });
            }
        } catch (error) {
            console.error("Error deleting request:", error);
            Toast.show({
                type: "error",
                text1: t("my_requests.delete_modal.error_title"),
                text2: t("my_requests.delete_modal.error_message", {
                    error: error.message,
                }),
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            Toast.show({
                type: "success",
                text1: t("my_requests.delete_modal.success_title"),
                text2: t("my_requests.delete_modal.success_message"),
            });
            await fetchRequests(requestFilters);
            setRequestToDelete(null);
        }
    };

    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...requestFilters });
        }
    }, [showFilterModal]);

    const toggleStatus = (statusId) => {
        setTempFilters((prev) => ({
            ...prev,
            statuses: prev.statuses.includes(statusId)
                ? prev.statuses.filter((id) => id !== statusId)
                : [...prev.statuses, statusId],
        }));
    };

    const toggleCategory = (categoryId) => {
        setTempFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handleApplyFilters = async () => {
        updateRequestFilters(tempFilters);
        setShowFilterModal(false);
        if (searchText.trim()) {
            await searchRequests(searchText.trim(), i18n.language, tempFilters);
        }
    };

    const handleResetFilters = async () => {
        const emptyFilters = {
            startDate: null,
            endDate: null,
            categories: [],
            statuses: [],
        };
        setTempFilters(emptyFilters);
        await updateRequestFilters(emptyFilters);
        if (searchText.trim()) {
            await searchRequests(
                searchText.trim(),
                i18n.language,
                emptyFilters
            );
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const handleClearSearch = () => {
        setSearchText("");
        resetRequestSearch();
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchRequests(
                    debouncedSearchText.trim(),
                    i18n.language,
                    requestFilters
                );
            } else {
                resetRequestSearch();
            }
        };
        performSearch();
    }, [debouncedSearchText, i18n.language, requestFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (searchText.trim()) {
                await searchRequests(
                    searchText.trim(),
                    i18n.language,
                    requestFilters
                );
            } else {
                await fetchRequests(requestFilters);
            }
        } catch (err) {
            console.error("Error refreshing requests:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!requestsLoading && !refreshing && !isRequestsLoadingMore) {
            loadMoreRequests();
        }
    };

    const renderFooter = () => {
        if (!isRequestsLoadingMore) return null;
        return (
            <View className="py-4 flex items-center justify-center">
                <ActivityIndicator
                    size="small"
                    color={isDark ? "#0066E6" : "#006FFD"}
                />
            </View>
        );
    };

    const renderEmptyList = () => {
        if (searchText) {
            return (
                <EmptyStateMessage searchText={searchText} isDark={isDark} />
            );
        }
        return (
            <View
                className={`flex-1 items-center justify-center py-10 ${
                    isDark ? "bg-dark-background" : "bg-secondary"
                }`}
            >
                <MaterialIcons
                    name="info"
                    size={64}
                    color={isDark ? "#A0A0A0" : "#9CA3AF"}
                />
                <Text
                    className={`text-lg font-mmedium mt-4 text-center ${
                        isDark ? "text-dark-text-secondary" : "text-gray-400"
                    }`}
                >
                    {t("my_requests.empty_state.no_requests")}
                </Text>
            </View>
        );
    };

    const handleRequestPress = (item) => {
        router.push(`/pages/requests-details/${item.id}`);
    };

    const displayData = isRequestSearchActive
        ? paginatedRequestSearchResults
        : paginatedRequests;
    const isLoading =
        (isRequestSearchActive ? requestSearchLoading : requestsLoading) &&
        !refreshing;
    const error = isRequestSearchActive ? requestSearchError : requestsError;

    const renderContent = () => {
        if (isLoading) {
            return <LoadingIndicator isDark={isDark} />;
        }
        if (error) {
            return (
                <View
                    className={`flex-1 justify-center items-center ${
                        isDark ? "bg-dark-background" : "bg-secondary"
                    }`}
                >
                    <Text
                        className={`${
                            isDark ? "text-red-400" : "text-red-500"
                        }`}
                    >
                        {t("my_requests.error")}: {error}
                    </Text>
                </View>
            );
        }
        return (
            <FlatList
                data={displayData}
                renderItem={({ item }) => (
                    <RequestCard
                        item={item}
                        onPress={() => handleRequestPress(item)}
                        i18n={i18n}
                        onViewRejection={handleViewRejection}
                        onDelete={handleDeleteRequest}
                        isDark={isDark}
                    />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmptyList}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={isDark ? "#0066E6" : "#006FFD"}
                        colors={[isDark ? "#0066E6" : "#006FFD"]}
                        progressBackgroundColor={isDark ? "#2D2D2D" : "#FFFFFF"}
                    />
                }
            />
        );
    };

    return (
        <View
            className={`flex-1 ${
                isDark ? "bg-dark-background" : "bg-secondary"
            }`}
        >
            <View className="flex-row items-center mb-4">
                <View className="flex-1">
                    <SearchComponent
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onClear={handleClearSearch}
                        tabName="requests"
                        isDark={isDark}
                    />
                </View>
                <FilterButton
                    onPress={() => setShowFilterModal(true)}
                    hasActiveFilters={
                        requestFilters.statuses.length > 0 ||
                        requestFilters.categories.length > 0 ||
                        requestFilters.startDate ||
                        requestFilters.endDate
                    }
                    containerStyles="ml-2"
                    isDark={isDark}
                />
            </View>

            {renderContent()}

            <Modal
                transparent={true}
                visible={showFilterModal}
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: isDark
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View className="flex-1 justify-end">
                        <View
                            className={`rounded-t-xl p-5 ${
                                isDark ? "bg-dark-surface" : "bg-white"
                            }`}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text
                                    className={`text-lg font-mbold ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t("my_requests.filter_modal.title")}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowFilterModal(false)}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color={isDark ? "#FFFFFF" : "#374151"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View className="mb-6">
                                <Text
                                    className={`text-base font-mmedium mb-2 ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t("my_requests.filter_modal.status")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {statusOptions.map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                                tempFilters.statuses.includes(
                                                    status.id
                                                )
                                                    ? isDark
                                                        ? "border-dark-primary bg-dark-primary"
                                                        : "border-primary bg-primary"
                                                    : isDark
                                                    ? "bg-gray-700 border-gray-600"
                                                    : "bg-gray-100 border-gray-200"
                                            }`}
                                            onPress={() =>
                                                toggleStatus(status.id)
                                            }
                                        >
                                            <Text
                                                className={`font-mregular ${
                                                    tempFilters.statuses.includes(
                                                        status.id
                                                    )
                                                        ? "text-white"
                                                        : isDark
                                                        ? "text-dark-text-primary"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {status.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View className="mb-6">
                                <Text
                                    className={`text-base font-mmedium mb-2 ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t("my_requests.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                                tempFilters.categories.includes(
                                                    category.id
                                                )
                                                    ? isDark
                                                        ? "border-dark-primary bg-dark-primary"
                                                        : "border-primary bg-primary"
                                                    : isDark
                                                    ? "bg-gray-700 border-gray-600"
                                                    : "bg-gray-100 border-gray-200"
                                            }`}
                                            onPress={() =>
                                                toggleCategory(category.id)
                                            }
                                        >
                                            <Text
                                                className={`font-mregular ${
                                                    tempFilters.categories.includes(
                                                        category.id
                                                    )
                                                        ? "text-white"
                                                        : isDark
                                                        ? "text-dark-text-primary"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {category.name[i18n.language]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View className="mb-6">
                                <Text
                                    className={`text-base font-mmedium mb-2 ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t("my_requests.filter_modal.date_range")}
                                </Text>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 rounded-lg border items-center justify-center ${
                                            tempFilters.startDate
                                                ? isDark
                                                    ? "border-2 border-dark-primary bg-gray-700"
                                                    : "border-2 border-primary"
                                                : isDark
                                                ? "bg-gray-700 border-gray-600"
                                                : "border-gray-200 bg-gray-100"
                                        }`}
                                        onPress={() =>
                                            setShowStartDatePicker(true)
                                        }
                                    >
                                        <Text
                                            className={`font-mregular ${
                                                isDark
                                                    ? "text-dark-text-primary"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {tempFilters.startDate
                                                ? formatDate(
                                                      tempFilters.startDate
                                                  )
                                                : t(
                                                      "my_requests.filter_modal.from"
                                                  )}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 ml-2 p-3 rounded-lg border items-center justify-center ${
                                            tempFilters.endDate
                                                ? isDark
                                                    ? "border-2 border-dark-primary bg-gray-700"
                                                    : "border-2 border-primary"
                                                : isDark
                                                ? "bg-gray-700 border-gray-600"
                                                : "border-gray-200 bg-gray-100"
                                        }`}
                                        onPress={() =>
                                            setShowEndDatePicker(true)
                                        }
                                    >
                                        <Text
                                            className={`font-mregular ${
                                                isDark
                                                    ? "text-dark-text-primary"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {tempFilters.endDate
                                                ? formatDate(
                                                      tempFilters.endDate
                                                  )
                                                : t(
                                                      "my_requests.filter_modal.to"
                                                  )}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className={`px-6 py-3 rounded-full ${
                                        isDark ? "bg-gray-700" : "bg-gray-200"
                                    }`}
                                    onPress={handleResetFilters}
                                >
                                    <Text
                                        className={`font-mmedium ${
                                            isDark
                                                ? "text-dark-text-primary"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {t("my_requests.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`px-6 py-3 rounded-full ${
                                        isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                    }`}
                                    onPress={handleApplyFilters}
                                >
                                    <Text
                                        className={`font-mmedium ${
                                            isDark
                                                ? "text-dark-text-primary"
                                                : "text-white"
                                        }`}
                                    >
                                        {t("my_requests.filter_modal.apply")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent={true}
                visible={showRejectionModal}
                animationType="fade"
                onRequestClose={() => setShowRejectionModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: isDark
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPress={() => setShowRejectionModal(false)}
                >
                    <View className="flex-1 justify-center items-center">
                        <View
                            className={`rounded-xl p-5 w-11/12 max-w-md ${
                                isDark ? "bg-dark-surface" : "bg-white"
                            }`}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text
                                    className={`text-lg font-mbold mb-2 ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t(
                                        "my_requests.rejection_reason_modal.title"
                                    )}
                                </Text>
                            </View>

                            <Text
                                className={`mb-4 ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {rejectionReason[i18n.language] ||
                                    rejectionReason.en ||
                                    t(
                                        "my_requests.rejection_reason_modal.no_reason"
                                    )}
                            </Text>
                            <TouchableOpacity
                                className={`px-6 py-3 rounded-full self-end ${
                                    isDark ? "bg-dark-primary" : "bg-primary"
                                }`}
                                onPress={() => setShowRejectionModal(false)}
                            >
                                <Text
                                    className={`font-mmedium ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-white"
                                    }`}
                                >
                                    {t(
                                        "my_requests.rejection_reason_modal.close_button"
                                    )}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent={true}
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: isDark
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPress={() => !isDeleting && setShowDeleteModal(false)}
                >
                    <View className="flex-1 justify-center items-center">
                        <View
                            className={`rounded-xl p-5 w-11/12 max-w-md border ${
                                isDark
                                    ? "bg-dark-surface border-dark-border"
                                    : "bg-white border-light-border"
                            }`}
                        >
                            <View className="flex-row justify-between items-center mb-4">
                                <Text
                                    className={`text-lg font-mbold ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                    }`}
                                >
                                    {t("my_requests.delete_modal.title")}
                                </Text>
                            </View>
                            <Text
                                className={`font-mregular mb-6 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-700"
                                }`}
                            >
                                {t("my_requests.delete_modal.message")}
                            </Text>
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className={`px-6 py-3 rounded-full ${
                                        isDark ? "bg-gray-700" : "bg-gray-200"
                                    }`}
                                    onPress={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                >
                                    <Text
                                        className={`font-mmedium ${
                                            isDark
                                                ? "text-dark-text-primary"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {t(
                                            "my_requests.delete_modal.cancel_button"
                                        )}
                                    </Text>
                                </TouchableOpacity>
                                <CustomButton
                                    title={t(
                                        "my_requests.delete_modal.delete_button"
                                    )}
                                    handlePress={confirmDelete}
                                    containerStyles={`px-6 py-3 rounded-full ${
                                        isDark ? "bg-red-600" : "bg-red-500"
                                    }`}
                                    textStyles="text-white font-mmedium"
                                    isLoading={isDeleting}
                                    isDark={isDark}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {showStartDatePicker && (
                <DateTimePicker
                    value={tempFilters.startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) {
                            setTempFilters((prev) => ({
                                ...prev,
                                startDate: selectedDate,
                            }));
                        }
                    }}
                    themeVariant={isDark ? "dark" : "light"}
                />
            )}
            {showEndDatePicker && (
                <DateTimePicker
                    value={tempFilters.endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) {
                            setTempFilters((prev) => ({
                                ...prev,
                                endDate: selectedDate,
                            }));
                        }
                    }}
                    themeVariant={isDark ? "dark" : "light"}
                />
            )}
        </View>
    );
};

export default MyRequestsTab;
