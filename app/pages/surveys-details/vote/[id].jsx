import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useFirestore } from "@/hooks/useFirestore";
import { serverTimestamp } from "firebase/firestore";
import { useData } from "../../../../lib/datacontext";

const VoteSurveyPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getDocument, addDocument, updateDocument, getCollection } =
        useFirestore();
    const { fetchSurveys } = useData();

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch the survey data
    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                setLoading(true);
                const surveyData = await getDocument("surveys", id);

                if (!surveyData) {
                    setError(t("vote.errors.survey_not_found"));
                    return;
                }

                // Check if user has already voted
                const userVotes = await getCollection("surveys_results", [
                    {
                        type: "where",
                        field: "surveyId",
                        operator: "==",
                        value: `/surveys/${id}`,
                    },
                    {
                        type: "where",
                        field: "userId",
                        operator: "==",
                        value: `/users/${user.uid}`,
                    },
                ]);

                if (userVotes.length > 0) {
                    router.back();
                    return;
                }

                setSurvey(surveyData);

                // Initialize answers structure
                const initialAnswers = {};
                surveyData.questions.forEach((question, index) => {
                    if (question.type === "multiple_choice") {
                        initialAnswers[index] = {};
                    } else {
                        initialAnswers[index] = null;
                    }
                });
                setAnswers(initialAnswers);
            } catch (err) {
                console.error("Error fetching survey:", err);
                setError(t("vote.errors.loading_failed"));
            } finally {
                setLoading(false);
            }
        };

        if (id && user) {
            fetchSurvey();
        }
    }, [id, user, t, i18n.language]);

    // Handle selection for single choice questions
    const handleSingleChoice = (questionIndex, optionIndex) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex,
        }));
    };

    // Handle selection for multiple choice questions
    const handleMultipleChoice = (questionIndex, optionIndex) => {
        setAnswers((prev) => {
            const currentSelections = prev[questionIndex] || {};

            // Toggle selection
            return {
                ...prev,
                [questionIndex]: {
                    ...currentSelections,
                    [optionIndex]: !currentSelections[optionIndex],
                },
            };
        });
    };

    // Check if form is valid before submission
    const isFormValid = () => {
        if (!survey) return false;

        // Check if all questions have been answered
        for (let i = 0; i < survey.questions.length; i++) {
            const questionType = survey.questions[i].type;
            const answer = answers[i];

            if (questionType === "single_choice") {
                if (answer === null || answer === undefined) {
                    return false;
                }
            } else if (questionType === "multiple_choice") {
                const hasSelection =
                    answer &&
                    Object.values(answer).some((selected) => selected === true);
                if (!hasSelection) {
                    return false;
                }
            }
        }

        return true;
    };

    // Submit the survey vote
    const submitVote = async () => {
        if (!isFormValid()) {
            Toast.show({
                type: "error",
                text1: t("vote.toast.error.title"),
                text2: t("vote.toast.error.answer_all_questions"),
            });
            return;
        }

        try {
            setSubmitting(true);

            // Format answers for submission
            const formattedResults = [];

            Object.keys(answers).forEach((questionIndex) => {
                const idx = parseInt(questionIndex);
                const questionType = survey.questions[idx].type;
                const answer = answers[idx];

                const responseObj = {
                    questionIndex: idx,
                    responses: {},
                };

                if (questionType === "single_choice") {
                    responseObj.responses[answer] = 1;
                } else if (questionType === "multiple_choice") {
                    Object.keys(answer).forEach((optionIdx) => {
                        if (answer[optionIdx]) {
                            responseObj.responses[optionIdx] = 1;
                        }
                    });
                }

                formattedResults.push(responseObj);
            });

            // Create the survey response document
            await addDocument("surveys_results", {
                surveyId: `/surveys/${id}`,
                userId: `/users/${user.uid}`,
                results: formattedResults,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Update the survey's total votes
            await updateDocument("surveys", id, {
                totalVotes: (survey.totalVotes || 0) + 1,
                updatedAt: serverTimestamp(),
            });

            // Navigate to results page
            await fetchSurveys();
            Toast.show({
                type: "success",
                text1: t("vote.toast.success.title"),
                text2: t("vote.toast.success.vote_submitted"),
            });
            router.back();
        } catch (err) {
            console.error("Error submitting vote:", err);
            Toast.show({
                type: "error",
                text1: t("vote.toast.error.title"),
                text2: t("vote.toast.error.submission_failed"),
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#006FFD" />
            </SafeAreaView>
        );
    }

    if (error || !survey) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text className="text-center font-mmedium text-lg mt-4 text-gray-800">
                    {error || t("vote.errors.loading_failed")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("vote.buttons.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("vote.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("vote.title")}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Survey Title */}
                <View className="mb-2 mt-4">
                    <Text className="font-mbold text-2xl text-black">
                        {survey.title[i18n.language] || survey.title.en}
                    </Text>
                </View>

                {/* Survey Description */}
                <View className="mb-6">
                    <Text className="font-mregular text-gray-700">
                        {survey.description[i18n.language] ||
                            survey.description.en}
                    </Text>
                </View>

                {/* Questions */}
                {survey.questions.map((question, questionIndex) => (
                    <View
                        key={questionIndex}
                        className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200"
                    >
                        <Text className="font-msemibold text-lg text-gray-800 mb-3">
                            {question.questionText[i18n.language] ||
                                question.questionText.en}
                        </Text>

                        {/* Question Type Indicator */}
                        <View className="mb-3">
                            <Text className="text-xs font-mlight text-gray-500">
                                {question.type === "single_choice"
                                    ? t(
                                          "vote.question_types.single_choice_instruction"
                                      )
                                    : t(
                                          "vote.question_types.multiple_choice_instruction"
                                      )}
                            </Text>
                        </View>

                        {/* Options */}
                        {question.options.map((option, optionIndex) => (
                            <TouchableOpacity
                                key={optionIndex}
                                className={`flex-row items-center p-3 mb-2 rounded-md border ${
                                    question.type === "single_choice"
                                        ? answers[questionIndex] === optionIndex
                                            ? "border-primary bg-blue-50"
                                            : "border-gray-200 bg-ghostwhite"
                                        : answers[questionIndex]?.[optionIndex]
                                        ? "border-primary bg-blue-50"
                                        : "border-gray-200 bg-ghostwhite"
                                }`}
                                onPress={() =>
                                    question.type === "single_choice"
                                        ? handleSingleChoice(
                                              questionIndex,
                                              optionIndex
                                          )
                                        : handleMultipleChoice(
                                              questionIndex,
                                              optionIndex
                                          )
                                }
                            >
                                <MaterialIcons
                                    name={
                                        question.type === "single_choice"
                                            ? answers[questionIndex] ===
                                              optionIndex
                                                ? "radio-button-checked"
                                                : "radio-button-unchecked"
                                            : answers[questionIndex]?.[
                                                  optionIndex
                                              ]
                                            ? "check-box"
                                            : "check-box-outline-blank"
                                    }
                                    size={24}
                                    color={
                                        (question.type === "single_choice" &&
                                            answers[questionIndex] ===
                                                optionIndex) ||
                                        (question.type === "multiple_choice" &&
                                            answers[questionIndex]?.[
                                                optionIndex
                                            ])
                                            ? "#006FFD"
                                            : "#6B7280"
                                    }
                                    style={{ marginRight: 12 }}
                                />
                                <Text className="font-mregular text-gray-800 flex-1">
                                    {option[i18n.language] || option.en}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Submit Button */}
                <TouchableOpacity
                    className={`mb-8 py-4 rounded-lg items-center justify-center ${
                        isFormValid() && !submitting
                            ? "bg-primary"
                            : "bg-gray-300"
                    }`}
                    onPress={submitVote}
                    disabled={!isFormValid() || submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text className="font-mbold text-white text-center">
                            {t("vote.buttons.submit_vote")}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default VoteSurveyPage;
