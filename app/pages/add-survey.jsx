import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";

const AddSurveyPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questions, setQuestions] = useState([
        { id: 1, text: "", type: "singleChoice", options: ["", ""] },
    ]);
    const [isEditing, setIsEditing] = useState(false);

    // Sample survey data for editing (in a real app, this would come from an API/database)
    const surveySample = {
        id: 4,
        title: "Public Transport Improvement",
        description: "Help us improve the city's public transportation system",
        questions: [
            {
                id: 1,
                text: "How often do you use public transport?",
                type: "singleChoice",
                options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"],
            },
            {
                id: 2,
                text: "Which types of public transport do you use?",
                type: "multipleChoice",
                options: ["Bus", "Subway", "Tram", "Taxi", "Shared bikes"],
            },
        ],
    };

    // Load survey data if editing an existing survey
    useEffect(() => {
        if (params.surveyId) {
            setTitle(surveySample.title);
            setDescription(surveySample.description);
            setQuestions(surveySample.questions);
            setIsEditing(true);
        }
    }, [params.surveyId]);

    const addQuestion = () => {
        const newQuestion = {
            id: questions.length + 1,
            text: "",
            type: "singleChoice",
            options: ["", ""],
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestionText = (id, text) => {
        setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
    };

    const addOption = (questionId) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId ? { ...q, options: [...q.options, ""] } : q
            )
        );
    };

    const updateOption = (questionId, optionIndex, text) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          options: q.options.map((opt, idx) =>
                              idx === optionIndex ? text : opt
                          ),
                      }
                    : q
            )
        );
    };

    const removeOption = (questionId, optionIndex) => {
        setQuestions(
            questions.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          options: q.options.filter(
                              (_, idx) => idx !== optionIndex
                          ),
                      }
                    : q
            )
        );
    };

    const removeQuestion = (questionId) => {
        if (questions.length <= 1) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "You need at least one question in your survey.",
            });
            return;
        }
        setQuestions(questions.filter((q) => q.id !== questionId));
    };

    const changeQuestionType = (questionId, type) => {
        setQuestions(
            questions.map((q) => (q.id === questionId ? { ...q, type } : q))
        );
    };

    const validateSurvey = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a survey title",
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a survey description",
            });
            return false;
        }

        for (const question of questions) {
            if (!question.text.trim()) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "All questions must have text",
                });
                return false;
            }

            for (const option of question.options) {
                if (!option.trim()) {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "All options must have text",
                    });
                    return false;
                }
            }

            if (question.options.length < 2) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Each question must have at least 2 options",
                });
                return false;
            }
        }

        return true;
    };

    const saveSurvey = (asDraft = false) => {
        if (!validateSurvey()) return;

        console.log("Saving survey", {
            title,
            description,
            questions,
            asDraft,
            isEditing,
        });

        Toast.show({
            type: "success",
            text1: "Success",
            text2: isEditing
                ? "Survey updated successfully"
                : "Survey submitted for moderation",
        });

        router.push("/pages/my-surveys");
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
                    {isEditing ? "Edit Survey" : "Create Survey"}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Survey Title */}
                <View className="mb-4 mt-4">
                    <Text className="font-mmedium text-gray-700 mb-2">
                        Survey Title
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Enter survey title"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Survey Description */}
                <View className="mb-4">
                    <Text className="font-mmedium text-gray-700 mb-2">
                        Description
                    </Text>
                    <TextInput
                        className="bg-ghostwhite border border-gray-300 rounded-lg p-3 font-mregular"
                        placeholder="Enter survey description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Questions Section */}
                <Text className="font-mbold text-lg text-gray-800 mb-4">
                    Questions
                </Text>

                {questions.map((question, index) => (
                    <View
                        key={question.id}
                        className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200"
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="font-mmedium text-gray-700">
                                Question {index + 1}
                            </Text>
                            <TouchableOpacity
                                onPress={() => removeQuestion(question.id)}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Question Text */}
                        <TextInput
                            className="bg-ghostwhite border border-gray-300 rounded-lg p-3 mb-3 font-mregular"
                            placeholder="Enter question"
                            value={question.text}
                            onChangeText={(text) =>
                                updateQuestionText(question.id, text)
                            }
                        />

                        {/* Question Type Selector */}
                        <View className="flex-row mb-3">
                            <TouchableOpacity
                                className={`mr-2 px-3 py-1 rounded-full ${
                                    question.type === "singleChoice"
                                        ? "bg-primary"
                                        : "bg-gray-200"
                                }`}
                                onPress={() =>
                                    changeQuestionType(
                                        question.id,
                                        "singleChoice"
                                    )
                                }
                            >
                                <Text
                                    className={`${
                                        question.type === "singleChoice"
                                            ? "text-white"
                                            : "text-gray-700"
                                    } font-mlight`}
                                >
                                    Single Choice
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`mr-2 px-3 py-1 rounded-full ${
                                    question.type === "multipleChoice"
                                        ? "bg-primary"
                                        : "bg-gray-200"
                                }`}
                                onPress={() =>
                                    changeQuestionType(
                                        question.id,
                                        "multipleChoice"
                                    )
                                }
                            >
                                <Text
                                    className={`${
                                        question.type === "multipleChoice"
                                            ? "text-white"
                                            : "text-gray-700"
                                    } font-mlight`}
                                >
                                    Multiple Choice
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Options */}
                        <View>
                            <Text className="font-mmedium text-gray-700 mb-2">
                                Options
                            </Text>
                            {question.options.map((option, optIndex) => (
                                <View
                                    key={optIndex}
                                    className="flex-row items-center mb-2"
                                >
                                    <MaterialIcons
                                        name={
                                            question.type === "singleChoice"
                                                ? "radio-button-unchecked"
                                                : "check-box-outline-blank"
                                        }
                                        size={20}
                                        color="#6B7280"
                                        style={{ marginRight: 8 }}
                                    />
                                    <TextInput
                                        className="flex-1 bg-ghostwhite border border-gray-300 rounded-lg p-2 font-mregular"
                                        placeholder={`Option ${optIndex + 1}`}
                                        value={option}
                                        onChangeText={(text) =>
                                            updateOption(
                                                question.id,
                                                optIndex,
                                                text
                                            )
                                        }
                                    />
                                    {question.options.length > 2 && (
                                        <TouchableOpacity
                                            className="ml-2"
                                            onPress={() =>
                                                removeOption(
                                                    question.id,
                                                    optIndex
                                                )
                                            }
                                        >
                                            <MaterialIcons
                                                name="remove-circle-outline"
                                                size={20}
                                                color="#EF4444"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity
                                className="flex-row items-center mt-2"
                                onPress={() => addOption(question.id)}
                            >
                                <MaterialIcons
                                    name="add-circle-outline"
                                    size={20}
                                    color="#006FFD"
                                />
                                <Text className="ml-2 text-primary font-mmedium">
                                    Add Option
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Add Question Button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center bg-white py-3 rounded-lg mb-6 border border-primary"
                    onPress={addQuestion}
                >
                    <MaterialIcons name="add" size={20} color="#006FFD" />
                    <Text className="ml-2 text-primary font-mmedium">
                        Add Question
                    </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View className="flex-row justify-between mb-8">
                    <TouchableOpacity
                        className="flex-1 mr-2 bg-gray-200 py-3 rounded-lg items-center justify-center"
                        onPress={() => saveSurvey(true)}
                    >
                        <Text className="font-mmedium text-gray-700 text-center">
                            Save as Draft
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 ml-2 bg-primary py-3 rounded-lg items-center justify-center"
                        onPress={() => saveSurvey(false)}
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

export default AddSurveyPage;
