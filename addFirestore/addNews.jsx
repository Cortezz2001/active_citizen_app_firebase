import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestNews = async () => {
    try {
        const testNews = {
            categoryId: doc(firestore, "categories", "9w1F3rlo7oBnMNMqCvjR"),
            cityKey: "pavlodar",
            content: {
                en: "Test news content",
                kz: "Тест мазмұны",
                ru: "Тестовый контент",
            },
            createdAt: serverTimestamp(),
            imageUrl: "https://picsum.photos/300/100",
            isGlobal: true,
            shortDescription: {
                en: "Test description",
                kz: "Тест сипаттамасы",
                ru: "Тестовое описание",
            },
            title: {
                en: "Test News",
                kz: "Тест Жаңалықтары",
                ru: "Тестовые Новости",
            },
            updatedAt: serverTimestamp(),
            viewCount: 0,
        };
        const docRef = await addDoc(collection(firestore, "news"), testNews);
        console.log("Test news added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test news:", error);
        throw error;
    }
};

const TestNewsButton = () => {
    const handleAddNews = async () => {
        try {
            await addTestNews();
            alert("Test news added successfully!");
        } catch (error) {
            alert("Failed to add test news: " + error.message);
        }
    };

    return (
        <View>
            <Button title="Add Test News" onPress={handleAddNews} />
        </View>
    );
};

export default TestNewsButton;

// Fetch comments for a specific news item
//   const fetchComments = async (newsId) => {
//     try {
//       const conditions = [
//         { type: 'where', field: 'parentCollection', operator: '==', value: 'news' },
//         { type: 'where', field: 'parentId', operator: '==', value: `news/${newsId}` },
//         { type: 'orderBy', field: 'createdAt', direction: 'desc' },
//       ];

//       const commentsData = await getCollection('comments', conditions);

//       // Fetch user details for each comment
//       const commentsWithUsers = await Promise.all(
//         commentsData.map(async (comment) => {
//           let userName = 'Anonymous';
//           if (comment.userId) {
//             const userDoc = await getDocument('users', comment.userId.id);
//             userName = userDoc ? `${userDoc.fname} ${userDoc.lname}` : 'Anonymous';
//           }
//           return { ...comment, userName };
//         })
//       );

//       return commentsWithUsers;
//     } catch (err) {
//       console.error('Error fetching comments:', err);
//       throw err;
//     }
//   };
