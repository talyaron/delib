"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _messaging = require("firebase/messaging");

var _config = require("./config");

var _store = _interopRequireDefault(require("../../data/store"));

var _dataTypes = require("../../data/dataTypes");

var _general = require("../general");

var _configKey = require("../firebase/configKey");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var messaging = (0, _messaging.getMessaging)();

if ('Notification' in window) {
  // Retrieve Firebase Messaging object.
  // Add the public key generated from the console here.
  (0, _messaging.getToken)(messaging, {
    vapidKey: 'BOXKnicJW5Cu3xwRG7buXf-JU8tS-AErJX_Ax7CsUwqZQvBvo2E-ECnE-uGvUKcgeL-1nT-cJw8qGo4dH-zrfGA'
  }).then(function (currentToken) {
    console.log(currentToken);
  }); // Callback fired if Instance ID token is updated.
  // MESSAGING.onTokenRefresh(function () {
  //     handleTokenRefresh();
  // });
  // MESSAGING.onMessage(function (payload) {
  // });
} // update which enteties are subscribed


function getSubscriptions() {
  if ('Notification' in window) {
    try {
      _config.DB.collection('tokens').doc(_store["default"].user.uid).onSnapshot(function (userTokenDB) {
        if (userTokenDB.exists && userTokenDB.data().pushEntities) {
          _store["default"].push = userTokenDB.data().pushEntities;

          _mithril["default"].redraw();
        }
      }, function (err) {
        console.error('On getSubscriptions:', err.name, err.message);
      });
    } catch (err) {
      if (err.message === 'Missing or insufficient permissions.') {
        console.error('Cant get subscriptions because of insufficient perpmissions');
      } else {
        console.error(err);
      }
    }
  }
}

function subscribeToNotification(ids) {
  var subscribe = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  try {
    if ('Notification' in window) {
      MESSAGING.requestPermission().then(function () {
        console.info('Notification permission granted.');
        handleTokenRefresh(ids, subscribe);
      })["catch"](function (err) {
        console.info('Unable to get permission to notify.', err);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function unsubscribeFromNotification(ids) {
  if ('Notification' in window) {// delete store.push[entity][entityId]
    // MESSAGING.getToken()
    //     .then((token) => {
    //         MESSAGING.deleteToken(token);
    //     })
    //     .then(() => {
    //         DB.collection('tokens').doc(store.user.uid).get().then((userTokenDB) => {
    //             if (userTokenDB.exists && userTokenDB.data().pushEntities) {
    //                 let entitiesSet = new Set(userTokenDB.data().pushEntities);
    //                 entitiesSet.delete(entityId);
    //                 console.dir(entitiesSet);
    //                 let entitiesArray = new Array(...entitiesSet);
    //                 DB.collection('tokens').doc(store.user.uid).update({
    //                     pushEntities: entitiesArray
    //                 });
    //             }
    //         });
    //     });
  }
}

function handleTokenRefresh(ids, subscribe) {
  try {
    if ('Notification' in window) {
      return MESSAGING.getToken().then(function (token) {
        var groupId = ids.groupId,
            questionId = ids.questionId,
            subQuestionId = ids.subQuestionId,
            optionId = ids.optionId;
        console.log('handleTokenRefresh', groupId, questionId, subQuestionId, optionId); //get device unique id

        var deviceUniqueId = localStorage.getItem('deviceUniqueId');

        if (deviceUniqueId === null) {
          deviceUniqueId = (0, _general.setBrowserUniqueId)();
        }

        var dbPath = "".concat((0, _general.concatenateDBPath)(groupId, questionId, subQuestionId, optionId), "/notifications/").concat(_store["default"].user.uid);
        console.log(dbPath);

        var tokenRef = _config.DB.doc(dbPath);

        if (subscribe === true) {
          var tokenObj = {};
          tokenObj[deviceUniqueId] = {
            token: token,
            uid: _store["default"].user.uid
          };
          tokenRef.set(tokenObj, {
            merge: true
          });
        } else {
          tokenRef.update(_defineProperty({}, deviceUniqueId, firebase.firestore.FieldValue["delete"]()));
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  getSubscriptions: getSubscriptions,
  subscribeToNotification: subscribeToNotification,
  unsubscribeFromNotification: unsubscribeFromNotification
};