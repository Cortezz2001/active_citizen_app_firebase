import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestRequest = async () => {
    try {
        const testRequest = {
            title: {
                en: "Test Request",
                kz: "Тест Сұранысы",
                ru: "Тестовый Запрос",
            },
            description: {
                en: "Test request description",
                kz: "Тест сұранысының сипаттамасы",
                ru: "Описание тестового запроса",
            },
            categoryId: doc(
                firestore,
                "requests_categories",
                "Yi32uA0id6NUBHnGXmEj"
            ),
            userId: doc(firestore, "users", "KKSVj1GSntMLKbszazn3TeRI71S2"),
            status: "In progress", // можно использовать: "pending", "in_progress", "completed", "rejected"
            address: {
                street: "Test Street 123",
                city: "Pavlodar",
                postalCode: "140000",
                coordinates: {
                    latitude: 52.285577,
                    longitude: 76.940947,
                },
            },
            mediaFiles: [
                {
                    type: "image", // или "video"
                    url: "https://picsum.photos/800/600",
                    fileName: "test_image.jpg",
                },
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(
            collection(firestore, "requests"),
            testRequest
        );
        console.log("Test request added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test request:", error);
        throw error;
    }
};

const AddRequestsButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAddSingleRequest = async () => {
        setIsLoading(true);
        try {
            await addTestRequest();
            Alert.alert("Success", "Test request added successfully!");
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to add test request: " + error.message
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ marginVertical: 10 }}>
            <Button
                title="Add Single Test Request"
                onPress={handleAddSingleRequest}
                disabled={isLoading}
            />
        </View>
    );
};

export default AddRequestsButton;
