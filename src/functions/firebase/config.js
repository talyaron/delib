// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";


import "firebase/firestore";
import "firebase/storage";


import { config } from './configKey';



firebase.initializeApp(config);
const DB = firebase.firestore();
const storage = firebase.storage();
// window.db = DB;
DB.settings({});

module.exports = { DB, storage };