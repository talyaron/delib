const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { async } = require("regenerator-runtime");
const { firebaseConfig } = require("firebase-functions");
admin.initializeApp();
const db = admin.firestore();
const settings = {
  timestampsInSnapshots: true,
  ignoreUndefinedProperties: true
};
db.settings(settings);
const FieldValue = require('firebase-admin').firestore.FieldValue;



const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

// Replace BUCKET_NAME
const bucket = 'gs://delib-v3-dev-backup';

exports.scheduledFirestoreExport = functions.pubsub.schedule('every 24 hours').onRun((context) => {

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = client.databasePath(projectId, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: []
  })
    .then(responses => {
      const response = responses[0];
      console.log(`Operation Name: ${response['name']}`);
      return response
    })
    .catch(err => {
      console.error(err);
      throw new Error('Export operation failed');
    });
});

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
        let totalVotes = 0;
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


// -------------- votes on options --------------
exports.setVoteForSubQuestion = functions.firestore
  .document("groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/votes/{userId}")
  .onCreate(async (snap, context) => {
    const optionId = snap.data().optionVoted;

    const optionsRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection('options')
      .doc(optionId);

    const subQuestionRef =
      db
        .collection("groups")
        .doc(context.params.groupId)
        .collection("questions")
        .doc(context.params.questionId)
        .collection("subQuestions")
        .doc(context.params.subQuestionId)

    try {
      await db.runTransaction(transaction => {
        return transaction.get(optionsRef)
          .then((optionDB) => {
            if (!optionDB.exists) {
              throw new Error("Document does not exist!");


            } else {
              const optionObj = optionDB.data();


              let newVotes = 0;

              if (!{}.hasOwnProperty.call(optionObj, 'votes')) {
                newVotes = 1
              }
              else if (isNaN(optionObj.votes)) {
                newVotes = 1
              }
              else {
                newVotes = optionObj.votes + 1;

              }
              transaction.update(optionsRef, { votes: newVotes });
            }

            return;
          });
      });
      console.log("vote on option " + optionId + ' was set');

      //update number of voters
      await db.runTransaction(transaction => {
        return transaction.get(subQuestionRef)
          .then((subQuestionDB) => {
            if (!subQuestionDB.exists) {
              throw new Error("Document does not exist!");


            } else {
              const subQuestionObj = subQuestionDB.data();
              let voters = 0
              //calc and initiate number of voters 
              if (!{}.hasOwnProperty.call(subQuestionObj, 'voters')) {
                voters = 1;
              } else if (isNaN(subQuestionObj.voters)) {
                voters = 1;
              } else {
                voters = subQuestionObj.voters + 1;
              }

              transaction.update(subQuestionRef, { voters });

            }
            return;
          });
      });
      console.log(`One voter on subQuestion ${context.params.subQuestionId} was added`);
      return;
    } catch (error) {
      console.log("Transaction failed: ", error);
    }

  })


exports.updateVoteForSubQuestion = functions.firestore
  .document("groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/votes/{userId}")
  .onUpdate(async (change, context) => {
    const optionIdBefore = change.before.data().optionVoted;
    const optionIdAfter = change.after.data().optionVoted;

    const optionBeforeRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection('options')
      .doc(optionIdBefore);

    const optionAfterRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection('options')
      .doc(optionIdAfter);

    try {

      //remove from the before option the vote
      await db.runTransaction(transaction => {
        return transaction.get(optionBeforeRef)
          .then((optionDB) => {
            if (!optionDB.exists) {
              throw new Error("Document does not exist!");



            } else {

              const optionObj = optionDB.data();
              let newVotes = 0

              if (!{}.hasOwnProperty.call(optionObj, 'votes')) {
                newVotes = 0;
              } else if (isNaN(optionObj.votes)) {
                newVotes = 0;
              } else {
                newVotes = optionObj.votes - 1;
              }


              transaction.update(optionBeforeRef, { votes: newVotes });

            }
            return;
          });
      });

      //add vote to ne new option voted

      await db.runTransaction(transaction => {
        return transaction.get(optionAfterRef)
          .then((optionDB) => {
            if (!optionDB.exists) {
              throw new Error("Document does not exist!");


            } else {

              const optionObj = optionDB.data();
              let newVotes = 0

              if (!{}.hasOwnProperty.call(optionObj, 'votes')) {
                newVotes = 1;
              } else if (isNaN(optionObj.votes)) {
                newVotes = 1;
              } else {
                newVotes = optionObj.votes + 1;
              }



              transaction.update(optionAfterRef, { votes: newVotes });
              return;
            }
          });
      });
      console.log(`In options ${optionIdBefore}, ${optionIdAfter}, change correctly `);
      return;
    } catch (error) {
      console.log("Transaction failed: ", error);
    }

  })

