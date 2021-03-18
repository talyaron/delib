"use strict";

var _mithril = _interopRequireDefault(require("mithril"));

var _lodash2 = require("lodash");

var _config = require("../config");

var _store2 = _interopRequireDefault(require("../../../data/store"));

var _general2 = require("../../general");

var _setChats = require("./setChats");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createGroup(settings) {
  try {
    var creatorId = settings.creatorId,
        title = settings.title,
        description = settings.description,
        callForAction = settings.callForAction,
        language = settings.language;
    console.log(creatorId, title, description, callForAction, language);
    var groupId = (0, _general2.uniqueId)();

    _config.DB.collection('groups').doc(groupId).set({
      title: title,
      description: description,
      creatorId: creatorId,
      time: new Date().getTime(),
      groupId: groupId,
      id: groupId,
      groupColor: (0, _general2.getRandomColor)(),
      callForAction: callForAction,
      language: language
    }).then(function () {
      _config.DB.collection("users").doc(_store2["default"].user.uid).collection("groupsOwned").doc(groupId).set({
        id: groupId,
        date: new Date().getTime()
      }).then(function () {
        console.info("added the group to the groups the user owns");
      })["catch"](function (e) {
        console.error(e);
      });

      (0, _setChats.subscribeUser)({
        groupId: groupId,
        subscribe: false
      });

      _mithril["default"].route.set("/group/".concat(groupId));
    })["catch"](function (error) {
      console.error('Error adding document: ', error);
    });
  } catch (e) {
    console.error(e);
  }
}

function updateGroup(vnode) {
  _config.DB.collection('groups').doc(vnode.attrs.id).update({
    title: vnode.state.title,
    description: vnode.state.description,
    callForAction: vnode.state.callForAction
  }).then(function () {
    _mithril["default"].route.set("/group/".concat(vnode.attrs.id));
  })["catch"](function (err) {
    console.error(err);
  });
}

function registerGroup(groupId) {
  try {
    var isUserRgisterdToGroup = (0, _lodash2.get)(_store2["default"].user, ".groupsUserTryToRegister[".concat(groupId, "]"), false);

    if (!isUserRgisterdToGroup) {
      // store.user.groupsUserTryToRegister[groupId] = true;
      (0, _lodash2.set)(_store2["default"].user, ".groupsUserTryToRegister[".concat(groupId, "]"), true);
      var waitForUser = setInterval(function () {
        if ({}.hasOwnProperty.call(_store2["default"].user, 'uid')) {
          clearInterval(waitForUser);

          if (!isUserRgisterdToGroup) {
            _store2["default"].groupsRegistered[groupId] = true;

            _config.DB.collection('users').doc(_store2["default"].user.uid).collection('registerGroups').doc(groupId).set({
              register: true
            }).then(function () {
              console.info('user registerd to group', groupId);
            })["catch"](function (e) {
              console.error(e);
            }); //store data from use as member in the group


            var _store$user = _store2["default"].user,
                displayName = _store$user.displayName,
                email = _store$user.email,
                uid = _store$user.uid,
                name = _store$user.name,
                photoURL = _store$user.photoURL,
                phoneNumber = _store$user.phoneNumber,
                isAnonymous = _store$user.isAnonymous;
            var userObjTemp = {
              displayName: displayName,
              email: email,
              uid: uid,
              name: name,
              photoURL: photoURL,
              phoneNumber: phoneNumber,
              isAnonymous: isAnonymous
            },
                userObj = {};

            for (var prop in userObjTemp) {
              if (userObjTemp[prop] !== null && userObjTemp[prop] !== undefined) {
                userObj[prop] = userObjTemp[prop];
              }
            }

            _config.DB.collection('groups').doc(groupId).collection('members').doc(_store2["default"].user.uid).set(userObj, {
              merge: true
            }).then(function () {
              console.info('user is a member of group', groupId);
            })["catch"](function (e) {
              console.error(e);
            });
          } else {
            console.info('user is already registered to', groupId);
          }
        }
      }, 1000);
    }
  } catch (e) {
    console.error(e);
  }
}

function createQuestion(groupId, creatorId, title, description) {
  var questionId = (0, _general2.uniqueId)();

  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).set({
    title: title,
    description: description,
    time: new Date().getTime(),
    creatorId: creatorId,
    questionId: questionId,
    id: questionId
  })["catch"](function (error) {
    console.error('Error adding document: ', error);
  });
}

function updateQuestion(groupId, questionId, title, description, authorizationObj) {
  try {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).update({
      title: title,
      description: description,
      authorization: authorizationObj
    }).then(function (something) {
      console.info('writen succesufuly');
    })["catch"](function (error) {
      console.error('Error adding document: ', error);
    });
  } catch (e) {
    console.error(e);
  }
}

