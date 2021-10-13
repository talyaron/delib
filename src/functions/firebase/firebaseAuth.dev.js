"use strict";

var _store = _interopRequireDefault(require("../../data/store"));

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../firebase/config");

var _auth = require("firebase/auth");

var _get = require("../firebase/get/get");

var _getChats = require("../firebase/get/getChats");

var _general = require("../general");

var _messaging = require("../firebase/messaging");

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//functions
var auth = (0, _auth.getAuth)();

function AnonymousLogin() {
  signInAnonymously(auth).then(function () {
    console.log('Anonymous login');
  })["catch"](function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorCode, errorMessage);
  });
}

function onAuth() {
  (0, _auth.onAuthStateChanged)(auth, function (user) {
    try {
      _store["default"].user = user;

      if (user) {
        (0, _messaging.getSubscriptions)();
        console.info('User', _store["default"].user.uid, 'is signed in.');

        if (!user.isAnonymous) {
          console.info('user', user.displayName, 'is logged in');
          user.name = user.displayName;
          var userSimpleObj = {
            uid: _store["default"].user.uid,
            name: _store["default"].user.name,
            email: _store["default"].user.email,
            isAnonymous: false,
            userColor: (0, _general.getRandomColorDark)(),
            signIn: true,
            groupsUserTryToRegister: {}
          };
          (0, _get.getUser)(_store["default"].user.uid);
          (0, _get.listenToFeed)();
          (0, _get.listenToFeedLastEntrance)();
          (0, _getChats.listenToChatFeed)();
          (0, _get.listenToUserGroups)();
          (0, _get.listenToRegisterdGroups)();
          (0, _getChats.listenToBageMessages)();

          _config.DB.collection('users').doc(user.uid).set(userSimpleObj, {
            merge: true
          }).then(function () {})["catch"](function (error) {
            console.error('On login, set user to DB;', error.name, error.message); // if(error.message == 'Missing or insufficient permissions.'){alert('Insufficient permisions')}
            // console.error('Error writing User 22: ', error);
          });

          var lastPage = sessionStorage.getItem('lastPage') || '/groups';

          _mithril["default"].route.set(lastPage);
        } else {
          //if user anonymous
          console.info('user is anonymous');
          (0, _get.getUser)(_store["default"].user.uid);
          (0, _get.listenToUserGroups)();
          (0, _get.listenToRegisterdGroups)();

          if (_store["default"].userTempName) {
            _store["default"].user.name = _store["default"].userTempName;
            _store["default"].user.userColor = (0, _general.getRandomColorDark)();
            var _userSimpleObj = {
              uid: _store["default"].user.uid,
              name: _store["default"].user.name,
              isAnonymous: true,
              userColor: _store["default"].user.userColor,
              signIn: true,
              groupsUserTryToRegister: {}
            };

            _config.DB.collection('users').doc(user.uid).set(_userSimpleObj).then(function () {})["catch"](function (error) {
              console.error('Error writing User: ', error);
            });
          } else {
            getAnonymousName(_store["default"].user.uid);
          }

          var _lastPage = sessionStorage.getItem('lastPage') || '/groups';

          _mithril["default"].route.set(_lastPage);
        }
      } else {
        console.info('User is signed out.');
        _store["default"].user = {};
        _store["default"].push = [false];

        _mithril["default"].redraw();
      }
    } catch (err) {
      console.error(err);
    }
  });
}

module.exports = {
  onAuth: onAuth,
  AnonymousLogin: AnonymousLogin
};

function getAnonymousName(userId) {
  _config.DB.collection('users').doc(userId).get().then(function (userDB) {
    _store["default"].user.name = userDB.data().name;
    _store["default"].user.userColor = userDB.data().userColor || 'teal';

    _mithril["default"].redraw();
  })["catch"](function (err) {
    console.error(err);
  });
}