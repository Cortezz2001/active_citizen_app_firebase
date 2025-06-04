import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
    Share,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFirestore } from "../../../hooks/useFirestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoadingIndicator from "../../../components/LoadingIndicator";
import Markdown from "react-native-markdown-display";
import { markdownStyles } from "../../../lib/markdownStyles";
import { markdownRules } from "../../../lib/markdownRules";
import { useTheme } from "../../../lib/themeContext";

const EventDetailsScreen = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getDocument } = useFirestore();
    const { isDark } = useTheme();

    const [eventItem, setEventItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const eventDoc = await getDocument("events", id);

            if (!eventDoc) {
                throw new Error("Event not found");
            }

            let categoryName = {
                en: "Unknown",
                ru: "Неизвестно",
                kz: "Белгісіз",
            };
            if (eventDoc.categoryId) {
                const categoryDoc = await getDocument(
                    "events_categories",
                    eventDoc.categoryId.id
                );
                categoryName = categoryDoc?.name || categoryName;
            }

            setEventItem({ ...eventDoc, categoryName });
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const handleBuyTicket = () => {
        if (eventItem?.ticket_url) {
            Linking.openURL(eventItem.ticket_url);
        }
    };

    const handleShare = async () => {
        if (!eventItem) return;

        try {
            await Share.share({
                message: `${
                    eventItem.title[i18n.language] || eventItem.title.en
                } - ${
                    eventItem.description[i18n.language] ||
                    eventItem.description.en
                }`,
                title: eventItem.title[i18n.language] || eventItem.title.en,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (loading) {
        return <LoadingIndicator isDark={isDark} />;
    }

    if (error || !eventItem) {
        return (
            <SafeAreaView
                className={`flex-1 ${
                    isDark ? "bg-dark-background" : "bg-gray-50"
                }`}
            >
                <StatusBar style={isDark ? "light" : "dark"} />
                <View
                    className={`px-6 pt-4 pb-2 flex-row items-center border-b shadow-sm ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mr-4"
                        accessibilityLabel={t("events_details.back")}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={isDark ? "#FFFFFF" : "black"}
                        />
                    </TouchableOpacity>
                    <Text
                        className={`text-2xl font-mbold ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("events_details.error")}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center p-4">
                    <MaterialIcons
                        name="error-outline"
                        size={64}
                        color={isDark ? "#FF6B6B" : "#EF4444"}
                    />
                    <Text
                        className={`text-lg font-mmedium mt-4 text-center ${
                            isDark ? "text-dark-text-primary" : "text-red-500"
                        }`}
                    >
                        {t("events_details.event_not_found")}
                    </Text>
                    <Text
                        className={`mt-2 text-center ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                    >
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-gray-50"}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center justify-between border-b shadow-sm ${
                    isDark
                        ? "bg-dark-background border-dark-border"
                        : "bg-white border-gray-200"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    accessibilityLabel={t("events_details.back")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    accessibilityLabel={t("events_details.share")}
                >
                    <MaterialIcons
                        name="share"
                        size={24}
                        color={isDark ? "#0066E6" : "#006FFD"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <Image
                    source={{ uri: eventItem.imageUrl }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                <View
                    className={`rounded-xl -mt-6 p-6 shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-100"
                    } mb-4`}
                >
                    <Text
                        className={`text-2xl font-mbold mb-3 ${
                            isDark ? "text-dark-text-primary" : "text-gray-900"
                        }`}
                    >
                        {eventItem.title[i18n.language] || eventItem.title.en}
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("events_details.category")}:{" "}
                                {eventItem.categoryName[i18n.language] ||
                                    eventItem.categoryName.en}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="event"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("events_details.date")}:{" "}
                                {new Date(
                                    eventItem.date.toDate()
                                ).toLocaleDateString(i18n.language)}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="location-on"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("events_details.location")}:{" "}
                                {eventItem.location.name[i18n.language] ||
                                    eventItem.location.name.en}
                                ,{" "}
                                {eventItem.location.address[i18n.language] ||
                                    eventItem.location.address.en}
                            </Text>
                        </View>
                    </View>

                    <Markdown
                        style={markdownStyles(isDark)}
                        mergeStyle={false}
                        rules={markdownRules}
                    >
                        {eventItem.description[i18n.language] ||
                            eventItem.description.en}
                    </Markdown>

                    <TouchableOpacity
                        className={`p-4 rounded-lg items-center ${
                            isDark ? "bg-dark-primary" : "bg-primary"
                        }`}
                        onPress={handleBuyTicket}
                    >
                        <Text className="text-white font-mbold">
                            {t("events_details.buy_ticket")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EventDetailsScreen;
