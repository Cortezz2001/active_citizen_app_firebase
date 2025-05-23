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
import { useData } from "../../../lib/datacontext";

const PetitionDetailsPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getDocument, addDocument, getCollection, updateDocument } =
        useFirestore();
    const { fetchPetitions } = useData();

    const [loading, setLoading] = useState(true);
    const [petition, setPetition] = useState(null);
    const [error, setError] = useState(null);
    const [hasSigned, setHasSigned] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchPetition = async () => {
        try {
            setLoading(true);
            const petitionData = await getDocument("petitions", id);

            if (!petitionData) {
                setError(t("petition.errors.not_found"));
                return;
            }

            // Load category information
            let categoryName = {
                en: "Unknown",
                ru: "Неизвестно",
                kz: "Белгісіз",
            };
            if (petitionData.categoryId) {
                let categoryId;
                if (typeof petitionData.categoryId === "string") {
                    // Handle string reference format: "petitions_categories/ID"
                    categoryId = petitionData.categoryId.split("/").pop();
                } else if (petitionData.categoryId?.id) {
                    // Handle object reference format: { id: "ID" }
                    categoryId = petitionData.categoryId.id;
                }

                if (categoryId) {
                    try {
                        const categoryDoc = await getDocument(
                            "petitions_categories",
                            categoryId
                        );
                        if (categoryDoc) {
                            categoryName = categoryDoc.name;
                        }
                    } catch (err) {
                        console.error("Error loading category:", err);
                    }
                }
            }

            // Check if user has already signed
            const userSignatures = await getCollection("petitions_signatures", [
                {
                    type: "where",
                    field: "petitionId",
                    operator: "==",
                    value: `/petitions/${id}`,
                },
                {
                    type: "where",
                    field: "userId",
                    operator: "==",
                    value: `/users/${user.uid}`,
                },
            ]);

            setHasSigned(userSignatures.length > 0);
            setPetition({
                ...petitionData,
                categoryName, // Add category name to petition data
            });
        } catch (err) {
            console.error("Error fetching petition:", err);
            setError(t("petition.errors.loading_failed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && user) {
            fetchPetition();
        }
    }, [id, user, t, i18n.language]);

    // Handle signing the petition
    const handleSignPetition = async () => {
        if (!user) {
            Toast.show({
                type: "error",
                text1: t("petition.toast.error.title"),
                text2: t("petition.toast.error.not_authenticated"),
            });
            return;
        }

        try {
            setSubmitting(true);

            // Calculate new signature count
            const newSignatureCount = (petition.totalSignatures || 0) + 1;

            // Check if petition should be marked as completed
            const newStatus =
                newSignatureCount >= petition.targetSignatures
                    ? "Completed"
                    : petition.status;

            // Update petition signature count and status if needed
            await updateDocument("petitions", id, {
                totalSignatures: newSignatureCount,
                status: newStatus,
                updatedAt: serverTimestamp(),
            });

            // Add signature
            await addDocument("petitions_signatures", {
                petitionId: `/petitions/${id}`,
                userId: `/users/${user.uid}`,
                createdAt: serverTimestamp(),
            });

            // Update local petition state to reflect changes immediately
            setPetition({
                ...petition,
                totalSignatures: newSignatureCount,
                status: newStatus,
            });

            // Refresh data in the background
            fetchPetitions();
            setHasSigned(true);

            Toast.show({
                type: "success",
                text1: t("petition.toast.success.title"),
                text2: t("petition.toast.success.signed"),
            });
        } catch (err) {
            console.error("Error signing petition:", err);
            Toast.show({
                type: "error",
                text1: t("petition.toast.error.title"),
                text2: t("petition.toast.error.signing_failed"),
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

    if (error || !petition) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text className="text-center font-mmedium text-lg mt-4 text-gray-800">
                    {error || t("petition.errors.loading_failed")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("petition.buttons.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const progressPercentage = Math.min(
        100,
        (petition.totalSignatures / petition.targetSignatures) * 100
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("petition.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <Text className="font-mbold text-2xl text-black">
                        {petition.title[i18n.language] || petition.title.en}
                    </Text>
                </View>

                {/* Category */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <Text className="font-mbold text-lg text-gray-800 mb-2">
                        {t("petition.category")}
                    </Text>
                    <Text className="text-gray-700 font-mregular">
                        {petition.categoryName?.[i18n.language] ||
                            petition.categoryName?.en ||
                            t("petition.unknown_category")}
                    </Text>
                </View>
                {/* Description */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <Text className="font-mbold text-lg text-gray-800 mb-2">
                        {t("petition.description")}
                    </Text>
                    <Text className="font-mregular text-gray-700 ">
                        {petition.description[i18n.language] ||
                            petition.description.en}
                    </Text>
                </View>

                {/* Problem */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <Text className="font-mbold text-lg text-gray-800 mb-2">
                        {t("petition.problem")}
                    </Text>
                    <Text className="font-mregular text-gray-700">
                        {petition.problem[i18n.language] || petition.problem.en}
                    </Text>
                </View>

                {/* Solution */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <Text className="font-mbold text-lg text-gray-800 mb-2">
                        {t("petition.solution")}
                    </Text>
                    <Text className="font-mregular text-gray-700">
                        {petition.solution[i18n.language] ||
                            petition.solution.en}
                    </Text>
                </View>

                {/* Progress Bar */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="people"
                                size={18}
                                color="#006FFD"
                            />
                            <Text className="ml-1 text-primary font-mmedium">
                                {petition.totalSignatures}{" "}
                                {t("petition.supporters")}
                            </Text>
                        </View>
                        <Text className="text-gray-500 font-mregular">
                            {t("petition.target")}: {petition.targetSignatures}
                        </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full w-full mt-1">
                        <View
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </View>
                </View>

                {/* Sign Button */}
                {petition.status !== "Completed" && (
                    <TouchableOpacity
                        className={`mt-2 mb-6 py-4 rounded-lg items-center justify-center ${
                            !hasSigned && !submitting
                                ? "bg-primary"
                                : "bg-gray-300"
                        }`}
                        onPress={handleSignPetition}
                        disabled={hasSigned || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="font-mbold text-white text-center">
                                {hasSigned
                                    ? t("petition.buttons.already_signed")
                                    : t("petition.buttons.sign")}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}

                {/* Petition Status */}
                {petition.status === "Completed" && (
                    <View className="mt-2 mb-6 flex-row items-center justify-center ">
                        <View className="px-6 py-2 rounded-full bg-green-100 flex-row items-center">
                            <MaterialIcons
                                name="check-circle"
                                size={16}
                                color="#047857"
                            />
                            <Text className="ml-1 text-sm font-mmedium text-green-700">
                                {t("petition.status.completed")}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PetitionDetailsPage;
