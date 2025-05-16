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
                {t("no_events_found", { search: searchText })}
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                {t("adjust_search")}
            </Text>
        </View>
    );
};

const EventCard = ({ item, onPress, i18n }) => (
    <TouchableOpacity
        className="rounded-lg mb-4 shadow-md bg-ghostwhite border border-gray-200 overflow-hidden h-44"
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View className="flex-row h-full items-center">
            <Image
                source={{ uri: item.imageUrl }}
                className="w-24 h-full rounded-l-lg"
            />
            <View className="p-4 flex-1">
                <Text
                    className="font-msemibold text-lg text-gray-800"
                    numberOfLines={2}
                >
                    {item.title[i18n.language] || item.title.en}
                </Text>
                <View className="flex-row items-center mt-2">
                    <MaterialIcons name="event" size={16} color="#6B7280" />
                    <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                        {new Date(item.date.toDate()).toLocaleDateString(
                            i18n.language
                        )}
                    </Text>
                </View>
                <View className="flex-row items-center mt-1">
                    <MaterialIcons
                        name="location-on"
                        size={16}
                        color="#6B7280"
                    />
                    <Text
                        className="text-gray-500 ml-1 text-sm font-mmedium"
                        numberOfLines={1}
                    >
                        {item.location.name[i18n.language] ||
                            item.location.name.en}
                    </Text>
                </View>
                {/* Добавленный блок для отображения категории */}
                <View className="flex-row items-center mt-1">
                    <MaterialIcons name="category" size={16} color="#6B7280" />
                    <Text
                        className="text-gray-500 ml-1 text-sm font-mmedium"
                        numberOfLines={1}
                    >
                        {item.categoryName?.[i18n.language] ||
                            item.categoryName?.en ||
                            t("unknown_category")}
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
        await updateEventFilters(tempFilters);
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
                    {t("no_events_available")}
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
                    <EventCard
                        item={item}
                        onPress={() => handleEventPress(item)}
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
                        tabName="events"
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
                            Object.values(eventFilters).some((v) =>
                                Array.isArray(v) ? v.length > 0 : v !== null
                            )
                                ? "#006FFD"
                                : "#9CA3AF"
                        }
                    />
                </TouchableOpacity>
            </View>

            {renderContent()}

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
                                    {t("events.filter_modal.title")}
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
                                    {t("events.filter_modal.categories")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                    {eventCategories.map((category) => (
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

                            <View className="mb-6">
                                <Text className="text-base font-mmedium mb-2">
                                    {t("events.filter_modal.date_range")}
                                </Text>
                                <View className="flex-row justify-between">
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 bg-gray-100 rounded-lg border items-center justify-center ${
                                            tempFilters.startDate
                                                ? "border-2 border-primary"
                                                : "border-gray-200 bg-gray-100"
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
                                                      "events.filter_modal.start_date"
                                                  )}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 mr-2 p-3 bg-gray-100 rounded-lg border items-center justify-center ${
                                            tempFilters.endDate
                                                ? "border-2 border-primary"
                                                : "border-gray-200 bg-gray-100"
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
                                                      "events.filter_modal.end_date"
                                                  )}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="px-6 py-3 bg-gray-200 rounded-full"
                                    onPress={handleResetFilters}
                                >
                                    <Text className="text-gray-700 font-mmedium">
                                        {t("events.filter_modal.reset")}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="px-6 py-3 bg-primary rounded-full"
                                    onPress={handleApplyFilters}
                                >
                                    <Text className="text-white font-mmedium">
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
