const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const settings = {
  timestampsInSnapshots: true,
};
db.settings(settings);

exports.totalVotes = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{op" +
    "tionId}/likes/{userId}"
  )
  .onUpdate((change, context) => {
    var newLike = change.after.data().like;
    var previousLike = 0;
    if (change.before.data() !== undefined) {
      previousLike = change.before.data().like;
    }

    var like = newLike - previousLike;

    var optionLikesRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection("options")
      .doc(context.params.optionId);

    return db.runTransaction((transaction) => {
      return transaction.get(optionLikesRef).then((optionDoc) => {
        // Compute new number of ratings
        var totalVotes = 0;
        if (optionDoc.data().totalVotes !== undefined) {
          totalVotes = optionDoc.data().totalVotes + like;
        } else {
          totalVotes = newLike;
        }

        //calaculate consensus precentage:
        let consensusPrecentage = 1;
        if (optionDoc.data().totalVoters !== undefined) {
          let totalVoters = optionDoc.data().totalVoters;

          // old method consensusPrecentage = totalVotes / totalVoters; consensus with
          // respect to group size
          consensusPrecentage =
            (totalVotes / totalVoters) * (Math.log(totalVoters) / Math.log(10));
        }

        // Compute new average rating var oldRatingTotal = optionDoc.data('avgRating') *
        // optionDoc.data('numRatings'); var newAvgRating = (oldRatingTotal + newLike) /
        // newNumRatings; Update restaurant info
        return transaction.update(optionLikesRef, {
          totalVotes,
          consensusPrecentage,
        });
      });
    });
  });

exports.totalVoters = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{op" +
    "tionId}/likes/{userId}"
  )
  .onCreate((change, context) => {
    var newLike = change.data().like;

    var optionLikesRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection("options")
      .doc(context.params.optionId);

    return db.runTransaction((transaction) => {
      return transaction.get(optionLikesRef).then((optionDoc) => {
        // Compute new number of ratings
        var totalVotes = newLike;
        if (optionDoc.data().totalVotes !== undefined) {
          totalVotes = optionDoc.data().totalVotes + newLike;
        }
        var totalVoters = 1;
        if (optionDoc.data().totalVoters !== undefined) {
          totalVoters = optionDoc.data().totalVoters + 1;
        }

        // calaculate consensus precentage: simple consensus let consensusPrecentage =
        // totalVotes / totalVoters; consensus with respect to group size
        let consensusPrecentage =
          (totalVotes / totalVoters) * (Math.log(totalVoters) / Math.log(10));

        // Update restaurant info
        return transaction.update(optionLikesRef, {
          totalVoters,
          totalVotes,
          consensusPrecentage,
        });
      });
    });
  });

exports.totalLikesForSubQuestion = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/likes/{user" +
    "Id}"
  )
  .onUpdate((change, context) => {
    var newLike = change.after.data().like;
    var previousLike = 0;
    if (change.before.data() !== undefined) {
      previousLike = change.before.data().like;
    }

    var like = newLike - previousLike;

    var subQuestionLikesRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId);

    return db.runTransaction((transaction) => {
      return transaction.get(subQuestionLikesRef).then((subQuestionDoc) => {
        // Compute new number of ratings
        var totalVotes = 0;
        if (subQuestionDoc.data().totalVotes !== undefined) {
          totalVotes = subQuestionDoc.data().totalVotes + like;
        } else {
          totalVotes = like;
        }

        // Update restaurant info
        return transaction.update(subQuestionLikesRef, { totalVotes });
      });
    });
  });

