"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _config = require("../config");

var _store = _interopRequireDefault(require("../../../data/store"));

var _lodash = require("lodash");

var _general = require("../../general");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//functions
var unsubscribe = {};

function getUserGroups(onOff, userId) {
  try {
    if (onOff == "on") {
      try {
        _config.DB.collection("users").doc(userId).collection("groupsOwned").onSnapshot(function (groupsOwnedDB) {
          //unsubsribe from previous listeners
          for (var i in unsubscribe) {
            unsubscribe[i]();
          }

          unsubscribe = {};
          var groupsNumber = groupsOwnedDB.size;
          var count = 0;
          var groupsObj = {},
              groupsArray = [];
          groupsOwnedDB.forEach(function (groupOwnedDB) {
            //listen a group and update...
            unsubscribe[groupOwnedDB.data().id] = _config.DB.collection("groups").doc(groupOwnedDB.data().id).onSnapshot(function (groupDB) {
              var tempObj = groupDB.data();
              tempObj.id = groupOwnedDB.id;
              groupsObj[groupOwnedDB.data().id] = tempObj;
              count++;

              if (count == groupsNumber) {
                //first update
                for (var _i in groupsObj) {
                  groupsArray.push(groupsObj[_i]);
                }

                _store["default"].userGroups = groupsArray;

                _mithril["default"].redraw();
              } else if (count > groupsNumber) {
                //net updates after initial update search in array and replace
                var indexOfGroup = _store["default"].userGroups.findIndex(function (group) {
                  return group.id === tempObj.id;
                });

                _store["default"].userGroups[indexOfGroup] = tempObj;

                _mithril["default"].redraw();
              }
            });
          });
        }, function (err) {
          console.error('On getUserGroups:', err.name, err.message);
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      //turn off listeners
      for (var i in unsubscribe) {
        unsubscribe[i]();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function getQuestions(onOff, groupId, vnode) {
  if (onOff === "on") {
    vnode.state.unsubscribe = _config.DB.collection("groups").doc(groupId).collection("questions").orderBy("time", "desc").onSnapshot(function (questionsDb) {
      questionsDb.forEach(function (questionDB) {
        if (questionDB.data().id) {
          // set(store.questions, `[${groupId}][${questionDB.data().id}]`,
          // questionDB.data())
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

function getGroupDetails(groupId, vnode) {
  try {
    return _config.DB.collection("groups").doc(groupId).onSnapshot(function (groupDB) {
      _store["default"].groups[groupId] = groupDB.data();

      _mithril["default"].redraw();
    }, function (err) {
      console.error("At getGroupDetails: ".concat(err.name, ", ").concat(err.message));

      if (err.message === 'Missing or insufficient permissions.') {
        _mithril["default"].route.set('/unauthorized');
      }
    });
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

    _mithril["default"].redraw();
  });

  return unsubscribe;
}

function getSubQuestions(groupId, questionId, vnode) {
  var getSubOptions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var subQuestionRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions");

  return subQuestionRef.orderBy("order", "asc").get().then(function (subQuestionsDB) {
    var subQuestionsArray = [];
    var subQuestionsObj = {};
    subQuestionsDB.forEach(function (subQuestionDB) {
      var subQuestionObj = subQuestionDB.data();
      subQuestionObj.id = subQuestionDB.id;
      subQuestionsArray.push(subQuestionObj);
      subQuestionsObj[subQuestionObj.id] = {};
    });
    vnode.state.subQuestions = subQuestionsArray;

    _mithril["default"].redraw();
  });
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
      }
    });
  } catch (e) {
    console.error(e);
  }
}

function listenToOptions(groupId, questionId, subQuestionId) {
  var order = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'top';
  var isSingle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  var optionsRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options");

  var orderBy = "time";

  switch (order) {
    case "new":
      orderBy = "time";
      break;

    case "top":
      orderBy = "consensusPrecentage";
      break;

    default:
      orderBy = "time";
  }

  var limit = 100;

  if (isSingle === true) {
    limit = 1;
  }

  return optionsRef.orderBy(orderBy, "desc").limit(limit).onSnapshot(function (optionsDB) {
    var optionsArray = [];
    optionsDB.forEach(function (optionDB) {
      //this is a patch TODO: change all data to query of active or not active options
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
      optionObj.optionId = optionDB.data().id;
      (0, _lodash.set)(_store["default"], "option[".concat(optionId, "]"), optionObj);

      _mithril["default"].redraw();
    });
    console.log(_store["default"].option);
  } catch (e) {
    console.error(e);
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
  var voteRef = _config.DB.collection("groups").doc(groupId).collection("questions").doc(questionId).collection("subQuestions").doc(subQuestionId).collection("options").doc(optionId).collection("likes").doc(creatorId);

  var unsubscribe = voteRef.onSnapshot(function (voteDB) {
    if (voteDB.exists) {
      _store["default"].optionsVotes[optionId] = voteDB.data().like;
    } else {
      _store["default"].optionsVotes[optionId] = 0;
    }

    _mithril["default"].redraw();
  });
  return unsubscribe;
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
    _config.DB.collection('users').doc(_store["default"].user.uid).collection('feed').limit(20).orderBy('date', 'desc').onSnapshot(function (feedDB) {
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
    _config.DB.collection('users').doc(_store["default"].user.uid).collection('feedLastEntrence').doc('info').onSnapshot(function (infoDB) {
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


function listenToChatFeed() {
  try {
    if (_store["default"].listen.chatFeed == false) {
      _config.DB.collection('users').doc(_store["default"].user.uid).collection('chat').orderBy("date", "asc").onSnapshot(function (chatDB) {
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

function listenToChat(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    if (groupId === undefined) throw new Error('No group id in the ids');
    var path = (0, _general.concatenatePath)(groupId, questionId, subQuestionId, optionId);
    var chatPath = path + '/chat';
    var lastRead = new Date('2020-01-01');

    if (!(path in _store["default"].chatLastRead)) {
      _store["default"].chat[path] = [];
      _store["default"].chatLastRead[path];
    } else {
      lastRead = _store["default"].chatLastRead[path];
    }

    return _config.DB.collection(chatPath).where('createdTime', '>', lastRead).orderBy('createdTime', 'desc').limit(100).onSnapshot(function (messagesDB) {
      messagesDB.docChanges().forEach(function (change) {
        if (change.type === "added") {
          if (!(path in _store["default"].chat)) {
            _store["default"].chat[path] = [];
          }

          _store["default"].chat[path].push(change.doc.data());

          _store["default"].chatLastRead = change.doc.data().createdTime;
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
    });
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  getUserGroups: getUserGroups,
  getQuestions: getQuestions,
  getGroupDetails: getGroupDetails,
  getQuestionDetails: getQuestionDetails,
  getSubQuestions: getSubQuestions,
  getSubQuestion: getSubQuestion,
  listenToOptions: listenToOptions,
  listenToOption: listenToOption,
  getOptionVote: getOptionVote,
  getSubItems: getSubItems,
  getSubItemLikes: getSubItemLikes,
  getSubItemUserLike: getSubItemUserLike,
  getSubAnswers: getSubAnswers,
  getOptionDetails: getOptionDetails,
  getMessages: getMessages,
  listenToFeed: listenToFeed,
  listenToChat: listenToChat,
  listenToChatFeed: listenToChatFeed,
  listenToFeedLastEntrance: listenToFeedLastEntrance,
  listenToSubscription: listenToSubscription
};