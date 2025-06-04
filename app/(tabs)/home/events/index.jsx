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
import DateTimePicker from "@react-native-community/datetimepicker";
import { ActivityIndicator } from "react-native";
import FilterButton from "../../../../components/FilterButton";
import { useTheme } from "../../../../lib/themeContext";
import FastImage from "react-native-fast-image";

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
                {t("events.no_events_found", { search: searchText })}
            </Text>
            <Text
                className={`mt-2 text-center ${
                    isDark ? "text-dark-text-secondary" : "text-gray-400"
                }`}
            >
                {t("events.adjust_search")}
            </Text>
        </View>
    );
};

const EventCard = ({ item, onPress, i18n, isDark }) => (
    <TouchableOpacity
        className={`rounded-lg mb-4 shadow-md border overflow-hidden h-44 ${
            isDark
                ? "bg-dark-surface border-gray-600"
                : "bg-ghostwhite border-gray-200"
        }`}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View className="flex-row h-full items-center">
            <View
                className={`relative ${
                    isDark ? "bg-dark-card" : "bg-light-card"
                }`}
            >
                <FastImage
                    source={{
                        uri: item.imageUrl,
                        priority: FastImage.priority.normal,
                        cache: FastImage.cacheControl.immutable,
                    }}
                    style={{
                        width: 96, // w-24 = 96px
                        height: "100%",
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                    fallback={true}
                />
            </View>
            <View className="p-4 flex-1">
                <Text
                    className={`font-msemibold text-lg ${
                        isDark ? "text-dark-text-primary" : "text-gray-800"
                    }`}
                    numberOfLines={2}
                >
                    {item.title[i18n.language] || item.title.en}
                </Text>
                <View className="flex-row items-center mt-2">
                    <MaterialIcons
                        name="event"
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
                        {new Date(item.date.toDate()).toLocaleDateString(
                            i18n.language
                        )}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <MaterialIcons
                        name="location-on"
                        size={16}
                        color={isDark ? "#A0A0A0" : "#6B7280"}
                    />
                    <Text
                        className={`ml-1 text-sm font-mmedium ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                        numberOfLines={1}
                    >
                        {item.location.name[i18n.language] ||
                            item.location.name.en}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
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
                        numberOfLines={1}
                    >
                        {item.categoryName?.[i18n.language] ||
                            item.categoryName?.en ||
                            t("events.unknown_category")}
                    </Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const EventsTab = () => {
    const { t, i18n } = useTranslation();
    const [searchText, setSearchText] = useState("");
    const {
        paginatedEvents,
        paginatedEventSearchResults,
        eventsLoading,
        eventsError,
        fetchEvents,
        searchEvents,
        eventSearchLoading,
        eventSearchError,
        resetEventSearch,
        isEventSearchActive,
        eventFilters,
        updateEventFilters,
        loadMoreEvents,
        isEventsLoadingMore,
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
    const [preloadedImages, setPreloadedImages] = useState(new Set());
    const { isDark } = useTheme();
    const eventCategories = [
        {
            id: "XTIA01ZY2LlASXoK8BXf",
            name: {
                en: "Concerts and Music",
                kz: "Концерттер мен музыка",
                ru: "Концерты и музыка",
            },
        },
        {
            id: "JCHO5QEFujwPCthq0B5K",
            name: {
                en: "Theater and Culture",
                kz: "Театр және мәдениет",
                ru: "Театр и культура",
            },
        },
        {
            id: "pBotzg0fe0wrmJ2HEz1P",
            name: {
                en: "Exhibitions and Museums",
                kz: "Көрмелер және өнер",
                ru: "Выставки и искусство",
            },
        },
        {
            id: "ArmAlb2N5Mm0ELH6GnFD",
            name: { en: "Holidays", kz: "Мерекелер", ru: "Праздники" },
        },
        {
            id: "762qXpi9J5Bke7Q14ZyF",
            name: {
                en: "Sports and Outdoors",
                kz: "Спорт және денсаулық",
                ru: "Спорт и здоровье",
            },
        },
        {
            id: "L1lsjFXRF4OL939W7Bn0",
            name: {
                en: "Education and Lectures",
                kz: "Білім беру және лекциялар",
                ru: "Образование и лекции",
            },
        },
        {
            id: "5LORthGu7tTj1dB8E6vh",
            name: {
                en: "Markets and Shops",
                kz: "Жаңаөзен және нарықтар",
                ru: "Ярмарки и рынки",
            },
        },
        {
            id: "3roTTJvjgKYluUSlPeGB",
            name: {
                en: "Digital events",
                kz: "Сандық оқиғалар",
                ru: "Цифровые мероприятия",
            },
        },
        {
            id: "8jttlBBy6bysWKLwZOUs",
            name: { en: "Other", kz: "Басқа", ru: "Другое" },
        },
    ];

    // Function to preload images
    const preloadImages = (eventItems, startIndex = 0, count = 10) => {
        if (!eventItems || eventItems.length === 0) return;

        const imagesToPreload = [];
        const endIndex = Math.min(startIndex + count, eventItems.length);

        for (let i = startIndex; i < endIndex; i++) {
            const item = eventItems[i];
            if (item?.imageUrl && !preloadedImages.has(item.imageUrl)) {
                imagesToPreload.push({
                    uri: item.imageUrl,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                });
            }
        }

        if (imagesToPreload.length > 0) {
            FastImage.preload(imagesToPreload);
            setPreloadedImages((prev) => {
                const newSet = new Set(prev);
                imagesToPreload.forEach((img) => newSet.add(img.uri));
                return newSet;
            });
        }
    };

    // Preload images when data changes
    useEffect(() => {
        const displayData = isEventSearchActive
            ? paginatedEventSearchResults
            : paginatedEvents;
        if (displayData && displayData.length > 0) {
            // Preload first 15 images on data load
            preloadImages(displayData, 0, 15);
        }
    }, [paginatedEvents, paginatedEventSearchResults, isEventSearchActive]);

    // Preload next images on scroll
    const handleViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems.length === 0) return;

        const displayData = isEventSearchActive
            ? paginatedEventSearchResults
            : paginatedEvents;
        const lastVisibleIndex = Math.max(
            ...viewableItems.map((item) => item.index)
        );

        // Preload next 10 images proactively
        if (lastVisibleIndex >= 0 && displayData && displayData.length > 0) {
            const preloadStartIndex = lastVisibleIndex + 1;
            preloadImages(displayData, preloadStartIndex, 10);
        }
    };

    useEffect(() => {
        if (showFilterModal) {
            setTempFilters({ ...eventFilters });
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
        updateEventFilters(tempFilters);
        setShowFilterModal(false);
        if (searchText.trim()) {
            await searchEvents(searchText.trim(), i18n.language, tempFilters);
        }
    };

    const handleResetFilters = async () => {
        const emptyFilters = {
            startDate: null,
            endDate: null,
            categories: [],
        };
        setTempFilters(emptyFilters);
        await updateEventFilters(emptyFilters);
        if (searchText.trim()) {
            await searchEvents(searchText.trim(), i18n.language, emptyFilters);
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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchText]);

    const handleClearSearch = () => {
        setSearchText("");
        resetEventSearch();
    };

    useEffect(() => {
        const performSearch = async () => {
            if (debouncedSearchText.trim()) {
                await searchEvents(
                    debouncedSearchText.trim(),
                    i18n.language,
                    eventFilters
                );
            } else {
                resetEventSearch();
            }
        };
        performSearch();
    }, [debouncedSearchText, i18n.language, eventFilters]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Reset preloaded images on refresh
            setPreloadedImages(new Set());
            if (searchText.trim()) {
                await searchEvents(
                    searchText.trim(),
                    i18n.language,
                    eventFilters
                );
            } else {
                await fetchEvents(eventFilters);
            }
        } catch (err) {
            console.error("Error refreshing events:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleEndReached = () => {
        if (!eventsLoading && !refreshing && !isEventsLoadingMore) {
            loadMoreEvents();
        }
    };

    const renderFooter = () => {
        if (!isEventsLoadingMore) return null;
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
                    {t("events.no_events_available")}
                </Text>
            </View>
        );
    };

    const handleEventPress = (item) => {
        router.push(`/pages/events-details/${item.id}`);
    };

    const displayData = isEventSearchActive
        ? paginatedEventSearchResults
        : paginatedEvents;
    const isLoading =
        (isEventSearchActive ? eventSearchLoading : eventsLoading) &&
        !refreshing;
    const error = isEventSearchActive ? eventSearchError : eventsError;

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
                        {t("events.error")}: {error}
                    </Text>
                </View>
            );
        }
        return (
            <FlatList
                data={displayData}
                renderItem={({ item }) => (
                    <EventCard
                        item={item}
                        onPress={() => handleEventPress(item)}
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
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                    minimumViewTime: 100,
                }}
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
                        tabName="events"
                        isDark={isDark}
                    />
                </View>
                <FilterButton
                    onPress={() => setShowFilterModal(true)}
                    hasActiveFilters={Object.values(eventFilters).some((v) =>
                        Array.isArray(v) ? v.length > 0 : v !== null
                    )}
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
                                    {t("events.filter_modal.title")}
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
                                    {t("events.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {eventCategories.map((category) => (
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
                                    {t("events.filter_modal.date_range")}
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
                                                      "events.filter_modal.start_date"
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
                                                      "events.filter_modal.end_date"
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
                                        {t("events.filter_modal.reset")}
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
                                        {t("events.filter_modal.apply")}
                                    </Text>
                                </TouchableOpacity>
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

export default EventsTab;
