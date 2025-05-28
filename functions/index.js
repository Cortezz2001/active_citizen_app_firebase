const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions/v2");

initializeApp();
setGlobalOptions({maxInstances: 10});

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
        
        const userDoc = await db
          .collection('users')
          .doc(userId)
          .get();
        
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
        
        console.log(`Sending notification to user ${userId} with token: ${expoPushToken.substring(0, 20)}...`);
        
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
          default:
            console.log(`Unexpected status for notification: ${newStatus}`);
            return null;
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
          await db
            .collection('notification_errors')
            .add({
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