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
import { useTheme } from "../../../../lib/themeContext";
import LoadingIndicator from "../../../../components/LoadingIndicator";

const VoteSurveyPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getDocument, addDocument, updateDocument, getCollection } =
        useFirestore();
    const { fetchSurveys, fetchUserSurveys } = useData();
    const { isDark } = useTheme();

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    // Fetch the survey data
    useEffect(() => {
        const fetchSurveyAndUserVote = async () => {
            try {
                setLoading(true);
                const surveyData = await getDocument("surveys", id);

                if (!surveyData) {
                    setError(t("surveys_details_vote.errors.survey_not_found"));
                    return;
                }

                setSurvey(surveyData);

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
                    // User has voted, fetch their answers
                    const userVote = userVotes[0];
                    const previousAnswers = {};
                    userVote.results.forEach((result) => {
                        const questionIndex = result.questionIndex;
                        if (
                            surveyData.questions[questionIndex].type ===
                            "single_choice"
                        ) {
                            const selectedOption = Object.keys(
                                result.responses
                            )[0];
                            previousAnswers[questionIndex] =
                                parseInt(selectedOption);
                        } else if (
                            surveyData.questions[questionIndex].type ===
                            "multiple_choice"
                        ) {
                            previousAnswers[questionIndex] = {};
                            Object.keys(result.responses).forEach(
                                (optionIndex) => {
                                    previousAnswers[questionIndex][
                                        parseInt(optionIndex)
                                    ] = true;
                                }
                            );
                        }
                    });
                    setAnswers(previousAnswers);
                    setHasVoted(true);
                } else {
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
                    setHasVoted(false);
                }
            } catch (err) {
                console.error("Error fetching survey or user vote:", err);
                setError(t("surveys_details_vote.errors.loading_failed"));
            } finally {
                setLoading(false);
            }
        };

        if (id && user) {
            fetchSurveyAndUserVote();
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
                text1: t("surveys_details_vote.toast.error.title"),
                text2: t(
                    "surveys_details_vote.toast.error.answer_all_questions"
                ),
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
            await Promise.all([fetchSurveys(), fetchUserSurveys()]);
            Toast.show({
                type: "success",
                text1: t("surveys_details_vote.toast.success.title"),
                text2: t("surveys_details_vote.toast.success.vote_submitted"),
            });
            router.back();
        } catch (err) {
            console.error("Error submitting vote:", err);
            Toast.show({
                type: "error",
                text1: t("surveys_details_vote.toast.error.title"),
                text2: t("surveys_details_vote.toast.error.submission_failed"),
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingIndicator isDark={isDark} />;
    }

    if (error || !survey) {
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
                    {error || t("surveys_details_vote.errors.loading_failed")}
                </Text>
                <TouchableOpacity
                    className={`mt-6 px-6 py-3 rounded-full ${
                        isDark ? "bg-dark-primary" : "bg-primary"
                    }`}
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("surveys_details_vote.buttons.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

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
                    accessibilityLabel={t("surveys_details_vote.back_button")}
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
                {/* Survey Title */}
                <View className="mb-2 mt-4">
                    <Text
                        className={`font-mbold text-2xl ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {survey.title[i18n.language] || survey.title.en}
                    </Text>
                </View>

                {/* Survey Description */}
                <View className="mb-6">
                    <Text
                        className={`font-mregular ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {survey.description[i18n.language] ||
                            survey.description.en}
                    </Text>
                </View>

                {/* Questions */}
                {survey.questions.map((question, questionIndex) => (
                    <View
                        key={questionIndex}
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <Text
                            className={`font-msemibold text-lg mb-3 ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-800"
                            }`}
                        >
                            {question.questionText[i18n.language] ||
                                question.questionText.en}
                        </Text>

                        {/* Question Type Indicator */}
                        <View className="mb-3">
                            <Text
                                className={`text-xs font-mlight ${
                                    isDark
                                        ? "text-dark-text-muted"
                                        : "text-gray-500"
                                }`}
                            >
                                {question.type === "single_choice"
                                    ? t(
                                          "surveys_details_vote.question_types.single_choice_instruction"
                                      )
                                    : t(
                                          "surveys_details_vote.question_types.multiple_choice_instruction"
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
                                            ? isDark
                                                ? "border-dark-primary bg-dark-surface"
                                                : "border-primary bg-blue-50"
                                            : isDark
                                            ? "border-dark-border bg-dark-surface"
                                            : "border-gray-200 bg-ghostwhite"
                                        : answers[questionIndex]?.[optionIndex]
                                        ? isDark
                                            ? "border-dark-primary bg-dark-surface"
                                            : "border-primary bg-blue-50"
                                        : isDark
                                        ? "border-dark-border bg-dark-surface"
                                        : "border-gray-200 bg-ghostwhite"
                                }`}
                                onPress={() =>
                                    !hasVoted &&
                                    (question.type === "single_choice"
                                        ? handleSingleChoice(
                                              questionIndex,
                                              optionIndex
                                          )
                                        : handleMultipleChoice(
                                              questionIndex,
                                              optionIndex
                                          ))
                                }
                                disabled={hasVoted}
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
                                            ? isDark
                                                ? "#0066E6"
                                                : "#006FFD"
                                            : isDark
                                            ? "#666666"
                                            : "#6B7280"
                                    }
                                    style={{ marginRight: 12 }}
                                />
                                <Text
                                    className={`font-mregular flex-1 ${
                                        isDark
                                            ? "text-dark-text-primary"
                                            : "text-gray-800"
                                    }`}
                                >
                                    {option[i18n.language] || option.en}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}

                {/* Submit Button */}
                <TouchableOpacity
                    className={`mb-8 py-4 rounded-lg items-center justify-center ${
                        hasVoted
                            ? isDark
                                ? "bg-dark-border"
                                : "bg-gray-300"
                            : isFormValid() && !submitting
                            ? isDark
                                ? "bg-dark-primary"
                                : "bg-primary"
                            : isDark
                            ? "bg-dark-border"
                            : "bg-gray-300"
                    }`}
                    onPress={!hasVoted ? submitVote : null}
                    disabled={hasVoted || submitting}
                >
                    {hasVoted ? (
                        <Text
                            className={`font-mbold ${
                                isDark ? "text-dark-text-primary" : "text-white"
                            } text-center`}
                        >
                            {t("surveys_details_vote.buttons.already_voted")}
                        </Text>
                    ) : submitting ? (
                        <ActivityIndicator
                            size="small"
                            color={isDark ? "#0066E6" : "white"}
                        />
                    ) : (
                        <Text
                            className={`font-mbold ${
                                isDark ? "text-dark-text-primary" : "text-white"
                            } text-center`}
                        >
                            {t("surveys_details_vote.buttons.submit_vote")}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default VoteSurveyPage;
