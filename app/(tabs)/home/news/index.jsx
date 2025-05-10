import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useData } from "../../../../lib/datacontext";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import SearchComponent from "../../../../components/SearchComponent";

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
                className="font-mmedium text-lg text-gray-800"
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
                    <Text className="text-gray-500 ml-1 text-sm">
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
                    <Text className="text-gray-500 ml-1 text-sm">
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
        news,
        newsLoading,
        newsError,
        fetchNews,
        updateNewsViewCount,
        searchNews,
        searchResults,
        searchLoading,
        searchError,
        resetSearch,
        isSearchActive,
    } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [debouncedSearchText, setDebouncedSearchText] = useState("");

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
                await searchNews(debouncedSearchText.trim(), i18n.language);
            } else {
                resetSearch();
            }
        };

        performSearch();
    }, [debouncedSearchText, i18n.language]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            // Если активен поиск, обновляем результаты поиска
            if (searchText.trim()) {
                await searchNews(searchText.trim(), i18n.language);
            } else {
                await fetchNews();
            }
        } catch (err) {
            console.error("Error refreshing news:", err);
        } finally {
            setRefreshing(false);
        }
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
    const displayData = isSearchActive ? searchResults : news;
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
            <SearchComponent
                searchText={searchText}
                setSearchText={setSearchText}
                onClear={handleClearSearch}
                tabName="news"
            />
            {renderContent()}
        </View>
    );
};

export default NewsTab;
