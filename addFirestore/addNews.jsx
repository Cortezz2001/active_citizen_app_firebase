// import React from "react";
// import { View, Button } from "react-native";
// import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
// import { firestore } from "../lib/firebase";

// export const addTestNews = async () => {
//     try {
//         const testNews = {
//             categoryId: doc(firestore, "categories", "9w1F3rlo7oBnMNMqCvjR"),
//             cityKey: "pavlodar",
//             content: {
//                 en: "Test news content",
//                 kz: "Тест мазмұны",
//                 ru: "Тестовый контент",
//             },
//             createdAt: serverTimestamp(),
//             imageUrl: "https://picsum.photos/300/100",
//             isGlobal: true,
//             shortDescription: {
//                 en: "Test description",
//                 kz: "Тест сипаттамасы",
//                 ru: "Тестовое описание",
//             },
//             title: {
//                 en: "Test News",
//                 kz: "Тест Жаңалықтары",
//                 ru: "Тестовые Новости",
//             },
//             updatedAt: serverTimestamp(),
//             viewCount: 0,
//         };
//         const docRef = await addDoc(collection(firestore, "news"), testNews);
//         console.log("Test news added with ID:", docRef.id);
//         return docRef.id;
//     } catch (error) {
//         console.error("Error adding test news:", error);
//         throw error;
//     }
// };

// const TestNewsButton = () => {
//     const handleAddNews = async () => {
//         try {
//             await addTestNews();
//             alert("Test news added successfully!");
//         } catch (error) {
//             alert("Failed to add test news: " + error.message);
//         }
//     };

//     return (
//         <View>
//             <Button title="Add Test News" onPress={handleAddNews} />
//         </View>
//     );
// };

// export default TestNewsButton;

import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestNews = async () => {
    try {
        const categories = [
            "EFSI2BK77w18bNAYGGX4",
            "5m8QecvGFlMF0D4Usqrs",
            "E4KL6iMQTGbFJ6h5BZDc",
            "WnTQxiyzcbdVm690j2Pn",
            "MdwCK3NMg64PqmPQFAQ4",
            "NYBHEyvWdhF8Yo6Pl73X",
            "sGkSl0AVr01NlBJEwWBs",
            "gfRxRWr0TlChOPdSW8kz",
            "lafwZEKCmogVNrQKxLI8",
            "9sbSX4PubjX090jhiQIS",
            "sdUQe1AYEBvoVBdkx7VN",
        ];
        const promises = [];

        for (let i = 1; i <= 10; i++) {
            const testNews = {
                categoryId: doc(
                    firestore,
                    "news_categories",
                    categories[i % 2]
                ), // Alternates categories
                cityKey: "pavlodar",
                content: {
                    en: `Test news content ${i}`,
                    kz: `Тест мазмұны ${i}`,
                    ru: `Тестовый контент ${i}`,
                },
                createdAt: serverTimestamp(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/active-citizen-firebase.firebasestorage.app/o/news%2FzdgFDEt4BwI6s3EesVJU%2F%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202025-03-08%20121736.png?alt=media&token=33a7aa07-11cb-41ea-bfa0-08715da6abaf`,
                isGlobal: true,
                shortDescription: {
                    en: `Test description ${i}`,
                    kz: `Тест сипаттамасы ${i}`,
                    ru: `Тестовое описание ${i}`,
                },
                title: {
                    en: `Test News ${i}`,
                    kz: `Тест Жаңалықтары ${i}`,
                    ru: `Тестовые Новости ${i}`,
                },
                updatedAt: serverTimestamp(),
                viewCount: Math.floor(Math.random() * 1000), // Random view count between 0 and 999
            };
            promises.push(addDoc(collection(firestore, "news"), testNews));
        }

        const docRefs = await Promise.all(promises);
        console.log(
            "10 test news added with IDs:",
            docRefs.map((doc) => doc.id)
        );
        return docRefs.map((doc) => doc.id);
    } catch (error) {
        console.error("Error adding test news:", error);
        throw error;
    }
};

const TestNewsButton = () => {
    const handleAddNews = async () => {
        try {
            await addTestNews();
            alert("10 test news added successfully!");
        } catch (error) {
            alert("Failed to add test news: " + error.message);
        }
    };

    return (
        <View>
            <Button title="Add 10 Test News" onPress={handleAddNews} />
        </View>
    );
};

export default TestNewsButton;
