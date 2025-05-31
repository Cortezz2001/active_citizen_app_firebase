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
import Toast from "react-native-toast-message";
import CustomButton from "../../../../components/CustomButton";
import { useTheme } from "../../../../lib/themeContext";
import FilterButton from "../../../../components/FilterButton";

const petitionCategories = [
    {
        id: "idfw7SRpl5RWJounhx5o",
        name: {
            en: "Infrastructure",
            kz: "Инфрақұрылым",
            ru: "Инфраструктура",
        },
    },
    {
        id: "OfveAVK1Ist1ERfv3OHD",
        name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
    },
    {
        id: "St4GZswPZZrV7gA94ePd",
        name: { en: "Ecology", kz: "Экология", ru: "Экология" },
    },
    {
        id: "AmhX5i5RKAZc1jFiMbpN",
        name: { en: "Education", kz: "Білім", ru: "Образование" },
    },
    {
        id: "iaFwXnVDYbX8lkEPriZO",
        name: {
            en: "Healthcare",
            kz: "Денсаулық сақтау",
            ru: "Здравоохранение",
        },
    },
    {
        id: "N9yPRzFYhGpOGD2y1B1q",
        name: {
            en: "Social Sphere",
            kz: "Алеуметтік сала",
            ru: "Социальная сфера",
        },
    },
    {
        id: "BqP3Z6iGnUqTIeGsWnoP",
        name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
    },
    {
        id: "I9jZzYjUkf4nZriN0aTK",
        name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
    },
    {
        id: "K5ZCIYox9QyfVxaKTcgg",
        name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
    },
    {
        id: "El34TsbdFsKpDRVXVkIQ",
        name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
    },
    {
        id: "8AfIHBPxoL8WDr6IZqvi",
        name: { en: "Other", kz: "Басқа", ru: "Другое" },
    },
];

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
                {t("no_petitions_found", { search: searchText })}
            </Text>
            <Text
                className={`mt-2 text-center ${
                    isDark ? "text-dark-text-secondary" : "text-gray-400"
                }`}
            >
                {t("adjust_search")}
            </Text>
        </View>
    );
};

