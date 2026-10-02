export interface FcmNotificationPayload {
  token?: string;
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(payload: FcmNotificationPayload) {
  // If running in development without credentials, provide mock response
  const hasFirebaseCredentials = Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
  );

  if (!hasFirebaseCredentials) {
    console.log("[FCM Mock Push Notification]:", {
      title: payload.title,
      body: payload.body,
      target: payload.token || payload.topic || "all-facilities",
      data: payload.data,
    });

    return {
      success: true,
      messageId: `mock-fcm-${Date.now()}`,
      mock: true,
    };
  }

  try {
    // In production with credentials, Firebase Admin SDK can be dynamically initialized
    const admin = await import("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        }),
      });
    }

    const messaging = admin.messaging();

    if (payload.token) {
      const response = await messaging.send({
        token: payload.token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      return { success: true, messageId: response };
    } else if (payload.topic) {
      const response = await messaging.send({
        topic: payload.topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      return { success: true, messageId: response };
    }

    return { success: false, error: "No target token or topic provided" };
  } catch (error: any) {
    console.error("[FCM Error]:", error);
    return { success: false, error: error.message };
  }
}
