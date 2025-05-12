import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Linking,
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

const EventDetailsScreen = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getDocument } = useFirestore();

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

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error || !eventItem) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />
                <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white shadow-sm">
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
                        {t("event_not_found")}
                    </Text>
                    <Text className="text-gray-500 mt-2 text-center">
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between border-b border-gray-200 bg-white shadow-sm">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    accessibilityLabel={t("back")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <Image
                    source={{ uri: eventItem.imageUrl }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                <View className="bg-white rounded-xl -mt-6 p-6 ">
                    <Text className="text-2xl font-mbold text-gray-900 mb-3">
                        {eventItem.title[i18n.language] || eventItem.title.en}
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {t("category")}:{" "}
                                {eventItem.categoryName[i18n.language] ||
                                    eventItem.categoryName.en}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="event"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {t("date")}:{" "}
                                {new Date(
                                    eventItem.date.toDate()
                                ).toLocaleDateString(i18n.language)}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="location-on"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {t("location")}:{" "}
                                {eventItem.location.name[i18n.language] ||
                                    eventItem.location.name.en}
                                ,{" "}
                                {eventItem.location.address[i18n.language] ||
                                    eventItem.location.address.en}
                            </Text>
                        </View>
                    </View>

                    <Markdown
                        style={markdownStyles}
                        mergeStyle={false}
                        rules={markdownRules}
                    >
                        {eventItem.description[i18n.language] ||
                            eventItem.description.en}
                    </Markdown>

                    <TouchableOpacity
                        className="bg-primary p-4 rounded-lg items-center"
                        onPress={handleBuyTicket}
                    >
                        <Text className="text-white font-mbold">
                            {t("buy_ticket")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EventDetailsScreen;
