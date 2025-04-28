import React, { useContext, useState, useEffect } from "react";
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
import { useFirestore } from "../../../../hooks/useFirestore";
import { doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../../../../lib/firebase";
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
    const { getCollection } = useFirestore();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [newsWithComments, setNewsWithComments] = useState([]);

    useEffect(() => {
        const fetchCommentCounts = async () => {
            try {
                const newsWithCommentCounts = await Promise.all(
                    news.map(async (item) => {
                        const conditions = [
                            {
                                type: "where",
                                field: "parentCollection",
                                operator: "==",
                                value: "news",
                            },
                            {
                                type: "where",
                                field: "parentId",
                                operator: "==",
                                value: `news/${item.id}`,
                            },
                        ];
                        const commentsData = await getCollection(
                            "comments",
                            conditions
                        );
                        return { ...item, commentCount: commentsData.length };
                    })
                );
                setNewsWithComments(newsWithCommentCounts);
            } catch (err) {
                console.error("Error fetching comment counts:", err);
            }
        };

        if (news.length > 0) {
            fetchCommentCounts();
        } else {
            setNewsWithComments([]);
        }
    }, [news, getCollection]);

    const getFilteredNews = () => {
        if (!searchText) return newsWithComments;
        const search = searchText.toLowerCase();
        return newsWithComments.filter(
            (item) =>
                item.title[i18n.language]?.toLowerCase().includes(search) ||
                item.shortDescription[i18n.language]
                    .toLowerCase()
                    .includes(search)
        );
    };

    const incrementViewCount = async (newsId) => {
        try {
            const newsRef = doc(firestore, "news", newsId);
            await updateDoc(newsRef, {
                viewCount: increment(1),
            });
        } catch (err) {
            console.error("Error incrementing view count:", err);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchNews();
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
                            className="rounded-lg mb-4 shadow-md bg-ghostwhite border border-gray-200 overflow-hidden"
                            onPress={async () => {
                                await incrementViewCount(item.id);
                                router.push(`/pages/news-details/${item.id}`);
                            }}
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

                                <View className="flex-row items-center mt-2">
                                    <MaterialIcons
                                        name="category"
                                        size={16}
                                        color="#6B7280"
                                    />
                                    <Text className="text-gray-500 ml-1 text-sm">
                                        {item.categoryName[i18n.language] ||
                                            item.categoryName.en}
                                    </Text>

                                    <MaterialIcons
                                        name="access-time"
                                        size={16}
                                        color="#6B7280"
                                        style={{ marginLeft: 12 }}
                                    />
                                    <Text className="text-gray-500 ml-1 text-sm">
                                        {new Date(
                                            item.createdAt.toDate()
                                        ).toLocaleDateString(i18n.language)}
                                    </Text>
                                </View>

                                <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                    <View className="flex-row items-center">
                                        <View className="bg-gray-100 p-1 rounded-full">
                                            <MaterialIcons
                                                name="visibility"
                                                size={16}
                                                color="#3B82F6"
                                            />
                                        </View>
                                        <Text className="text-gray-600 ml-1 font-mmedium text-sm">
                                            {item.viewCount || 0}
                                        </Text>
                                    </View>

                                    <View className="flex-row items-center">
                                        <View className="bg-gray-100 p-1 rounded-full">
                                            <MaterialIcons
                                                name="comment"
                                                size={16}
                                                color="#3B82F6"
                                            />
                                        </View>
                                        <Text className="text-gray-600 ml-1 font-mmedium text-sm">
                                            {item.commentCount || 0}
                                        </Text>
                                    </View>
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
