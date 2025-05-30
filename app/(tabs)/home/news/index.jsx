import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
    Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useData } from "../../../../lib/datacontext";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import SearchComponent from "../../../../components/SearchComponent";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator } from "react-native";
import FilterButton from "../../../../components/FilterButton";
import { useTheme } from "../../../../lib/themeContext";

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
                {t("no_news_found", { search: searchText })}
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

const NewsCard = ({ item, onPress, i18n, isDark }) => (
    <TouchableOpacity
        className={`rounded-lg mb-4 shadow-md border overflow-hidden ${
            isDark
                ? "bg-dark-surface border-gray-600"
                : "bg-ghostwhite border-gray-200"
        }`}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-48 rounded-t-lg"
            resizeMode="cover"
        />
        <View className="p-4">
            <Text
                className={`font-msemibold text-lg ${
                    isDark ? "text-dark-text-primary" : "text-gray-800"
                }`}
                numberOfLines={2}
            >
                {item.title[i18n.language] || item.title.en}
            </Text>
            <Text
                className={`font-mregular text-sm mt-2 ${
                    isDark ? "text-dark-text-secondary" : "text-gray-600"
                }`}
                numberOfLines={3}
            >
                {item.shortDescription[i18n.language] ||
                    item.shortDescription.en}
            </Text>
            <View className="flex-row items-center mt-4 justify-between">
                <View className="flex-row items-center">
                    <MaterialIcons
                        name="category"
                        size={16}
                        color={isDark ? "#A0A0A0" : "#6B7280"}
                    />
                    <Text
                        className={`ml-1 text-sm font-mmedium ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                    >
                        {item.categoryName[i18n.language] ||
                            item.categoryName.en}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialIcons
                        name="access-time"
                        size={16}
                        color={isDark ? "#A0A0A0" : "#6B7280"}
                    />
                    <Text
                        className={`ml-1 text-sm font-mmedium ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                    >
                        {new Date(item.createdAt.toDate()).toLocaleDateString(
                            i18n.language
                        )}
                    </Text>
                </View>
            </View>
            <View className="flex-row justify-between items-center pt-3 mr-2">
                <View className="flex-row items-center">
                    <View
                        className={`p-1.5 rounded-full ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                        <MaterialIcons
                            name="visibility"
                            size={16}
                            color={isDark ? "#FFFFFF" : "#3B82F6"}
                        />
                    </View>
                    <Text
                        className={`ml-2 font-mmedium text-sm ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-600"
                        }`}
                    >
                        {item.viewCount || 0}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <View
                        className={`p-1.5 rounded-full ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}
                    >
                        <MaterialIcons
                            name="comment"
                            size={16}
                            color={isDark ? "#FFFFFF" : "#3B82F6"}
                        />
                    </View>
                    <Text
                        className={`ml-2 font-mmedium text-sm ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-600"
                        }`}
                    >
                        {item.commentCount || 0}
                    </Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const NewsTab = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const {
        paginatedNews,
        paginatedSearchResults,
        newsLoading,
        newsError,
        fetchNews,
        updateNewsViewCount,
        searchNews,
        searchLoading,
        searchError,
        resetSearch,
        isSearchActive,
        newsFilters,
        updateNewsFilters,
        loadMoreNews,
        isLoadingMore,
    } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [tempFilters, setTempFilters] = useState({
        startDate: null,
        endDate: null,
        categories: [],
    });
    const { isDark } = useTheme();

    // Available categories
    const categories = [
        {
            id: "EFSI2BK77w18bNAYGGX4",
            name: {
                en: "Infrastructure",
                kz: "Инфрақұрылым",
                ru: "Инфраструктура",
            },
        },
        {
            id: "5m8QecvGFlMF0D4Usqrs",
            name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
        },
        {
            id: "E4KL6iMQTGbFJ6h5BZDc",
            name: { en: "Ecology", kz: "Экология", ru: "Экология" },
        },
        {
            id: "WnTQxiyzcbdVm690j2Pn",
            name: { en: "Education", kz: "Білім", ru: "Образование" },
        },
        {
            id: "MdwCK3NMg64PqmPQFAQ4",
            name: {
                en: "Healthcare",
                kz: "Денсаулық сақтау",
                ru: "Здравоохранение",
            },
        },
        {
            id: "NYBHEyvWdhF8Yo6Pl73X",
            name: {
                en: "Social Sphere",
                kz: "Әлеуметтік сала",
                ru: "Социальная сфера",
            },
        },
        {
            id: "sGkSl0AVr01NlBJEwWBs",
            name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
        },
        {
            id: "gfRxRWr0TlChOPdSW8kz",
            name: {
                en: "Housing and Utilities",
                kz: "ТКШ",
                ru: "ЖКХ",
            },
        },
        {
            id: "lafwZEKCmogVNrQKxLI8",
            name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
        },
        {
            id: "9sbSX4PubjX090jhiQIS",
            name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
        },
        {
            id: "sdUQe1AYEBvoVBdkx7VN",
            name: { en: "Other", kz: "Басқа", ru: "Другое" },
        },
    ];

    // Initialize temp filters when modal opens
    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...newsFilters });
        }
    }, [showFilterModal]);

    const toggleCategory = (categoryId) => {
        setTempFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter((id) => id !== categoryId)
                : [...prev.categories, categoryId],
        }));
    };

    const handleApplyFilters = async () => {
        updateNewsFilters(tempFilters);
        setShowFilterModal(false);

        // Refresh search results if search is active with new filters
        if (searchText.trim()) {
            await searchNews(searchText.trim(), i18n.language, tempFilters);
        }
    };

    // Обновляем функцию сброса фильтров
    const handleResetFilters = async () => {
        const emptyFilters = {
            startDate: null,
            endDate: null,
            categories: [],
        };
        setTempFilters(emptyFilters);
        await updateNewsFilters(emptyFilters);

        // Обновляем результаты поиска с пустыми фильтрами, если поиск активен
        if (searchText.trim()) {
            await searchNews(searchText.trim(), i18n.language, emptyFilters);
        }
    };
    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // Обработчик изменения текста поиска с задержкой
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const handleClearSearch = () => {
        setSearchText("");
        resetSearch();
    };

    // Выполняем поиск при изменении задержанного текста поиска
    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchNews(
                    debouncedSearchText.trim(),
                    i18n.language,
                    newsFilters
                );
            } else {
                resetSearch();
            }
        };

        performSearch();
    }, [debouncedSearchText, i18n.language, newsFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Если активен поиск, обновляем результаты поиска с учетом фильтров
            if (searchText.trim()) {
                await searchNews(searchText.trim(), i18n.language, newsFilters);
            } else {
                await fetchNews(newsFilters);
            }
        } catch (err) {
            console.error("Error refreshing news:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!isLoading && !refreshing && !isLoadingMore) {
            loadMoreNews();
        }
    };
    const renderFooter = () => {
        if (!isLoadingMore) return null;
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
                    {t("no_news_available")}
                </Text>
            </View>
        );
    };

    const handleNewsPress = async (item) => {
        router.push(`/pages/news-details/${item.id}`);
        await updateNewsViewCount(item.id);
    };

    // Определяем, какие данные отображать: результаты поиска или обычные новости
    const displayData = isSearchActive ? paginatedSearchResults : paginatedNews;
    const isLoading =
        (isSearchActive ? searchLoading : newsLoading) && !refreshing;
    const error = isSearchActive ? searchError : newsError;

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
                        {t("error")}: {error}
                    </Text>
                </View>
            );
        }
        return (
            <FlatList
                data={displayData}
                renderItem={({ item }) => (
                    <NewsCard
                        item={item}
                        onPress={() => handleNewsPress(item)}
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
                        tabName="news"
                        isDark={isDark}
                    />
                </View>
                <FilterButton
                    onPress={() => setShowFilterModal(true)}
                    hasActiveFilters={Object.values(newsFilters).some((v) =>
                        Array.isArray(v) ? v.length > 0 : v !== null
                    )}
                    containerStyles="ml-2"
                    isDark={isDark}
                />
            </View>

            {renderContent()}

            {/* Filter Modal */}
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
                                    {t("news.filter_modal.title")}
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
                                    {t("news.filter_modal.categories")}
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
                                    {t("news.filter_modal.date_range")}
                                </Text>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 rounded-lg border items-center justify-center ${
                                            tempFilters.startDate
                                                ? isDark
                                                    ? "border-2 border-dark-primary"
                                                    : "border-2 border-primary"
                                                : isDark
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-gray-100 border-gray-200"
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
                                                      "news.filter_modal.start_date"
                                                  )}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 rounded-lg border items-center justify-center ${
                                            tempFilters.endDate
                                                ? isDark
                                                    ? "border-2 border-dark-primary"
                                                    : "border-2 border-primary"
                                                : isDark
                                                ? "bg-gray-700 border-gray-600"
                                                : "bg-gray-100 border-gray-200"
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
                                                      "news.filter_modal.end_date"
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
                                        {t("news.filter_modal.reset")}
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
                                        {t("news.filter_modal.apply")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Pickers */}
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
                />
            )}
        </View>
    );
};

export default NewsTab;
