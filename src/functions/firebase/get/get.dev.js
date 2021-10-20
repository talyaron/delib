"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../config");

var _firestore = require("firebase/firestore");

var _store = _interopRequireWildcard(require("../../../data/store"));

var _evaluationTypes = require("../../../data/evaluationTypes");

var _lodash = require("lodash");

var _general = require("../../general");

var _set = require("../set/set");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//model
//functions
var unsubscribe = {};

function getUser(uid) {
  var userRef, userSnap, _userSnap$data, stopRegistrationMessages, firstTimeOnSuggestions;

  return regeneratorRuntime.async(function getUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          userRef = (0, _firestore.doc)(_config.DB, 'users', uid);
          _context.next = 4;
          return regeneratorRuntime.awrap((0, _firestore.getDoc)(userRef));

        case 4:
          userSnap = _context.sent;

          if (!userSnap.exists()) {
            _context.next = 13;
            break;
          }

          console.log(userSnap.data());
          _userSnap$data = userSnap.data(), stopRegistrationMessages = _userSnap$data.stopRegistrationMessages, firstTimeOnSuggestions = _userSnap$data.firstTimeOnSuggestions;
          if (stopRegistrationMessages === undefined) stopRegistrationMessages = false;
          _store["default"].user.stopRegistrationMessages = stopRegistrationMessages; //check if user is first time on suggestions

          if (firstTimeOnSuggestions === undefined) _store["default"].user.firstTimeOnSuggestions = true;
          _context.next = 14;
          break;

        case 13:
          throw new Error("No user with id ".concat(uid));

        case 14:
          _context.next = 20;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          (0, _set.sendError)(_context.t0);

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 16]]);
}

