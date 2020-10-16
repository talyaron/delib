import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";

//functions
import { orderBy, set } from 'lodash';
import { concatenatePath } from '../../general'

var unsubscribe = {};

function getUserGroups(onOff, userId) {

    try {
        if (onOff == "on") {
            try {

                DB
                    .collection("users")
                    .doc(userId)
                    .collection("groupsOwned")
                    .onSnapshot(groupsOwnedDB => {
                        //unsubsribe from previous listeners
                        for (let i in unsubscribe) {
                            unsubscribe[i]();
                        }
                        unsubscribe = {};

                        const groupsNumber = groupsOwnedDB.size;
                        let count = 0;
                        var groupsObj = {},
                            groupsArray = [];

                        groupsOwnedDB.forEach(groupOwnedDB => {
                            //listen a group and update...
                            unsubscribe[
                                groupOwnedDB
                                    .data()
                                    .id
                            ] = DB
                                .collection("groups")
                                .doc(groupOwnedDB.data().id)
                                .onSnapshot(groupDB => {
                                    let tempObj = groupDB.data();
                                    tempObj.id = groupOwnedDB.id;

                                    groupsObj[
                                        groupOwnedDB
                                            .data()
                                            .id
                                    ] = tempObj;
                                    count++;

                                    if (count == groupsNumber) {
                                        //first update
                                        for (let i in groupsObj) {
                                            groupsArray.push(groupsObj[i]);
                                        }

                                        store.userGroups = groupsArray;
                                        m.redraw();
                                    } else if (count > groupsNumber) {
                                        //net updates after initial update search in array and replace
                                        let indexOfGroup = store
                                            .userGroups
                                            .findIndex(group => {
                                                return group.id === tempObj.id;
                                            });
                                        store.userGroups[indexOfGroup] = tempObj;
                                        m.redraw();
                                    }
                                });
                        });
                    }, err => {
                        console.error('On getUserGroups:', err.name, err.message)
                    });
            } catch (err) {
                console.error(err)
            }
        } else {
            //turn off listeners
            for (let i in unsubscribe) {
                unsubscribe[i]();
            }
        }
    } catch (err) {
        console.error(err)
    }
}

function getQuestions(onOff, groupId, vnode) {
    if (onOff === "on") {
        vnode.state.unsubscribe = DB
            .collection("groups")
            .doc(groupId)
            .collection("questions")
            .orderBy("time", "desc")
            .onSnapshot(questionsDb => {
                questionsDb.forEach(questionDB => {
                    if (questionDB.data().id) {
                        // set(store.questions, `[${groupId}][${questionDB.data().id}]`,
                        // questionDB.data())
                        setStore(store.questions, groupId, questionDB.data().id, questionDB.data());
                    }
                });

                m.redraw();
            });
    } else {
        vnode
            .state
            .unsubscribe();
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
        return DB
            .collection("groups")
            .doc(groupId)
            .onSnapshot(groupDB => {
                store.groups[groupId] = groupDB.data();

                m.redraw();
            }, err => {
                console.error(`At getGroupDetails: ${err.name}, ${err.message}`);
                if (err.message === 'Missing or insufficient permissions.') {
                    m
                        .route
                        .set('/unauthorized');
                }

            });
    } catch (err) {
        console.error(err)
    }
}

function getQuestionDetails(groupId, questionId, vnode) {
    let unsubscribe = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .onSnapshot(questionDB => {
            // set(store.questions, `[${groupId}][${questionId}]`, questionDB.data());
            setStore(store.questions, groupId, questionId, questionDB.data());

            vnode.state.title = questionDB
                .data()
                .title;
            vnode.state.description = questionDB
                .data()
                .description;
            vnode.state.creatorId = questionDB
                .data()
                .creatorId;
            if (questionDB.data().authorization) {
                vnode.state.authorized = questionDB
                    .data()
                    .authorization;
            }

            m.redraw();
        });

    return unsubscribe;
}

function getSubQuestions(groupId, questionId, vnode, getSubOptions = false) {
    let subQuestionRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions");

    return subQuestionRef
        .orderBy("order", "asc")
        .get()
        .then(subQuestionsDB => {
            let subQuestionsArray = [];
            let subQuestionsObj = {};

            subQuestionsDB.forEach(subQuestionDB => {
                let subQuestionObj = subQuestionDB.data();
                subQuestionObj.id = subQuestionDB.id;

                subQuestionsArray.push(subQuestionObj);
                subQuestionsObj[subQuestionObj.id] = {};
            });

            vnode.state.subQuestions = subQuestionsArray;

            m.redraw();
        });
}

function getSubQuestion(groupId, questionId, subQuestionId) {

    let optionRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId);

    return optionRef.onSnapshot(subQuestionDB => {
        if (subQuestionDB.exists) {
            set(store, `subQuestions[${subQuestionId}]`, subQuestionDB.data())

            m.redraw();
        } else {
            console.error(`subQuestion ${groupId}/${questionId}/${subQuestionId} dont exists `)
        }
    })

}

