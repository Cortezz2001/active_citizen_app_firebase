import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Share,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFirestore } from "../../../hooks/useFirestore";
import { getCityNameByKey } from "../../../lib/cities";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoadingIndicator from "../../../components/LoadingIndicator";

const NewsDetailsScreen = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getDocument } = useFirestore();

    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                setLoading(true);
                const newsDoc = await getDocument("news", id);

                if (!newsDoc) {
                    throw new Error("News not found");
                }

                let categoryName = {
                    en: "Unknown",
                    ru: "Неизвестно",
                    kz: "Белгісіз",
                };
                if (newsDoc.categoryId) {
                    const categoryDoc = await getDocument(
                        "categories",
                        newsDoc.categoryId.id
                    );
                    categoryName = categoryDoc?.name || categoryName;
                }

                setNewsItem({ ...newsDoc, categoryName });
            } catch (err) {
                console.error("Error fetching news details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNewsDetails();
        }
    }, [id]);

    const handleShare = async () => {
        if (!newsItem) return;

        try {
            await Share.share({
                message: `${
                    newsItem.title[i18n.language] || newsItem.title.en
                } - ${
                    newsItem.shortDescription[i18n.language] ||
                    newsItem.shortDescription.en
                }`,
                title: newsItem.title[i18n.language] || newsItem.title.en,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error || !newsItem) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar style="dark" />
                <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mr-4"
                        accessibilityLabel={t("back")}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl font-mbold text-black">
                        {t("error")}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center p-4">
                    <MaterialIcons
                        name="error-outline"
                        size={64}
                        color="#EF4444"
                    />
                    <Text className="text-red-500 text-lg font-mmedium mt-4 text-center">
                        {t("news_not_found")}
                    </Text>
                    <Text className="text-gray-500 mt-2 text-center">
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            {/* Header */}
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    accessibilityLabel={t("back")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleShare}
                    accessibilityLabel={t("share")}
                >
                    <MaterialIcons name="share" size={24} color="#006FFD" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 bg-white">
                {/* Hero Image */}
                <Image
                    source={{ uri: newsItem.imageUrl }}
                    className="w-full h-64 "
                    resizeMode="cover"
                />

                {/* Content Card */}
                <View className="bg-ghostwhite rounded-t-3xl -mt-6 p-6  shadow-sm border border-gray-200">
                    {/* Title */}
                    <Text className="text-2xl font-mbold text-gray-900 mb-3">
                        {newsItem.title[i18n.language] || newsItem.title.en}
                    </Text>

                    {/* Metadata Badges */}
                    <View className="flex-row flex-wrap mb-4">
                        <View className="bg-green-50 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                            <MaterialIcons
                                name="category"
                                size={16}
                                color="#059669"
                            />
                            <Text className="text-green-600 ml-1 text-sm font-mmedium">
                                {newsItem.categoryName[i18n.language] ||
                                    newsItem.categoryName.en}
                            </Text>
                        </View>
                        <View className="bg-gray-50 rounded-full px-3 py-1 mb-2 flex-row items-center">
                            <MaterialIcons
                                name="access-time"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {new Date(
                                    newsItem.createdAt.toDate()
                                ).toLocaleDateString(i18n.language)}
                            </Text>
                        </View>
                    </View>

                    {/* Short Description */}
                    <View className="bg-ghostwhite p-4 rounded-lg mb-6 border border-gray-200">
                        <Text className="text-gray-800 font-mmedium italic">
                            {newsItem.shortDescription[i18n.language] ||
                                newsItem.shortDescription.en}
                        </Text>
                    </View>

                    {/* Main Content */}
                    <Text className="text-gray-800 text-base font-mregular leading-relaxed mb-6">
                        {newsItem.content[i18n.language] || newsItem.content.en}
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s,
                        when an unknown printer took a galley of type and
                        scrambled it to make a type specimen book. It has
                        survived not only five centuries, but also the leap into
                        electronic typesetting, remaining essentially unchanged.
                        It was popularised in the 1960s with the release of
                        Letraset sheets containing Lorem Ipsum passages, and
                        more recently with desktop publishing software like
                        Aldus PageMaker including versions of Lorem Ipsum.
                    </Text>

                    {/* Source */}
                    {newsItem.source && (
                        <View className="flex-row items-center mb-6">
                            <MaterialIcons
                                name="link"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                                {t("source")}: {newsItem.source}
                            </Text>
                        </View>
                    )}

                    {/* Share Button */}
                    <TouchableOpacity
                        className="bg-primary rounded-full py-3 px-6 flex-row justify-center items-center"
                        onPress={handleShare}
                    >
                        <MaterialIcons name="share" size={20} color="white" />
                        <Text className="ml-2 text-white font-mmedium">
                            {t("share_news")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewsDetailsScreen;
