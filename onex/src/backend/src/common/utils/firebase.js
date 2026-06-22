// backend/utils/firebase.js
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace escaped newlines with actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
});

const bucket = admin.storage().bucket();
export default bucket;