exports.deleteVoteForSubQuestion = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/votes/{userId}"
  )

  .onDelete(async (snap, context) => {
    const optionId = snap.data().optionVoted;

    const optionsRef = db
      .collection("groups")
      .doc(context.params.groupId)
      .collection("questions")
      .doc(context.params.questionId)
      .collection("subQuestions")
      .doc(context.params.subQuestionId)
      .collection('options')
      .doc(optionId);

    const subQuestionRef =
      db
        .collection("groups")
        .doc(context.params.groupId)
        .collection("questions")
        .doc(context.params.questionId)
        .collection("subQuestions")
        .doc(context.params.subQuestionId)

    try {

      //delete vote from option
      db.runTransaction(transaction => {
        return transaction.get(optionsRef)
          .then((optionDB) => {
            if (!optionDB.exists) {
              throw new Error("Document does not exist!");


            } else {

              const optionObj = optionDB.data();
              let newVotes = 0

              if (!{}.hasOwnProperty.call(optionObj, 'votes')) {
                newVotes = 0;
              } else if (isNaN(optionObj.votes)) {
                newVotes = 0;
              } else {
                newVotes = optionObj.votes - 1;
              }

              if (newVotes < 0) newVotes = 0;


              transaction.update(optionsRef, { votes: newVotes });
            }
            return;
          });
      });
      console.log("vote deleted in option", optionId);

      //decrease number of voters
      db.runTransaction(transaction => {
        return transaction.get(subQuestionRef)
          .then((subQuestionDB) => {
            if (!subQuestionDB.exists) {
              throw new Error("Document does not exist!");


            } else {
              const subQuestionObj = subQuestionDB.data();
              let newNumberOfVoters = 0;
              //calc and initiate number of voters 
              if (!{}.hasOwnProperty.call(subQuestionObj, 'voters')) {
                newNumberOfVoters = 0;
              } else if (isNaN(subQuestionObj.voters)) {
                newNumberOfVoters = 0;
              } else {
                newNumberOfVoters = subQuestionObj.voters - 1;
              }

              transaction.update(subQuestionRef, { voters: newNumberOfVoters });

            }
            return;
          });
      });
      console.log(`One voter on subQuestion ${context.params.subQuestionId} was removed`);
      return;
    } catch (error) {
      console.log("Transaction failed: ", error);
    }

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
      return docRef
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
      return docRef
        .get()
        .then((snap) => {
          docRef.update({
            numberOfMessages: snap.data().numberOfMessages - 1,
          });
          return true;
        })
        .catch((err) => {
          console.log(err);
          return
        });
    }
    return false
  });

// ========= push notifications =======
exports.sendPushForNewOptions = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}"
    // "groups/{groupId}/questions/{questionId}"
  )
  .onCreate((snap, context) => {

    const { groupId, questionId, subQuestionId, optionId } = context.params;
    const DATA = snap.data();

    console.log('title:', DATA.title)

    // send notification

    const pathForAction = concatenateURL(groupId, questionId, subQuestionId, optionId);
    const pathDBNotifications = `groups/${groupId}/questions/${questionId}/subQuestions/${subQuestionId}/notifications`

    const payload = {
      notification: {
        title: `הצעה חדשה: ${DATA.title}`,
        body: `${DATA.creatorName} מציע ש ${DATA.title} \nהיא תשובה טובה ל-\n ${DATA.subQuestionTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/${pathForAction}`,
      },
    };

    return notifiyUsers(payload, context.params, pathDBNotifications)


  });

exports.optionChatNotifications = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/messages/{messageId}"

  )
  .onCreate((snap, context) => {

    const { groupId, questionId, subQuestionId, optionId } = context.params;
    const message = snap.data();



    console.log('message:', message.message)

    // send notification


    const pathDBNotifications = `groups/${groupId}/questions/${questionId}/subQuestions/${subQuestionId}/options/${optionId}/notifications`

    const payload = {
      notification: {
        title: `${message.name} אמר ${message.message}`,
        body: `ב${message.topic}: ${message.entityTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/option-chat/${groupId}/${questionId}/${subQuestionId}/${optionId}`,
      },
    };

    return notifiyUsers(payload, context.params, pathDBNotifications)


  });


