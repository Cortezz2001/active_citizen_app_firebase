import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Modal,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useData } from "../../lib/datacontext";
import SearchComponent from "../../components/SearchComponent";
import LoadingIndicator from "../../components/LoadingIndicator";
import { useKeyboard } from "../../hooks/useKeyboard";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../lib/firebase";
import Toast from "react-native-toast-message";
import CustomButton from "../../components/CustomButton";
import { useTheme } from "../../lib/themeContext";
import FilterButton from "../../components/FilterButton";

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
        darkBg: "bg-yellow-900",
        darkText: "text-yellow-200",
        darkIconColor: "#FBBF24",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
        darkBg: "bg-red-900",
        darkText: "text-red-200",
        darkIconColor: "#F87171",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
        darkBg: "bg-green-900",
        darkText: "text-green-200",
        darkIconColor: "#34D399",
    },
    Published: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "public",
        iconColor: "#1D4ED8",
        darkBg: "bg-blue-900",
        darkText: "text-blue-200",
        darkIconColor: "#60A5FA",
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
                {t("my_surveys.empty_state.no_surveys")}
            </Text>
            <Text
                className={`mt-2 text-center ${
                    isDark ? "text-dark-text-secondary" : "text-gray-400"
                }`}
            >
                {searchText
                    ? t("my_surveys.empty_state.search_advice")
                    : t("my_surveys.empty_state.create_advice")}
            </Text>
        </View>
    );
};

