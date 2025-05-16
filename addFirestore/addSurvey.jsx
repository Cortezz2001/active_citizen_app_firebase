import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestSurvey = async () => {
    try {
        const testSurvey = {
            title: {
                en: "Test Survey 2",
                kz: "Тесттік Саулнама 2",
                ru: "Тестовый Опрос 2",
            },
            description: {
                en: "This is a test survey description",
                kz: "Бұл тестілік саулнама сипаттамасы",
                ru: "Это тестовое описание опроса",
            },
            cityKey: "pavlodar",
            categoryId: "surveys_categories/91kpAs3p4VS5yucBqqLS",
            questions: [
                {
                    questionText: {
                        en: "What is your favorite color?",
                        kz: "Сіздің сүйікті түсіңіз қандай?",
                        ru: "Какой ваш любимый цвет?",
                    },
                    type: "multiple_choice",
                    options: [
                        {
                            en: "Red",
                            kz: "Қызыл",
                            ru: "Красный",
                        },
                        {
                            en: "Blue",
                            kz: "Көк",
                            ru: "Синий",
                        },
                        {
                            en: "Green",
                            kz: "Жасыл",
                            ru: "Зеленый",
                        },
                    ],
                },
                {
                    questionText: {
                        en: "How satisfied are you?",
                        kz: "Сіз қаншалықты қанағаттанасыз?",
                        ru: "Насколько вы удовлетворены?",
                    },
                    type: "single_choice",
                    options: [
                        {
                            en: "Very Satisfied",
                            kz: "Өте қанағаттанған",
                            ru: "Очень доволен",
                        },
                        {
                            en: "Neutral",
                            kz: "Бейтарап",
                            ru: "Нейтрально",
                        },
                        {
                            en: "Dissatisfied",
                            kz: "Қанағаттанбаған",
                            ru: "Недоволен",
                        },
                    ],
                },
            ],
            isGlobal: true,
            userId: "/users/KKSVj1GSntMLKbszazn3TeRI71S2",
            status: "Published",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            totalVotes: 1,
        };

        const docRef = await addDoc(
            collection(firestore, "surveys"),
            testSurvey
        );
        console.log("Test survey added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test survey:", error);
        throw error;
    }
};

export const addTestSurveyResult = async () => {
    try {
        const testSurveyResult = {
            surveyId: "/surveys/EPUv0qHU6VOK9eLqwpBL",
            userId: "/users/KKSVj1GSntMLKbszazn3TeRI71S2",
            results: [
                {
                    questionIndex: 0,
                    responses: { 0: 1, 1: 1 }, // Example: 1 vote for first option
                },
                {
                    questionIndex: 1,
                    responses: { 1: 1 }, // Example: 1 vote for second option
                },
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const resultDocRef = await addDoc(
            collection(firestore, "surveys_results"),
            testSurveyResult
        );
        console.log("Test survey result added with ID:", resultDocRef.id);
        return resultDocRef.id;
    } catch (error) {
        console.error("Error adding test survey result:", error);
        throw error;
    }
};

const TestSurveyButton = () => {
    const handleAddSurvey = async () => {
        try {
            const surveyId = await addTestSurvey();
            alert("Test survey added successfully with ID: " + surveyId);
        } catch (error) {
            alert("Failed to add test survey: " + error.message);
        }
    };

    const handleAddSurveyResult = async () => {
        try {
            const resultId = await addTestSurveyResult();
            alert("Test survey result added successfully with ID: " + resultId);
        } catch (error) {
            alert("Failed to add test survey result: " + error.message);
        }
    };

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Add Test Survey" onPress={handleAddSurvey} />
            <Button
                title="Add Test Survey Result"
                onPress={handleAddSurveyResult}
            />
        </View>
    );
};

export default TestSurveyButton;
