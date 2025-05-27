import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Constants from 'expo-constants';

// Настройка обработки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Регистрация для push-уведомлений и сохранение токена в Firestore
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Создаем канал уведомлений для Android
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    // Проверяем текущие разрешения
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Запрашиваем разрешения, если их нет
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }
    
    // Получаем токен Expo
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('Expo Push Token:', token);
      
      // Сохраняем токен в Firestore
      await saveTokenToFirestore(token);
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
    
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}

/**
 * Сохранение токена в Firestore
 */
async function saveTokenToFirestore(token) {
  try {
    const user = auth().currentUser;
    
    if (user) {
      console.log('Saving token for user:', user.uid);
      
      // Обновляем пользователя, добавляя токен уведомлений
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          expoPushToken: token,
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      
      console.log('Push token saved to Firestore for user:', user.uid);
    } else {
      console.log('No authenticated user found when saving token');
    }
  } catch (error) {
    console.error('Error saving token to Firestore:', error);
  }
}

/**
 * Настройка слушателей уведомлений
 */
export function setupNotificationListeners(navigationRef) {
  // Обработка уведомлений, когда приложение активно
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received while app is active:', notification);
    
    // Можете показать локальное уведомление или обновить UI
    const { title, body } = notification.request.content;
    console.log(`Received: ${title} - ${body}`);
  });

  // Обработка нажатий на уведомления
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    
    // Навигация в зависимости от типа уведомления
    if (data.type === 'status_change' && data.requestId) {
      // Навигация на динамический маршрут pages/requests-detail/[id]
    //   navigationRef.current?.navigate('pages', {
    //     screen: 'requests-detail/[id]',
    //     params: { id: data.requestId, newStatus: data.newStatus },
    //   });
navigationRef.current?.navigate('request', {
  screen: 'my-requests',
});
    }
  });

  // Функция для очистки слушателей
  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Проверка и обновление токена при необходимости
 */
export async function checkAndUpdateToken() {
  try {
    const user = auth().currentUser;
    
    if (!user) {
      console.log('No authenticated user for token check');
      return;
    }
    
    const userDoc = await firestore()
      .collection('users')
      .doc(user.uid)
      .get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const lastUpdate = userData.lastTokenUpdate?.toDate();
      const now = new Date();
      
      // Обновляем токен раз в месяц или если его нет
      if (!userData.expoPushToken || 
          !lastUpdate || 
          (now - lastUpdate) > 30 * 24 * 60 * 60 * 1000) {
        
        console.log('Updating push token...');
        await registerForPushNotificationsAsync();
      }
    } else {
      // Если документа пользователя нет, регистрируем токен
      console.log('User document not found, registering token...');
      await registerForPushNotificationsAsync();
    }
  } catch (error) {
    console.error('Error checking/updating token:', error);
  }
}