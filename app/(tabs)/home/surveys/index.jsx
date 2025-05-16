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
import { useData } from "../../../../lib/datacontext";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import SearchComponent from "../../../../components/SearchComponent";
import { ActivityIndicator } from "react-native";
import { useKeyboard } from "../../../../hooks/useKeyboard";
import Toast from "react-native-toast-message"; // Добавлен импорт Toast

// Компоненты EmptyStateMessage и SurveyCard
const EmptyStateMessage = ({ searchText }) => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("no_surveys_found", { search: searchText })}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {t("adjust_search")}
            </Text>
        </View>
    );
};

const SurveyCard = ({ item, onPress, i18n }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const isCompleted = item.status === "Completed";
    const hasVoted = item.hasVoted;

    const statusColor = isCompleted ? "bg-red-400" : "bg-green-400";
    const statusText = isCompleted ? t("completed") : t("active");

    // Сделаем все карточки кликабельными
    const cardBorderClass = isCompleted
        ? "border-l-4 border-l-red-400 border-t border-t-gray-200 border-r border-r-gray-200 border-b border-b-gray-200"
        : "border-l-4 border-l-green-400 border-t border-t-gray-200 border-r border-r-gray-200 border-b border-b-gray-200";
    return (
        <TouchableOpacity
            className={`rounded-lg mb-4 shadow-md bg-ghostwhite ${cardBorderClass} overflow-hidden `}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="p-4">
                <View className="flex-row items-center mb-2">
                    <View
                        className={`h-2 w-2 rounded-full ${statusColor} mr-2`}
                    />
                    <Text className="text-sm font-mmedium text-gray-600">
                        {statusText}
                    </Text>
                </View>
                <Text
                    className="font-msemibold text-lg text-gray-800"
                    numberOfLines={2}
                >
                    {item.title[i18n.language] || item.title.en}
                </Text>
                <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center">
                        <MaterialIcons
                            name="how-to-vote"
                            size={16}
                            color="#6B7280"
                        />
                        <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                            {item.totalVotes || 0} {t("votes")}
                        </Text>
                    </View>
                    {isCompleted ? (
                        <TouchableOpacity
                            className={`bg-ghostwhite px-3 py-1 rounded-full border border-gray-300`}
                            onPress={() => {
                                router.push(
                                    `/pages/surveys-details/results/${item.id}`
                                );
                            }}
                        >
                            <Text className="text-gray-700 font-mmedium">
                                {t("view_results")}
                            </Text>
                        </TouchableOpacity>
                    ) : hasVoted ? (
                        <View className=" rounded-full flex items-center justify-center">
                            <MaterialIcons
                                name="check-circle"
                                size={24}
                                color="#10B981"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity
                            className={`bg-ghostwhite px-3 py-1 rounded-full border border-gray-300`}
                            onPress={() => {
                                router.push(
                                    `/pages/surveys-details/vote/${item.id}`
                                );
                            }}
                        >
                            <Text className="text-gray-700 font-mmedium">
                                {t("vote")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const SurveysTab = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const {
        paginatedSurveys,
        paginatedSurveySearchResults,
        surveysLoading,
        surveysError,
        fetchSurveys,
        searchSurveys,
        surveySearchLoading,
        surveySearchError,
        resetSurveySearch,
        isSurveySearchActive,
        surveyFilters,
        updateSurveyFilters,
        loadMoreSurveys,
        isSurveysLoadingMore,
    } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [tempFilters, setTempFilters] = useState({ status: [] });
    const { isKeyboardVisible } = useKeyboard();

    const statusOptions = [
        { id: "Published", name: t("active") },
        { id: "Completed", name: t("completed") },
    ];

    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...surveyFilters });
        }
    }, [showFilterModal]);

    const toggleStatus = (statusId) => {
        setTempFilters((prev) => ({
            ...prev,
            status: prev.status.includes(statusId)
                ? prev.status.filter((id) => id !== statusId)
                : [...prev.status, statusId],
        }));
    };

    const handleApplyFilters = async () => {
        await updateSurveyFilters(tempFilters);
        setShowFilterModal(false);
        if (searchText.trim()) {
            await searchSurveys(searchText.trim(), i18n.language, tempFilters);
        }
    };

    const handleResetFilters = async () => {
        const emptyFilters = { status: [] };
        setTempFilters(emptyFilters);
        await updateSurveyFilters(emptyFilters);
        if (searchText.trim()) {
            await searchSurveys(searchText.trim(), i18n.language, emptyFilters);
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
        resetSurveySearch();
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchSurveys(
                    debouncedSearchText.trim(),
                    i18n.language,
                    surveyFilters
                );
            } else {
                resetSurveySearch();
            }
        };
        performSearch();
    }, [debouncedSearchText, i18n.language, surveyFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (searchText.trim()) {
                await searchSurveys(
                    searchText.trim(),
                    i18n.language,
                    surveyFilters
                );
            } else {
                await fetchSurveys(surveyFilters);
            }
        } catch (err) {
            console.error("Error refreshing surveys:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!surveysLoading && !refreshing && !isSurveysLoadingMore) {
            loadMoreSurveys();
        }
    };

    const renderFooter = () => {
        if (!isSurveysLoadingMore) return null;
        return (
            <View className="py-4 flex items-center justify-center">
                <ActivityIndicator size="small" color="#006FFD" />
            </View>
        );
    };

    const renderEmptyList = () => {
        if (searchText) {
            return <EmptyStateMessage searchText={searchText} />;
        }
        return (
            <View className="flex-1 items-center justify-center py-10 bg-secondary">
                <MaterialIcons name="info" size={64} color="#9CA3AF" />
                <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                    {t("no_surveys_available")}
                </Text>
            </View>
        );
    };

    const handleSurveyPress = (item) => {
        if (item.status === "Completed") {
            router.push(`/pages/surveys-details/results/${item.id}`);
        } else if (!item.hasVoted) {
            router.push(`/pages/surveys-details/vote/${item.id}`);
        } else {
            // Показываем уведомление для уже пройденных опросов
            Toast.show({
                type: "info",
                text1: t("surveys.already_completed"),
                text2: t("surveys.already_voted_in_this_survey"),
            });
        }
    };

    const displayData = isSurveySearchActive
        ? paginatedSurveySearchResults
        : paginatedSurveys;
    const isLoading =
        (isSurveySearchActive ? surveySearchLoading : surveysLoading) &&
        !refreshing;
    const error = isSurveySearchActive ? surveySearchError : surveysError;

    const renderContent = () => {
        if (isLoading) {
            return <LoadingIndicator />;
        }
        if (error) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">
                        {t("surveys.error")}: {error}
                    </Text>
                </View>
            );
        }
        return (
            <FlatList
                data={displayData}
                renderItem={({ item }) => (
                    <SurveyCard
                        item={item}
                        onPress={() => handleSurveyPress(item)}
                        i18n={i18n}
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
                        tintColor="#006FFD"
                        colors={["#006FFD"]}
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            />
        );
    };

    // Функции для навигации
    const navigateToAddSurvey = () => {
        setShowOptionsModal(false);
        router.push("/pages/add-survey");
    };

    const navigateToMySurveys = () => {
        setShowOptionsModal(false);
        router.push("/pages/my-surveys");
    };

    return (
        <View className="flex-1">
            <View className="flex-row items-center mb-4">
                <View className="flex-1">
                    <SearchComponent
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onClear={handleClearSearch}
                        tabName="surveys"
                    />
                </View>
                <TouchableOpacity
                    className="ml-2 p-2 bg-ghostwhite rounded-full shadow-md border border-gray-200"
                    onPress={() => setShowFilterModal(true)}
                >
                    <MaterialIcons
                        name="filter-list"
                        size={24}
                        color={
                            surveyFilters.status.length > 0
                                ? "#006FFD"
                                : "#9CA3AF"
                        }
                    />
                </TouchableOpacity>
            </View>

            {renderContent()}

            {/* Плавающая кнопка для открытия модального окна */}
            {!isKeyboardVisible && (
                <TouchableOpacity
                    className="absolute bottom-5 right-4 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
                    onPress={() => setShowOptionsModal(true)}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}

            {/* Модальное окно с опциями */}
            <Modal
                visible={showOptionsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOptionsModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setShowOptionsModal(false)}
                >
                    <View className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg">
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3 border-b border-gray-100"
                            onPress={navigateToAddSurvey}
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                {t("surveys.create_new_survey")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={navigateToMySurveys}
                        >
                            <MaterialIcons
                                name="list"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
                                {t("surveys.my_surveys")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Модальное окно фильтров */}
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
                        <View className="bg-white rounded-t-xl p-5">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-mbold">
                                    {t("surveys.filter_modal.title")}
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
                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("surveys.filter_modal.status")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {statusOptions.map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full border border-gray-200 ${
                                                tempFilters.status.includes(
                                                    status.id
                                                )
                                                    ? "border-primary bg-primary"
                                                    : "bg-gray-100"
                                            }`}
                                            onPress={() =>
                                                toggleStatus(status.id)
                                            }
                                        >
                                            <Text
                                                className={`font-mregular ${
                                                    tempFilters.status.includes(
                                                        status.id
                                                    )
                                                        ? "text-white"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {status.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="px-6 py-3 bg-gray-200 rounded-full"
                                    onPress={handleResetFilters}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        {t("surveys.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-6 py-3 bg-primary rounded-full"
                                    onPress={handleApplyFilters}
                                >
                                    <Text className="text-white font-mmedium">
                                        {t("surveys.filter_modal.apply")}
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

export default SurveysTab;
