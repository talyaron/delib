"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToTopOptions = exports.listenToOptionsConfirmed = exports.listenToTopOption = void 0;

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../config");

var _store = _interopRequireWildcard(require("../../../data/store"));

var _evaluationTypes = require("../../../data/evaluationTypes");

var _firestore = require("firebase/firestore");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var listenToTopOption = function listenToTopOption(ids) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'consensusPrecentage';

  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId;

    if (!{}.hasOwnProperty.call(_store["default"].selectedOptionListen, subQuestionId)) {
      _store["default"].selectedOptionListen[subQuestionId] = true;

      _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").orderBy(type, 'desc').limit(1).onSnapshot(function (optionsDB) {
        optionsDB.forEach(function (optionDB) {
          if (optionDB.exists) {
            _store["default"].selectedOption[subQuestionId] = optionDB.data();

            _mithril["default"].redraw();
          }
        });
      }, function (e) {
        return console.error(e);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

exports.listenToTopOption = listenToTopOption;

var listenToOptionsConfirmed = function listenToOptionsConfirmed(ids, minmumConfirms) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId;

    if (!{}.hasOwnProperty.call(_store["default"].subQuestionOptionsConfirmedListen, subQuestionId)) {
      _store["default"].subQuestionOptionsConfirmedListen[subQuestionId] = true;

      _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").where('numberOfConfirms', '>=', minmumConfirms).orderBy('numberOfConfirms', 'desc').onSnapshot(function (optionsDB) {
        var confirmedOptions = [];
        optionsDB.forEach(function (optionDB) {
          if (optionDB.exists) {
            var optionObj = optionDB.data();
            optionObj.optionId = optionDB.id;
            confirmedOptions.push(optionObj);
          }
        });
        _store["default"].subQuestionOptionsConfirmed[subQuestionId] = confirmedOptions;
        console.log(_store["default"].subQuestionOptionsConfirmed[subQuestionId]);

        _mithril["default"].redraw();
      }, function (e) {
        return console.error(e);
      });
    }
  } catch (error) {}
};

exports.listenToOptionsConfirmed = listenToOptionsConfirmed;

var listenToTopOptions = function listenToTopOptions(groupId, questionId, subQuestionId, processType, subQuestion) {
  switch (processType) {
    case _evaluationTypes.VOTES:
      listenToTopOption({
        groupId: groupId,
        questionId: questionId,
        subQuestionId: subQuestionId
      });
      break;

    case _evaluationTypes.SUGGESTIONS:
      listenToTopOption({
        groupId: groupId,
        questionId: questionId,
        subQuestionId: subQuestionId
      });
      break;

    case _evaluationTypes.PARALLEL_OPTIONS:
      var maxConfirms = subQuestion.maxConfirms,
          cutoff = subQuestion.cutoff;

      if (cutoff !== undefined && maxConfirms !== undefined) {
        cutoff = parseInt(cutoff);
        maxConfirms = parseInt(maxConfirms);
        var minmumConfirms = maxConfirms * (cutoff / 100);
        listenToOptionsConfirmed({
          groupId: groupId,
          questionId: questionId,
          subQuestionId: subQuestionId
        }, minmumConfirms);
      }

      break;

    default:
      listenToTopOption({
        groupId: groupId,
        questionId: questionId,
        subQuestionId: subQuestionId
      });
      break;
  }
};

exports.listenToTopOptions = listenToTopOptions;