exports.subQuestionChatNotifications = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/messages/{messageId}"

  )
  .onCreate((snap, context) => {

    const { groupId, questionId, subQuestionId, optionId } = context.params;
    const message = snap.data();



    console.log('message:', message.message)

    // send notification


    const pathDBNotifications = `groups/${groupId}/questions/${questionId}/subQuestions/${subQuestionId}/notifications`

    const payload = {
      notification: {
        title: `${message.name} אמר ${message.message}`,
        body: `ב${message.topic}: ${message.entityTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/subquestions-chat/${groupId}/${questionId}/${subQuestionId}`,
      },
    };

    return notifiyUsers(payload, context.params, pathDBNotifications)


  });

exports.questionChatNotifications = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/messages/{messageId}"

  )
  .onCreate((snap, context) => {

    const { groupId, questionId } = context.params;
    const message = snap.data();



    console.log('message:', message.message)

    // send notification


    const pathDBNotifications = `groups/${groupId}/questions/${questionId}/notifications`

    const payload = {
      notification: {
        title: `${message.name} אמר ${message.message}`,
        body: `ב${message.topic}: ${message.entityTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/question-chat/${groupId}/${questionId}`,
      },
    };

    return notifiyUsers(payload, context.params, pathDBNotifications)


  });

exports.groupChatNotifications = functions.firestore
  .document(
    "groups/{groupId}/messages/{messageId}"

  )
  .onCreate((snap, context) => {

    const { groupId } = context.params;
    const message = snap.data();



    console.log('message:', message.message)

    // send notification


    const pathDBNotifications = `groups/${groupId}/notifications`

    const payload = {
      notification: {
        title: `${message.name} אמר ${message.message}`,
        body: `ב${message.topic}: ${message.entityTitle}`,
        icon: "https://delib.tech/img/logo-192.png",
        click_action: `https://delib.tech/?/group-chat/${groupId}`,
      },
    };

    return notifiyUsers(payload, context.params, pathDBNotifications)


  });

// =============== end of notifications ==================


// =============== Feed =================================

const GROUP = 'GROUP', QUESTION = 'QUESTION', SUB_QUESTION = 'SUB_QUESTION', OPTION = 'OPTION'

//update subscribers on CUD of questions under a group
exports.updateGroupSubscribers = functions.firestore
  .document("groups/{groupId}/questions/{questionId}")
  .onWrite((change, context) => {
    try {

      sendToSubscribers({ change, context, lisetnToEntity: GROUP });
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
      return sendToSubscribers({ change, context, lisetnToEntity: QUESTION });
    } catch (err) {
      console.log(err);
    }
  });

// update subscribers on CUD of options under a subQuestion
exports.updateSubQuestionSubscribers = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}"
  )
  .onWrite((change, context) => {
    try {
      return sendToSubscribers({ change, context, lisetnToEntity: SUB_QUESTION });
    } catch (err) {
      console.log('err')
    }
  });

// update subscribers on CUD of options under a subQuestion
exports.updateOptionSubscribers = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}/consequences/{consequenceId}"
  )
  .onWrite((change, context) => {
    try {

      return sendToSubscribers({ change, context, lisetnToEntity: OPTION });
    } catch (err) {
      console.log('err')
      return true
    }
  });

