const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({ maxInstances: 10 });

// Общая функция для отправки уведомлений
async function sendStatusChangeNotification(event, collectionType) {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  
  if (beforeData.status !== afterData.status) {
    const documentId = event.params[`${collectionType}Id`];
    const newStatus = afterData.status;
    const oldStatus = beforeData.status;
    
    console.log(`${collectionType} status changed from ${oldStatus} to ${newStatus} for ${collectionType} ${documentId}`);
    
    const notificationStatuses = ['Rejected', 'Completed', 'Published'];
    
    if (!notificationStatuses.includes(newStatus)) {
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
      
      console.log(`Sending ${collectionType} notification to user ${userId} with token: ${expoPushToken.substring(0, 20)}... in language: ${language}`);
      
      // Объект переводов
      const translations = {
        en: {
          request: {
            completedTitle: 'Request Completed',
            completedBody: 'Your request has been completed',
            rejectedTitle: 'Request Rejected',
            rejectedBody: 'Your request has been rejected',
          },
          petition: {
            completedTitle: 'Petition Completed',
            completedBody: 'Your petition has been completed',
            rejectedTitle: 'Petition Rejected',
            rejectedBody: 'Your petition has been rejected',
            publishedTitle: 'Petition Published',
            publishedBody: 'Your petition has been published',
          },
          survey: {
            completedTitle: 'Survey Completed',
            completedBody: 'Your survey has been completed',
            rejectedTitle: 'Survey Rejected',
            rejectedBody: 'Your survey has been rejected',
            publishedTitle: 'Survey Published',
            publishedBody: 'Your survey has been published',
          }
        },
        ru: {
          request: {
            completedTitle: 'Заявка выполнена',
            completedBody: 'Ваша заявка была выполнена',
            rejectedTitle: 'Заявка отклонена',
            rejectedBody: 'Ваша заявка была отклонена',
          },
          petition: {
            completedTitle: 'Петиция выполнена',
            completedBody: 'Ваша петиция была выполнена',
            rejectedTitle: 'Петиция отклонена',
            rejectedBody: 'Ваша петиция была отклонена',
            publishedTitle: 'Петиция опубликована',
            publishedBody: 'Ваша петиция была опубликована',
          },
          survey: {
            completedTitle: 'Опрос выполнен',
            completedBody: 'Ваш опрос был выполнен',
            rejectedTitle: 'Опрос отклонен',
            rejectedBody: 'Ваш опрос был отклонен',
            publishedTitle: 'Опрос опубликован',
            publishedBody: 'Ваш опрос был опубликован',
          }
        },
        kz: {
          request: {
            completedTitle: 'Өтініш орындалды',
            completedBody: 'Сіздің өтінішіңіз орындалды',
            rejectedTitle: 'Өтініш қабылданбады',
            rejectedBody: 'Сіздің өтінішіңіз қабылданбады',
          },
          petition: {
            completedTitle: 'Петиция орындалды',
            completedBody: 'Сіздің петицияңыз орындалды',
            rejectedTitle: 'Петиция қабылданбады',
            rejectedBody: 'Сіздің петицияңыз қабылданбады',
            publishedTitle: 'Петиция жарияланды',
            publishedBody: 'Сіздің петицияңыз жарияланды',
          },
          survey: {
            completedTitle: 'Сауалнама орындалды',
            completedBody: 'Сіздің сауалнамаңыз орындалды',
            rejectedTitle: 'Сауалнама қабылданбады',
            rejectedBody: 'Сіздің сауалнамаңыз қабылданбады',
            publishedTitle: 'Сауалнама жарияланды',
            publishedBody: 'Сіздің сауалнамаңыз жарияланды',
          }
        }
      };
      
      // Проверка на поддержку языка
      const validLanguage = translations[language] ? language : 'ru';
      
      // Определяем тип документа для переводов
      let documentType;
      switch (collectionType) {
        case 'request':
          documentType = 'request';
          break;
        case 'petition':
          documentType = 'petition';
          break;
        case 'survey':
          documentType = 'survey';
          break;
        default:
          documentType = 'request';
      }
      
      let title, body;
      if (newStatus === 'Completed') {
        title = translations[validLanguage][documentType].completedTitle;
        body = translations[validLanguage][documentType].completedBody;
      } else if (newStatus === 'Rejected') {
        title = translations[validLanguage][documentType].rejectedTitle;
        body = translations[validLanguage][documentType].rejectedBody;
      } else if (newStatus === 'Published') {
        title = translations[validLanguage][documentType].publishedTitle;
        body = translations[validLanguage][documentType].publishedBody;
      }
      
      const message = {
        to: expoPushToken,
        title: title,
        body: body,
        data: {
          documentId: documentId,
          newStatus: newStatus,
          oldStatus: oldStatus,
          type: `${collectionType}_status_change`,
          userId: userId,
          collectionType: collectionType
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
        console.log(`${collectionType} notification sent successfully to user:`, userId, result);
      } else {
        console.error('Error response from Expo:', result);
        throw new Error(`Expo API error: ${JSON.stringify(result)}`);
      }

      return result;
      
    } catch (error) {
      console.error(`Error sending ${collectionType} notification:`, error);
      
      const db = getFirestore();
      
      try {
        await db.collection('notification_errors').add({
          documentId: documentId,
          userId: userId,
          error: error.message,
          errorStack: error.stack,
          timestamp: new Date(),
          newStatus: newStatus,
          oldStatus: oldStatus,
          collectionType: collectionType
        });
      } catch (logError) {
        console.error('Error logging to Firestore:', logError);
      }
      
      return null;
    }
  } else {
    console.log(`${collectionType} status did not change, skipping notification`);
  }
  
  return null;
}

// Cloud Function для requests
exports.sendRequestStatusChangeNotification = onDocumentUpdated(
  "requests/{requestId}",
  async (event) => {
    return await sendStatusChangeNotification(event, 'request');
  }
);

// Cloud Function для petitions
exports.sendPetitionStatusChangeNotification = onDocumentUpdated(
  "petitions/{petitionId}",
  async (event) => {
    return await sendStatusChangeNotification(event, 'petition');
  }
);

// Cloud Function для surveys
exports.sendSurveyStatusChangeNotification = onDocumentUpdated(
  "surveys/{surveyId}",
  async (event) => {
    return await sendStatusChangeNotification(event, 'survey');
  }
);