// exports.totalLikesForQuestionsGoals = functions.firestore
// .document('groups/{groupId}/questions/{questionId}/goals/{subGoalId}/likes/{us
// erId}')     .onUpdate((change, context) => {         var newLike =
// change.after.data().like;         var previousLike = 0;         if
// (change.before.data() !== undefined) {             previousLike =
// change.before.data().like;         }         var like = newLike -
// previousLike;         var subGoalLikesRef =
// db.collection('groups').doc(context.params.groupId)
// .collection('questions').doc(context.params.questionId)
// .collection('goals').doc(context.params.subGoalId);         return
// db.runTransaction(transaction => {             return
// transaction.get(subGoalLikesRef).then(subGoalDoc => {                 //
// Compute new number of ratings                 var totalVotes = 0;
//     if (subGoalDoc.data().totalVotes !== undefined) {
// totalVotes = subGoalDoc.data().totalVotes + like;                 } else {
//                  totalVotes = like;                 }                 //
// Update restaurant info                 return
// transaction.update(subGoalLikesRef, {                     totalVotes
//        });             })         })     })
// exports.totalLikesForQuestionsValues = functions.firestore
// .document('groups/{groupId}/questions/{questionId}/values/{subValueId}/likes/{
// userId}')     .onUpdate((change, context) => {         var newLike =
// change.after.data().like;         var previousLike = 0;         if
// (change.before.data() !== undefined) {             previousLike =
// change.before.data().like;         }         var like = newLike -
// previousLike;         var subValueLikesRef =
// db.collection('groups').doc(context.params.groupId)
// .collection('questions').doc(context.params.questionId)
// .collection('values').doc(context.params.subValueId);         return
// db.runTransaction(transaction => {             return
// transaction.get(subValueLikesRef).then(subGoalDoc => {                 //
// Compute new number of ratings                 var totalVotes = 0;
//     if (subGoalDoc.data().totalVotes !== undefined) {
// totalVotes = subGoalDoc.data().totalVotes + like;                 } else {
//                  totalVotes = like;                 }                 //
// Update restaurant info                 return
// transaction.update(subValueLikesRef, {                     totalVotes
//         });             })         })     })