function sendToSubscribers(info) {
  try {
    const { change, context, lisetnToEntity } = info;
    let { groupId, questionId, subQuestionId, optionId, consequenceId } = context.params;


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

    //initial settings
    let changedEntity = "group", entityId = 'groups', dbLevelSubscribers = db.collection("groups").doc(groupId), url = "/groups";

    //find update level
    if (lisetnToEntity === GROUP) {
      changedEntity = "question";
      entityId = groupId;
      dbLevelSubscribers = db.collection("groups").doc(groupId);

      url = message !== "deleted" ? `/question/${groupId}/${questionId}` : `/group/${groupId}`;

    } else if (lisetnToEntity === QUESTION) {
      //update in subscribers in level group - listen to questions

      entityId = questionId;
      changedEntity = "subQuestion";
      dbLevelSubscribers = db.collection("groups").doc(groupId).collection('questions').doc(questionId);
    
      optionId = false;
      url = message !== "deleted" ? `/subquestions/${groupId}/${questionId}/${subQuestionId}` : `/question/${groupId}/${questionId}`;


    } else if (lisetnToEntity === SUB_QUESTION) {
      //update in subscribers in level question - listen to subQuestions

      entityId = subQuestionId;
      changedEntity = "option";
      dbLevelSubscribers = db
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)

      optionId = false;
      url = message !== "deleted" ? `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}` : `/subquestions/${groupId}/${questionId}/${subQuestionId}`;


    } else if (lisetnToEntity === OPTION) {
      //update in subscribers in level subQuestion - listen to options

      entityId = optionId;
      changedEntity = "consequence";
      dbLevelSubscribers = db
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection('options')
        .doc(optionId)

      url = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`;


    } else {
      //update in subscribers in level option - listen to consequences

      throw new Error('No entity to update')

      // entityId = optionId;
      // changedEntity = "option";
      // dbLevelSubscribers = db
      //   .collection("groups")
      //   .doc(groupId)
      //   .collection("questions")
      //   .doc(questionId)
      //   .collection("subQuestions")
      //   .doc(subQuestionId)
      //   .collection("options")
      //   .doc(consequenceId)

      // url = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`
    }

    return dbLevelSubscribers
      .collection("subscribers")
      .get() //get all subscribers on this level and update them
      .then((subscribersDB) => {
        return subscribersDB.forEach((subscriberDB) => {

          db.collection("users")
            .doc(subscriberDB.id)
            .collection("feed")
            .add({
              message:
                changedEntity !== "option"
                  ? `A ${changedEntity} was ${message}`
                  : `An ${changedEntity} was ${message}`,
              changedEntity,
              changeType:message,
              groupId,
              questionId,
              subQuestionId,
              optionId,
              consequenceId,
              entityId,
              data: JSON.parse(JSON.stringify(DATA)),
              date: new Date(),
              url,
            })
            .then(() => console.log("add to user", subscriberDB.id, "action:", message))
            .catch((err) => console.log(err.message));
        });
      })
      .catch((err) => console.log(err.message));
  } catch (err) {
    console.log(err);
  }
}


// ---------- listen to chats ------ ///
exports.listenToGroupChats = functions.firestore
  .document("groups/{groupId}/messages/{chatMassageId}")
  .onCreate((newMsg, context) => {
    try {
      const { groupId, chatMassageId } = context.params;


      return db
        .collection(`/groups/${groupId}/subscribers`)
        .get()
        .then(subscribersDB => {
          return subscribersDB.forEach(subscriberDB => {
            console.log('update user ', subscriberDB.id)

            const userChatRef = db.collection('users').doc(subscriberDB.id).collection('messages').doc(`${generateChatEntitiyId({ groupId })}`);

            return userChatRef.update({
              msgNumber: FieldValue.increment(1),
              msgDifference: FieldValue.increment(1),
              msg: newMsg.data(),
              date: new Date()
            })
          })

        })
    } catch (err) {
      console.log(err)
    }
  })

exports.listenToQuestionChats = functions.firestore
  .document("groups/{groupId}/questions/{questionId}/messages/{chatMassageId}")
  .onCreate((newMsg, context) => {
    try {
      const { groupId, questionId } = context.params;


      return db
        .collection(`/groups/${groupId}/questions/${questionId}/subscribers`)
        .get()
        .then(subscribersDB => {
          return subscribersDB.forEach(subscriberDB => {
            console.log('update user ', subscriberDB.id)

            const userChatRef = db.collection('users').doc(subscriberDB.id).collection('messages').doc(`${generateChatEntitiyId({ groupId, questionId })}`);

            return userChatRef.update({
              msgNumber: FieldValue.increment(1),
              msgDifference: FieldValue.increment(1),
              msg: newMsg.data(),
              date: new Date()
            })
          })

        })
    } catch (err) {
      console.log(err)
    }
  })

