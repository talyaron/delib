"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _auth = require("firebase/auth");

var _store = _interopRequireDefault(require("../../data/store"));

var _config = require("../firebase/config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var provider = new _auth.GoogleAuthProvider();
var auth = (0, _auth.getAuth)();

function googleLogin() {
  (0, _auth.signInWithPopup)(auth, provider).then(function (result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var credential = _auth.GoogleAuthProvider.credentialFromResult(result);

    var token = credential.accessToken; // The signed-in user info.

    _store["default"].user = result.user;
    console.log("user is logged in with google");
    var lastPage = sessionStorage.getItem('lastPage') || '/groups';

    _mithril["default"].route.set(lastPage); // ...

  })["catch"](function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message; // The email of the user's account used.

    var email = error.email; // The AuthCredential type that was used.

    var credential = _auth.GoogleAuthProvider.credentialFromError(error);

    console.error(errorCode, errorMessage, email, credential); // ...
  }); // var provider = new firebase.auth.GoogleAuthProvider();
  // firebase.auth().signInWithPopup(provider).then(function (result) {
  //     // This gives you a Google Access Token. You can use it to access the Google API.
  //     var token = result.credential.accessToken;
  //     // The signed-in user info.
  //     // store.user = result.user;
  //     console.log(`user is logged in with google`);
  //     let lastPage = sessionStorage.getItem('lastPage') || '/groups'
  //     m.route.set(lastPage)
  // }).catch(function (error) {
  //     // Handle Errors here.
  //     var errorCode = error.code;
  //     var errorMessage = error.message;
  //     // The email of the user's account used.
  //     var email = error.email;
  //     // The firebase.auth.AuthCredential type that was used.
  //     var credential = error.credential;
  //     console.error(errorCode, errorMessage, email, credential)
  //     // ...
  // });
  // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
}

function anonymousLogin() {
  if (_store["default"].userTempName) {
    firebase.auth().signInAnonymously()["catch"](function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message; // ...
    });
  } else {
    console.log('User didnot provide username');
  }
}

function logout() {
  firebase.auth().signOut().then(function () {
    console.log('logout');
  })["catch"](function (error) {
    console.error(error);
  });
}

module.exports = {
  googleLogin: googleLogin,
  anonymousLogin: anonymousLogin,
  logout: logout
};