"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToChatFeed = listenToChatFeed;
exports.listenToBageMessages = listenToBageMessages;

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../config");

var _firestore = require("firebase/firestore");

var _store = _interopRequireWildcard(require("../../../data/store"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function listenToChatFeed() {
  try {
    if (_store["default"].listen.chatFeed == false) {
      var chatFeedRef = (0, _firestore.collection)(_config.DB, 'users', _store["default"].user.uid, 'messages');
      var q = (0, _firestore.query)(chatFeedRef, (0, _firestore.orderBy)("date", "asc"));
      var unsub = (0, _firestore.onSnapshot)(q, function (chatDB) {
        var unreadMessagesCouner = 0;
        var messages = [];
        chatDB.forEach(function (newMessageDB) {
          messages.push(newMessageDB.data());
          unreadMessagesCouner += newMessageDB.data().msgDifference;
        });
        _store["default"].chatFeed = messages;
        _store["default"].chatFeedCounter = unreadMessagesCouner;

        _mithril["default"].redraw();
      });
      _store["default"].listen.chatFeed = true;
    }
  } catch (e) {
    console.error(e);
  }
}

function listenToBageMessages() {
  if ("setAppBadge" in navigator && "clearAppBadge" in navigator) {
    var badgeCounterRef = (0, _firestore.doc)(_config.DB, 'users', _store["default"].user.uid, 'messagesCounter', 'counter');
    return (0, _firestore.onSnapshot)(badgeCounterRef, function (counterDB) {
      if (counterDB.exists) {
        var counter = counterDB.data().messages;
        navigator.setAppBadge(counter)["catch"](function (e) {
          console.error(e);
        });
      }
    });
  } else {
    return function () {};
  }
}