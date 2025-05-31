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
const categories = [
    {
        id: "RkdtDA478Mzbz1ludDqk",
        name: {
            en: "Infrastructure",
            kz: "Инфрақұрылым",
            ru: "Инфраструктура",
        },
    },
    {
        id: "QQv49ItsxuLUaUrhqOcX",
        name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
    },
    {
        id: "OxVqr3xUJKdhXTPyiLmQ",
        name: { en: "Ecology", kz: "Экология", ru: "Экология" },
    },
    {
        id: "kpP3pGJ9DWJMZevFwHcN",
        name: { en: "Education", kz: "Білім", ru: "Образование" },
    },
    {
        id: "W71S9fR85wftoGUzZH9K",
        name: {
            en: "Healthcare",
            kz: "Денсаулық сақтау",
            ru: "Здравоохранение",
        },
    },
    {
        id: "WHeEqvVUnOxqkYNDb9BP",
        name: {
            en: "Social Sphere",
            kz: "Әлеуметтік сала",
            ru: "Соц. сфера",
        },
    },
    {
        id: "91kpAs3p4VS5yucBqqLS",
        name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
    },
    {
        id: "9KbN8KoH0b7JAhnsVBV0",
        name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
    },
    {
        id: "BXNGHpDQrPOaYD7SM3OG",
        name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
    },
    {
        id: "CmWOBmtNUtNOzj2zuM0k",
        name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
    },
    {
        id: "AZd4V140mdc6dYiNnGtU",
        name: { en: "Other", kz: "Басқа", ru: "Другое" },
    },
];

