import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: 'gs://frontend-casita-costuras.appspot.com' 
});

export const bucket = admin.storage().bucket();
