"use strict";

var _configKey = _interopRequireDefault(require("./configKey"));

var _app = require("firebase/app");

var _analytics = require("firebase/analytics");

var _firestore = require("firebase/firestore");

var _storage = require("firebase/storage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
console.log(_configKey["default"]);
var firebaseApp = (0, _app.initializeApp)(_configKey["default"]); // const analytics = getAnalytics(app);

var DB = (0, _firestore.getFirestore)();
var storage = (0, _storage.getStorage)(); // firebase.analytics();
// window.db = DB;

module.exports = {
  DB: DB,
  storage: storage
};