exports.countNumbeOfMessages = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{op" +
    "tionId}/messages/{messageId}"
  )
  .onWrite((change, context) => {
    let docRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection("options")
      .doc(context.params.optionId);

    if (!change.before.exists) {
      // New document Created : add one to count
      docRef
        .get()
        .then((snap) => {
          //check if new
          let numberOfMessages = 0;
          if (isNaN(snap.data().numberOfMessages)) {
            numberOfMessages = 1;
          } else {
            numberOfMessages = snap.data().numberOfMessages + 1;
          }
          docRef.update({ numberOfMessages });
          return true;
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
      return true;
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count
      docRef
        .get()
        .then((snap) => {
          docRef.update({
            numberOfMessages: snap.data().numberOfMessages - 1,
          });
          return true;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });

// ========= push notifications =======
exports.sendPushForNewOptions = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{op" +
    "tionId}"
  )
  .onWrite((change, context) => {
    const CP = context.params;
    const OPTION_DATA = change.after.data();

    // Setup notification

    const payload = {
      notification: {
        title: `הצעה חדשה: ${OPTION_DATA.title}`,
        body: `${OPTION_DATA.creatorName} מציע ש ${OPTION_DATA.title} \nהיא תשובה טובה ל-\n ${OPTION_DATA.subQuestionTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/subquestions/${CP.groupId}/${CP.questionId}/${CP.subQuestionId}`,
      },
    };

    // Clean invalid tokens
    function cleanInvalidTokens(tokensWithKey, results) {
      const invalidTokens = [];

      results.forEach((result, i) => {
        if (!result.error) return;

        console.error(
          "Failure sending notification to",
          tokensWithKey[i].token,
          result.error
        );

        switch (result.error.code) {
          case "messaging/invalid-registration-token":
          case "messaging/registration-token-not-registered":
            invalidTokens.push(
              admin
                .database()
                .ref("/tokens")
                .child(tokensWithKey[i].key)
                .remove()
            );
            break;
          default:
            break;
        }
      });

      return Promise.all(invalidTokens);
    }

    // go over all token given by users and see which user set a token for this
    // entity
    return db
      .collection("tokens")
      .where("pushEntities", "array-contains", context.params.subQuestionId)
      .get()
      .then((tokensDB) => {
        if (tokensDB.size === 0) return;

        // const snapshot = tokensDB.data();
        const snapshot = [];
        const tokensWithKey = [];
        const tokens = [];
        let counter = 0;
        tokensDB.forEach((tokenDb) => {
          //gather all users in this entity
          tokens.push(tokenDb.data().token);
        });
        //send notifications to all users that are registerd to this entity
        return admin.messaging().sendToDevice(tokens, payload);
        // .then((response) => cleanInvalidTokens(tokensWithKey, response.results))
        // .then(() =>
        // admin.database().ref('/notifications').child(NOTIFICATION_SNAPSHOT.key).remove
        // ())
      })
      .catch((err) => {
        console.log("Error2:", err);
      });
  });

//update subscribers on CUD of questions under a group
exports.updateGroupSubscribers = functions.firestore
  .document("groups/{groupId}/questions/{questionId}")
  .onWrite((change, context) => {
    try {
      return sendToSubscribers({ change, context });
    } catch (err) {
      console.log(err);
    }
  });

//update subscribers on CUD of subQuestion under a question
exports.updateQuestionSubscribers = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}"
  )
  .onWrite((change, context) => {
    try {
      return sendToSubscribers({ change, context });
    } catch (err) {
      console.log(err);
    }
  });

//update subscribers on CUD of options under a subQuestion
exports.updateSubQuestionSubscribers = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}"
  )
  .onWrite((change, context) => {
    try {
      return sendToSubscribers({ change, context });
    } catch (err) {
      console.log(err);
    }
  });

function sendToSubscribers(info) {
  try {
    const { change, context } = info;
    let { groupId, questionId, subQuestionId, optionId } = context.params;
    const DATA = change.after.data();
    const { before, after } = change;

    
    let message;
    if (before.data() === undefined && after.data() !== undefined)
      message = "created";
    else if (before.data() !== undefined && after.data() !== undefined)
      message = "updated";
    else if (before.data() !== undefined && after.data() === undefined)
      message = "deleted";
    else
      throw new Error(
        `Unkown firestore event! before: '${before}', after: '${after}'`
      );

    //find update level
    let listenToLevel = "group", entityId = 'groups',
      dbLevelSubscribers = db.collection("groups").doc(groupId);

    url = message !== "deleted" ? `group/${groupId}` : "/groups";

    if (subQuestionId === undefined) {
      //update in subscribers in level group - listen to questions
      
      entityId = questionId;
      listenToLevel = "question";
      dbLevelSubscribers = db.collection("groups").doc(groupId);
      subQuestionId = false;
      optionId = false;
      url =
        message !== "deleted"
          ? `/question/${groupId}/${questionId}`
          : `/group/${groupId}`;
    } else if (optionId === undefined) {
      //update in subscribers in level question - listen to subQuestions

      entityId = subQuestionId;
      listenToLevel = "subQuestion";
      dbLevelSubscribers = db
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)

      optionId = false;
      url =
        message !== "deleted"
          ? `/subquestions/${groupId}/${questionId}/${subQuestionId}`
          : `/question/${groupId}/${questionId}`;
    } else {
      //update in subscribers in level subQuestion - listen to options

      entityId = optionId;
      listenToLevel = "option";
      dbLevelSubscribers = db
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)

      url =
        message !== "deleted"
          ? `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`
          : `/subquestion/${groupId}/${questionId}/${subQuestionId}`;
    }

    return dbLevelSubscribers
      .collection("subscribers")
      .get()
      .then((subscribersDB) => {
        return subscribersDB.forEach((subscriberDB) => {
          console.log("subscriber ID:", subscriberDB.id);
          db.collection("users")
            .doc(subscriberDB.id)
            .collection("feed")
            .add({
              message:
                listenToLevel !== "option"
                  ? `A ${listenToLevel} was ${message}`
                  : `An ${listenToLevel} was ${message}`,
              groupId,
              questionId,
              subQuestionId,
              optionId,
              entityId,
              data: DATA,
              change: JSON.stringify(change),
              date: new Date(),
              url,
            })
            .then(() => console.log("add to user", subscriberDB.id))
            .catch((err) => console.log(err.message));
        });
      })
      .catch((err) => console.log(err.message));
  } catch (err) {
    console.log(err);
  }
}