function createSubQuestion(groupId, questionId, title, order) {
  try {
    return new Promise(function (resolve, reject) {
      var subQuestionId = (0, _general2.uniqueId)();

      _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).set({
        title: title,
        order: order,
        creator: _store2["default"].user.uid,
        orderBy: 'top',
        subQuestionId: subQuestionId,
        id: subQuestionId
      }).then(function () {
        resolve(subQuestionId);
      })["catch"](function (error) {
        console.error('Error adding document: ', error);
        reject(undefined);
      });
    });
  } catch (e) {
    console.error(e);
    reject(undefined);
  }
}

function updateSubQuestion(groupId, questionId, subQuestionId, title) {
  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
    title: title
  });
}

function updateSubQuestionProcess(groupId, questionId, subQuestionId, processType) {
  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
    processType: processType
  });
}

function updateSubQuestionOrderBy(groupId, questionId, subQuestionId, orderBy) {
  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
    orderBy: orderBy
  });
}

function setSubQuestion(ids, settings) {
  try {
    return new Promise(function (resolve, reject) {
      var title = settings.title,
          processType = settings.processType,
          orderBy = settings.orderBy,
          userHaveNavigation = settings.userHaveNavigation,
          showSubQuestion = settings.showSubQuestion,
          numberOfSubquestions = settings.numberOfSubquestions,
          proAgainstType = settings.proAgainstType;
      var groupId = ids.groupId,
          questionId = ids.questionId,
          subQuestionId = ids.subQuestionId;

      var subQuestionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions');

      if (subQuestionId === undefined) {
        //new subQuestion
        var uid = (0, _general2.uniqueId)();
        subQuestionRef.doc(uid).set({
          title: title,
          processType: processType,
          orderBy: orderBy,
          groupId: groupId,
          questionId: questionId,
          subQuestionId: uid,
          userHaveNavigation: userHaveNavigation,
          showSubQuestion: showSubQuestion,
          order: numberOfSubquestions,
          proAgainstType: proAgainstType,
          creator: _store2["default"].user.uid
        }).then(function () {
          console.info("saved subQuestion ".concat(uid, " to DB"));
          resolve(uid);
        })["catch"](function (e) {
          console.error(e);
          reject(undefined);
        });
      } else {
        subQuestionRef.doc(subQuestionId).update({
          title: title,
          processType: processType,
          orderBy: orderBy,
          groupId: groupId,
          questionId: questionId,
          subQuestionId: subQuestionId,
          userHaveNavigation: userHaveNavigation,
          showSubQuestion: showSubQuestion,
          proAgainstType: proAgainstType
        }).then(function () {
          console.info("updated subQuestion ".concat(subQuestionId, " to DB"));
          resolve(subQuestionId);
        })["catch"](function (e) {
          console.error(e);
          reject(undefined);
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
}

function deleteSubQuestion(groupId, questionId, subQuestionId) {
  try {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
      showSubQuestion: 'deleted'
    }).then(function () {
      console.info('SubQuestion was deleted (and styed in db as subQuestion', subQuestionId, ')');
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function updateDoesUserHaveNavigation(groupId, questionId, subQuestionId, userHaveNavigation) {
  try {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
      userHaveNavigation: userHaveNavigation
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function updateSubQuestionsOrder(groupId, questionId, newOrderArray) {
  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).update({
    subQuestions: {
      order: newOrderArray
    }
  }).then(function (something) {
    console.info('writen succesufuly');
  })["catch"](function (error) {
    console.error('Error adding document: ', error);
  });
}

function setSubQuestionsOrder(groupId, questionId, subQuestionId, order) {
  try {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).update({
      order: order
    }).then(function (something) {
      console.info("writen to ".concat(subQuestionId, " succesufuly"));
    })["catch"](function (error) {
      console.error('Error adding document: ', error);
    });
  } catch (e) {
    console.error(e);
  }
}

function createOption(groupId, questionId, subQuestionId, type, creatorId, title, description, creatorName, subQuestionTitle) {
  var isVote = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : false;
  var optionId = (0, _general2.uniqueId)();

  try {
    var optionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options');

    optionRef.doc(optionId).set({
      groupId: groupId,
      questionId: questionId,
      subQuestionId: subQuestionId,
      optionId: optionId,
      id: optionId,
      creatorId: creatorId,
      type: type,
      title: title,
      description: description,
      creatorName: creatorName,
      subQuestionTitle: subQuestionTitle,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      consensusPrecentage: 0,
      isActive: true,
      isVote: isVote
    })["catch"](function (error) {
      console.error('Error adding document: ', error);
    });
    return optionId;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function voteOption(ids, settings) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    var addVote = settings.addVote;

    var optionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('votes').doc(_store2["default"].user.uid);

    var updateObj = {
      optionVoted: optionId,
      voter: {
        voterId: _store2["default"].user.uid,
        name: _store2["default"].user.name,
        photoURL: _store2["default"].user.photoURL || ""
      }
    };

    if (addVote) {
      optionRef.update(updateObj).then(function () {
        console.info("Option ".concat(optionId, " was voted for"));
      })["catch"](function (e) {
        // console.error(e)
        var errRexExp = new RegExp('No document to update');

        if (errRexExp.test(e.message)) {
          optionRef.set(updateObj).then(function () {
            console.log("A vote to option ".concat(optionId, " was added"));
          })["catch"](function (e) {
            console.error(e);
          });
        } else {
          console.error(e);
        }
      });
    } else {
      optionRef["delete"]().then(function () {
        console.info("Option ".concat(optionId, " was deleted"));
      })["catch"](function (e) {
        console.error(e);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function createConsequence(groupId, questionId, subQuestionId, optionId, creatorId, title, description, goodBad, creatorName) {
  try {
    var consequenceId = (0, _general2.uniqueId)();

    var consequenceRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('consequences').doc(consequenceId);

    consequenceRef.set({
      groupId: groupId,
      questionId: questionId,
      subQuestionId: subQuestionId,
      optionId: optionId,
      consequenceId: consequenceId,
      creatorId: creatorId,
      title: title,
      description: description,
      creatorName: creatorName,
      time: firebase.firestore.FieldValue.serverTimestamp(),
      consensusPrecentage: 0,
      isActive: true
    }).then(function () {
      voteConsequence({
        groupId: groupId,
        questionId: questionId,
        subQuestionId: subQuestionId,
        optionId: optionId,
        consequenceId: consequenceId
      }, 1, goodBad);
      console.info('consequence', consequenceId, 'was saved');
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function voteConsequence(ids, truthiness, evaluation) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId,
        consequenceId = ids.consequenceId;
    if (truthiness === undefined) throw new Error('No truthiness in voteConsequence', truthiness);
    if (evaluation === undefined) throw new Error('No evaluation in voteConsequence', evaluation);
    if (isNaN(truthiness)) throw new Error('truthiness is not a number', value);
    if (truthiness < 0 || truthiness > 1) throw new Error('truthiness is out of range (0 -->1):', truthiness);
    if (isNaN(evaluation)) throw new Error('evaluation is not a number', value);
    if (evaluation < -1 || evaluation > 1) throw new Error('evaluation is out of range (-1 --> 1):', evaluation);
    var userId = _store2["default"].user.uid;

    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('consequences').doc(consequenceId).collection('voters').doc(userId).set({
      truthiness: truthiness,
      evaluation: evaluation,
      userId: userId,
      time: firebase.firestore.FieldValue.serverTimestamp()
    }, {
      merge: true
    }).then(function () {
      console.info('consequence', consequenceId, 'was voted');
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function setOptionActive(groupId, questionId, subQuestionId, optionId, isActive) {
  try {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).update({
      isActive: isActive
    });
  } catch (err) {
    console.error(err);
  }
}

function updateOptionDescription(ids, description) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;

    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).update({
      description: description
    }).then(function () {
      console.info("a description was updated on option ".concat(optionId));
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function setLike(groupId, questionId, subQuestionId, optionId, creatorId, like) {
  try {
    if (groupId === undefined || questionId === undefined || subQuestionId === undefined || optionId === undefined || creatorId === undefined) throw new Error("One of the Ids groupId, questionId, subQuestionId, optionId, creatorId is missing", groupId, questionId, subQuestionId, optionId, creatorId);

    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('likes').doc(creatorId).set({
      like: like
    })["catch"](function (error) {
      console.error('Error adding document: ', error);
    });
  } catch (e) {
    console.error(e);
  }
}

function setMessage(groupId, questionId, subQuestionId, optionId, creatorId, creatorName, message, groupName, questionName, optionName) {
  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).collection('messages').add({
    creatorId: creatorId,
    creatorName: creatorName,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    timeSeconds: new Date().getTime(),
    message: message,
    type: 'messages',
    groupName: groupName,
    questionName: questionName,
    optionName: optionName
  }).then(function (messageDB) {
    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).update({
      lastMessage: firebase.firestore.FieldValue.serverTimestamp()
    })["catch"](function (e) {
      console.error(e);
    });
  })["catch"](function (error) {
    console.error('Error:', error);
  });
}

function createSubItem(subItemsType, groupId, questionId, creatorId, creatorName, title, description) {
  var subQuestionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection(subItemsType);

  var addObj = {
    groupId: groupId,
    questionId: questionId,
    creatorId: creatorId,
    title: title,
    description: description,
    author: creatorName,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    consensusPrecentage: 0,
    roles: {},
    totalVotes: 0
  };
  addObj.roles[creatorId] = 'owner';
  subQuestionRef.add(addObj).then(function (newItem) {})["catch"](function (error) {
    console.error('Error adding document: ', error);
  });
}

function updateSubItem(subItemsType, groupId, questionId, subQuestionId, title, description) {
  var subQuestionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection(subItemsType).doc(subQuestionId);

  var updateObj = {
    title: title,
    description: description,
    time: firebase.firestore.FieldValue.serverTimestamp()
  };
  subQuestionRef.update(updateObj).then(function (newOption) {})["catch"](function (error) {
    console.error('Error updating document: ', error);
  });
}

function setLikeToSubItem(subItemsType, groupId, questionId, subQuestionId, creatorId, isUp) {
  console.log(subItemsType, groupId, questionId, subQuestionId);

  var subQuestionRef = _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection(subItemsType).doc(subQuestionId).collection('likes').doc(creatorId);

  if (isUp) {
    subQuestionRef.set({
      like: 1
    });
  } else {
    subQuestionRef.set({
      like: 0
    });
  }
}

function setSubAnswer(groupId, questionId, subQuestionId, creatorId, creatorName, message) {
  var _DB$collection$doc$co;

  _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('subAnswers').add((_DB$collection$doc$co = {
    groupId: groupId,
    questionId: questionId,
    subQuestionId: subQuestionId,
    creatorId: creatorId,
    author: creatorName
  }, _defineProperty(_DB$collection$doc$co, "creatorId", creatorId), _defineProperty(_DB$collection$doc$co, "time", firebase.firestore.FieldValue.serverTimestamp()), _defineProperty(_DB$collection$doc$co, "message", message), _DB$collection$doc$co)).then(function (newLike) {})["catch"](function (error) {
    console.error('Error adding document: ', error);
  });
} //add a path ([collection1, doc1, collection2, doc2, etc])


function addToFeed(addRemove, pathArray, refString, collectionOrDoc) {
  if (addRemove == 'add') {
    _config.DB.collection('users').doc(_store2["default"].user.uid).collection('feeds').doc(refString).set({
      path: refString,
      time: new Date().getTime(),
      type: collectionOrDoc,
      refString: refString
    }).then(function () {
      _store2["default"].subscribed[refString] = true;
      console.dir(_store2["default"].subscribed);
    })["catch"](function (error) {
      console.error('Error writing document: ', error);
    });
  } else {
    _config.DB.collection('users').doc(_store2["default"].user.uid).collection('feeds').doc(refString)["delete"]().then(function () {
      delete _store2["default"].subscribed[refString];
    })["catch"](function (error) {
      console.error('Error removing document: ', error);
    });
  }
}

function setToFeedLastEntrance() {
  try {
    _config.DB.collection('users').doc(_store2["default"].user.uid).collection('feedLastEntrence').doc('info').set({
      lastEntrance: new Date().getTime()
    })["catch"](function (err) {
      console.error(err);
    });
  } catch (err) {
    console.error(err);
  }
}

function updateOption(vnode) {
  var _vnode$attrs$ids = vnode.attrs.ids,
      groupId = _vnode$attrs$ids.groupId,
      questionId = _vnode$attrs$ids.questionId,
      subQuestionId = _vnode$attrs$ids.subQuestionId,
      optionId = _vnode$attrs$ids.optionId;

  try {
    var creatorName = vnode.state.isNamed ? vnode.state.creatorName : 'אנונימי/ת';

    _config.DB.collection('groups').doc(groupId).collection('questions').doc(questionId).collection('subQuestions').doc(subQuestionId).collection('options').doc(optionId).update({
      creatorUid: _store2["default"].user.uid,
      creatorName: creatorName,
      title: vnode.state.title,
      description: vnode.state.description
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function setChatLastEntrance(ids) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId,
        consequenceId = ids.consequenceId;
    var path = (0, _general2.concatenateDBPath)(groupId, questionId, subQuestionId, optionId, consequenceId);
    var regex = new RegExp('/', 'gi');
    path = path.replace(regex, '-');

    if (path !== '-groups') {
      _config.DB.collection("users").doc(_store2["default"].user.uid).collection('chatLastEnterence').doc(path).set({
        lastTime: firebase.firestore.FieldValue.serverTimestamp()
      })["catch"](function (e) {
        console.error(e);
      });
    } else {
      throw new Error('couldnt find path to spesific chat (groupId, questionId, subQuestionId, optionId, consequenceId)', groupId, questionId, subQuestionId, optionId, consequenceId);
    }
  } catch (e) {
    console.error(e);
  }
}

function setNotifications(ids, isSubscribed) {
  try {
    var groupId = ids.groupId,
        questionId = ids.questionId,
        subQuestionId = ids.subQuestionId,
        optionId = ids.optionId;
    var path = "".concat((0, _general2.concatenateDBPath)(groupId, questionId, subQuestionId, optionId), "/notifications/").concat(_store2["default"].user.uid);

    if (isSubscribed) {
      _config.DB.doc(path).set({
        username: _store2["default"].user.name,
        email: _store2["default"].user.email || null
      })["catch"](function (e) {
        console.error(e);
      });
    } else {
      _config.DB.doc(path)["delete"]()["catch"](function (e) {
        console.error(e);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

function setNumberOfMessagesMark(ids) {
  var numberOfMessages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  try {
    var optionId = ids.optionId;
    if (optionId === undefined) throw new Error("option doesnt have optionId");

    _config.DB.collection('users').doc(_store2["default"].user.uid).collection('optionsRead').doc(optionId).set({
      numberOfMessages: numberOfMessages
    })["catch"](function (e) {
      console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function dontShowPopAgain() {
  try {
    _config.DB.collection('users').doc(_store2["default"].user.uid).update({
      stopRegistrationMessages: true
    }).then(function () {
      return console.info('user will not recive pop messages again');
    })["catch"](function (e) {
      return console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function markUserSeenSuggestionsWizard() {
  try {
    _config.DB.collection('users').doc(_store2["default"].user.uid).update({
      firstTimeOnSuggestions: false
    }).then(function () {
      console.info('user seen wizared');
    })["catch"](function (e) {
      return console.error(e);
    });
  } catch (e) {
    console.error(e);
  }
}

function handleSubscription(vnode) {
  try {
    //path for subscription object
    var _vnode$attrs = vnode.attrs,
        groupId = _vnode$attrs.groupId,
        questionId = _vnode$attrs.questionId,
        subQuestionId = _vnode$attrs.subQuestionId,
        optionId = _vnode$attrs.optionId;
    var path = (0, _general.concatenateDBPath)(groupId, questionId, subQuestionId, optionId);
    (0, _setChats.subscribeUser)({
      vnode: vnode,
      subscribe: vnode.state.subscribed
    });

    if (vnode.state.subscribed == false) {
      vnode.state.subscribed = true;
      (0, _lodash.set)(_store["default"].subscribe, "[".concat(path, "]"), true);
    } else {
      vnode.state.subscribed = false;
      (0, _lodash.set)(_store["default"].subscribe, "[".concat(path, "]"), false);
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  updateOption: updateOption,
  addToFeed: addToFeed,
  createGroup: createGroup,
  updateGroup: updateGroup,
  registerGroup: registerGroup,
  createQuestion: createQuestion,
  updateQuestion: updateQuestion,
  createSubQuestion: createSubQuestion,
  updateSubQuestion: updateSubQuestion,
  setSubQuestion: setSubQuestion,
  deleteSubQuestion: deleteSubQuestion,
  setSubQuestionsOrder: setSubQuestionsOrder,
  createOption: createOption,
  voteOption: voteOption,
  updateOptionDescription: updateOptionDescription,
  createConsequence: createConsequence,
  voteConsequence: voteConsequence,
  setOptionActive: setOptionActive,
  createSubItem: createSubItem,
  updateSubItem: updateSubItem,
  setLikeToSubItem: setLikeToSubItem,
  setLike: setLike,
  setMessage: setMessage,
  setSubAnswer: setSubAnswer,
  updateSubQuestionProcess: updateSubQuestionProcess,
  updateSubQuestionOrderBy: updateSubQuestionOrderBy,
  updateDoesUserHaveNavigation: updateDoesUserHaveNavigation,
  setChatLastEntrance: setChatLastEntrance,
  setToFeedLastEntrance: setToFeedLastEntrance,
  setNotifications: setNotifications,
  setNumberOfMessagesMark: setNumberOfMessagesMark,
  dontShowPopAgain: dontShowPopAgain,
  markUserSeenSuggestionsWizard: markUserSeenSuggestionsWizard,
  handleSubscription: handleSubscription
};