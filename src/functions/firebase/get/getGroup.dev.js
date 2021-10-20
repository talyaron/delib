"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToGroupSections = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../config");

var _store = _interopRequireWildcard(require("../../../data/store"));

var _firestore = require("firebase/firestore");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//functions
var listenToGroupSections = function listenToGroupSections(groupId) {
  try {
    if (groupId === undefined) throw new Error('group id is missing');

    if (!{}.hasOwnProperty.call(_store["default"].groupSectionsListen, groupId)) {
      _store["default"].groupSectionsListen[groupId] = [];

      if (!{}.hasOwnProperty.call(_store["default"].groupSections, groupId)) {
        _store["default"].groupSections[groupId] = [];
      }

      var sectionsRef = (0, _firestore.collection)(_config.DB, 'groups', groupId, 'sections');
      return (0, _firestore.onSnapshot)(sectionsRef, function (sectionsDB) {
        var sections = [];
        sectionsDB.forEach(function (sectionDB) {
          var sectionObj = sectionDB.data();
          sectionObj.groupTitleId = sectionDB.id;
          sections.push(sectionObj);
        });
        _store["default"].groupSections[groupId] = [].concat(sections);

        _mithril["default"].redraw();
      });
    } else {
      return function () {};
    }
  } catch (e) {
    console.error(e);
    return function () {};
  }
};

exports.listenToGroupSections = listenToGroupSections;