function listenToOptions(groupId, questionId, subQuestionId, order) {

    let optionsRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection("options");

    let orderBy = "time";
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

    return optionsRef
        .orderBy(orderBy, "desc")
        .onSnapshot(optionsDB => {
            let optionsArray = [];
            optionsDB.forEach(optionDB => {

                //this is a patch TODO: change all data to query of active or not active options
                if (optionDB.data().isActive == null || optionDB.data().isActive == true) {

                    let optionObj = optionDB.data();
                    optionObj.id = optionObj.optionId = optionDB.id; //the preferd syntax is 'optionId' and not id, but we left the old 'id' for backward compatability purpose (Tal Yaron)
                    optionObj.subQuestionId = subQuestionId;

                    //get before position Align for animation
                    let elm = document.getElementById(optionObj.id);
                    if (elm) {
                        store.optionsLoc[optionObj.id] = {
                            offsetTop: elm.offsetTop,
                            offsetLeft: elm.offsetLeft,
                            toAnimate: true,
                            new: false
                        };
                    } else {
                        store.optionsLoc[optionObj.id] = {
                            offsetTop: 0,
                            offsetLeft: 0,
                            toAnimate: false,
                            new: true
                        };
                    }

                    optionsArray.push(optionObj);

                } else {
                    console.info(optionDB.data().id, 'is not active')
                };

            });

            set(store, `options[${subQuestionId}]`, optionsArray);

            //add or update or delete an option

            m.redraw();
        });

}

function getOptionDetails(groupId, questionId, subQuestionId, optionId, vnode) {
    let optionRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection("options")
        .doc(optionId);

    return optionRef.onSnapshot(optionDB => {
        store.optionsDetails[optionId] = optionDB.data();
        vnode.state.option.title = optionDB
            .data()
            .title;

        m.redraw();
    });
}

function getOptionVote(groupId, questionId, subQuestionId, optionId, creatorId) {
    let voteRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection("options")
        .doc(optionId)
        .collection("likes")
        .doc(creatorId);

    let unsubscribe = voteRef.onSnapshot(voteDB => {
        if (voteDB.exists) {
            store.optionsVotes[optionId] = voteDB
                .data()
                .like;
        } else {
            store.optionsVotes[optionId] = 0;
        }
        m.redraw();
    });
    return unsubscribe;
}

function getSubAnswers(groupId, questionId, subQuestionId, vnode) {
    let subAnswersRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection("subAnswers")
        .orderBy("time", "desc")
        .limit(100);

    unsubscribe = subAnswersRef.onSnapshot(subAnswersDB => {
        let subAnswersArr = [];
        subAnswersDB.forEach(subAnswerDB => {
            let subAnswerObj = subAnswerDB.data();

            subAnswerObj.id = subAnswerDB.id;
            subAnswersArr.push(subAnswerObj);
        });

        vnode.state.subAnswers[subQuestionId] = subAnswersArr;
        m.redraw();
    });
    return unsubscribe;
}

function getMessages(groupId, questionId, subQuestionId, optionId, vnode) {
    let messagesRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection("subQuestions")
        .doc(subQuestionId)
        .collection("options")
        .doc(optionId)
        .collection("messages");

    return messagesRef
        .orderBy("time", "desc")
        .limit(20)
        .onSnapshot(messagesDB => {
            let messagesArray = [];

            let numberOfMessages = messagesDB.size;
            messagesDB.forEach(messageDB => {
                let tempMessage = messageDB.data();

                //check if message is new
                if (!vnode.state.messagesIds.hasOwnProperty(messageDB.id)) {
                    tempMessage.isNew = true;
                } else {
                    tempMessage.isNew = false;
                }

                messagesArray.unshift(tempMessage);
                vnode.state.messagesIds[messageDB.id] = true;
            });
            vnode.state.messages = messagesArray;
            // vnode.state.numberOfMessages = numberOfMessages;

            m.redraw();
        });
}

function getSubItems(subItemsType, groupId, questionId, vnode) {
    let subItemsRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection(subItemsType);

    unsubscribe = subItemsRef
        .orderBy("totalVotes", "desc")
        .onSnapshot(SubItemsDB => {
            SubItemsDB
                .docChanges()
                .forEach(function (change) {
                    if (change.type === "added") {
                        vnode.state.subAnswersUnsb[change.doc.id] = getSubAnswers(groupId, questionId, change.doc.id, vnode); //listen to answers
                    }

                    if (change.type === "removed") {
                        //unsubscribe from answers
                    }
                });

            let subItemArr = [];
            SubItemsDB.forEach(SubItemDB => {
                let subItemObj = SubItemDB.data();

                subItemObj.id = SubItemDB.id;
                subItemArr.push(subItemObj);
            });

            vnode.state[subItemsType] = subItemArr;
            m.redraw();
        });
    return unsubscribe;
}

