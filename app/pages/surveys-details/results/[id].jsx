import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { useFirestore } from "@/hooks/useFirestore";
import { PieChart } from "react-native-chart-kit";

const SurveyResultsPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { getDocument, getCollection } = useFirestore();

    const [loading, setLoading] = useState(true);
    const [survey, setSurvey] = useState(null);
    const [results, setResults] = useState([]);
    const [processedResults, setProcessedResults] = useState([]);
    const [error, setError] = useState(null);
    const screenWidth = Dimensions.get("window").width - 40; // Account for padding

    // Fetch the survey data and results
    useEffect(() => {
        const fetchSurveyAndResults = async () => {
            try {
                setLoading(true);
                // Get survey details
                const surveyData = await getDocument("surveys", id);
                if (!surveyData) {
                    setError(t("results.errors.survey_not_found"));
                    return;
                }
                setSurvey(surveyData);

                // Get all results for this survey
                const surveyResults = await getCollection("surveys_results", [
                    {
                        type: "where",
                        field: "surveyId",
                        operator: "==",
                        value: `/surveys/${id}`,
                    },
                ]);
                setResults(surveyResults);

                // Process results for visualization
                processResults(surveyData, surveyResults);
            } catch (err) {
                console.error("Error fetching survey results:", err);
                setError(t("results.errors.loading_failed"));
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSurveyAndResults();
        }
    }, [id, t, i18n.language]);

    // Process survey results for visualization
    const processResults = (surveyData, resultsData) => {
        if (!surveyData || !resultsData || resultsData.length === 0) {
            return;
        }

        const processed = surveyData.questions.map((question, qIndex) => {
            // Initialize counts for each option
            const optionCounts = {};
            question.options.forEach((_, optIndex) => {
                optionCounts[optIndex] = 0;
            });

            // Count responses for each option
            resultsData.forEach((resultDoc) => {
                const questionResult = resultDoc.results.find(
                    (r) => r.questionIndex === qIndex
                );
                if (questionResult && questionResult.responses) {
                    Object.keys(questionResult.responses).forEach(
                        (optIndex) => {
                            optionCounts[parseInt(optIndex)] +=
                                questionResult.responses[optIndex];
                        }
                    );
                }
            });

            // Total responses for percentage calculation
            const totalResponses = Object.values(optionCounts).reduce(
                (sum, count) => sum + count,
                0
            );

            // Prepare data for charts
            const chartData = question.options.map((option, optIndex) => {
                const count = optionCounts[optIndex] || 0;
                const percentage =
                    totalResponses > 0
                        ? Math.round((count / totalResponses) * 100)
                        : 0;

                return {
                    optionText: option[i18n.language] || option.en,
                    count,
                    percentage,
                    // Pie chart data format
                    name: `${percentage}%`,
                    value: count,
                    color: getChartColor(optIndex),
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                };
            });

            return {
                questionText:
                    question.questionText[i18n.language] ||
                    question.questionText.en,
                type: question.type,
                totalResponses,
                chartData,
            };
        });

        setProcessedResults(processed);
    };

    // Get colors for chart elements
    const getChartColor = (index) => {
        const colors = [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#8AC054",
            "#5DA5DA",
            "#FAA43A",
            "#60BD68",
        ];
        return colors[index % colors.length];
    };

    // Charts configuration
    const chartConfig = {
        backgroundGradientFrom: "#FFFFFF",
        backgroundGradientTo: "#FFFFFF",
        color: (opacity = 1) => `rgba(0, 111, 253, ${opacity})`,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
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
                    {error || t("results.errors.loading_failed")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("results.buttons.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (results.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar style="dark" />
                <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mr-4"
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                    <Text
                        className="text-2xl font-mbold text-black"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                    >
                        {t("results.title")}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center p-4">
                    <MaterialIcons name="bar-chart" size={64} color="#9CA3AF" />
                    <Text className="text-center font-mmedium text-lg mt-4 text-gray-800">
                        {t("results.no_responses")}
                    </Text>
                </View>
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
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("results.title")}
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Survey Title and Statistics */}
                <View className="mb-6">
                    <Text className="font-mbold text-2xl text-black mb-2">
                        {survey.title[i18n.language] || survey.title.en}
                    </Text>
                    <Text className="font-mregular text-gray-700 mb-4">
                        {survey.description[i18n.language] ||
                            survey.description.en}
                    </Text>

                    <View className="flex-row justify-between items-center bg-blue-50 p-4 rounded-lg mb-2">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="how-to-vote"
                                size={24}
                                color="#006FFD"
                            />
                            <Text className="font-msemibold text-gray-700 ml-2">
                                {t("results.total_participants")}
                            </Text>
                        </View>
                        <Text className="font-mbold text-xl text-primary">
                            {survey.totalVotes || 0}
                        </Text>
                    </View>
                </View>

                {/* Question Results */}
                {processedResults.map((questionResult, qIndex) => (
                    <View
                        key={qIndex}
                        className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200"
                    >
                        <View className="mb-4">
                            <Text className="font-msemibold text-lg text-gray-800">
                                {`${qIndex + 1}. ${
                                    questionResult.questionText
                                }`}
                            </Text>
                            <Text className="text-gray-500 text-sm mt-1">
                                {questionResult.type === "single_choice"
                                    ? t("results.question_types.single_choice")
                                    : t(
                                          "results.question_types.multiple_choice"
                                      )}
                                {" • "}
                                {questionResult.totalResponses}{" "}
                                {t("results.responses")}
                            </Text>
                        </View>

                        {/* Pie Chart */}
                        <View className="items-center justify-center mb-4">
                            <PieChart
                                data={questionResult.chartData}
                                width={screenWidth}
                                height={200}
                                chartConfig={chartConfig}
                                accessor="value"
                                backgroundColor="transparent"
                                paddingLeft={screenWidth / 4}
                                absolute
                                hasLegend={false}
                                center={[0, 0]}
                            />
                        </View>
                        {/* Detailed results list */}
                        <View>
                            {questionResult.chartData.map((item, optIndex) => (
                                <View
                                    key={optIndex}
                                    className="flex-row justify-between items-center p-3 mb-2 bg-ghostwhite rounded-md border border-gray-100"
                                >
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                            className="h-3 w-3 rounded-full mr-2"
                                        />
                                        <Text
                                            className="font-mregular text-gray-800"
                                            numberOfLines={2}
                                        >
                                            {item.optionText}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="font-mmedium text-gray-700 mr-2">
                                            {item.count}
                                        </Text>
                                        <View className="bg-gray-200 px-2 py-1 rounded-full">
                                            <Text className="text-xs font-mregular text-gray-700">
                                                {item.percentage}%
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Share Results Button */}
                <TouchableOpacity
                    className="mb-8 py-4 rounded-lg items-center justify-center bg-primary"
                    onPress={() => {
                        // Implement share functionality here
                        alert(t("results.share_not_implemented"));
                    }}
                >
                    <View className="flex-row items-center justify-center">
                        <MaterialIcons
                            name="share"
                            size={20}
                            color="white"
                            style={{ marginRight: 8 }}
                        />
                        <Text className="font-mbold text-white text-center">
                            {t("results.buttons.share_results")}
                        </Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SurveyResultsPage;
