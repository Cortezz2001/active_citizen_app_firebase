import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Constants from 'expo-constants';

// Настройка обработки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const currentUser = auth().currentUser;
    const notificationUserId = notification.request.content.data?.userId;
    
    if (currentUser && notificationUserId && currentUser.uid !== notificationUserId) {
      console.log(`Notification for user ${notificationUserId}, but current user is ${currentUser.uid}. Skipping.`);
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

/**
 * Регистрация для push-уведомлений и сохранение токена в Firestore
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }
    
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('Expo Push Token:', token);
      
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
 * Сохранение токена в Firestore с учетом устройства
 */
async function saveTokenToFirestore(token) {
  try {
    const user = auth().currentUser;
    
    if (user) {
      console.log('Saving token for user:', user.uid);
      
      const deviceInfo = {
        token: token,
        platform: Platform.OS,
        deviceName: Device.deviceName || Device.modelName || 'Unknown Device',
        lastUpdate: firestore.FieldValue.serverTimestamp(),
        isActive: true 
      };
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          deviceInfo: deviceInfo,
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
 * Очистка токена при выходе из аккаунта
 */
export async function clearPushTokenOnLogout() {
  try {
    const user = auth().currentUser;
    
    if (user) {
      console.log('Clearing push token for user:', user.uid);
      
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          'deviceInfo.isActive': false,
          'deviceInfo.lastLogout': firestore.FieldValue.serverTimestamp()
        });
      
      console.log('Push token cleared for user:', user.uid);
    }
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}

/**
 * Обработка навигации по уведомлению
 */
function handleNotificationNavigation(data, navigationRef) {
  const currentUser = auth().currentUser;
  
  if (!currentUser || !data.userId || currentUser.uid !== data.userId) {
    console.log('Notification navigation ignored - not for current user');
    return;
  }
  
  console.log('Handling notification navigation:', data);
  
  // Обработка различных типов уведомлений
  switch (data.type) {
    case 'request_status_change':
      if (data.documentId) {
        navigationRef.current?.navigate('request', {
          screen: 'my-requests',
        });
      }
      break;
      
    case 'petition_status_change':
      if (data.documentId) {
        navigationRef.current?.navigate('pages', {
          screen: 'my-petitions',
        });
      }
      break;
      
    case 'survey_status_change':
      if (data.documentId) {
        navigationRef.current?.navigate('pages', {
          screen: 'my-surveys',
        });
      }
      break;
      
    // Обратная совместимость со старыми уведомлениями requests
    case 'status_change':
      if (data.requestId) {
        navigationRef.current?.navigate('request', {
          screen: 'my-requests',
        });
      }
      break;
      
    default:
      console.log('Unknown notification type:', data.type);
      break;
  }
}

/**
 * Проверка уведомления при запуске приложения (когда приложение было закрыто)
 */
export async function checkInitialNotification(navigationRef) {
  try {
    console.log('Checking for initial notification...');
    const response = await Notifications.getLastNotificationResponseAsync();
    
    if (response) {
      console.log('Found initial notification:', response);
      const data = response.notification.request.content.data;
      
      if (data && data.type) {
        // Небольшая задержка для загрузки навигации и авторизации
        setTimeout(() => {
          handleNotificationNavigation(data, navigationRef);
        }, 1000);
      }
    } else {
      console.log('No initial notification found');
    }
  } catch (error) {
    console.error('Error checking initial notification:', error);
  }
}

/**
 * Настройка слушателей уведомлений
 */
export function setupNotificationListeners(navigationRef) {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received while app is active:', notification);
    
    const currentUser = auth().currentUser;
    const notificationUserId = notification.request.content.data?.userId;
    
    if (!currentUser || !notificationUserId || currentUser.uid !== notificationUserId) {
      console.log('Notification not for current user, ignoring');
      return;
    }
    
    const { title, body } = notification.request.content;
    console.log(`Received: ${title} - ${body}`);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped:', response);
    
    const data = response.notification.request.content.data;
    handleNotificationNavigation(data, navigationRef);
  });

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
      const now = new Date();
      
      if (!userData.deviceInfo || 
          !userData.deviceInfo.token || 
          (userData.deviceInfo.lastUpdate && 
           (now - userData.deviceInfo.lastUpdate.toDate()) > 30 * 24 * 60 * 60 * 1000)) {
        
        console.log('Updating push token...');
        await registerForPushNotificationsAsync();
      }
    } else {
      console.log('User document not found, registering token...');
      await registerForPushNotificationsAsync();
    }
  } catch (error) {
    console.error('Error checking/updating token:', error);
  }
}