import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

// Array of category IDs for petitions
const categoryIds = [
    "idfw7SRpl5RWJounhx5o",
    "OfveAVK1Ist1ERfv3OHD",
    "St4GZswPZZrV7gA94ePd",
    "AmhX5i5RKAZc1jFiMbpN",
    "iaFwXnVDYbX8lkEPriZO",
    "N9yPRzFYhGpOGD2y1B1q",
    "BqP3Z6iGnUqTIeGsWnoP",
    "I9jZzYjUkf4nZriN0aTK",
    "K5ZCIYox9QyfVxaKTcgg",
    "El34TsbdFsKpDRVXVkIQ",
];

/**
 * Adds a test petition to the Firestore database with randomized categoryId.
 * @returns {Promise<string>} The ID of the added petition.
 */
export const addTestPetition = async () => {
    try {
        const randomIndex = Math.floor(Math.random() * categoryIds.length);
        const categoryId = `petitions_categories/${categoryIds[randomIndex]}`;
        const testPetition = {
            title: {
                en: "Test Petition",
                kz: "Тесттік Петиция",
                ru: "Тестовая Петиция",
            },
            description: {
                en: "This is a test petition description",
                kz: "Бұл тестілік петиция сипаттамасы",
                ru: "Это тестовое описание петиции",
            },
            problem: {
                en: "This is a test problem",
                kz: "Бұл тестілік мәселе",
                ru: "Это тестовая проблема",
            },
            solution: {
                en: "This is a test solution",
                kz: "Бұл тестілік шешім",
                ru: "Это тестовое решение",
            },
            targetSignatures: 1000,
            totalSignatures: 0,
            categoryId: categoryId,
            cityKey: "pavlodar",
            isGlobal: true,
            userId: "/users/KKSVj1GSntMLKbszazn3TeRI71S2",
            status: "Published",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(
            collection(firestore, "petitions"),
            testPetition
        );
        console.log("Test petition added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test petition:", error);
        throw error;
    }
};

export const addTestSignature = async () => {
    try {
        const testSignature = {
            petitionId: "/petitions/J9SEWv0Tf3cBymGSP1AC",
            userId: "/users/KKSVj1GSntMLKbszazn3TeRI71S2",
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(
            collection(firestore, "petitions_signatures"),
            testSignature
        );
        console.log("Test signature added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test signature:", error);
        throw error;
    }
};

const TestPetitionButton = () => {
    const handleAddPetition = async () => {
        try {
            const petitionId = await addTestPetition();
            alert("Test petition added successfully with ID: " + petitionId);
        } catch (error) {
            alert("Failed to add test petition: " + error.message);
        }
    };

    const handleAddSignature = async () => {
        try {
            const signatureId = await addTestSignature();
            alert("Test signature added successfully with ID: " + signatureId);
        } catch (error) {
            alert("Failed to add test signature: " + error.message);
        }
    };

    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Button title="Add Test Petition" onPress={handleAddPetition} />
            <Button title="Add Test Signature" onPress={handleAddSignature} />
        </View>
    );
};

export default TestPetitionButton;
