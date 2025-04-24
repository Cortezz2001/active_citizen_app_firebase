import React, { useContext, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { SearchContext } from "../_layout";
import { useData } from "../../../../lib/datacontext";
import LoadingIndicator from "../../../../components/LoadingIndicator";

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

const NewsTab = () => {
    const { t, i18n } = useTranslation();
    const { searchText } = useContext(SearchContext);
    const { news, newsLoading, newsError, fetchNews } = useData();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const getFilteredNews = () => {
        if (!searchText) return news;
        const search = searchText.toLowerCase();
        return news.filter(
            (item) =>
                item.title[i18n.language]?.toLowerCase().includes(search) ||
                item.shortDescription[i18n.language]
                    ?.toLowerCase()
                    .includes(search)
        );
    };

    // Функция для обработки pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchNews(); // Вызываем fetchNews для обновления новостей
        } catch (err) {
            console.error("Error refreshing news:", err);
        } finally {
            setRefreshing(false);
        }
    };

    if (newsLoading && !refreshing) {
        return <LoadingIndicator />;
    }

    if (newsError) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">
                    {t("error")}: {newsError}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#006FFD"
                        colors={["#006FFD"]}
                        progressBackgroundColor="#FFFFFF"
                    />
                }
            >
                {searchText && getFilteredNews().length === 0 ? (
                    <EmptyStateMessage searchText={searchText} />
                ) : getFilteredNews().length === 0 ? (
                    <View className="flex-1 items-center justify-center py-10 bg-secondary">
                        <MaterialIcons name="info" size={64} color="#9CA3AF" />
                        <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                            {t("no_news_available")}
                        </Text>
                    </View>
                ) : (
                    getFilteredNews().map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            className="rounded-lg mb-4 shadow-md bg-ghostwhite border border-gray-200"
                            onPress={() =>
                                router.push(`/pages/news-details/${item.id}`)
                            }
                        >
                            <Image
                                source={{ uri: item.imageUrl }}
                                className="w-full h-48 rounded-t-lg"
                            />
                            <View className="p-4">
                                <Text className="font-mmedium text-lg">
                                    {item.title[i18n.language] || item.title.en}
                                </Text>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons
                                        name="category"
                                        size={16}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-500 ml-1 text-sm">
                                        {item.categoryName[i18n.language] ||
                                            item.categoryName.en}
                                    </Text>
                                </View>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons
                                        name="access-time"
                                        size={16}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-500 ml-1 text-sm">
                                        {new Date(
                                            item.createdAt.toDate()
                                        ).toLocaleDateString(i18n.language)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default NewsTab;
