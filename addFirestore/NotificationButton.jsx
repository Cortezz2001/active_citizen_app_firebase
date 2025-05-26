import React, { useEffect } from "react";
import { View, Button, Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== "granted") {
            Alert.alert("Ошибка", "Разрешение на уведомления не получено!");
            return;
        }
        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId: "active_citizen_app",
            })
        ).data;
        console.log("Push token:", token);
    } else {
        Alert.alert(
            "Ошибка",
            "Для получения push-уведомлений используйте физическое устройство."
        );
    }

    if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    return token;
}

async function scheduleTestNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Тестовое уведомление",
            body: "Это пример локального уведомления!",
            data: { someData: "Тестовые данные" },
        },
        trigger: { seconds: 2 },
    });
}

export default function NotificationButton() {
    useEffect(() => {
        // Запрашиваем разрешение при монтировании компонента
        registerForPushNotificationsAsync();

        // Обработчик для уведомлений в foreground
        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Уведомление получено:", notification);
            });

        // Обработчик для реакции на нажатие уведомления
        const responseListener =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log("Реакция на уведомление:", response);
                }
            );

        // Очистка слушателей при размонтировании
        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);

    return (
        <View>
            <Button
                title="Отправить тестовое уведомление"
                onPress={async () => {
                    await scheduleTestNotification();
                }}
            />
        </View>
    );
}
