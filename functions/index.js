const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ maxInstances: 10 });

exports.sendStatusChangeNotification = onDocumentUpdated(
  "requests/{requestId}",
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    
    if (beforeData.status !== afterData.status) {
      const requestId = event.params.requestId;
      const newStatus = afterData.status;
      const oldStatus = beforeData.status;
      
      console.log(`Status changed from ${oldStatus} to ${newStatus} for request ${requestId}`);
      
      if (newStatus !== 'Rejected' && newStatus !== 'Completed') {
        console.log(`Status ${newStatus} does not require notification. Skipping.`);
        return null;
      }
      
      let userId;
      
      if (typeof afterData.userId === 'string') {
        userId = afterData.userId.replace('/users/', '');
        console.log(`Extracted userId: ${userId}`);
      } else {
        console.log('Invalid userId format:', afterData.userId);
        return null;
      }
      
      if (!userId || userId.trim() === '') {
        console.log('Empty userId after processing');
        return null;
      }
      
      try {
        const db = getFirestore();
        
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
          console.log('User not found:', userId);
          return null;
        }
        
        const userData = userDoc.data();
        
        if (!userData.deviceInfo || !userData.deviceInfo.isActive || !userData.deviceInfo.token) {
          console.log('Device info missing, not active, or no token for user:', userId);
          return null;
        }
        
        const expoPushToken = userData.deviceInfo.token;
        const language = userData.language || 'ru'; // По умолчанию русский
        
        console.log(`Sending notification to user ${userId} with token: ${expoPushToken.substring(0, 20)}... in language: ${language}`);
        
        // Объект переводов
        const translations = {
          en: {
            completedTitle: 'Request Completed',
            completedBody: 'Your request has been completed',
            rejectedTitle: 'Request Rejected',
            rejectedBody: 'Your request has been rejected',
          },
          ru: {
            completedTitle: 'Заявка выполнена',
            completedBody: 'Ваша заявка была выполнена',
            rejectedTitle: 'Заявка отклонена',
            rejectedBody: 'Ваша заявка была отклонена',
          },
          kz: {
            completedTitle: 'Өтініш орындалды',
            completedBody: 'Сіздің өтінішіңіз орындалды',
            rejectedTitle: 'Өтініш қабылданбады',
            rejectedBody: 'Сіздің өтінішіңіз қабылданбады',
          }
        };
        
        // Проверка на поддержку языка
        const validLanguage = translations[language] ? language : 'ru';
        
        let title, body;
        if (newStatus === 'Completed') {
          title = translations[validLanguage].completedTitle;
          body = translations[validLanguage].completedBody;
        } else if (newStatus === 'Rejected') {
          title = translations[validLanguage].rejectedTitle;
          body = translations[validLanguage].rejectedBody;
        }
        
        const message = {
          to: expoPushToken,
          title: title,
          body: body,
          data: {
            requestId: requestId,
            newStatus: newStatus,
            oldStatus: oldStatus,
            type: 'status_change',
            userId: userId 
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
        
        if (response.ok) {
          console.log('Notification sent successfully to user:', userId, result);
        } else {
          console.error('Error response from Expo:', result);
          throw new Error(`Expo API error: ${JSON.stringify(result)}`);
        }

        return result;
        
      } catch (error) {
        console.error('Error sending notification:', error);
        
        const db = getFirestore();
        
        try {
          await db.collection('notification_errors').add({
            requestId: requestId,
            userId: userId,
            error: error.message,
            errorStack: error.stack,
            timestamp: new Date(),
            newStatus: newStatus,
            oldStatus: oldStatus
          });
        } catch (logError) {
          console.error('Error logging to Firestore:', logError);
        }
        
        return null;
      }
    } else {
      console.log('Status did not change, skipping notification');
    }
    
    return null;
  }
);