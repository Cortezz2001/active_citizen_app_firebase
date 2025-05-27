/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions/v2");
// Инициализация Firebase Admin
initializeApp();
setGlobalOptions({maxInstances: 10});
// Cloud Function для отслеживания изменений статуса заявок
exports.sendStatusChangeNotification = onDocumentUpdated(
  "requests/{requestId}",
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    
    // Проверяем, изменился ли статус
    if (beforeData.status !== afterData.status) {
      const requestId = event.params.requestId;
      const newStatus = afterData.status;
      const oldStatus = beforeData.status;
      
      console.log(`Status changed from ${oldStatus} to ${newStatus} for request ${requestId}`);
      
      // Получаем userId из заявки
      let userId;
      
      if (typeof afterData.userId === 'string') {
        userId = afterData.userId.replace('/users/', '');
      } else {
        console.log('Invalid userId format');
        return null;
      }
      
      try {
        const db = getFirestore();
        
        // Получаем данные пользователя с его токеном уведомлений
        const userDoc = await db
          .collection('users')
          .doc(userId)
          .get();
        
        if (!userDoc.exists) {
          console.log('User not found:', userId);
          return null;
        }
        
        const userData = userDoc.data();
        const expoPushToken = userData.expoPushToken;
        
        if (!expoPushToken) {
          console.log('No push token found for user:', userId);
          return null;
        }
        
        // Формируем сообщение в зависимости от нового статуса
        let title, body;
        
        switch (newStatus) {
          case 'Completed':
            title = 'Request Completed / Заявка выполнена';
            body = `Your request has been completed / Ваша заявка была выполнена`;
            break;
          case 'Rejected':
            title = 'Request Rejected / Заявка отклонена';
            body = `Your request has been rejected / Ваша заявка была отклонена`;
            break;
          case 'In progress':
            title = 'Request In Progress / Заявка в работе';
            body = `Your request is being processed / Ваша заявка обрабатывается`;
            break;
          default:
            title = 'Request Status Changed / Статус заявки изменен';
            body = `Your request status has been updated to: ${newStatus} / Статус вашей заявки изменен на: ${newStatus}`;
        }
        
        // Отправляем уведомление через Expo
        const message = {
          to: expoPushToken,
          title: title,
          body: body,
          data: {
            requestId: requestId,
            newStatus: newStatus,
            oldStatus: oldStatus,
            type: 'status_change'
          },
          sound: 'default',
          priority: 'high',
          channelId: 'default'
        };
        
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
        
        const result = await response.json();
        console.log('Notification sent successfully:', result);

        return result;
        
      } catch (error) {
        console.error('Error sending notification:', error);
        
        const db = getFirestore();
        
        // Логируем ошибку в Firestore для отладки
        await db
          .collection('notification_errors')
          .add({
            requestId: requestId,
            userId: userId,
            error: error.message,
            timestamp: new Date()
          });
        
        return null;
      }
    }
    
    return null;
  }
);

// Тестовая функция для проверки уведомлений
// exports.testNotification = onRequest(async (req, res) => {
//   // Разрешаем CORS
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Access-Control-Allow-Methods', 'GET, POST');
//   res.set('Access-Control-Allow-Headers', 'Content-Type');
  
//   if (req.method === 'OPTIONS') {
//     res.status(204).send('');
//     return;
//   }
  
//   try {
//     const { userId, message } = req.body;
    
//     if (!userId || !message) {
//       res.status(400).json({ 
//         success: false, 
//         error: 'Missing userId or message',
//         example: {
//           userId: 'your-user-id',
//           message: {
//             title: 'Test Title',
//             body: 'Test Body'
//           }
//         }
//       });
//       return;
//     }
    
//     const db = getFirestore();
    
//     const userDoc = await db
//       .collection('users')
//       .doc(userId)
//       .get();
    
//     if (!userDoc.exists) {
//       res.status(404).json({ success: false, error: 'User not found' });
//       return;
//     }
    
//     const userData = userDoc.data();
//     const expoPushToken = userData.expoPushToken;
    
//     if (!expoPushToken) {
//       res.status(400).json({ 
//         success: false, 
//         error: 'No push token found for user',
//         userData: {
//           hasToken: !!expoPushToken,
//           userId: userId
//         }
//       });
//       return;
//     }
    
//     const testMessage = {
//       to: expoPushToken,
//       title: message.title || 'Test Notification',
//       body: message.body || 'This is a test notification',
//       data: { 
//         type: 'test',
//         timestamp: new Date().toISOString()
//       },
//       sound: 'default',
//       priority: 'high'
//     };
    
//     console.log('Sending test notification:', testMessage);
    
//     const response = await fetch('https://exp.host/--/api/v2/push/send', {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Accept-encoding': 'gzip, deflate',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(testMessage),
//     });
    
//     const result = await response.json();
    
//     console.log('Expo API response:', result);
    
//     res.json({ 
//       success: true, 
//       result,
//       sentTo: expoPushToken,
//       message: testMessage
//     });
    
//   } catch (error) {
//     console.error('Test notification error:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: error.message,
//       stack: error.stack
//     });
//   }
// });