exports.listenToSubQuestionChats = functions.firestore
  .document("groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/messages/{chatMassageId}")
  .onCreate((newMsg, context) => {
    try {
      const { groupId, questionId, subQuestionId } = context.params;


      return db
        .collection(`/groups/${groupId}/questions/${questionId}/subQuestions/${subQuestionId}/subscribers`)
        .get()
        .then(subscribersDB => {
          return subscribersDB.forEach(subscriberDB => {
            console.log('update user ', subscriberDB.id)

            const userChatRef = db.collection('users').doc(subscriberDB.id).collection('messages').doc(`${generateChatEntitiyId({ groupId, questionId, subQuestionId })}`);

            return userChatRef.update({
              msgNumber: FieldValue.increment(1),
              msgDifference: FieldValue.increment(1),
              msg: newMsg.data(),
              date: new Date()
            })
          })

        })
    } catch (err) {
      console.log(err)
    }
  })

exports.listenToOptionChats = functions.firestore
  .document("groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}/messages/{chatMassageId}")
  .onCreate((newMsg, context) => {
    try {
      const { groupId, questionId, subQuestionId, optionId } = context.params;


      return db
        .collection(`/groups/${groupId}/questions/${questionId}/subQuestions/${subQuestionId}/options/${optionId}/subscribers`)
        .get()
        .then(subscribersDB => {
          return subscribersDB.forEach(subscriberDB => {
            console.log('update user on option', subscriberDB.id)

            const userChatRef = db.collection('users').doc(subscriberDB.id).collection('messages').doc(`${generateChatEntitiyId({ groupId, questionId, subQuestionId, optionId })}`);

            return userChatRef.update({
              msgNumber: FieldValue.increment(1),
              msgDifference: FieldValue.increment(1),
              msg: newMsg.data(),
              date: new Date()
            })
          })

        })
    } catch (err) {
      console.log(err)
    }
  })
//  ---------- End Listen to Chats -----------


function generateChatEntitiyId(ids) {
  try {
    if (ids === undefined) { throw new Error("No ids were given") }
    const { groupId, questionId, subQuestionId, optionId } = ids;

    if (groupId === undefined) { throw new Error('Missing groupId in generateChatEntitiyId') }


    let entityChatId = `${groupId}`;
    if (questionId !== undefined) { entityChatId += `--${questionId}` }
    if (subQuestionId !== undefined) { entityChatId += `--${subQuestionId}` }
    if (optionId !== undefined) { entityChatId += `--${optionId}` }

    return entityChatId;
  } catch (e) {
    console.error(e);
    return e;
  }
}

function generateCollectionPath(ids) {
  try {
    const { groupId, questionId, subQuestionId, optionId } = ids;
    let path = 'groups'
    if (groupId !== undefined) { path = 'groups' } else { throw new Error('no group id') }
    if (questionId !== undefined) { path += `/${groupId}` }
    if (subQuestionId !== undefined) { path += `/questions/${questionId}` }
    if (optionId !== undefined) { path += `/subQuestions/${subQuestionId}` }

    return path;

  } catch (e) {
    console.log('error at generateCollectionPath')
    console.log(e)
  }
}

function notifiyUsers(payload, ids, pathDB) {
  try {

    const { groupId, questionId, subQuestionId, optionId } = ids;





    // go over all token given by users and see which user set a token for this
    // entity
    const path2 = generateCollectionPath({ groupId, questionId, subQuestionId, optionId })
    console.log(`${path2}/notifications`)

    return db
      .collection(pathDB)
      .get()
      .then((usersDB) => {
        if (usersDB.size === 0) return;

        usersDB.forEach((userDB) => {
          const userTokensObj = userDB.data();

          for (let i in userTokensObj) {

            let token = userTokensObj[i].token
            if (userTokensObj[i].token) {
              console.log(token)
              admin.messaging().sendToDevice(token, payload);
            }
          }


        });


        return

        // Clean invalid tokens
        // function cleanInvalidTokens(tokensWithKey, results) {
        //   const invalidTokens = [];

        //   results.forEach((result, i) => {
        //     if (!result.error) return;

        //     console.error(
        //       "Failure sending notification to",
        //       tokensWithKey[i].token,
        //       result.error
        //     );

        //     switch (result.error.code) {
        //       case "messaging/invalid-registration-token":
        //       case "messaging/registration-token-not-registered":
        //         invalidTokens.push(
        //           admin
        //             .database()
        //             .ref("/tokens")
        //             .child(tokensWithKey[i].key)
        //             .remove()
        //         );
        //         break;
        //       default:
        //         break;
        //     }
        //   });

        //   return Promise.all(invalidTokens);
        // }
        // .then((response) => cleanInvalidTokens(tokensWithKey, response.results))
        // .then(() =>
        // admin.database().ref('/notifications').child(NOTIFICATION_SNAPSHOT.key).remove
        // ())
      })
      .catch((err) => {
        console.log("Error2:", err);
      });
  } catch (e) {
    console.log(e)
  }
  return false
}


