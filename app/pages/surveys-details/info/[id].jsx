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

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
    },
    Published: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: "public",
        iconColor: "#1D4ED8",
    },
};

const SurveyDetailPage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
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
        return <LoadingIndicator />;
    }

    if (!survey) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text className="text-center font-mmedium text-lg mt-4 text-gray-800">
                    {t("survey.survey_not_found")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
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
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("survey.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("survey.details_title")}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <Text className="font-mbold text-2xl text-black mb-1">
                        {survey.title?.[i18n.language] ||
                            survey.title?.en ||
                            ""}
                    </Text>
                    <View
                        className={`mt-2 px-2 py-1 rounded-full flex-row items-center ${statusColor.bg}`}
                    >
                        <MaterialIcons
                            name={statusColor.icon}
                            size={16}
                            color={statusColor.iconColor}
                        />
                        <Text
                            className={`ml-1 text-sm font-mmedium ${statusColor.text}`}
                        >
                            {t`\survey.status.${survey.status.toLowerCase()}`}
                        </Text>
                    </View>
                </View>

                {/* Rejection Reason */}
                {survey.status === "Rejected" && survey.rejectionReason && (
                    <View className="bg-red-100 rounded-lg p-4 mb-4 shadow-sm border border-red-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="info"
                                size={20}
                                color="#B91C1C"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("survey.rejection_reason")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {survey.rejectionReason?.[i18n.language] ||
                                survey.rejectionReason?.en ||
                                t("survey.no_reason_provided")}
                        </Text>
                    </View>
                )}

                {/* Category */}
                {category && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("survey.category")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {category.name?.[i18n.language] ||
                                category.name?.en ||
                                ""}
                        </Text>
                    </View>
                )}

                {/* Description */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="description"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("survey.description")}
                        </Text>
                    </View>
                    <Text className="font-mregular text-gray-700">
                        {survey.description?.[i18n.language] ||
                            survey.description?.en ||
                            ""}
                    </Text>
                </View>

                {/* Created Date */}
                {survey.createdAt && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="schedule"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("survey.created_date")}
                            </Text>
                        </View>
                        <Text className="ml-3 text-gray-700 font-mregular">
                            {formatDate(survey.createdAt)}
                        </Text>
                    </View>
                )}

                {/* Total Votes */}
                {(survey.status === "Published" ||
                    survey.status === "Completed") && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="how-to-vote"
                                size={20}
                                color="#006FFD"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("survey.total_votes")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {survey.totalVotes || 0} {t("survey.votes_label")}
                        </Text>
                    </View>
                )}

                {/* Questions */}
                {survey.questions && survey.questions.length > 0 && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="question-answer"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("survey.questions")} (
                                {survey.questions.length})
                            </Text>
                        </View>
                        {survey.questions.map((question, index) => (
                            <View key={index} className="mb-4">
                                <Text className="font-mmedium text-gray-700 mb-2">
                                    {t("survey.question_label", {
                                        index: index + 1,
                                    })}
                                    :{" "}
                                    {question.questionText[i18n.language] ||
                                        question.questionText.en}
                                </Text>
                                <Text className="text-gray-500 font-mregular mb-2">
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
                                            color="#6B7280"
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text className="text-gray-700 font-mregular">
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
