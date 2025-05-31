import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../lib/context";
import { useFirestore } from "../../hooks/useFirestore";
import { firestore } from "../../lib/firebase";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import DropdownField from "../../components/DropdownField";
import { useData } from "../../lib/datacontext";
import CustomButton from "../../components/CustomButton";
import { useTheme } from "../../lib/themeContext";

const petitionCategories = [
    {
        id: "idfw7SRpl5RWJounhx5o",
        name: {
            en: "Infrastructure",
            kz: "Инфрақұрылым",
            ru: "Инфраструктура",
        },
    },
    {
        id: "OfveAVK1Ist1ERfv3OHD",
        name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
    },
    {
        id: "St4GZswPZZrV7gA94ePd",
        name: { en: "Ecology", kz: "Экология", ru: "Экология" },
    },
    {
        id: "AmhX5i5RKAZc1jFiMbpN",
        name: { en: "Education", kz: "Білім", ru: "Образование" },
    },
    {
        id: "iaFwXnVDYbX8lkEPriZO",
        name: {
            en: "Healthcare",
            kz: "Денсаулық сақтау",
            ru: "Здравоохранение",
        },
    },
    {
        id: "N9yPRzFYhGpOGD2y1B1q",
        name: {
            en: "Social Sphere",
            kz: "Әлеуметтік сала",
            ru: "Социальная сфера",
        },
    },
    {
        id: "BqP3Z6iGnUqTIeGsWnoP",
        name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
    },
    {
        id: "I9jZzYjUkf4nZriN0aTK",
        name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
    },
    {
        id: "K5ZCIYox9QyfVxaKTcgg",
        name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
    },
    {
        id: "El34TsbdFsKpDRVXVkIQ",
        name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
    },
    {
        id: "8AfIHBPxoL8WDr6IZqvi",
        name: { en: "Other", kz: "Басқа", ru: "Другое" },
    },
];

const AddPetitionPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthContext();
    const { getDocument } = useFirestore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [problem, setProblem] = useState("");
    const [solution, setSolution] = useState("");
    const [targetSupporters, setTargetSupporters] = useState("");
    const [category, setCategory] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingPetition, setIsLoadingPetition] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [cityKey, setCityKey] = useState("");
    const { fetchUserPetitions } = useData();
    const { isDark } = useTheme();

    const categoryOptions = petitionCategories.map(
        (cat) => cat.name[i18n.language]
    );
    const categoryIds = petitionCategories.map((cat) => cat.id);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (user && user.uid) {
                    const userData = await getDocument("users", user.uid);
                    if (userData && userData.cityKey) {
                        setCityKey(userData.cityKey);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: t("add_petition.toast.error.title"),
                            text2: t("add_petition.toast.error.no_city_key"),
                        });
                    }
                } else {
                    Toast.show({
                        type: "error",
                        text1: t("add_petition.toast.error.title"),
                        text2: t("add_petition.toast.error.no_user"),
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Toast.show({
                    type: "error",
                    text1: t("add_petition.toast.error.title"),
                    text2: t("add_petition.toast.error.load_user_error"),
                });
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, [user, t]);

    useEffect(() => {
        if (params.petitionId) {
            const fetchPetition = async () => {
                setIsLoadingPetition(true);
                try {
                    const docRef = doc(
                        firestore,
                        "petitions",
                        params.petitionId
                    );
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const petitionData = docSnap.data();
                        setTitle(
                            petitionData.title[i18n.language] ||
                                petitionData.title.en
                        );
                        setDescription(
                            petitionData.description[i18n.language] ||
                                petitionData.description.en
                        );
                        setProblem(
                            petitionData.problem[i18n.language] ||
                                petitionData.problem.en
                        );
                        setSolution(
                            petitionData.solution[i18n.language] ||
                                petitionData.solution.en
                        );
                        setTargetSupporters(
                            petitionData.targetSupporters.toString()
                        );
                        const categoryRef = petitionData.categoryId;
                        const categoryDoc = await getDoc(categoryRef);
                        const categoryData = categoryDoc.data();
                        const categoryName =
                            categoryData.name[i18n.language] ||
                            categoryData.name.en;
                        setCategory(categoryName);
                        setIsEditing(true);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: t("add_petition.toast.error.title"),
                            text2: t(
                                "add_petition.toast.error.petition_not_found"
                            ),
                        });
                    }
                } catch (error) {
                    console.error("Error fetching petition:", error);
                    Toast.show({
                        type: "error",
                        text1: t("add_petition.toast.error.title"),
                        text2: t("add_petition.toast.error.fetch_failed"),
                    });
                } finally {
                    setIsLoadingPetition(false);
                }
            };
            fetchPetition();
        } else {
            setIsLoadingPetition(false);
        }
    }, [params.petitionId, t, i18n.language]);

    const validatePetition = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.title_required"),
            });
            return false;
        }
        if (title.trim().length < 10 || title.trim().length > 100) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.title_length"),
            });
            return false;
        }
        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.description_required"),
            });
            return false;
        }
        if (!problem.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.problem_required"),
            });
            return false;
        }
        if (!solution.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.solution_required"),
            });
            return false;
        }
        if (
            !targetSupporters ||
            isNaN(parseInt(targetSupporters)) ||
            parseInt(targetSupporters) <= 0
        ) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.target_supporters_required"),
            });
            return false;
        }
        if (!category) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.category_required"),
            });
            return false;
        }
        if (!cityKey) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.no_city_key"),
            });
            return false;
        }
        return true;
    };

    const savePetition = async (asDraft = false) => {
        if (!validatePetition()) return;

        if (!user) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.no_user"),
            });
            return;
        }

        if (asDraft) setIsSavingDraft(true);
        else setIsSubmitting(true);

        try {
            const selectedCategoryIndex = categoryOptions.indexOf(category);
            const categoryId = categoryIds[selectedCategoryIndex];

            const petitionData = {
                title: { en: title, kz: title, ru: title },
                description: {
                    en: description,
                    kz: description,
                    ru: description,
                },
                problem: { en: problem, kz: problem, ru: problem },
                solution: { en: solution, kz: solution, ru: solution },
                targetSupporters: parseInt(targetSupporters),
                cityKey: cityKey,
                categoryId: doc(firestore, "petitions_categories", categoryId),
                userId: `/users/${user.uid}`,
                status: asDraft ? "Draft" : "In progress",
                updatedAt: serverTimestamp(),
                rejectionReason: { en: "", kz: "", ru: "" },
            };

            if (isEditing) {
                const petitionRef = doc(
                    firestore,
                    "petitions",
                    params.petitionId
                );
                await updateDoc(petitionRef, petitionData);
            } else {
                petitionData.createdAt = serverTimestamp();
                petitionData.supporters = 0;
                await addDoc(collection(firestore, "petitions"), petitionData);
            }

            Toast.show({
                type: "success",
                text1: t("add_petition.toast.success.title"),
                text2: asDraft
                    ? t("add_petition.toast.success.saved_as_draft")
                    : t("add_petition.toast.success.submitted"),
            });

            fetchUserPetitions();
            router.back();
        } catch (error) {
            console.error("Error saving petition:", error);
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: `Failed to save petition: ${error.message}`,
            });
        } finally {
            if (asDraft) setIsSavingDraft(false);
            else setIsSubmitting(false);
        }
    };

    if (isLoadingPetition || isLoadingUser) {
        return (
            <View
                className={`flex-1 justify-center items-center ${
                    isDark ? "bg-dark-background" : "bg-white"
                }`}
            >
                <ActivityIndicator
                    size="large"
                    color={isDark ? "#0066E6" : "#006FFD"}
                />
            </View>
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
                    accessibilityLabel={t("add_petition.back_button")}
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
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {isEditing
                        ? t("add_petition.title_edit")
                        : t("add_petition.title_create")}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.title.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t("add_petition.fields.title.placeholder")}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.description.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t(
                            "add_petition.fields.description.placeholder"
                        )}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.problem.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t(
                            "add_petition.fields.problem.placeholder"
                        )}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={problem}
                        onChangeText={setProblem}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.solution.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t(
                            "add_petition.fields.solution.placeholder"
                        )}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={solution}
                        onChangeText={setSolution}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.target_supporters.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t(
                            "add_petition.fields.target_supporters.placeholder"
                        )}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={targetSupporters}
                        onChangeText={setTargetSupporters}
                        keyboardType="numeric"
                    />
                </View>

                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_petition.fields.category")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <DropdownField
                        title={t("add_petition.fields.category")}
                        placeholder={t("add_petition.fields.select_category")}
                        value={category}
                        options={categoryOptions}
                        onSelect={setCategory}
                        containerStyle={
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }
                        isDark={isDark}
                    />
                </View>

                <View className="flex-row justify-between mb-8">
                    <CustomButton
                        title={t("add_petition.buttons.save_draft")}
                        handlePress={() => savePetition(true)}
                        containerStyles={`flex-1 mr-2 py-3 px-2 rounded-lg ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                        textStyles={`font-mmedium ${
                            isDark ? "text-dark-text-primary" : "text-gray-700"
                        }`}
                        isLoading={isSavingDraft}
                        isDark={isDark}
                    />
                    <CustomButton
                        title={t("add_petition.buttons.submit")}
                        handlePress={() => savePetition(false)}
                        containerStyles={`flex-1 ml-2 py-3 px-2 rounded-lg ${
                            isDark ? "bg-dark-primary" : "bg-primary"
                        }`}
                        textStyles="text-white font-mmedium"
                        isLoading={isSubmitting}
                        isDark={isDark}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddPetitionPage;
