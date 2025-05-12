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

// import React from "react";
// import { View, Button } from "react-native";
// import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
// import { firestore } from "../lib/firebase";

// export const addTestNews = async () => {
//     try {
//         const categories = ["Ftu3UnveQDkb6VnLWO4l", "IE5GnHjgawytO4oEkIJk"];
//         const promises = [];

//         for (let i = 1; i <= 50; i++) {
//             const testNews = {
//                 categoryId: doc(
//                     firestore,
//                     "news_categories",
//                     categories[i % 2]
//                 ), // Alternates categories
//                 cityKey: "pavlodar",
//                 content: {
//                     en: `Test news content ${i}`,
//                     kz: `Тест мазмұны ${i}`,
//                     ru: `Тестовый контент ${i}`,
//                 },
//                 createdAt: serverTimestamp(),
//                 imageUrl: `https://picsum.photos/1920/1080?random=${i}`,
//                 isGlobal: true,
//                 shortDescription: {
//                     en: `Test description ${i}`,
//                     kz: `Тест сипаттамасы ${i}`,
//                     ru: `Тестовое описание ${i}`,
//                 },
//                 title: {
//                     en: `Test News ${i}`,
//                     kz: `Тест Жаңалықтары ${i}`,
//                     ru: `Тестовые Новости ${i}`,
//                 },
//                 updatedAt: serverTimestamp(),
//                 viewCount: Math.floor(Math.random() * 1000), // Random view count between 0 and 999
//             };
//             promises.push(addDoc(collection(firestore, "news"), testNews));
//         }

//         const docRefs = await Promise.all(promises);
//         console.log(
//             "50 test news added with IDs:",
//             docRefs.map((doc) => doc.id)
//         );
//         return docRefs.map((doc) => doc.id);
//     } catch (error) {
//         console.error("Error adding test news:", error);
//         throw error;
//     }
// };

// const TestNewsButton = () => {
//     const handleAddNews = async () => {
//         try {
//             await addTestNews();
//             alert("50 test news added successfully!");
//         } catch (error) {
//             alert("Failed to add test news: " + error.message);
//         }
//     };

//     return (
//         <View>
//             <Button title="Add 50 Test News" onPress={handleAddNews} />
//         </View>
//     );
// };

// export default TestNewsButton;
