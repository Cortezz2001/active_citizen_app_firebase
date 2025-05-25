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

const EmptyStateMessage = ({ searchText }) => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("no_petitions_found", { search: searchText })}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {t("adjust_search")}
            </Text>
        </View>
    );
};

const PetitionCard = ({ item, onPress, i18n }) => {
    const { t } = useTranslation();
    const hasSigned = item.hasSigned;
    const isCompleted = item.status === "Completed";
    const isPublished = item.status === "Published";

    return (
        <TouchableOpacity
            className={`rounded-lg mb-4 shadow-md bg-ghostwhite overflow-hidden border border-gray-200`}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-msemibold text-lg text-gray-900 flex-1 mr-2">
                        {item.title[i18n.language] || item.title.en}
                    </Text>
                    {isCompleted ? (
                        <View
                            className={`px-2 py-1 rounded-full flex-row items-center bg-green-100`}
                        >
                            <MaterialIcons
                                name={"check-circle"}
                                size={16}
                                color={"#047857"}
                            />
                            <Text
                                className={`ml-1 text-xs font-mmedium text-green-700`}
                            >
                                {t(`completed`)}
                            </Text>
                        </View>
                    ) : isPublished ? (
                        <View
                            className={`px-2 py-1 rounded-full flex-row items-center bg-blue-100`}
                        >
                            <MaterialIcons
                                name={"public"}
                                size={16}
                                color={"#006FFD"}
                            />

                            <Text
                                className={`ml-1 text-xs font-mmedium text-blue-700`}
                            >
                                {t(`active`)}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View className="flex-row items-center my-2">
                    <MaterialIcons name="category" size={16} color="#6B7280" />
                    <Text className="text-gray-500 ml-1 text-sm font-mmedium">
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
                                color="#006FFD"
                            />
                            <Text className="ml-1 text-primary font-mmedium">
                                {item.totalSignatures} {t("supporters")}
                            </Text>
                        </View>
                        <Text className="text-gray-500 font-mregular">
                            {t("target")}: {item.targetSignatures}
                        </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full w-full mt-1">
                        <View
                            className="h-2 bg-primary rounded-full"
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
                                color="#10B981"
                            />
                        </View>
                    ) : !isCompleted ? (
                        <CustomButton
                            title={t("sign")}
                            handlePress={() => onPress()}
                            containerStyles="bg-ghostwhite px-3 py-1 rounded-full border border-gray-300 shadow-lg"
                            textStyles="text-gray-700 font-mmedium text-sm"
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
            return <LoadingIndicator />;
        }
        if (error) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">
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

    const navigateToAddPetition = () => {
        setShowOptionsModal(false);
        router.push("/pages/add-petition");
    };

    const navigateToMyPetitions = () => {
        setShowOptionsModal(false);
        router.push("/pages/my-petitions");
    };

    return (
        <View className="flex-1">
            <View className="flex-row items-center mb-4">
                <View className="flex-1">
                    <SearchComponent
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onClear={handleClearSearch}
                        tabName="petitions"
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
                            petitionFilters.status.length > 0 ||
                            petitionFilters.categories.length > 0
                                ? "#006FFD"
                                : "#9CA3AF"
                        }
                    />
                </TouchableOpacity>
            </View>

            {renderContent()}

            {!isKeyboardVisible && (
                <TouchableOpacity
                    className="absolute bottom-5 right-4 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
                    onPress={() => setShowOptionsModal(true)}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}

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
                            onPress={navigateToAddPetition}
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
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
                                color="#006FFD"
                            />
                            <Text className="ml-3 font-mmedium text-gray-800">
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
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View className="flex-1 justify-end">
                        <View className="bg-white rounded-t-xl p-5">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-mbold">
                                    {t("petitions.filter_modal.title")}
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
                                    {t("petitions.filter_modal.status")}
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
                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("petitions.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {petitionCategories.map((category) => (
                                        <TouchableOpacity
                                            key={category.id}
                                            className={`mr-2 mb-2 px-4 py-2 rounded-full border border-gray-200 ${
                                                tempFilters.categories.includes(
                                                    category.id
                                                )
                                                    ? "border-primary bg-primary"
                                                    : "bg-gray-100"
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
                                    className="px-6 py-3 bg-gray-200 rounded-full"
                                    onPress={handleResetFilters}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        {t("petitions.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-6 py-3 bg-primary rounded-full"
                                    onPress={handleApplyFilters}
                                >
                                    <Text className="text-white font-mmedium">
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