const PetitionCard = ({ item, onPress, i18n, isDark }) => {
    const { t } = useTranslation();
    const hasSigned = item.hasSigned;
    const isCompleted = item.status === "Completed";
    const isPublished = item.status === "Published";

    return (
        <TouchableOpacity
            className={`rounded-lg mb-4 shadow-md border overflow-hidden ${
                isDark
                    ? "bg-dark-surface border-gray-600"
                    : "bg-ghostwhite border-gray-200"
            }`}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text
                        className={`font-msemibold text-lg flex-1 mr-2 ${
                            isDark ? "text-dark-text-primary" : "text-gray-900"
                        }`}
                        numberOfLines={3}
                    >
                        {item.title[i18n.language] || item.title.en}
                    </Text>
                    {isCompleted ? (
                        <View
                            className={`px-2 py-1 rounded-full flex-row items-center ${
                                isDark ? "bg-green-900" : "bg-green-100"
                            }`}
                        >
                            <MaterialIcons
                                name="check-circle"
                                size={16}
                                color={isDark ? "#34D399" : "#047857"}
                            />
                            <Text
                                className={`ml-1 text-xs font-mmedium ${
                                    isDark ? "text-green-300" : "text-green-700"
                                }`}
                            >
                                {t("completed")}
                            </Text>
                        </View>
                    ) : isPublished ? (
                        <View
                            className={`px-2 py-1 rounded-full flex-row items-center ${
                                isDark ? "bg-blue-900" : "bg-blue-100"
                            }`}
                        >
                            <MaterialIcons
                                name="public"
                                size={16}
                                color={isDark ? "#60A5FA" : "#006FFD"}
                            />
                            <Text
                                className={`ml-1 text-xs font-mmedium ${
                                    isDark ? "text-blue-300" : "text-blue-700"
                                }`}
                            >
                                {t("active")}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <View className="flex-row items-center my-2">
                    <MaterialIcons
                        name="category"
                        size={16}
                        color={isDark ? "#A0A0A0" : "#6B7280"}
                    />
                    <Text
                        className={`text-sm font-mmedium ml-1 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                    >
                        {item.categoryName[i18n.language] ||
                            item.categoryName.en}
                    </Text>
                </View>
                <View className="mb-3 mt-2">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="people"
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
                                {item.totalSignatures} {t("supporters")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-500"
                            }`}
                        >
                            {t("target")}: {item.targetSignatures}
                        </Text>
                    </View>
                    <View
                        className={`h-2 rounded-full w-full mt-1 ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                    >
                        <View
                            className={`h-2 rounded-full ${
                                isDark ? "bg-dark-primary" : "bg-primary"
                            }`}
                            style={{
                                width: `${Math.min(
                                    100,
                                    (item.totalSignatures /
                                        item.targetSignatures) *
                                        100
                                )}%`,
                            }}
                        />
                    </View>
                </View>
                <View className="flex-row items-center justify-end">
                    {hasSigned && !isCompleted ? (
                        <View className="rounded-full flex items-center justify-center">
                            <MaterialIcons
                                name="check-circle"
                                size={24}
                                color={isDark ? "#34D399" : "#10B981"}
                            />
                        </View>
                    ) : !isCompleted ? (
                        <CustomButton
                            title={t("sign")}
                            handlePress={() => onPress()}
                            containerStyles={`px-3 py-1 rounded-full border shadow-lg ${
                                isDark
                                    ? "bg-dark-surface border-gray-600"
                                    : "bg-ghostwhite border-gray-300"
                            }`}
                            textStyles={`font-mmedium text-sm ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-700"
                            }`}
                        />
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const PetitionsTab = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const {
        paginatedPetitions,
        paginatedPetitionSearchResults,
        petitionsLoading,
        petitionsError,
        fetchPetitions,
        searchPetitions,
        petitionSearchLoading,
        petitionSearchError,
        resetPetitionSearch,
        isPetitionSearchActive,
        petitionFilters,
        updatePetitionFilters,
        loadMorePetitions,
        isPetitionsLoadingMore,
    } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        status: [],
        categories: [],
    });
    const { isKeyboardVisible } = useKeyboard();
    const { isDark } = useTheme();

    const statusOptions = [
        { id: "Published", name: t("active") },
        { id: "Completed", name: t("completed") },
    ];

    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...petitionFilters });
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

    const toggleCategory = (categoryId) => {
        setTempFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handleApplyFilters = async () => {
        updatePetitionFilters(tempFilters);
        setShowFilterModal(false);
        if (searchText.trim()) {
            await searchPetitions(
                searchText.trim(),
                i18n.language,
                tempFilters
            );
        }
    };

    const handleResetFilters = async () => {
        const emptyFilters = { status: [], categories: [] };
        setTempFilters(emptyFilters);
        await updatePetitionFilters(emptyFilters);
        if (searchText.trim()) {
            await searchPetitions(
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
        resetPetitionSearch();
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchPetitions(
                    debouncedSearchText.trim(),
                    i18n.language,
                    petitionFilters
                );
            } else {
                resetPetitionSearch();
            }
        };
        performSearch();
    }, [debouncedSearchText, i18n.language, petitionFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            if (searchText.trim()) {
                await searchPetitions(
                    searchText.trim(),
                    i18n.language,
                    petitionFilters
                );
            } else {
                await fetchPetitions(petitionFilters);
            }
        } catch (err) {
            console.error("Error refreshing petitions:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!petitionsLoading && !refreshing && !isPetitionsLoadingMore) {
            loadMorePetitions();
        }
    };

    const renderFooter = () => {
        if (!isPetitionsLoadingMore) return null;
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
                    {t("no_petitions_available")}
                </Text>
            </View>
        );
    };

    const handlePetitionPress = (item) => {
        router.push(`/pages/petitions-details/${item.id}`);
    };

    const displayData = isPetitionSearchActive
        ? paginatedPetitionSearchResults
        : paginatedPetitions;
    const isLoading =
        (isPetitionSearchActive ? petitionSearchLoading : petitionsLoading) &&
        !refreshing;
    const error = isPetitionSearchActive ? petitionSearchError : petitionsError;

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
                        {t("petitions.error")}: {error}
                    </Text>
                </View>
            );
        }
        return (
            <FlatList
                data={displayData}
                renderItem={({ item }) => (
                    <PetitionCard
                        item={item}
                        onPress={() => handlePetitionPress(item)}
                        i18n={i18n}
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

    const navigateToAddPetition = () => {
        setShowOptionsModal(false);
        router.push("/pages/add-petition");
    };

    const navigateToMyPetitions = () => {
        setShowOptionsModal(false);
        router.push("/pages/my-petitions");
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
                        tabName="petitions"
                        isDark={isDark}
                    />
                </View>
                <FilterButton
                    onPress={() => setShowFilterModal(true)}
                    hasActiveFilters={
                        petitionFilters.status.length > 0 ||
                        petitionFilters.categories.length > 0
                    }
                    containerStyles="ml-2"
                    isDark={isDark}
                />
            </View>

            {renderContent()}

            {!isKeyboardVisible && (
                <TouchableOpacity
                    className={`absolute bottom-5 right-4 rounded-full w-14 h-14 items-center justify-center shadow-lg ${
                        isDark ? "bg-dark-primary" : "bg-primary"
                    }`}
                    onPress={() => setShowOptionsModal(true)}
                >
                    <MaterialIcons
                        name="add"
                        size={30}
                        color={isDark ? "#FFFFFF" : "white"}
                    />
                </TouchableOpacity>
            )}

            <Modal
                visible={showOptionsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowOptionsModal(false)}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: isDark
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(0,0,0,0.5)",
                    }}
                    activeOpacity={1}
                    onPress={() => setShowOptionsModal(false)}
                >
                    <View
                        className={`absolute bottom-24 right-4 rounded-lg shadow-lg ${
                            isDark ? "bg-dark-surface" : "bg-white"
                        }`}
                    >
                        <TouchableOpacity
                            className={`flex-row items-center px-4 py-3 ${
                                isDark
                                    ? "border-b border-gray-600"
                                    : "border-b border-gray-100"
                            }`}
                            onPress={navigateToAddPetition}
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={24}
                                color={isDark ? "#0066E6" : "#006FFD"}
                            />
                            <Text
                                className={`ml-3 font-mmedium ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("petitions.create_new_petition")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center px-4 py-3"
                            onPress={navigateToMyPetitions}
                        >
                            <MaterialIcons
                                name="list"
                                size={24}
                                color={isDark ? "#0066E6" : "#006FFD"}
                            />
                            <Text
                                className={`ml-3 font-mmedium ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("petitions.my_petitions")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

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
                                    {t("petitions.filter_modal.title")}
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
                                    {t("petitions.filter_modal.status")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {statusOptions.map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                                                tempFilters.status.includes(
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
                                                    tempFilters.status.includes(
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
                                    {t("petitions.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {petitionCategories.map((category) => (
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
                                        {t("petitions.filter_modal.reset")}
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
                                        {t("petitions.filter_modal.apply")}
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

export default PetitionsTab;