function listenToUserGroups() {
  try {
    if (!{}.hasOwnProperty.call(_store["default"].user, 'uid')) throw new Error('Cant listen to user groups, because user do not have uid');

    if (_store["default"].userGroupsListen === false) {
      _store["default"].userGroupsListen = true;
      var q = (0, _firestore.query)((0, _firestore.collection)(_config.DB, 'users', _store["default"].user.uid, 'groupsOwned'));
      var unsub = (0, _firestore.onSnapshot)(q, function (groupsOwnedDB) {
        setTimeout(function () {
          if (_store["default"].userGroups[0] === false) _store["default"].userGroups.splice(0, 1);

          _mithril["default"].redraw();
        }, 500);
        listenToGroups(groupsOwnedDB);

        _mithril["default"].redraw();
      }, function (err) {
        console.error('On getUserGroups:', err.name, err.message);
        (0, _set.sendError)(err);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function listenToRegisterdGroups() {
  try {
    if ({}.hasOwnProperty.call(_store["default"].user, 'uid') && _store["default"].registerGroupsListen === false) {
      _store["default"].registerGroupsListen = true;
      var registerdGroupsRef = (0, _firestore.collection)(_config.DB, 'users', _store["default"].user.uid, 'registerGroups');
      var unsub = (0, _firestore.onSnapshot)(registerdGroupsRef, function (groupsDB) {
        listenToGroups(groupsDB);
      }, function (err) {
        console.error('On listenToRegisterdGroups:', err.name, err.message);
        (0, _set.sendError)(e);
      });
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToGroups(groupsDB) {
  try {
    groupsDB.docChanges().forEach(function (change) {
      if (change.type === "added") {
        //subscribe to group and listen
        _store["default"].userGroupsListners[change.doc.id] = listenToGroup(change.doc.id);
      } else if (change.type === "removed") {
        //remove from dom
        var groupIndex = _store["default"].userGroups.findIndex(function (group) {
          return group.id === change.doc.id;
        });

        if (groupIndex > -1) {
          _store["default"].userGroups.splice(groupIndex, 1);
        } //unsubscribe to group


        _store["default"].userGroupsListners[change.doc.id]();

        delete _store["default"].userGroupListen[change.doc.id];
      }

      _mithril["default"].redraw();
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToGroup(groupId) {
  try {
    if (!{}.hasOwnProperty.call(_store["default"].userGroupsListners, groupId)) {
      _store["default"].userGroupListen[groupId] = true;
      return _config.DB.collection('groups').doc(groupId).onSnapshot(function (groupDB) {
        if (groupDB.exists) {
          var groupIndex = _store["default"].userGroups.findIndex(function (group) {
            return group.id === groupId;
          });

          if (_store["default"].userGroups[0] === false) _store["default"].userGroups.splice(0, 1);
          var groupObj = groupDB.data();

          if (!{}.hasOwnProperty.call(groupObj, 'id')) {
            _config.DB.collection('groups').doc(groupId).update({
              id: groupId,
              groupId: groupId
            })["catch"](function (e) {
              console.error(e);
              (0, _set.sendError)(e);
            });
          }

          groupObj.id = groupObj.groupId = groupDB.id;

          if (groupIndex == -1) {
            _store["default"].userGroups.push(groupObj);
          } else {
            _store["default"].userGroups[groupIndex] = groupObj;
          }

          _mithril["default"].redraw();
        } else {
          _config.DB.collection('users').doc(_store["default"].user.uid).collection('registerGroups').doc(groupId)["delete"]().then(function (d) {
            return console.info(d);
          });

          throw new Error("group ".concat(groupId, " do not exists. deleteing this group from user subscription"));
        }
      }, function (err) {
        console.error('On listenToGroup:', err.name, err.message);
        (0, _set.sendError)(err);
      });
    } else {
      return function () {};
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
    ;
  }
}

function listenToGroupMembers(groupId) {
  try {
    return _config.DB.collection('groups').doc(groupId).collection('members').onSnapshot(function (membersDB) {
      var members = [];
      membersDB.forEach(function (memberDB) {
        members.push(memberDB.data());
      });
      _store["default"].groupMembers[groupId] = members;

      _mithril["default"].redraw();
    }, function (e) {
      console.error(e);
      (0, _set.sendError)(e);
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
    return function () {};
  }
}

function getQuestions(onOff, groupId, vnode) {
  if (onOff === "on") {
    vnode.state.unsubscribe = _config.DB.collection("groups").doc(groupId).collection("questions").orderBy("time", "desc").onSnapshot(function (questionsDb) {
      questionsDb.forEach(function (questionDB) {
        if (questionDB.data().id) {
          setStore(_store["default"].questions, groupId, questionDB.data().id, questionDB.data());
        }
      });

      _mithril["default"].redraw();
    });
  } else {
    vnode.state.unsubscribe();
  }
}

function setStore(obj, groupId, questionId, data) {
  if (!obj.hasOwnProperty(groupId)) {
    obj[groupId] = {};
    obj[groupId][questionId] = data;
  } else {
    obj[groupId][questionId] = data;
  }
}

function listenToGroupDetails(groupId, vnode) {
  try {
    if (typeof groupId !== 'string') {
      console.info(groupId);
      throw new Error(' groupId is not a string');
    }

    if (!{}.hasOwnProperty.call(_store["default"].groupListen, groupId)) {
      _store["default"].groupListen[groupId] = true;

      _config.DB.collection("groups").doc(groupId).onSnapshot(function (groupDB) {
        _store["default"].groups[groupId] = groupDB.data();

        _mithril["default"].redraw();
      }, function (err) {
        console.error("At listenToGroupDetails: ".concat(err.name, ", ").concat(err.message));

        if (err.message === 'Missing or insufficient permissions.') {
          _mithril["default"].route.set('/unauthorized');
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function getQuestionDetails(groupId, questionId, vnode) {
  var unsubscribe = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).onSnapshot(function (questionDB) {
    // set(store.questions, `[${groupId}][${questionId}]`, questionDB.data());
    setStore(_store["default"].questions, groupId, questionId, questionDB.data());
    vnode.state.title = questionDB.data().title;
    vnode.state.description = questionDB.data().description;
    vnode.state.creatorId = questionDB.data().creatorId;

    if (questionDB.data().authorization) {
      vnode.state.authorized = questionDB.data().authorization;
    }

    listenSubQuestions(groupId, questionId, vnode);

    _mithril["default"].redraw();
  });

  return unsubscribe;
}

function listenSubQuestions(groupId, questionId, vnode) {
  var getSubOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  try {
    //listen only once
    if (!{}.hasOwnProperty.call(_store["default"].subQuestionsListners, questionId)) {
      _store["default"].subQuestionsListners[questionId] = {
        listen: true
      };

      if (!{}.hasOwnProperty.call(vnode.state, 'creatorId')) {
        throw new Error('No creatorId in vnode at listenSubQuestions');
      }

      var term, search; // sub question seen by the admin are diffrenet then subquestions seen by yhe simple user

      if (vnode.state.creatorId != _store["default"].user.uid) {
        //simple user view
        term = '==';
        search = 'userSee';
      } else {
        //admin view
        term = '!=';
        search = 'deleted';
      }

      _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions") // .where('showSubQuestion', term, search)
      .onSnapshot(function (subQuestionsDB) {
        var subQuestionsArray = [];
        var subQuestionsObj = {};
        subQuestionsDB.forEach(function (subQuestionDB) {
          var subQuestionObj = subQuestionDB.data();
          subQuestionObj.subQuestionId = subQuestionObj.id = subQuestionDB.id;
          subQuestionsArray.push(subQuestionObj);
          subQuestionsObj[subQuestionObj.id] = {};
        });
        _store["default"].subQuestions[groupId] = subQuestionsArray;

        _mithril["default"].redraw();
      });
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function getSubQuestion(groupId, questionId, subQuestionId, isSingle) {
  try {
    var optionRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId);

    return optionRef.onSnapshot(function (subQuestionDB) {
      if (subQuestionDB.exists) {
        (0, _lodash.set)(_store["default"], "subQuestions[".concat(subQuestionId, "]"), subQuestionDB.data());

        _mithril["default"].redraw();
      } else {
        console.error("subQuestion ".concat(groupId, "/").concat(questionId, "/").concat(subQuestionId, " dont exists "));

        _mithril["default"].route.set("question/".concat(groupId, "/").concat(questionId));
      }
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToOptions(groupId, questionId, subQuestionId) {
  var order = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'top';
  var isSingle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  try {
    if (!{}.hasOwnProperty.call(_store["default"].optionsListen, subQuestionId)) {
      //signal that this questionId options are listend to
      _store["default"].optionsListen[subQuestionId] = true;

      var optionsRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options");

      var _orderBy = "time";

      switch (order) {
        case "new":
          _orderBy = "time";
          break;

        case "top":
          _orderBy = "consensusPrecentage";
          break;

        default:
          _orderBy = "time";
      }

      var _limit = 100; // if (isSingle === true) {
      //     limit = 1
      // }

      return optionsRef.orderBy(_orderBy, "desc").limit(_limit).onSnapshot(function (optionsDB) {
        var optionsArray = [];
        optionsDB.forEach(function (optionDB) {
          //see how many message the user read (from total mesaages of option). use this to calculate hoem namy messages the user didn't read.
          listenToUserLastReadOfOptionChat(optionDB.data().optionId); //this is a patch TODO: change all data to query of active or not active options

          if (optionDB.data().isActive == null || optionDB.data().isActive == true) {
            var optionObj = optionDB.data();
            optionObj.id = optionObj.optionId = optionDB.id; //the preferd syntax is 'optionId' and not id, but we left the old 'id' for backward compatability purpose (Tal Yaron)

            optionObj.subQuestionId = subQuestionId; //get before position Align for animation

            var elm = document.getElementById(optionObj.id);

            if (elm) {
              _store["default"].optionsLoc[optionObj.id] = {
                offsetTop: elm.offsetTop,
                offsetLeft: elm.offsetLeft,
                toAnimate: true,
                "new": false
              };
            } else {
              _store["default"].optionsLoc[optionObj.id] = {
                offsetTop: 0,
                offsetLeft: 0,
                toAnimate: false,
                "new": true
              };
            }

            optionsArray.push(optionObj);
          } else {
            console.info(optionDB.data().id, 'is not active');
          }

          ;
        });
        (0, _lodash.set)(_store["default"], "options[".concat(subQuestionId, "]"), optionsArray); //add or update or delete an option

        _mithril["default"].redraw();
      });
    } else {
      return function () {};
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToUserLastReadOfOptionChat(optionId) {
  try {
    if (!{}.hasOwnProperty.call(_store["default"].optionNumberOfMessagesRead, optionId)) {
      _config.DB.collection('users').doc(_store["default"].user.uid).collection('optionsRead').doc(optionId).onSnapshot(function (optionListenDB) {
        if (optionListenDB.exists) {
          var numberOfMessages = optionListenDB.data().numberOfMessages || 0;
          _store["default"].optionNumberOfMessagesRead[optionId] = numberOfMessages;

          _mithril["default"].redraw();
        }
      }, function (e) {
        console.error(e);
        (0, _set.sendError)(e);
      });
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToOption(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    if (groupId === undefined) throw new Error('missing groupId');
    if (questionId === undefined) throw new Error('missing questionId');
    if (subQuestionId === undefined) throw new Error('missing subQuestionId');
    if (optionId === undefined) throw new Error('missing optionId');
    return _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").doc(optionId).onSnapshot(function (optionDB) {
      var optionObj = optionDB.data();
      optionObj.optionId = optionDB.data().optionId;
      (0, _lodash.set)(_store["default"], "option[".concat(optionId, "]"), optionObj);

      _mithril["default"].redraw();
    }, function (e) {
      console.error(e);
      (0, _set.sendError)(e);
      ;
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
    ;
  }
}

function getOptionDetails(groupId, questionId, subQuestionId, optionId, vnode) {
  var optionRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").doc(optionId);

  return optionRef.onSnapshot(function (optionDB) {
    _store["default"].optionsDetails[optionId] = optionDB.data();
    vnode.state.option.title = optionDB.data().title;

    _mithril["default"].redraw();
  });
}

function getOptionVote(groupId, questionId, subQuestionId, optionId, creatorId) {
  var processType = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : _evaluationTypes.SUGGESTIONS;

  try {
    if (groupId === undefined || questionId === undefined || subQuestionId === undefined || optionId === undefined || creatorId === undefined) throw new Error("One of the Ids groupId, questionId, subQuestionId, optionId, creatorId is missing", groupId, questionId, subQuestionId, optionId, creatorId);

    var evaluationRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").doc(optionId);

    var evaluationTypeRef;

    if (processType === _evaluationTypes.SUGGESTIONS) {
      evaluationTypeRef = evaluationRef.collection("likes").doc(creatorId);
    } else if (processType === _evaluationTypes.PARALLEL_OPTIONS) {
      evaluationTypeRef = evaluationRef.collection("confirms").doc(creatorId);
    } else {
      throw new Error("couldnt detect the process type (".concat(processType, ")"));
    }

    var _unsubscribe = evaluationTypeRef.onSnapshot(function (voteDB) {
      if (voteDB.exists) {
        if (processType === _evaluationTypes.SUGGESTIONS) {
          _store["default"].optionsVotes[optionId] = voteDB.data().like;
        } else if (processType === _evaluationTypes.PARALLEL_OPTIONS) {
          console.log('process type', _evaluationTypes.PARALLEL_OPTIONS);
          console.log(voteDB.data());
          _store["default"].optionsConfirm[optionId] = voteDB.data().confirm;
        }
      } else {
        _store["default"].optionsVotes[optionId] = 0;
        console.error('voteDB do not exists.....');
      }

      console.log(_store["default"].optionsConfirm);

      _mithril["default"].redraw();
    });

    return _unsubscribe;
  } catch (e) {
    console.error(e);
  }
}

function listenToUserVote(vnode) {
  try {
    var _vnode$attrs$ids = vnode.attrs.ids,
        groupId = _vnode$attrs$ids.groupId,
        questionId = _vnode$attrs$ids.questionId,
        subQuestionId = _vnode$attrs$ids.subQuestionId;
    return _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection('votes').doc(_store["default"].user.uid).onSnapshot(function (voteDB) {
      if (!voteDB.exists) {
        vnode.state.optionVoted = false;
      } else {
        vnode.state.optionVoted = voteDB.data().optionVoted;
      }

      _mithril["default"].redraw();
    }, function (e) {
      console.error(e);
      (0, _set.sendError)(e);
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
    return function () {};
  }
}

function listenToConsequences(groupId, questionId, subQuestionId, optionId) {
  try {
    if (!{}.hasOwnProperty.call(_store["default"].consequencesListen, optionId)) {
      _store["default"].consequencesListen[optionId] = true;

      _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('consequences').onSnapshot(function (consequencesDB) {
        var consequences = [];
        consequencesDB.forEach(function (consequenceDB) {
          consequences.push(consequenceDB.data());
        });
        _store["default"].consequences[optionId] = consequences;

        _mithril["default"].redraw();
      });
    } else {
      console.info("Allredy listen to consequnces on option ".concat(optionId));
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenToTopConsequences(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    if (groupId === undefined) throw new Error('groupId is missing in listenToTopConsequences');
    if (questionId === undefined) throw new Error('questionId is missing in listenToTopConsequences');
    if (subQuestionId === undefined) throw new Error('subQuestionId is missing in listenToTopConsequences');
    if (optionId === undefined) throw new Error('optionId is missing in listenToTopConsequences');

    if (!{}.hasOwnProperty.call(_store["default"].consequencesTopListen, optionId)) {
      _store["default"].consequencesTopListen[optionId] = true;
      _store["default"].consequencesTop[optionId] = [];

      _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('consequences').orderBy('totalWeightAbs', 'desc').limit(1).onSnapshot(function (consequencesDB) {
        var consequences = [];
        consequencesDB.forEach(function (consequenceDB) {
          _store["default"].consequencesTop[optionId] = [consequenceDB.data()];
        });

        _mithril["default"].redraw();
      });
    }
  } catch (e) {
    console.error;
  }
}

function getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId) {
  try {
    return _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('consequences').doc(consequenceId).collection('voters').doc(_store["default"].user.uid).get().then(function (voteDB) {
      return voteDB.data();
    })["catch"](function (e) {
      console.error(e);
      (0, _set.sendError)(e);
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function getSubAnswers(groupId, questionId, subQuestionId, vnode) {
  var subAnswersRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("subAnswers").orderBy("time", "desc").limit(100);

  unsubscribe = subAnswersRef.onSnapshot(function (subAnswersDB) {
    var subAnswersArr = [];
    subAnswersDB.forEach(function (subAnswerDB) {
      var subAnswerObj = subAnswerDB.data();
      subAnswerObj.id = subAnswerDB.id;
      subAnswersArr.push(subAnswerObj);
    });
    vnode.state.subAnswers[subQuestionId] = subAnswersArr;

    _mithril["default"].redraw();
  });
  return unsubscribe;
}

function getMessages(groupId, questionId, subQuestionId, optionId, vnode) {
  var messagesRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").doc(optionId).collection("messages");

  return messagesRef.orderBy("time", "desc").limit(20).onSnapshot(function (messagesDB) {
    var messagesArray = [];
    var numberOfMessages = messagesDB.size;
    messagesDB.forEach(function (messageDB) {
      var tempMessage = messageDB.data(); //check if message is new

      if (!vnode.state.messagesIds.hasOwnProperty(messageDB.id)) {
        tempMessage.isNew = true;
      } else {
        tempMessage.isNew = false;
      }

      messagesArray.unshift(tempMessage);
      vnode.state.messagesIds[messageDB.id] = true;
    });
    vnode.state.messages = messagesArray; // vnode.state.numberOfMessages = numberOfMessages;

    _mithril["default"].redraw();
  });
}

function getSubItems(subItemsType, groupId, questionId, vnode) {
  var subItemsRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection(subItemsType);

  unsubscribe = subItemsRef.orderBy("totalVotes", "desc").onSnapshot(function (SubItemsDB) {
    SubItemsDB.docChanges().forEach(function (change) {
      if (change.type === "added") {
        vnode.state.subAnswersUnsb[change.doc.id] = getSubAnswers(groupId, questionId, change.doc.id, vnode); //listen to answers
      }

      if (change.type === "removed") {//unsubscribe from answers
      }
    });
    var subItemArr = [];
    SubItemsDB.forEach(function (SubItemDB) {
      var subItemObj = SubItemDB.data();
      subItemObj.id = SubItemDB.id;
      subItemArr.push(subItemObj);
    });
    vnode.state[subItemsType] = subItemArr;

    _mithril["default"].redraw();
  });
  return unsubscribe;
}

function getSubItemLikes(subItemsType, groupId, questionId, subQuestionId, creatorId, vnode) {
  var subQuestionRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection(subItemsType).doc(subQuestionId);

  return subQuestionRef.onSnapshot(function (likeDB) {
    if (likeDB.data().totalVotes != undefined) {
      vnode.state.likes = likeDB.data().totalVotes;
    } else {
      vnode.state.likes = 0;
    }

    _mithril["default"].redraw();
  });
}

function getSubItemUserLike(subItemsType, groupId, questionId, subQuestionId, creatorId, vnode) {
  var subQuestionRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection(subItemsType).doc(subQuestionId).collection("likes").doc(creatorId);

  return subQuestionRef.onSnapshot(function (likeDB) {
    if (likeDB.exists) {
      if (likeDB.data().like == 1) {
        vnode.state.up = true;
      } else {
        vnode.state.up = false;
      }
    } else {
      vnode.state.up = false;
    }

    _mithril["default"].redraw();
  });
}

function listenToSubscription(path) {
  return new Promise(function (resolve, reject) {
    if ({}.hasOwnProperty.call(_store["default"].subscribe, path) === false) {
      _config.DB.doc("".concat(path, "/subscribers/").concat(_store["default"].user.uid)).onSnapshot(function (subscriberDB) {
        (0, _lodash.set)(_store["default"].subscribe, "[".concat(path, "]"), subscriberDB.exists);

        _mithril["default"].redraw();

        if (subscriberDB.exists) console.info('user is subscribed');else {
          console.info('user is not subscribed');
        }
        resolve();
      }, function (err) {
        console.error(err);
        reject(err);
      });
    }
  });
}

function listenToFeed() {
  try {
    var feedRef = (0, _firestore.collection)(_config.DB, 'users', _store["default"].user.uid, 'feed');
    var q = (0, _firestore.query)(feedRef, (0, _firestore.orderBy)('date', 'desc'), (0, _firestore.limit)(20));
    var usub = (0, _firestore.onSnapshot)(q, function (feedDB) {
      feedDB.docChanges().forEach(function (change) {
        if (change.type === "added") {
          var feedItem = change.doc.data();
          feedItem.feedItemId = change.doc.id;

          _store["default"].feed2.push(feedItem);
        }
      });

      _mithril["default"].redraw();
    });
  } catch (err) {
    console.error(err);
  }
}

function listenToFeedLastEntrance() {
  try {
    var feedLastEntrenceRef = (0, _firestore.doc)(_config.DB, 'users', _store["default"].user.uid, 'feedLastEntrence', 'info');
    var unsub = (0, _firestore.onSnapshot)(feedLastEntrenceRef, function (infoDB) {
      var _infoDB$data = infoDB.data(),
          lastEntrance = _infoDB$data.lastEntrance;

      _store["default"].feed2Info = {
        lastEntrance: lastEntrance
      };
    }, function (err) {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
} // function listenToFeed(path, onOff = "on") {
//     let path1 = path;
//     path = path.replace(/--/g, "/");
//     if (onOff === "on") {
//         let feedRef = DB.collection(path);
//         //for how long should a message appear in the feed
//         let dayPassed = 1;
//         let hoursPassed = 12;
//         let timeOfActiveMessage = (dayPassed + (hoursPassed * 1) / 24) * 24 * 3600 * 1000;
//         let timePassed = new Date().getTime() - timeOfActiveMessage;
//         store.feedsUnsubscribe[path1] = feedRef
//             .where("timeSeconds", ">", timePassed)
//             .orderBy("timeSeconds", "desc")
//             .limit(1)
//             .onSnapshot(feedsDB => {
//                 feedsDB.forEach(feedDB => {
//                     if (feedDB.data().time !== null) {
//                         let newFeed = feedDB.data();
//                         newFeed.path = path1;
//                         //add feed-inputs to feed
//                         store.feed[path] = newFeed;
//                         store.numberOfNewMessages++;
//                         audio.play();
//                         const playPromise = audio.play()
//                         // const playPromise = media.play();
//                         if (playPromise !== null) {
//                             playPromise.catch(() => {
//                                 audio.play();
//                             })
//                         }
//                         m.redraw();
//                     }
//                 });
//             });
//     } else {
//         //unsubscribe
//         if (store.feedsUnsubscribe.hasOwnProperty(path1)) {
//             store.feedsUnsubscribe[path1]();
//         }
//         delete store.subscribed[path1]; //delete indciation that this feed is regigsterd
//         m.redraw();
//     }
// }


function listenToChat(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    if (groupId === undefined) throw new Error('No group id in the ids');
    var path = (0, _general.concatenateDBPath)(groupId, questionId, subQuestionId, optionId);
    var chatPath = path + '/messages';
    var lastRead = new Date('2020-01-01');

    if (!(path in _store["default"].chatLastRead)) {
      _store["default"].chat[path] = [];
      _store["default"].chatLastRead[path];
    } else {
      lastRead = _store["default"].chatLastRead[path];
    }

    if (!(path in _store["default"].chatMessegesNotRead)) {
      _store["default"].chatMessegesNotRead[path] = 0;
    }

    return _config.DB.collection(chatPath).where('createdTime', '>', lastRead).orderBy('createdTime', 'desc').limit(100).onSnapshot(function (messagesDB) {
      messagesDB.docChanges().forEach(function (change) {
        if (change.type === "added") {
          if (!(path in _store["default"].chat)) {
            _store["default"].chat[path] = [];
          }

          var messageObj = change.doc.data();
          messageObj.messageId = change.doc.id;

          _store["default"].chat[path].push(messageObj);

          _store["default"].chatLastRead = change.doc.data().createdTime;
          _store["default"].chatMessegesNotRead[path]++;
        } else if (change.type === 'removed') {
          console.log('removed', change.doc.id);
          _store["default"].chat[path] = _store["default"].chat[path].filter(function (msg) {
            return msg.messageId !== change.doc.id;
          });
        }
      });
      _store["default"].chat[path] = _store["default"].chat[path].sort(function (a, b) {
        return a.createdTime.seconds - b.createdTime.seconds;
      });
      var userUID = '';

      _store["default"].chat[path].map(function (message, index) {
        if (message.uid === userUID) {
          _store["default"].chat[path][index].isSameUser = true;
        } else {
          _store["default"].chat[path][index].isSameUser = false;
          userUID = message.uid;
        }
      });

      _mithril["default"].redraw();
    }, function (e) {
      console.error(e);
      (0, _set.sendError)(e);
    });
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function listenIfGetsMessages(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    var entityId = (0, _general.getEntityId)(ids); //activate listening only once

    if (!{}.hasOwnProperty.call(_store["default"].listenToMessages, entityId)) {
      var browserUniqueId = (0, _general.setBrowserUniqueId)();
      var dbPath = "".concat((0, _general.concatenateDBPath)(groupId, questionId, subQuestionId, optionId), "/notifications/").concat(_store["default"].user.uid);

      _config.DB.doc(dbPath).onSnapshot(function (tokensDB) {
        if (tokensDB.exists) {
          if (tokensDB.data()[browserUniqueId] === undefined) {
            _store["default"].listenToMessages[entityId] = false;
          } else {
            _store["default"].listenToMessages[entityId] = true;
          }
        } else {
          _store["default"].listenToMessages[entityId] = false;
        }

        _mithril["default"].redraw();
      }, function (e) {
        console.error(e);
        (0, _set.sendError)(e);
      });
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

function getLastTimeEntered(ids, vnode) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId,
        consequenceId = ids.consequenceId;
    var path = (0, _general.concatenateDBPath)(groupId, questionId, subQuestionId, optionId, consequenceId);
    var regex = new RegExp('/', 'gi');
    path = path.replace(regex, '-');

    if (path !== '-groups') {
      _config.DB.collection("users").doc(_store["default"].user.uid).collection('chatLastEnterence').doc(path).get().then(function (time) {
        if (time.data() !== undefined) {
          vnode.state.lastTimeEntered = time.data().lastTime.seconds;

          _mithril["default"].redraw();
        } else {
          vnode.state.lastTimeEntered = 0;
        }
      });
    } else {
      vnode.state.unreadMessages = 0;
      throw new Error('couldnt find path to spesific chat (groupId, questionId, subQuestionId, optionId, consequenceId)', groupId, questionId, subQuestionId, optionId, consequenceId);
    }
  } catch (e) {
    console.error(e);
    (0, _set.sendError)(e);
  }
}

module.exports = {
  getUser: getUser,
  listenToUserGroups: listenToUserGroups,
  listenToRegisterdGroups: listenToRegisterdGroups,
  getQuestions: getQuestions,
  listenToGroupDetails: listenToGroupDetails,
  listenToGroupMembers: listenToGroupMembers,
  listenToGroup: listenToGroup,
  getQuestionDetails: getQuestionDetails,
  listenSubQuestions: listenSubQuestions,
  getSubQuestion: getSubQuestion,
  listenToOptions: listenToOptions,
  listenToOption: listenToOption,
  listenToConsequences: listenToConsequences,
  listenToTopConsequences: listenToTopConsequences,
  getMyVotesOnConsequence: getMyVotesOnConsequence,
  getOptionVote: getOptionVote,
  listenToUserVote: listenToUserVote,
  getSubItems: getSubItems,
  getSubItemLikes: getSubItemLikes,
  getSubItemUserLike: getSubItemUserLike,
  getSubAnswers: getSubAnswers,
  getOptionDetails: getOptionDetails,
  getMessages: getMessages,
  listenToFeed: listenToFeed,
  listenToChat: listenToChat,
  listenToFeedLastEntrance: listenToFeedLastEntrance,
  listenToSubscription: listenToSubscription,
  listenIfGetsMessages: listenIfGetsMessages,
  getLastTimeEntered: getLastTimeEntered
};