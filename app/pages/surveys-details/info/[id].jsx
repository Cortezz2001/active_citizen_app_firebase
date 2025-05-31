import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../../../lib/firebase";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoadingIndicator from "../../../../components/LoadingIndicator";
import { useTheme } from "../../../../lib/themeContext";

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
        darkBg: "bg-yellow-900",
        darkText: "text-yellow-200",
        darkIconColor: "#FBBF24",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
        darkBg: "bg-red-900",
        darkText: "text-red-200",
        darkIconColor: "#F87171",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
        darkBg: "bg-green-900",
        darkText: "text-green-200",
        darkIconColor: "#34D399",
    },
    Published: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "public",
        iconColor: "#1D4ED8",
        darkBg: "bg-blue-900",
        darkText: "text-blue-200",
        darkIconColor: "#60A5FA",
    },
};

const SurveyDetailPage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDark } = useTheme();
    const [survey, setSurvey] = useState(null);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchSurveyDetails();
        }
    }, [id, i18n.language]);

    const fetchSurveyDetails = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(firestore, "surveys", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const surveyData = docSnap.data();
                setSurvey(surveyData);

                // Fetch category details
                if (surveyData.categoryId) {
                    const categorySnap = await getDoc(surveyData.categoryId);
                    if (categorySnap.exists()) {
                        setCategory(categorySnap.data());
                    }
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: t("survey.error"),
                    text2: t("survey.survey_not_found"),
                });
                router.back();
            }
        } catch (error) {
            console.error("Error fetching survey details:", error);
            Toast.show({
                type: "error",
                text1: t("survey.error"),
                text2: t("survey.failed_to_load_survey"),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
        return date.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return <LoadingIndicator isDark={isDark} />;
    }

    if (!survey) {
        return (
            <SafeAreaView
                className={`flex-1 justify-center items-center p-4 ${
                    isDark ? "bg-dark-background" : "bg-white"
                }`}
            >
                <StatusBar style={isDark ? "light" : "dark"} />
                <MaterialIcons
                    name="error-outline"
                    size={64}
                    color={isDark ? "#FF6B6B" : "#EF4444"}
                />
                <Text
                    className={`text-center font-mmedium text-lg mt-4 ${
                        isDark ? "text-dark-text-primary" : "text-gray-800"
                    }`}
                >
                    {t("survey.survey_not_found")}
                </Text>
                <TouchableOpacity
                    className={`mt-6 px-6 py-3 rounded-full ${
                        isDark ? "bg-dark-primary" : "bg-primary"
                    }`}
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("survey.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusColor = statusColors[survey.status] || {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "help",
        iconColor: "#374151",
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    };

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center border-b ${
                    isDark
                        ? "bg-dark-background border-dark-border"
                        : "bg-white border-gray-200"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("survey.back_button")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <View className="flex-row items-start">
                        <Text
                            className={`font-mbold text-2xl flex-1 mr-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {survey.title[i18n.language] || survey.title.en}
                        </Text>
                        <View
                            className={`px-1 py-1 rounded-full ${
                                isDark ? statusColor.darkBg : statusColor.bg
                            } mt-1`}
                        >
                            <MaterialIcons
                                name={statusColor.icon}
                                size={16}
                                color={
                                    isDark
                                        ? statusColor.darkIconColor
                                        : statusColor.iconColor
                                }
                            />
                        </View>
                    </View>
                </View>
                {/* Rejection Reason */}
                {survey.status === "Rejected" && survey.rejectionReason && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-red-900 border-red-700"
                                : "bg-red-100 border-red-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="info"
                                size={20}
                                color={isDark ? "#F87171" : "#B91C1C"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark ? "text-red-200" : "text-gray-800"
                                }`}
                            >
                                {t("survey.rejection_reason")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark ? "text-red-100" : "text-gray-700"
                            }`}
                        >
                            {survey.rejectionReason?.[i18n.language] ||
                                survey.rejectionReason?.en ||
                                t("survey.no_reason_provided")}
                        </Text>
                    </View>
                )}
                {/* Category */}
                {category && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("survey.category")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {category.name?.[i18n.language] ||
                                category.name?.en ||
                                ""}
                        </Text>
                    </View>
                )}
                {/* Description */}
                <View
                    className={`rounded-lg p-4 mb-4 shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="description"
                            size={20}
                            color={isDark ? "#B3B3B3" : "#212938"}
                        />
                        <Text
                            className={`font-mbold text-lg ml-2 ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-800"
                            }`}
                        >
                            {t("survey.description")}
                        </Text>
                    </View>
                    <Text
                        className={`font-mregular ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {survey.description?.[i18n.language] ||
                            survey.description?.en ||
                            ""}
                    </Text>
                </View>

                {/* Created Date */}
                {survey.createdAt && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="schedule"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("survey.created_date")}
                            </Text>
                        </View>
                        <Text
                            className={`ml-3 font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {formatDate(survey.createdAt)}
                        </Text>
                    </View>
                )}
                {/* Total Votes */}
                {(survey.status === "Published" ||
                    survey.status === "Completed") && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="how-to-vote"
                                size={20}
                                color={isDark ? "#60A5FA" : "#006FFD"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("survey.total_votes")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {survey.totalVotes || 0} {t("survey.votes_label")}
                        </Text>
                    </View>
                )}
                {/* Questions */}
                {survey.questions && survey.questions.length > 0 && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="question-answer"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("survey.questions")} (
                                {survey.questions.length})
                            </Text>
                        </View>
                        {survey.questions.map((question, index) => (
                            <View key={index} className="mb-4">
                                <Text
                                    className={`font-mmedium mb-2 ${
                                        isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {t("survey.question_label", {
                                        index: index + 1,
                                    })}
                                    :{" "}
                                    {question.questionText[i18n.language] ||
                                        question.questionText.en}
                                </Text>
                                <Text
                                    className={`font-mregular mb-2 ${
                                        isDark
                                            ? "text-dark-text-muted"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {t(
                                        `survey.question_types.${question.type}`
                                    )}
                                </Text>
                                {question.options.map((option, optIndex) => (
                                    <View
                                        key={optIndex}
                                        className="flex-row items-center mb-1"
                                    >
                                        <MaterialIcons
                                            name={
                                                question.type ===
                                                "single_choice"
                                                    ? "radio-button-unchecked"
                                                    : "check-box-outline-blank"
                                            }
                                            size={16}
                                            color={
                                                isDark ? "#666666" : "#6B7280"
                                            }
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text
                                            className={`font-mregular ${
                                                isDark
                                                    ? "text-dark-text-secondary"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {option[i18n.language] || option.en}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SurveyDetailPage;
