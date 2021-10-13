import config  from './configKey';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

console.log(config)

const firebaseApp = initializeApp(config);
// const analytics = getAnalytics(app);



const DB = getFirestore();
const storage = getStorage();
// firebase.analytics();
// window.db = DB;


module.exports = { DB, storage };