function concatenateURL(groupId, questionId, subQuestionId, optionId) {
  try {
    let subscriptionPath = 'groups/'
    if (groupId !== undefined) {
      subscriptionPath = 'group/' + groupId;
      if (questionId !== undefined) {
        subscriptionPath = `question/${groupId}/${questionId}`;
        if (subQuestionId !== undefined) {
          subscriptionPath = `/subquestions/${groupId}/${questionId}/${subQuestionId}`;
          if (optionId !== undefined) {
            subscriptionPath = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`
          }
        }
      }
      return subscriptionPath
    } else {
      return '/groups'

    }


  } catch (err) {
    console.error(err);
    return undefined;
  }
}

//  ============ votes on consequences =======


exports.calcValidateEval = functions.firestore
  .document(
    "groups/{groupId}/questions/{questionId}/subQuestions/{subQuestionId}/options/{optionId}/consequences/{consequenceId}/voters/{userId}"
  )
  .onWrite((change, context) => {

    const { groupId, questionId, subQuestionId, optionId, consequenceId } = context.params;

    let { evaluation, truthiness } = change.after.data();

    if (evaluation === undefined) { evaluationAvg = 0 }
    if (truthiness === undefined) { truthiness = 0 }


    let userVotes = {
      evaluation,
      truthiness
    }



    const consequenceRef = db
      .collection("groups")
      .doc(groupId)
      .collection("questions")
      .doc(questionId)
      .collection("subQuestions")
      .doc(subQuestionId)
      .collection("options")
      .doc(optionId)
      .collection('consequences')
      .doc(consequenceId)

    return db.runTransaction(transaction => {
      return transaction.get(consequenceRef).then(consequenceDB => {



        let totalVotes = 0;
        let truthinessAvg = 0;
        let evaluationAvg = 0;
        let truthinessSum = 0;
        let evaluationSum = 0;
        let totalWeight = 0;

        // get total votes
        if (consequenceDB.data().totalVotes === undefined) {
          totalVotes = 1;
          if (!change.before.exists) { totalVotes = 0 } //only in case it is a new voter and it is the first voter - zero it, so it will be added later.
        } else {
          totalVotes = consequenceDB.data().totalVotes;
        }

        //if new voter
        if (!change.before.exists) {
          //new voter then add number of votes

          totalVotes++



          //get sum of all votes in truthiness and evaluation
          if (consequenceDB.data().truthinessSum === undefined) {
            truthinessSum = userVotes.truthiness
          } else {
            truthinessSum = consequenceDB.data().truthinessSum + userVotes.truthiness;
          }

          if (consequenceDB.data().evaluationSum === undefined) {
            evaluationSum = userVotes.evaluation;
          } else {
            evaluationSum = consequenceDB.data().evaluationSum + userVotes.evaluation;
          }

          truthinessAvg = truthinessSum / totalVotes;
          evaluationAvg = evaluationSum / totalVotes;


        } else {
          //existing voter


          //get previous votes

          let beforeUserVotes = {
            evaluation: change.before.data().evaluation || 0,
            truthiness: change.before.data().truthiness || 1
          }



          truthinessSum = consequenceDB.data().truthinessSum - beforeUserVotes.truthiness + userVotes.truthiness;
          evaluationSum = consequenceDB.data().evaluationSum - beforeUserVotes.evaluation + userVotes.evaluation;

          truthinessAvg = truthinessSum / totalVotes;
          evaluationAvg = evaluationSum / totalVotes;

        }
        totalWeight = truthinessAvg * evaluationAvg;
        let totalWeightAbs = Math.abs(totalWeight)



        return transaction.update(consequenceRef, {
          totalVotes,
          evaluationSum,
          evaluationAvg,
          truthinessAvg,
          truthinessSum,
          totalWeight,
          totalWeightAbs
        });
      });
    });
  });


