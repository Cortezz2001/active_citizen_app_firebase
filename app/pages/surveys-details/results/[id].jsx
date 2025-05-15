import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useData } from "../../../../lib/datacontext";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../../../lib/firebase";

const SurveyResultsPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { surveys } = useData();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                setLoading(true);
                const surveyDoc = await getDoc(doc(firestore, "surveys", id));
                if (surveyDoc.exists()) {
                    setSurvey({ id: surveyDoc.id, ...surveyDoc.data() });
                } else {
                    setError(t("survey_not_found"));
                }
            } catch (err) {
                console.error("Error fetching survey:", err);
                setError(t("error_fetching_survey"));
            } finally {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [id, t]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#006FFD" />
            </View>
        );
    }

    if (error || !survey) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500">
                    {error || t("survey_not_found")}
                </Text>
            </View>
        );
    }

    // Placeholder for results UI
    return (
        <View className="flex-1 p-4 bg-secondary">
            <Text className="text-2xl font-mbold text-gray-800 mb-4">
                {survey.title[i18n.language] || survey.title.en}
            </Text>
            <Text className="text-gray-600 mb-4">
                {survey.description[i18n.language] || survey.description.en}
            </Text>
            {/* Add results UI here (e.g., charts, vote counts) */}
            <Text className="text-gray-500 mb-4">
                {t("results_ui_placeholder")}
            </Text>
            <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-full"
                onPress={() => router.back()}
            >
                <Text className="text-white font-mmedium text-center">
                    {t("back")}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default SurveyResultsPage;
