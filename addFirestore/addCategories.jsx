import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addCategories = async () => {
    try {
        const categories = [
            {
                name: {
                    en: "Infrastructure",
                    ru: "Инфраструктура",
                    kz: "Инфрақұрылым",
                },
            },
            {
                name: {
                    en: "Transport",
                    ru: "Транспорт",
                    kz: "Көлік",
                },
            },
            {
                name: {
                    en: "Ecology",
                    ru: "Экология",
                    kz: "Экология",
                },
            },
            {
                name: {
                    en: "Education",
                    ru: "Образование",
                    kz: "Білім",
                },
            },
            {
                name: {
                    en: "Healthcare",
                    ru: "Здравоохранение",
                    kz: "Денсаулық сақтау",
                },
            },
            {
                name: {
                    en: "Social Sphere",
                    ru: "Социальная сфера",
                    kz: "Әлеуметтік сала",
                },
            },
            {
                name: {
                    en: "Culture",
                    ru: "Культура",
                    kz: "Мәдениет",
                },
            },
            {
                name: {
                    en: "Housing and Utilities",
                    ru: "ЖКХ",
                    kz: "ТКШ",
                },
            },
            {
                name: {
                    en: "Safety",
                    ru: "Безопасность",
                    kz: "Қауіпсіздік",
                },
            },
            {
                name: {
                    en: "Application",
                    ru: "Приложение",
                    kz: "Қосымша",
                },
            },
        ];

        const addedCategories = [];

        for (const category of categories) {
            const categoryData = {
                name: category.name,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(
                collection(firestore, "surveys_categories"),
                categoryData
            );

            addedCategories.push({
                id: docRef.id,
                name: category.name,
            });
        }

        console.log("categories added:", addedCategories);
        return addedCategories;
    } catch (error) {
        console.error("Error adding  categories:", error);
        throw error;
    }
};

const AddCategoriesButton = () => {
    const handleAddCategories = async () => {
        try {
            const categories = await addCategories();
            alert("categories added successfully!");
        } catch (error) {
            alert("Failed to add categories: " + error.message);
        }
    };

    return (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Button title="Add Categories" onPress={handleAddCategories} />
        </View>
    );
};

export default AddCategoriesButton;
