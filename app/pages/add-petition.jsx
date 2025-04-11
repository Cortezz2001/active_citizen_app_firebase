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

const AddPetitionPage = () => {
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
        "Environment",
        "Transportation",
        "Healthcare",
        "Education",
        "Housing",
        "Public Safety",
        "Arts & Culture",
        "Parks & Recreation",
        "Community Development",
        "Other",
    ];

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
            "Transportation",
            "Public Safety",
            "Community Development",
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

    const toggleCategory = (category) => {
        if (categories.includes(category)) {
            setCategories(categories.filter((c) => c !== category));
        } else {
            setCategories([...categories, category]);
        }
    };

    const validatePetition = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a petition title",
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a petition description",
            });
            return false;
        }

        if (!problem.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please describe the problem your petition addresses",
            });
            return false;
        }

        if (!solution.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please describe your proposed solution",
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
                text1: "Error",
                text2: "Please enter a valid target number of supporters",
            });
            return false;
        }

        if (categories.length === 0) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please select at least one category",
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
            isPublicByDefault,
            categories,
            asDraft,
            isEditing,
        });

        Toast.show({
            type: "success",
            text1: "Success",
            text2: isEditing
                ? "Petition updated successfully"
                : "Petition submitted for moderation",
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
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {isEditing ? "Edit Petition" : "Create Petition"}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Petition Title */}
                <View className="mb-4 mt-4">
                    <Text className="font-msemibold text-black mb-2">
                        Petition Title
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Enter a clear, descriptive title"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Petition Description */}
                <View className="mb-4">
                    <Text className="font-msemibold text-black mb-2">
                        Brief Description
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Provide a short summary of your petition"
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
                        Problem Statement
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Describe the issue or problem that needs to be addressed"
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
                        Proposed Solution
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="What changes or actions do you propose to resolve the problem"
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
                        Target Number of Supporters
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Enter target number (e.g., 1000)"
                        value={targetSupporters}
                        onChangeText={setTargetSupporters}
                        keyboardType="numeric"
                    />
                </View>

                {/* Categories Section */}
                <Text className="font-mbold text-lg text-gray-800 mb-3">
                    Categories
                </Text>
                <Text className="text-gray-600 text-sm mb-3">
                    Select at least one category that best describes your
                    petition
                </Text>

                <View className="flex-row flex-wrap mb-4">
                    {availableCategories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            className={`mr-2 mb-2 px-3 py-1 rounded-full ${
                                categories.includes(category)
                                    ? "bg-primary"
                                    : "bg-gray-200"
                            }`}
                            onPress={() => toggleCategory(category)}
                        >
                            <Text
                                className={`${
                                    categories.includes(category)
                                        ? "text-white"
                                        : "text-gray-700"
                                } font-mlight`}
                            >
                                {category}
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
                            Save as Draft
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 ml-2 bg-primary py-3 rounded-lg items-center justify-center"
                        onPress={() => savePetition(false)}
                    >
                        <Text className="font-mmedium text-white text-center">
                            Submit for Moderation
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddPetitionPage;
