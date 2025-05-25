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

// Цвета для статусов
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

const PetitionDetailsPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { getDocument, addDocument, getCollection, updateDocument } =
        useFirestore();
    const { fetchUserPetitions } = useData();

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
                setError(t("my_petitions.errors.not_found"));
                return;
            }

            // Получение информации о категории
            let categoryName = {
                en: "Unknown",
                ru: "Неизвестно",
                kz: "Белгісіз",
            };
            if (petitionData.categoryId) {
                let categoryId;
                if (typeof petitionData.categoryId === "string") {
                    // Обработка строкового формата: "petitions_categories/ID"
                    categoryId = petitionData.categoryId.split("/").pop();
                } else if (petitionData.categoryId) {
                    // Обработка объектного формата: { id: "ID" }
                    categoryId = petitionData.categoryId?.id;
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

            // Проверка, подписал ли пользователь
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
                categoryName, // Добавление имени категории в данные петиции
            });
        } catch (err) {
            console.error("Error fetching petition:", err);
            setError(t("my_petitions.errors.loading_failed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && user) {
            fetchPetition();
        }
    }, [id, user, t, i18n.language]);

    // Обработка подписания петиции
    const handleSignPetition = async () => {
        if (!user) {
            Toast.show({
                type: "error",
                text1: t("my_petitions.toast.error.title"),
                text2: t("my_petitions.toast.error.not_authenticated"),
            });
            return;
        }

        try {
            setSubmitting(true);

            // Расчет нового количества подписей
            const newSignatureCount = (petition.totalSignatures || 0) + 1;

            // Проверка, нужно ли пометить петицию как завершенную
            const newStatus =
                newSignatureCount >= petition.targetSignatures
                    ? "Completed"
                    : petition.status;

            // Обновление количества подписей и статуса петиции
            await updateDocument("petitions", id, {
                totalSignatures: newSignatureCount,
                status: newStatus,
                updatedAt: serverTimestamp(),
            });

            // Добавление подписи
            await addDocument("petitions_signatures", {
                petitionId: `/petitions/${id}`,
                userId: `/users/${user.uid}`,
                createdAt: serverTimestamp(),
            });

            // Обновление локального состояния петиции
            setPetition({
                ...petition,
                totalSignatures: newSignatureCount,
                status: newStatus,
            });

            // Обновление данных в фоновом режиме
            fetchUserPetitions();
            setHasSigned(true);

            Toast.show({
                type: "success",
                text1: t("my_petitions.toast.success.title"),
                text2: t("my_petitions.toast.success.signed"),
            });
        } catch (err) {
            console.error("Error signing petition:", err);
            Toast.show({
                type: "error",
                text1: t("my_petitions.toast.error.title"),
                text2: t("my_petitions.toast.error.signing_failed"),
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
                    {error || t("my_petitions.errors.loading_failed")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("my_petitions.buttons.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusColor = statusColors[petition.status] || {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "help",
        iconColor: "#374151",
    };

    const progressPercentage = Math.min(
        100,
        ((petition.totalSignatures || 0) / petition.targetSignatures) * 100
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("my_petitions.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <View className="flex-row items-center">
                        <Text className="font-mbold text-2xl text-black mr-2">
                            {petition.title[i18n.language] || petition.title.en}
                        </Text>
                        <View
                            className={`px-1 py-1 rounded-full ${statusColor.bg}`}
                        >
                            <MaterialIcons
                                name={statusColor.icon}
                                size={16}
                                color={statusColor.iconColor}
                            />
                        </View>
                    </View>
                </View>
                {/* Причина отклонения */}
                {petition.status === "Rejected" && petition.rejectionReason && (
                    <View className="bg-red-100 rounded-lg p-4 mb-4 shadow-sm border border-red-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="info"
                                size={20}
                                color="#B91C1C"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("my_petitions.rejection_reason")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {petition.rejectionReason?.[i18n.language] ||
                                petition.rejectionReason?.en ||
                                t("my_petitions.no_reason_provided")}
                        </Text>
                    </View>
                )}

                {/* Категория */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="category"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("my_petitions.category")}
                        </Text>
                    </View>
                    <Text className="text-gray-700 font-mregular">
                        {petition.categoryName?.[i18n.language] ||
                            petition.categoryName?.en ||
                            t("my_petitions.unknown_category")}
                    </Text>
                </View>

                {/* Описание */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="description"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("my_petitions.description")}
                        </Text>
                    </View>
                    <Text className="font-mregular text-gray-700">
                        {petition.description[i18n.language] ||
                            petition.description.en}
                    </Text>
                </View>

                {/* Проблема */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="warning"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("my_petitions.problem")}
                        </Text>
                    </View>
                    <Text className="font-mregular text-gray-700">
                        {petition.problem[i18n.language] || petition.problem.en}
                    </Text>
                </View>

                {/* Решение */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="lightbulb"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("my_petitions.solution")}
                        </Text>
                    </View>
                    <Text className="font-mregular text-gray-700">
                        {petition.solution[i18n.language] ||
                            petition.solution.en}
                    </Text>
                </View>

                {/* Прогресс-бар */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="people"
                                size={18}
                                color="#006FFD"
                            />
                            <Text className="ml-1 text-primary font-mmedium">
                                {petition.totalSignatures || 0}{" "}
                                {t("my_petitions.supporters")}
                            </Text>
                        </View>
                        <Text className="text-gray-500 font-mregular">
                            {t("my_petitions.target")}:{" "}
                            {petition.targetSignatures}
                        </Text>
                    </View>
                    <View className="h-2 bg-gray-200 rounded-full w-full mt-1">
                        <View
                            className="h-2 bg-primary rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </View>
                </View>

                {/* Кнопка подписать (для Published) */}
                {petition.status === "Published" && (
                    <TouchableOpacity
                        className={`mt-2 mb-6 py-4 rounded-lg items-center justify-center ${
                            hasSigned || submitting
                                ? "bg-gray-300"
                                : "bg-primary"
                        }`}
                        onPress={handleSignPetition}
                        disabled={hasSigned || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className="font-mbold text-white text-center">
                                {hasSigned
                                    ? t("my_petitions.buttons.already_signed")
                                    : t("my_petitions.buttons.sign")}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PetitionDetailsPage;
