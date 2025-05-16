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

const EmptyStateMessage = ({ searchText }) => {
    const { t } = useTranslation();
    return (
        <View className="flex-1 items-center justify-center py-10 bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                {t("no_news_found", { search: searchText })}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {t("adjust_search")}
            </Text>
        </View>
    );
};

const NewsCard = ({ item, onPress, i18n }) => (
    <TouchableOpacity
        className="rounded-lg mb-4 shadow-md bg-ghostwhite border border-gray-200 overflow-hidden"
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
                className="font-msemibold text-lg text-gray-800"
                numberOfLines={2}
            >
                {item.title[i18n.language] || item.title.en}
            </Text>
            <Text
                className="font-mregular text-sm text-gray-600 mt-2"
                numberOfLines={3}
            >
                {item.shortDescription[i18n.language] ||
                    item.shortDescription.en}
            </Text>
            <View className="flex-row items-center mt-4 justify-between">
                <View className="flex-row items-center">
                    <MaterialIcons name="category" size={16} color="#6B7280" />
                    <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                        {item.categoryName[i18n.language] ||
                            item.categoryName.en}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialIcons
                        name="access-time"
                        size={16}
                        color="#6B7280"
                    />
                    <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                        {new Date(item.createdAt.toDate()).toLocaleDateString(
                            i18n.language
                        )}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center pt-3 mr-2">
                <View className="flex-row items-center">
                    <View className="bg-gray-100 p-1.5 rounded-full">
                        <MaterialIcons
                            name="visibility"
                            size={16}
                            color="#3B82F6"
                        />
                    </View>
                    <Text className="text-gray-600 ml-2 font-mmedium text-sm">
                        {item.viewCount || 0}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <View className="bg-gray-100 p-1.5 rounded-full">
                        <MaterialIcons
                            name="comment"
                            size={16}
                            color="#3B82F6"
                        />
                    </View>
                    <Text className="text-gray-600 ml-2 font-mmedium text-sm">
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
        await updateNewsFilters(tempFilters);
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
            return <LoadingIndicator />;
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-red-500">
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

    return (
        <View className="flex-1">
            <View className="flex-row items-center mb-4">
                <View className="flex-1">
                    <SearchComponent
                        searchText={searchText}
                        setSearchText={setSearchText}
                        onClear={handleClearSearch}
                        tabName="news"
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
                            Object.values(newsFilters).some((v) =>
                                Array.isArray(v) ? v.length > 0 : v !== null
                            )
                                ? "#006FFD"
                                : "#9CA3AF"
                        }
                    />
                </TouchableOpacity>
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
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View className="flex-1 justify-end">
                        <View className="bg-white rounded-t-xl p-5">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-mbold">
                                    {t("news.filter_modal.title")}
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

                            {/* Categories */}
                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("news.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {categories.map((category) => (
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

                            {/* Date Range */}
                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("news.filter_modal.date_range")}
                                </Text>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 bg-gray-100 rounded-lg border items-center justify-center ${
                                            tempFilters.startDate
                                                ? "border-2 border-primary" // Синяя граница, если есть дата
                                                : "border-gray-200 bg-gray-100" // Серая граница и фон, если нет даты
                                        }`}
                                        onPress={() =>
                                            setShowStartDatePicker(true)
                                        }
                                    >
                                        <Text className="text-gray-700 font-mregular">
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
                                        className={`flex-1 mr-2 p-3 bg-gray-100 rounded-lg border items-center justify-center ${
                                            tempFilters.endDate
                                                ? "border-2 border-primary" // Синяя граница, если есть дата
                                                : "border-gray-200 bg-gray-100" // Серая граница и фон, если нет даты
                                        }`}
                                        onPress={() =>
                                            setShowEndDatePicker(true)
                                        }
                                    >
                                        <Text className="text-gray-700 font-mregular">
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

                            {/* Action Buttons */}
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="px-6 py-3 bg-gray-200 rounded-full"
                                    onPress={handleResetFilters}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        {t("news.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-6 py-3 bg-primary rounded-full"
                                    onPress={handleApplyFilters}
                                >
                                    <Text className="text-white font-mmedium">
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
