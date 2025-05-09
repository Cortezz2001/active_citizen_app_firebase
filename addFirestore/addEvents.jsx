import React from "react";
import { View, Button } from "react-native";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../lib/firebase";

export const addTestEvent = async () => {
    try {
        const testEvent = {
            title: {
                en: "Grodno Capella Concert",
                ru: "Концерт Гродненской капеллы",
                kz: "Гродно капелласының концерті",
            },
            cityKey: "pavlodar",
            categoryId: doc(
                firestore,
                "events_categories",
                "rG7BKHidmMVnk1A7lVKs"
            ),
            date: serverTimestamp(),
            location: {
                name: {
                    en: "Cultural Center Concert Hall",
                    ru: "Концертный зал центра культуры",
                    kz: "Мәдениет орталығының концерт залы",
                },
                address: {
                    en: "10 Sovetskaya St, Grodno",
                    ru: "ул. Советская, 10, Гродно",
                    kz: "Советская көшесі, 10, Гродно",
                },
            },
            description: {
                en: "Performance by the Grodno Capella with a classical program.",
                ru: "Выступление Гродненской капеллы с классической программой.",
                kz: "Гродно капелласының классикалық бағдарламамен өнер көрсетуі.",
            },
            ticket_url: "https://ticketon.kz/pavlodar/events",
            imageUrl: "https://picsum.photos/1920/1080",
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
        };
        const docRef = await addDoc(collection(firestore, "events"), testEvent);
        console.log("Test event added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding test event:", error);
        throw error;
    }
};

const TestEventButton = () => {
    const handleAddEvent = async () => {
        try {
            await addTestEvent();
            alert("Test event added successfully!");
        } catch (error) {
            alert("Failed to add test event: " + error.message);
        }
    };

    return (
        <View>
            <Button title="Add Test Event" onPress={handleAddEvent} />
        </View>
    );
};

export default TestEventButton;

// import React from "react";
// import { View, Button } from "react-native";
// import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
// import { firestore } from "../lib/firebase";

// // Функция для генерации случайной строки
// const generateRandomString = (length) => {
//     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
//     let result = "";
//     for (let i = 0; i < length; i++) {
//         result += characters.charAt(
//             Math.floor(Math.random() * characters.length)
//         );
//     }
//     return result;
// };

// // Функция для генерации случайного URL изображения
// const generateRandomImageUrl = () => {
//     return `https://picsum.photos/1920/1080?random=${Math.floor(
//         Math.random() * 1000
//     )}`;
// };

// // Функция для генерации случайной даты (в пределах ближайшего месяца)
// const generateRandomDate = () => {
//     const now = new Date();
//     const randomDays = Math.floor(Math.random() * 30); // Случайно от 0 до 30 дней
//     return new Date(now.setDate(now.getDate() + randomDays));
// };

// // Функция для добавления одного случайного события
// const addRandomEvent = async () => {
//     try {
//         const randomEvent = {
//             title: {
//                 en: `Random Event ${generateRandomString(6)}`,
//                 ru: `Случайное Событие ${generateRandomString(6)}`,
//                 kz: `Кездейсоқ Оқиға ${generateRandomString(6)}`,
//             },
//             cityKey: "pavlodar",
//             categoryId: doc(
//                 firestore,
//                 "events_categories",
//                 "rG7BKHidmMVnk1A7lVKs"
//             ),
//             date: generateRandomDate(), // Можно использовать generateRandomDate() для большей вариативности
//             location: {
//                 name: {
//                     en: `Cultural Venue ${generateRandomString(5)}`,
//                     ru: `Культурный Зал ${generateRandomString(5)}`,
//                     kz: `Мәдени Орын ${generateRandomString(5)}`,
//                 },
//                 address: {
//                     en: `${Math.floor(
//                         Math.random() * 100
//                     )} Random St, Pavlodar`,
//                     ru: `ул. Случайная, ${Math.floor(
//                         Math.random() * 100
//                     )}, Павлодар`,
//                     kz: `Кездейсоқ көшесі, ${Math.floor(
//                         Math.random() * 100
//                     )}, Павлодар`,
//                 },
//             },
//             description: {
//                 en: `Random event description ${generateRandomString(10)}`,
//                 ru: `Описание случайного события ${generateRandomString(10)}`,
//                 kz: `Кездейсоқ оқиғаның сипаттамасы ${generateRandomString(
//                     10
//                 )}`,
//             },
//             ticket_url: `https://ticketon.kz/pavlodar/events/${generateRandomString(
//                 8
//             )}`,
//             imageUrl: generateRandomImageUrl(),
//             created_at: serverTimestamp(),
//             updated_at: serverTimestamp(),
//         };
//         const docRef = await addDoc(
//             collection(firestore, "events"),
//             randomEvent
//         );
//         return docRef.id;
//     } catch (error) {
//         console.error("Error adding random event:", error);
//         throw error;
//     }
// };

// // Функция для добавления 50 случайных событий
// const addMultipleRandomEvents = async (count = 50) => {
//     try {
//         const promises = Array.from({ length: count }, () => addRandomEvent());
//         const results = await Promise.all(promises);
//         console.log(`${count} random events added with IDs:`, results);
//         return results;
//     } catch (error) {
//         console.error("Error adding multiple random events:", error);
//         throw error;
//     }
// };

// const TestEventButton = () => {
//     const handleAddEvent = async () => {
//         try {
//             await addMultipleRandomEvents(50);
//             alert("50 random events added successfully!");
//         } catch (error) {
//             alert("Failed to add random events: " + error.message);
//         }
//     };

//     return (
//         <View>
//             <Button title="Add 50 Random Events" onPress={handleAddEvent} />
//         </View>
//     );
// };

// export default TestEventButton;
