import React, { useState } from "react";
import { View, Button, Alert } from "react-native";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestRequest = async () => {
    try {
        const testRequest = {
            title: {
                en: "Test Request 2",
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
                "4NWS6iYzOUo8QYQ5T6Wh"
            ),
            userId: "/users/KKSVj1GSntMLKbszazn3TeRI71S2",
            status: "rejected",
            address: {
                city: "Pavlodar",
                country: "Kazakhstan",
                district: null,
                formattedAddress: "Test Street 123, Pavlodar, Kazakhstan",
                isoCountryCode: "KZ",
                name: "Test Street 123",
                postalCode: "140000",
                region: "Pavlodar Region",
                street: "Test Street",
                streetNumber: "123",
                subregion: "",
                timezone: "Asia/Almaty",
                coordinates: {
                    latitude: 52.285577,
                    longitude: 76.940947,
                },
            },
            mediaFiles: [
                {
                    type: "image",
                    url: "https://picsum.photos/800/601",
                    fileName: "test_image.jpg",
                },
            ],
            rejectionReason: {
                en: "Test rejection reason",
                kz: "Тесттік бас тарту себебі",
                ru: "Тестовая причина отказа",
            },
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