const AddSurveyPage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthContext();
    const { getDocument } = useFirestore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [questions, setQuestions] = useState([
        { id: 1, text: "", type: "singleChoice", options: ["", ""] },
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [cityKey, setCityKey] = useState("");
    const { fetchUserSurveys } = useData();
    const { isDark } = useTheme();
    const categoryOptions = categories.map((cat) => cat.name[i18n.language]);
    const categoryIds = categories.map((cat) => cat.id);

    // Fetch user data to get cityKey
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
                            text1: t("add_survey.toast.error.title"),
                            text2: t("add_survey.toast.error.no_city_key"),
                        });
                    }
                } else {
                    Toast.show({
                        type: "error",
                        text1: t("add_survey.toast.error.title"),
                        text2: t("add_survey.toast.error.no_user"),
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Toast.show({
                    type: "error",
                    text1: t("add_survey.toast.error.title"),
                    text2: t("add_survey.toast.error.load_user_error"),
                });
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, [user, t]);

    // Fetch survey data if editing an existing survey
    useEffect(() => {
        if (params.surveyId) {
            const fetchSurvey = async () => {
                setIsLoadingSurvey(true);
                try {
                    const docRef = doc(firestore, "surveys", params.surveyId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const surveyData = docSnap.data();
                        setTitle(
                            surveyData.title[i18n.language] ||
                                surveyData.title.en
                        );
                        setDescription(
                            surveyData.description[i18n.language] ||
                                surveyData.description.en
                        );
                        setQuestions(
                            surveyData.questions.map((q, index) => ({
                                id: index + 1,
                                text:
                                    q.questionText[i18n.language] ||
                                    q.questionText.en,
                                type:
                                    q.type === "single_choice"
                                        ? "singleChoice"
                                        : "multipleChoice",
                                options: q.options.map(
                                    (opt) => opt[i18n.language] || opt.en
                                ),
                            }))
                        );
                        const categoryRef = surveyData.categoryId;
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
                            text1: t("add_survey.toast.error.title"),
                            text2: t("add_survey.toast.error.survey_not_found"),
                        });
                    }
                } catch (error) {
                    console.error("Error fetching survey:", error);
                    Toast.show({
                        type: "error",
                        text1: t("add_survey.toast.error.title"),
                        text2: t("add_survey.toast.error.fetch_failed"),
                    });
                } finally {
                    setIsLoadingSurvey(false);
                }
            };
            fetchSurvey();
        } else {
            setIsLoadingSurvey(false);
        }
    }, [params.surveyId, t, i18n.language]);

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
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.min_questions"),
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
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.title_required"),
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.description_required"),
            });
            return false;
        }

        if (!category) {
            Toast.show({
                type: "error",
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.category_required"),
            });
            return false;
        }

        if (!cityKey) {
            Toast.show({
                type: "error",
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.no_city_key"),
            });
            return false;
        }

        for (const question of questions) {
            if (!question.text.trim()) {
                Toast.show({
                    type: "error",
                    text1: t("add_survey.toast.error.title"),
                    text2: t("add_survey.toast.error.question_text_required"),
                });
                return false;
            }

            for (const option of question.options) {
                if (!option.trim()) {
                    Toast.show({
                        type: "error",
                        text1: t("add_survey.toast.error.title"),
                        text2: t("add_survey.toast.error.option_text_required"),
                    });
                    return false;
                }
            }

            if (question.options.length < 2) {
                Toast.show({
                    type: "error",
                    text1: t("add_survey.toast.error.title"),
                    text2: t("add_survey.toast.error.min_options"),
                });
                return false;
            }
        }

        return true;
    };

    const saveSurvey = async (asDraft = false) => {
        if (!validateSurvey()) return;

        if (!user) {
            Toast.show({
                type: "error",
                text1: t("add_survey.toast.error.title"),
                text2: t("add_survey.toast.error.no_user"),
            });
            return;
        }

        if (asDraft) {
            setIsSavingDraft(true);
        } else {
            setIsSubmitting(true);
        }

        try {
            const selectedCategoryIndex = categoryOptions.indexOf(category);
            const categoryId = categoryIds[selectedCategoryIndex];

            const surveyData = {
                title: { en: title, kz: title, ru: title },
                description: {
                    en: description,
                    kz: description,
                    ru: description,
                },
                questions: questions.map((q) => ({
                    questionText: { en: q.text, kz: q.text, ru: q.text },
                    type:
                        q.type === "singleChoice"
                            ? "single_choice"
                            : "multiple_choice",
                    options: q.options.map((opt) => ({
                        en: opt,
                        kz: opt,
                        ru: opt,
                    })),
                })),
                cityKey: cityKey,
                categoryId: doc(firestore, "surveys_categories", categoryId),
                isGlobal: false,
                userId: `/users/${user.uid}`,
                status: asDraft ? "Draft" : "In progress",
                updatedAt: serverTimestamp(),
                rejectionReason: { en: "", kz: "", ru: "" },
            };

            if (isEditing) {
                const surveyRef = doc(firestore, "surveys", params.surveyId);
                await updateDoc(surveyRef, surveyData);
            } else {
                surveyData.createdAt = serverTimestamp();
                surveyData.totalVotes = 0;
                await addDoc(collection(firestore, "surveys"), surveyData);
            }

            Toast.show({
                type: "success",
                text1: t("add_survey.toast.success.title"),
                text2: asDraft
                    ? t("add_survey.toast.success.saved_as_draft")
                    : t("add_survey.toast.success.submitted"),
            });

            fetchUserSurveys();
            router.back();
        } catch (error) {
            console.error("Error saving survey:", error);
            Toast.show({
                type: "error",
                text1: t("add_survey.toast.error.title"),
                text2: `Failed to save survey: ${error.message}`,
            });
        } finally {
            if (asDraft) {
                setIsSavingDraft(false);
            } else {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoadingSurvey || isLoadingUser) {
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
                    accessibilityLabel={t("add_survey.back_button")}
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
                        ? t("add_survey.title_edit")
                        : t("add_survey.title_create")}
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                {/* Survey Title */}
                <View className="mb-4 mt-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_survey.fields.title.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t("add_survey.fields.title.placeholder")}
                        placeholderTextColor={
                            isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                        }
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Survey Description */}
                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_survey.fields.description.label")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TextInput
                        className={`border rounded-lg p-3 font-mregular ${
                            isDark
                                ? "bg-dark-surface border-dark-border text-dark-text-primary"
                                : "bg-ghostwhite border-gray-300 text-black"
                        }`}
                        placeholder={t(
                            "add_survey.fields.description.placeholder"
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

                {/* Survey Category */}
                <View className="mb-4">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("add_survey.fields.category")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <DropdownField
                        title={t("add_survey.fields.category")}
                        placeholder={t("add_survey.fields.select_category")}
                        value={category}
                        options={categoryOptions}
                        onSelect={setCategory}
                        containerStyle={
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }
                        isDark={isDark}
                    />
                </View>

                {/* Questions Section */}
                <Text
                    className={`font-mbold text-lg mb-4 ${
                        isDark ? "text-dark-text-primary" : "text-gray-800"
                    }`}
                >
                    {t("add_survey.fields.questions.label")}
                </Text>

                {questions.map((question, index) => (
                    <View
                        key={question.id}
                        className={`rounded-lg p-4 mb-4 border shadow-sm ${
                            isDark
                                ? "bg-dark-surface border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row justify-between items-center mb-2">
                            <Text
                                className={`font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-700"
                                }`}
                            >
                                {t(
                                    "add_survey.fields.questions.question_label",
                                    { index: index + 1 }
                                )}
                            </Text>
                            <TouchableOpacity
                                onPress={() => removeQuestion(question.id)}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={20}
                                    color={isDark ? "#F87171" : "#6B7280"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Question Text */}
                        <TextInput
                            className={`border rounded-lg p-3 mb-3 font-mregular ${
                                isDark
                                    ? "bg-dark-background border-dark-border text-dark-text-primary"
                                    : "bg-ghostwhite border-gray-300 text-gray-900"
                            }`}
                            placeholder={t(
                                "add_survey.fields.questions.placeholder"
                            )}
                            placeholderTextColor={
                                isDark ? "#A0A0A0" : "rgba(0, 0, 0, 0.5)"
                            }
                            value={question.text}
                            onChangeText={(text) =>
                                updateQuestionText(question.id, text)
                            }
                        />

                        {/* Question Type Selector */}
                        <View className="flex-row mb-4 flex-wrap">
                            <TouchableOpacity
                                className={`mr-2 px-4 py-1 mb-1 rounded-full ${
                                    question.type === "singleChoice"
                                        ? isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                        : isDark
                                        ? "bg-gray-700"
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
                                    className={`font-mlight ${
                                        question.type === "singleChoice"
                                            ? "text-white"
                                            : isDark
                                            ? "text-dark-text-primary"
                                            : "text-gray-700"
                                    }`}
                                    style={{ flexShrink: 1 }}
                                >
                                    {t(
                                        "add_survey.question_types.single_choice"
                                    )}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`mr-2 px-4 py-1 mb-1 rounded-full ${
                                    question.type === "multipleChoice"
                                        ? isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                        : isDark
                                        ? "bg-gray-700"
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
                                    className={`font-mlight ${
                                        question.type === "multipleChoice"
                                            ? "text-white"
                                            : isDark
                                            ? "text-dark-text-primary"
                                            : "text-gray-700"
                                    }`}
                                    style={{ flexShrink: 1 }}
                                >
                                    {t(
                                        "add_survey.question_types.multiple_choice"
                                    )}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Options */}
                        <View>
                            <Text
                                className={`font-mmedium mb-2 ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-700"
                                }`}
                            >
                                {t("add_survey.fields.options.label")}
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
                                        color={isDark ? "#A0A0A0" : "#6B7280"}
                                        style={{ marginRight: 8 }}
                                    />
                                    <TextInput
                                        className={`flex-1 border rounded-lg p-2 font-mregular ${
                                            isDark
                                                ? "bg-dark-background border-dark-border text-dark-text-primary"
                                                : "bg-ghostwhite border-gray-300 text-gray-900"
                                        }`}
                                        placeholder={t(
                                            "add_survey.fields.options.placeholder",
                                            { index: optIndex + 1 }
                                        )}
                                        placeholderTextColor={
                                            isDark
                                                ? "#A0A0A0"
                                                : "rgba(0, 0, 0, 0.5)"
                                        }
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
                                                color={
                                                    isDark
                                                        ? "#F87171"
                                                        : "#EF4444"
                                                }
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
                                    color={isDark ? "#0066E6" : "#006FFD"}
                                />
                                <Text
                                    className={`ml-2 font-mmedium ${
                                        isDark
                                            ? "text-dark-primary"
                                            : "text-primary"
                                    }`}
                                >
                                    {t("add_survey.buttons.add_option")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Add Question Button */}
                <TouchableOpacity
                    className={`flex-row items-center justify-center py-3 rounded-lg mb-6 border ${
                        isDark
                            ? "bg-dark-surface border-dark-primary"
                            : "bg-white border-primary"
                    }`}
                    onPress={addQuestion}
                >
                    <MaterialIcons
                        name="add"
                        size={20}
                        commonwealth="true"
                        color={isDark ? "#0066E6" : "#006FFD"}
                    />
                    <Text
                        className={`ml-2 font-mmedium ${
                            isDark ? "text-dark-primary" : "text-primary"
                        }`}
                    >
                        {t("add_survey.buttons.add_question")}
                    </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View className="flex-row justify-between mb-8">
                    <CustomButton
                        title={t("add_survey.buttons.save_draft")}
                        handlePress={() => saveSurvey(true)}
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
                        title={t("add_survey.buttons.submit")}
                        handlePress={() => saveSurvey(false)}
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

export default AddSurveyPage;
