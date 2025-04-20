import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";

const AddPetitionPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [problem, setProblem] = useState("");
    const [solution, setSolution] = useState("");
    const [targetSupporters, setTargetSupporters] = useState("");
    const [categories, setCategories] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    // Available categories
    const availableCategories = [
        "environment",
        "transportation",
        "healthcare",
        "education",
        "housing",
        "public_safety",
        "arts_culture",
        "parks_recreation",
        "community_development",
        "other",
    ].map((categoryKey) => ({
        key: categoryKey,
        label: t(`add_petition.fields.categories.options.${categoryKey}`),
    }));

    // Sample petition data for editing (in a real app, this would come from an API/database)
    const petitionSample = {
        id: 4,
        title: "Pedestrian-Friendly Streets",
        description: "Making our streets safer for pedestrians",
        problem:
            "Current street design prioritizes cars over pedestrians, leading to unsafe conditions for walking and crossing streets in our community.",
        solution:
            "Implement wider sidewalks, better crosswalks, traffic calming measures, and pedestrian-first policies in downtown areas.",
        targetSupporters: 700,
        isPublicByDefault: true,
        categories: [
            "transportation",
            "public_safety",
            "community_development",
        ],
    };

    // Load petition data if editing an existing petition
    useEffect(() => {
        if (params.petitionId) {
            setTitle(petitionSample.title);
            setDescription(petitionSample.description);
            setProblem(petitionSample.problem);
            setSolution(petitionSample.solution);
            setTargetSupporters(petitionSample.targetSupporters.toString());
            setCategories(petitionSample.categories);
            setIsEditing(true);
        }
    }, [params.petitionId]);

    const toggleCategory = (categoryKey) => {
        if (categories.includes(categoryKey)) {
            setCategories(categories.filter((c) => c !== categoryKey));
        } else {
            setCategories([...categories, categoryKey]);
        }
    };

    const validatePetition = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.title_required"),
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

        if (categories.length === 0) {
            Toast.show({
                type: "error",
                text1: t("add_petition.toast.error.title"),
                text2: t("add_petition.toast.error.categories_required"),
            });
            return false;
        }

        return true;
    };

    const savePetition = (asDraft = false) => {
        if (!validatePetition()) return;

        console.log("Saving petition", {
            title,
            description,
            problem,
            solution,
            targetSupporters,
            categories,
            asDraft,
            isEditing,
        });

        Toast.show({
            type: "success",
            text1: t("add_petition.toast.success.title"),
            text2: isEditing
                ? t("add_petition.toast.success.updated")
                : t("add_petition.toast.success.submitted"),
        });

        router.push("/pages/my-petitions");
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("add_petition.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
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
                {/* Petition Title */}
                <View className="mb-4 mt-4">
                    <Text className="font-msemibold text-black mb-2">
                        {t("add_petition.fields.title.label")}
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder={t("add_petition.fields.title.placeholder")}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Petition Description */}
                <View className="mb-4">
                    <Text className="font-msemibold text-black mb-2">
                        {t("add_petition.fields.description.label")}
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder={t(
                            "add_petition.fields.description.placeholder"
                        )}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={2}
                        textAlignVertical="top"
                    />
                </View>

                {/* Problem Statement */}
                <View className="mb-4">
                    <Text className="font-msemibold text-black mb-2">
                        {t("add_petition.fields.problem.label")}
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder={t(
                            "add_petition.fields.problem.placeholder"
                        )}
                        value={problem}
                        onChangeText={setProblem}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Proposed Solution */}
                <View className="mb-4">
                    <Text className="font-msemibold text-black mb-2">
                        {t("add_petition.fields.solution.label")}
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder={t(
                            "add_petition.fields.solution.placeholder"
                        )}
                        value={solution}
                        onChangeText={setSolution}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Target Supporters */}
                <View className="mb-4">
                    <Text className="font-msemibold text-black mb-2">
                        {t("add_petition.fields.target_supporters.label")}
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder={t(
                            "add_petition.fields.target_supporters.placeholder"
                        )}
                        value={targetSupporters}
                        onChangeText={setTargetSupporters}
                        keyboardType="numeric"
                    />
                </View>

                {/* Categories Section */}
                <Text className="font-mbold text-lg text-gray-800 mb-3">
                    {t("add_petition.fields.categories.label")}
                </Text>
                <Text className="text-gray-600 text-sm mb-3">
                    {t("add_petition.fields.categories.instruction")}
                </Text>

                <View className="flex-row flex-wrap mb-4">
                    {availableCategories.map(({ key, label }) => (
                        <TouchableOpacity
                            key={key}
                            className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                                categories.includes(key)
                                    ? "bg-primary"
                                    : "bg-gray-200"
                            }`}
                            onPress={() => toggleCategory(key)}
                        >
                            <Text
                                className={`${
                                    categories.includes(key)
                                        ? "text-white"
                                        : "text-gray-700"
                                } font-mlight`}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between mb-8">
                    <TouchableOpacity
                        className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg items-center justify-center"
                        onPress={() => savePetition(true)}
                    >
                        <Text className="font-mmedium text-gray-700 text-center">
                            {t("add_petition.buttons.save_draft")}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 ml-2 bg-primary py-3 rounded-lg items-center justify-center"
                        onPress={() => savePetition(false)}
                    >
                        <Text className="font-mmedium text-white text-center">
                            {t("add_petition.buttons.submit")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddPetitionPage;