const SurveyCard = ({ item, i18n, onViewRejection, onDelete, isDark }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const statusColor = statusColors[item.status] || {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "help",
        iconColor: "#374151",
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    };

    const canEdit = item.status === "Draft";
    const canDelete = item.status === "Draft";

    // Determine the route based on survey status
    const getDetailsRoute = (status, surveyId) => {
        switch (status) {
            case "In progress":
            case "Rejected":
                return `/pages/surveys-details/info/${surveyId}`;
            case "Published":
                return `/pages/surveys-details/vote/${surveyId}`;
            case "Completed":
                return `/pages/surveys-details/results/${surveyId}`;
            default:
                return null; // No route for Draft or unknown status
        }
    };

    return (
        <View
            className={`rounded-lg mb-4 shadow-sm border overflow-hidden min-h-[180px] flex flex-col ${
                isDark
                    ? "bg-dark-surface border-dark-border"
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
                        className={`px-2 py-1 rounded-full flex-row items-center ${
                            isDark ? statusColor.darkBg : statusColor.bg
                        }`}
                    >
                        <MaterialIcons
                            name={statusColor.icon}
                            size={16}
                            color={
                                isDark
                                    ? statusColor.darkIconColor
                                    : statusColor.iconColor
                            }
                        />
                        <Text
                            className={`ml-1 text-xs font-mmedium ${
                                isDark ? statusColor.darkText : statusColor.text
                            }`}
                        >
                            {t(
                                `my_surveys.statuses.${item.status.toLowerCase()}`
                            )}
                        </Text>
                    </View>
                </View>

                <Text
                    className={`text-sm mb-3 font-mmedium ${
                        isDark ? "text-dark-text-secondary" : "text-gray-500"
                    }`}
                >
                    {t("my_surveys.created_label")}:{" "}
                    {item.createdAt.toDate().toLocaleDateString(i18n.language)}
                </Text>

                {(item.status === "Published" ||
                    item.status === "Completed") && (
                    <View className="flex-row items-center mb-3">
                        <MaterialIcons
                            name="how-to-vote"
                            size={18}
                            color={isDark ? "#0066E6" : "#006FFD"}
                        />
                        <Text
                            className={`ml-1 font-mmedium ${
                                isDark ? "text-dark-primary" : "text-primary"
                            }`}
                        >
                            {t("my_surveys.votes", {
                                count: item.totalVotes || 0,
                            })}
                        </Text>
                    </View>
                )}

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
                                {t("my_surveys.actions.view_rejection_reason")}
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
                                        pathname: "/pages/add-survey",
                                        params: { surveyId: item.id },
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
                                        {t("my_surveys.actions.edit")}
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
                                        {t("my_surveys.actions.delete")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {item.status !== "Draft" && (
                        <View className="flex-row justify-end mb-2">
                            {getDetailsRoute(item.status, item.id) && (
                                <TouchableOpacity
                                    className={`px-3 py-1 rounded-full border ${
                                        isDark
                                            ? "bg-dark-surface border-dark-border"
                                            : "bg-ghostwhite border-gray-300"
                                    }`}
                                    onPress={() => {
                                        router.push(
                                            getDetailsRoute(
                                                item.status,
                                                item.id
                                            )
                                        );
                                    }}
                                >
                                    <Text
                                        className={`font-mmedium ${
                                            isDark
                                                ? "text-dark-text-primary"
                                                : "text-gray-700"
                                        }`}
                                    >
                                        {t("my_surveys.actions.view_details")}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const MySurveysPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const {
        paginatedUserSurveys,
        paginatedUserSurveySearchResults,
        userSurveysLoading,
        userSurveysError,
        fetchUserSurveys,
        searchUserSurveys,
        userSurveySearchLoading,
        userSurveySearchError,
        resetUserSurveySearch,
        isUserSurveySearchActive,
        userSurveyFilters,
        updateUserSurveyFilters,
        loadMoreUserSurveys,
        isUserSurveysLoadingMore,
    } = useData();
    const { isDark } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        statuses: [],
        categories: [],
        startDate: null,
        endDate: null,
    });
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [surveyToDelete, setSurveyToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { isKeyboardVisible } = useKeyboard();

    const statusOptions = [
        { id: "Draft", name: t("my_surveys.statuses.draft") },
        { id: "In progress", name: t("my_surveys.statuses.in progress") },
        { id: "Completed", name: t("my_surveys.statuses.completed") },
        { id: "Rejected", name: t("my_surveys.statuses.rejected") },
        { id: "Published", name: t("my_surveys.statuses.published") },
    ];

    const categories = [
        {
            id: "RkdtDA478Mzbz1ludDqk",
            name: {
                en: "Infrastructure",
                kz: "Инфрақұрылым",
                ru: "Инфраструктура",
            },
        },
        {
            id: "QQv49ItsxuLUaUrhqOcX",
            name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
        },
        {
            id: "OxVqr3xUJKdhXTPyiLmQ",
            name: { en: "Ecology", kz: "Экология", ru: "Экология" },
        },
        {
            id: "kpP3pGJ9DWJMZevFwHcN",
            name: { en: "Education", kz: "Білім", ru: "Образование" },
        },
        {
            id: "W71S9fR85wftoGUzZH9K",
            name: {
                en: "Healthcare",
                kz: "Денсаулық сақтау",
                ru: "Здравоохранение",
            },
        },
        {
            id: "WHeEqvVUnOxqkYNDb9BP",
            name: {
                en: "Social Sphere",
                kz: "Әлеуметтік сала",
                ru: "Соц. сфера",
            },
        },
        {
            id: "91kpAs3p4VS5yucBqqLS",
            name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
        },
        {
            id: "9KbN8KoH0b7JAhnsVBV0",
            name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
        },
        {
            id: "BXNGHpDQrPOaYD7SM3OG",
            name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
        },
        {
            id: "CmWOBmtNUtNOzj2zuM0k",
            name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
        },
        {
            id: "AZd4V140mdc6dYiNnGtU",
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

    useEffect(() => {
        fetchUserSurveys();
    }, []);

    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...userSurveyFilters });
        }
    }, [showFilterModal, userSurveyFilters]);

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
        updateUserSurveyFilters(tempFilters);
        setShowFilterModal(false);
        if (searchText.trim()) {
            await searchUserSurveys(
                searchText.trim(),
                i18n.language,
                tempFilters
            );
        }
    };

    const handleResetFilters = async () => {
        const emptyFilters = {
            statuses: [],
            categories: [],
            startDate: null,
            endDate: null,
        };
        setTempFilters(emptyFilters);
        await updateUserSurveyFilters(emptyFilters);
        if (searchText.trim()) {
            await searchUserSurveys(
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
        resetUserSurveySearch();
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchUserSurveys(
                    debouncedSearchText.trim(),
                    i18n.language,
                    userSurveyFilters
                );
            } else {
                resetUserSurveySearch();
            }
        };
        performSearch();
    }, [debouncedSearchText, i18n.language, userSurveyFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (searchText.trim()) {
                await searchUserSurveys(
                    searchText.trim(),
                    i18n.language,
                    userSurveyFilters
                );
            } else {
                await fetchUserSurveys(userSurveyFilters);
            }
        } catch (err) {
            console.error("Error refreshing surveys:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!userSurveysLoading && !refreshing && !isUserSurveysLoadingMore) {
            loadMoreUserSurveys();
        }
    };

    const renderFooter = () => {
        if (!isUserSurveysLoadingMore) return null;
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
                    {t("my_surveys.empty_state.no_surveys")}
                </Text>
            </View>
        );
    };

    const handleViewRejection = (reason) => {
        setRejectionReason(reason);
        setShowRejectionModal(true);
    };

    const handleDeleteSurvey = (surveyId) => {
        setSurveyToDelete(surveyId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!surveyToDelete) return;

        setIsDeleting(true);
        try {
            const docRef = doc(firestore, "surveys", surveyToDelete);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                await deleteDoc(docRef);
                Toast.show({
                    type: "success",
                    text1: t("my_surveys.delete_modal.success_title"),
                    text2: t("my_surveys.delete_modal.success_message"),
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: t("my_surveys.delete_modal.error_title"),
                    text2: t("my_surveys.delete_modal.error_not_found"),
                });
            }
        } catch (error) {
            console.error("Error deleting survey:", error);
            Toast.show({
                type: "error",
                text1: t("my_surveys.delete_modal.error_title"),
                text2: t("my_surveys.delete_modal.error_message", {
                    error: error.message,
                }),
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            await fetchUserSurveys(userSurveyFilters);
            setSurveyToDelete(null);
        }
    };

    const displayData = isUserSurveySearchActive
        ? paginatedUserSurveySearchResults
        : paginatedUserSurveys;
    const isLoading =
        (isUserSurveySearchActive
            ? userSurveySearchLoading
            : userSurveysLoading) && !refreshing;
    const error = isUserSurveySearchActive
        ? userSurveySearchError
        : userSurveysError;

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View
                className={`px-6 pt-12 pb-2 flex-row items-center border-b ${
                    isDark
                        ? "bg-dark-background border-dark-border"
                        : "bg-white border-gray-200"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text
                        className={`text-2xl font-mbold ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
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
                    <MaterialIcons
                        name="add"
                        size={24}
                        color={isDark ? "#0066E6" : "#006FFD"}
                    />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-4 mt-4">
                <View className="flex-row items-center mb-4">
                    <View className="flex-1">
                        <SearchComponent
                            searchText={searchText}
                            setSearchText={setSearchText}
                            onClear={handleClearSearch}
                            tabName="surveys"
                            isDark={isDark}
                        />
                    </View>
                    <FilterButton
                        onPress={() => setShowFilterModal(true)}
                        hasActiveFilters={
                            userSurveyFilters.statuses.length > 0 ||
                            userSurveyFilters.categories.length > 0 ||
                            userSurveyFilters.startDate ||
                            userSurveyFilters.endDate
                        }
                        containerStyles="ml-2"
                        isDark={isDark}
                    />
                </View>

                {isLoading ? (
                    <LoadingIndicator isDark={isDark} />
                ) : error ? (
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
                            {t("my_surveys.error")}: {error}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={displayData}
                        renderItem={({ item }) => (
                            <SurveyCard
                                item={item}
                                i18n={i18n}
                                onViewRejection={handleViewRejection}
                                onDelete={handleDeleteSurvey}
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
                                progressBackgroundColor={
                                    isDark ? "#2D2D2D" : "#FFFFFF"
                                }
                            />
                        }
                    />
                )}
            </View>

            {/* Modal for Filter */}
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
                                    {t("my_surveys.filter_modal.title")}
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
                                    {t("my_surveys.filter_modal.status")}
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
                                    {t("my_surveys.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            className={`mr-2 mb-2 px-4 py-1 rounded-full border ${
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
                                    {t("my_surveys.filter_modal.date_range")}
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
                                                      "my_surveys.filter_modal.from"
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
                                                      "my_surveys.filter_modal.to"
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
                                        {t("my_surveys.filter_modal.reset")}
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
                                        {t("my_surveys.filter_modal.apply")}
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
                                isDark
                                    ? "bg-dark-surface border-dark-border"
                                    : "bg-white border-light-border"
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
                                        "my_surveys.rejection_reason_modal.title"
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
                                        "my_surveys.rejection_reason_modal.no_reason"
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
                                        "my_surveys.rejection_reason_modal.close_button"
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
                            className={`rounded-xl p-5 w-11/12 max-w-md ${
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
                                    {t("my_surveys.delete_modal.title")}
                                </Text>
                            </View>
                            <Text
                                className={`font-mregular mb-6 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-700"
                                }`}
                            >
                                {t("my_surveys.delete_modal.message")}
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
                                            "my_surveys.delete_modal.cancel_button"
                                        )}
                                    </Text>
                                </TouchableOpacity>
                                <CustomButton
                                    title={t(
                                        "my_surveys.delete_modal.delete_button"
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
        </SafeAreaView>
    );
};

export default MySurveysPage;