function getSubItemLikes(subItemsType, groupId, questionId, subQuestionId, creatorId, vnode) {
    let subQuestionRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection(subItemsType)
        .doc(subQuestionId);

    return subQuestionRef.onSnapshot(likeDB => {
        if (likeDB.data().totalVotes != undefined) {
            vnode.state.likes = likeDB
                .data()
                .totalVotes;
        } else {
            vnode.state.likes = 0;
        }

        m.redraw();
    });
}

function getSubItemUserLike(subItemsType, groupId, questionId, subQuestionId, creatorId, vnode) {
    let subQuestionRef = DB
        .collection("groups")
        .doc(groupId)
        .collection("questions")
        .doc(questionId)
        .collection(subItemsType)
        .doc(subQuestionId)
        .collection("likes")
        .doc(creatorId);

    return subQuestionRef.onSnapshot(likeDB => {
        if (likeDB.exists) {
            if (likeDB.data().like == 1) {
                vnode.state.up = true;
            } else {
                vnode.state.up = false;
            }
        } else {
            vnode.state.up = false;
        }

        m.redraw();
    });
}

function listenToSubscription(path) {
    return new Promise((resolve, reject) => {


        if ({}.hasOwnProperty.call(store.subscribe, path) === false) {

            DB
                .doc(`${path}/subscribers/${store.user.uid}`)
                .onSnapshot(subscriberDB => {

                    set(store.subscribe, `[${path}]`, subscriberDB.exists);

                    m.redraw();

                    if (subscriberDB.exists)
                        console.info('user is subscribed')
                    else {
                        console.info('user is not subscribed')
                    }
                    resolve();
                }, err => {
                    console.error(err)
                    reject(err)
                })
        }
    })
}

function listenToFeed() {
    try {
        DB.collection('users').doc(store.user.uid).collection('feed')
            .limit(20)
            .orderBy('date', 'desc')
            .onSnapshot(feedDB => {

                feedDB.docChanges().forEach(function (change) {
                    if (change.type === "added") {
                        const feedItem = change.doc.data();
                        feedItem.feedItemId = change.doc.id;
                        store.feed2.push(feedItem)

                    }

                });

                m.redraw();
            })
    } catch (err) {
        console.error(err)
    }
}



function listenToFeedLastEntrance() {
    try {
        DB.collection('users').doc(store.user.uid).collection('feedLastEntrence').doc('info')
            .onSnapshot(infoDB => {
                const { lastEntrance } = infoDB.data()
                store.feed2Info = { lastEntrance }

            }, err => {
                console.error(err)
            })
    } catch (err) {
        console.error(err)
    }
}
// function listenToFeed(path, onOff = "on") {
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

        if (store.listen.chatFeed == false) {
            DB.collection('users').doc(store.user.uid).collection('chat')
                .orderBy("date", "asc")
                .onSnapshot(chatDB => {
                    let unreadMessagesCouner = 0;
                    const messages = [];
                    chatDB.forEach(newMessageDB => {
                        messages.push(newMessageDB.data());

                        unreadMessagesCouner += newMessageDB.data().msgDifference;
                    })


                    store.chatFeed = messages;

                    store.chatFeedCounter = unreadMessagesCouner;

                    m.redraw()
                })

            store.listen.chatFeed = true;
        }

    } catch (e) {
        console.error(e)
    }
}

function listenToChat(ids) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;
        if (groupId === undefined) throw new Error('No group id in the ids')
        let path = concatenatePath(groupId, questionId, subQuestionId, optionId);
        console.log(path)
        const chatPath = path + '/chat';
        let lastRead = new Date('2020-01-01');

        if (!(path in store.chatLastRead)) {
            store.chat[path] = [];
            store.chatLastRead[path]

        } else {
            lastRead = store.chatLastRead[path]
        }

        console.log('last read', lastRead)


        return DB.collection(chatPath)
            .where('createdTime', '>', lastRead)
            .orderBy('createdTime', 'desc')
            .onSnapshot(messagesDB => {
                messagesDB.docChanges().forEach(function (change) {
                    if (change.type === "added") {
                      
                        if (!(path in store.chat)) { store.chat[path] = [] }
                        store.chat[path].push(change.doc.data());
                        store.chatLastRead = change.doc.data().createdTime;
                    }
                    
                })
                console.log(store.chat);
                console.log(store.chatLastRead)


                
            }, e => {
                console.error(e)
            })
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    getUserGroups,
    getQuestions,
    getGroupDetails,
    getQuestionDetails,
    getSubQuestions,
    getSubQuestion,
    listenToOptions,
    getOptionVote,
    getSubItems,
    getSubItemLikes,
    getSubItemUserLike,
    getSubAnswers,
    getOptionDetails,
    getMessages,
    listenToFeed,
    listenToChat,
    listenToChatFeed,
    listenToFeedLastEntrance,
    listenToSubscription
};