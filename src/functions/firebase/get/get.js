import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";

//functions
import { cond, constant, orderBy, set } from 'lodash';
import { concatenateDBPath, setBrowserUniqueId, getEntityId } from '../../general'

var unsubscribe = {};

function listenToUserGroups() {



    try {

        if (!{}.hasOwnProperty.call(store.user, 'uid')) throw new Error('Cant listen to user groups, because user do not have uid')

        if (store.userGroupsListen === false) {
            store.userGroupsListen = true;



            DB
                .collection("users")
                .doc(store.user.uid)
                .collection("groupsOwned")
                .onSnapshot(groupsOwnedDB => {


                    setTimeout(() => {
                        if (store.userGroups[0] === false) store.userGroups.splice(0, 1);
                        m.redraw()
                    }, 500)

                    listenToGroups(groupsOwnedDB);
                    m.redraw();
                }, err => {
                    console.error('On getUserGroups:', err.name, err.message)
                });
        }
    } catch (err) {
        console.error(err)
    }
}

function listenToRegisterdGroups() {


    try {

        if ({}.hasOwnProperty.call(store.user, 'uid') && store.registerGroupsListen === false) {
            store.registerGroupsListen = true;


            DB.collection('users').doc(store.user.uid).collection('registerGroups').onSnapshot(groupsDB => {

                listenToGroups(groupsDB);
            }, err => {
                console.error('On listenToRegisterdGroups:', err.name, err.message)
            })
        }
    } catch (e) {
        console.error(e)
    }

}



function listenToGroups(groupsDB) {


    try {

        groupsDB.docChanges().forEach(change => {

            if (change.type === "added") {

                //subscribe to group and listen

                store.userGroupsListners[change.doc.id] = listenToGroup(change.doc.id);


            } else if (change.type === "removed") {


                //remove from dom
                let groupIndex = store.userGroups.findIndex(group => group.id === change.doc.id);
                if (groupIndex > -1) {
                    store.userGroups.splice(groupIndex, 1);
                }
                //unsubscribe to group
                store.userGroupsListners[change.doc.id]();

                delete store.userGroupListen[change.doc.id]


            }


            m.redraw()


        });
    } catch (e) {
        console.error(e)
    }
}

function listenToGroup(groupId) {

    try {
        if (!{}.hasOwnProperty.call(store.userGroupsListners, groupId)) {

            store.userGroupListen[groupId] = true


            return DB.collection('groups').doc(groupId).onSnapshot(groupDB => {
                try {
                    if (groupDB.exists) {
                        let groupIndex = store.userGroups.findIndex(group => group.id === groupId);

                        if (store.userGroups[0] === false) store.userGroups.splice(0, 1);

                        let groupObj = groupDB.data();
                        if (!{}.hasOwnProperty.call(groupObj, 'id')) {
                            DB.collection('groups').doc(groupId).update({ id: groupId, groupId }).catch(e => console.error(e))
                        }
                        groupObj.id = groupObj.groupId = groupDB.id;
                        if (groupIndex == -1) {
                            store.userGroups.push(groupObj)
                        } else {
                            store.userGroups[groupIndex] = groupObj
                        }


                        m.redraw();




                    } else {
                        throw new Error(`group ${groupId} do not exists`)
                    }
                } catch (e) {
                    console.error(e.message)
                }
            }, err => {
                console.error('On listenToGroup:', err.name, err.message)
            })
        } else {
            return () => { };
        }
    } catch (e) {
        console.error(e);
    }

}

function listenToGroupMembers(groupId) {
    try {

        return DB.collection('groups').doc(groupId).collection('members')
            .onSnapshot(membersDB => {
                let members = [];
                membersDB.forEach(memberDB => {
                    members.push(memberDB.data());

                })

                store.groupMembers[groupId] = members;
                m.redraw();

            }, e => { console.error(e) })
    } catch (e) {
        console.error(e)
        return () => { };
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

        if (typeof groupId !== 'string') {
            console.info(groupId)
            throw new Error(' groupId is not a string')
        }

        if (!{}.hasOwnProperty.call(store.groupListen, groupId)) {
            store.groupListen[groupId] = true;

            DB
                .collection("groups")
                .doc(groupId)
                .onSnapshot(groupDB => {
                    store.groups[groupId] = groupDB.data();

                    m.redraw();
                }, err => {
                    console.error(`At getGroupDetails: ${err.name}, ${err.message}`);
                    if (err.message === 'Missing or insufficient permissions.') {
                        m.route.set('/unauthorized');
                    }

                });
        }
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

            vnode.state.title = questionDB.data().title;
            vnode.state.description = questionDB.data().description;
            vnode.state.creatorId = questionDB.data().creatorId;
            if (questionDB.data().authorization) {
                vnode.state.authorized = questionDB
                    .data()
                    .authorization;
            }

            listenSubQuestions(groupId, questionId, vnode)
            m.redraw();
        });

    return unsubscribe;
}

function listenSubQuestions(groupId, questionId, vnode, getSubOptions = false) {

    try {

        console.log('listenSubQuestions', groupId, questionId)

        //listen only once

        if (!{}.hasOwnProperty.call(store.subQuestionsListners, questionId)) {

            store.subQuestionsListners[questionId] = { listen: true };

            console.log('listenSubQuestions, listen to sub groups')

            if (!{}.hasOwnProperty.call(vnode.state, 'creatorId')) { throw new Error('No creatorId in vnode at listenSubQuestions') }

            let term, search;

            // sub question seen by the admin are diffrenet then subquestions seen by yhe simple user
            if (vnode.state.creatorId != store.user.uid) {

                //simple user view
                term = '=='; search = 'userSee'
            } else {

                //admin view
                term = '!='; search = 'deleted'
            }



            DB
                .collection("groups")
                .doc(groupId)
                .collection("questions")
                .doc(questionId)
                .collection("subQuestions")
                .where('showSubQuestion', term, search)
                .onSnapshot(subQuestionsDB => {
                    let subQuestionsArray = [];
                    let subQuestionsObj = {};

                    subQuestionsDB.forEach(subQuestionDB => {
                        let subQuestionObj = subQuestionDB.data();
                        subQuestionObj.id = subQuestionDB.id;

                        subQuestionsArray.push(subQuestionObj);
                        subQuestionsObj[subQuestionObj.id] = {};
                    });



                    store.subQuestions[groupId] = subQuestionsArray;
                    console.log()

                    m.redraw();

                });
        }
    } catch (e) {

        console.error(e)
    }
}

function getSubQuestion(groupId, questionId, subQuestionId, isSingle) {

    try {
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
    } catch (e) {
        console.error(e)
    }

}

function listenToOptions(groupId, questionId, subQuestionId, order = 'top', isSingle = false) {
    try {

        if (!{}.hasOwnProperty.call(store.optionsListen, subQuestionId)) {
            //signal that this questionId options are listend to
            store.optionsListen[subQuestionId] = true;

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

            let limit = 100;
            // if (isSingle === true) {
            //     limit = 1
            // }

            return optionsRef
                .orderBy(orderBy, "desc")
                .limit(limit)
                .onSnapshot(optionsDB => {
                    let optionsArray = [];
                    optionsDB.forEach(optionDB => {


                        //see how many message the user read (from total mesaages of option). use this to calculate hoem namy messages the user didn't read.
                        listenToUserLastReadOfOptionChat(optionDB.data().optionId);

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
        } else {
            return () => { };
        }
    } catch (e) {
        console.error(e)
    }

}

function listenToUserLastReadOfOptionChat(optionId) {
    try {


        if (!{}.hasOwnProperty.call(store.optionNumberOfMessagesRead, optionId)) {


            DB.collection('users')
                .doc(store.user.uid)
                .collection('optionsRead')
                .doc(optionId)
                .onSnapshot(optionListenDB => {
                    if (optionListenDB.exists) {
                        const numberOfMessages = optionListenDB.data().numberOfMessages || 0;
                        store.optionNumberOfMessagesRead[optionId] = numberOfMessages;
                        m.redraw()
                    }
                }, e => { console.error(e) })


        }

    } catch (e) {
        console.error(e)
    }
}


function listenToOption(ids) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        if (groupId === undefined) throw new Error('missing groupId');
        if (questionId === undefined) throw new Error('missing questionId');
        if (subQuestionId === undefined) throw new Error('missing subQuestionId');
        if (optionId === undefined) throw new Error('missing optionId');

        return DB
            .collection("groups")
            .doc(groupId)
            .collection("questions")
            .doc(questionId)
            .collection("subQuestions")
            .doc(subQuestionId)
            .collection("options")
            .doc(optionId)
            .onSnapshot(optionDB => {
                let optionObj = optionDB.data();
                optionObj.optionId = optionDB.data().id;

                set(store, `option[${optionId}]`, optionObj);
                m.redraw()
            })

    } catch (e) {
        console.error(e);
    }
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
    try {



        if (groupId === undefined || questionId === undefined || subQuestionId === undefined || optionId === undefined || creatorId === undefined) throw new Error("One of the Ids groupId, questionId, subQuestionId, optionId, creatorId is missing", groupId, questionId, subQuestionId, optionId, creatorId)
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
                store.optionsVotes[optionId] = voteDB.data().like;
            } else {
                store.optionsVotes[optionId] = 0;
            }
            m.redraw();
        });
        return unsubscribe;
    } catch (e) {
        console.error(e)
    }
}

function listenToUserVote(vnode) {
    try {

        const { groupId, questionId, subQuestionId } = vnode.attrs.ids;

        return DB.collection("groups")
            .doc(groupId)
            .collection("questions")
            .doc(questionId)
            .collection("subQuestions")
            .doc(subQuestionId)
            .collection('votes')
            .doc(store.user.uid)
            .onSnapshot(voteDB => {
                if (!voteDB.exists) {
                    vnode.state.optionVoted = false;
                } else {
                    vnode.state.optionVoted = voteDB.data().optionVoted;
                }
                m.redraw();

            }, e => {
                console.error(e)
            })
    } catch (e) {
        console.error(e)
        return () => { };
    }
}



function listenToConsequences(groupId, questionId, subQuestionId, optionId) {
    try {
        if (!{}.hasOwnProperty.call(store.consequencesListen, optionId)) {
            store.consequencesListen[optionId] = true;


            DB
                .collection('groups')
                .doc(groupId)
                .collection('questions')
                .doc(questionId)
                .collection('subQuestions')
                .doc(subQuestionId)
                .collection('options')
                .doc(optionId)
                .collection('consequences')
                .onSnapshot(consequencesDB => {
                    const consequences = [];
                    consequencesDB.forEach(consequenceDB => {
                        consequences.push(consequenceDB.data());
                    })
                    store.consequences[optionId] = consequences;
                    m.redraw();
                })
        } else {
            console.info(`Allredy listen to consequnces on option ${optionId}`);
        }
    } catch (e) {
        console.error(e)
    }
}

function listenToTopConsequences(ids) {

    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        if (groupId === undefined) throw new Error('groupId is missing in listenToTopConsequences');
        if (questionId === undefined) throw new Error('questionId is missing in listenToTopConsequences');
        if (subQuestionId === undefined) throw new Error('subQuestionId is missing in listenToTopConsequences');
        if (optionId === undefined) throw new Error('optionId is missing in listenToTopConsequences');

        if (!{}.hasOwnProperty.call(store.consequencesTopListen, optionId)) {
            store.consequencesTopListen[optionId] = true;
            store.consequencesTop[optionId] = []

            DB
                .collection('groups')
                .doc(groupId)
                .collection('questions')
                .doc(questionId)
                .collection('subQuestions')
                .doc(subQuestionId)
                .collection('options')
                .doc(optionId)
                .collection('consequences')
                .orderBy('totalWeightAbs', 'desc')
                .limit(3)
                .onSnapshot(consequencesDB => {
                    let consequences = [];
                    consequencesDB.forEach(consequenceDB => {
                        consequences.push(consequenceDB.data())
                    })

                    store.consequencesTop[optionId] = consequences;

                    m.redraw();
                })
        }

    }
    catch (e) {
        console.error
    }
}

function getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId) {
    try {

        return DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .collection('options')
            .doc(optionId)
            .collection('consequences')
            .doc(consequenceId)
            .collection('voters')
            .doc(store.user.uid)
            .get().then(voteDB => {
                return voteDB.data();
            })
            .catch(e => {
                console.error(e)
            })

    } catch (e) {
        console.error(e)
    }

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
            DB.collection('users').doc(store.user.uid).collection('messages')
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
        let path = concatenateDBPath(groupId, questionId, subQuestionId, optionId);

        const chatPath = path + '/messages';
        let lastRead = new Date('2020-01-01');

        if (!(path in store.chatLastRead)) {
            store.chat[path] = [];
            store.chatLastRead[path]

        } else {
            lastRead = store.chatLastRead[path]
        }

        if (!(path in store.chatMessegesNotRead)) {
            store.chatMessegesNotRead[path] = 0;
        }


        return DB.collection(chatPath)
            .where('createdTime', '>', lastRead)
            .orderBy('createdTime', 'desc')
            .limit(100)
            .onSnapshot(messagesDB => {
                messagesDB.docChanges().forEach(function (change) {
                    if (change.type === "added") {

                        if (!(path in store.chat)) { store.chat[path] = [] }
                        store.chat[path].push(change.doc.data());
                        store.chatLastRead = change.doc.data().createdTime;
                        store.chatMessegesNotRead[path]++;


                    }

                })

                store.chat[path] = store.chat[path].sort((a, b) => a.createdTime.seconds - b.createdTime.seconds);
                let userUID = ''
                store.chat[path].map((message, index) => {
                    if (message.uid === userUID) {
                        store.chat[path][index].isSameUser = true;
                    } else {
                        store.chat[path][index].isSameUser = false;
                        userUID = message.uid;
                    }
                })
                m.redraw();


            }, e => {
                console.error(e)
            })
    } catch (e) {
        console.error(e)
    }
}

function listenIfGetsMessages(ids) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        let entityId = getEntityId(ids);

        //activate listening only once
        if (!{}.hasOwnProperty.call(store.listenToMessages, entityId)) {


            const browserUniqueId = setBrowserUniqueId()

            const dbPath = `${concatenateDBPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;


            DB.doc(dbPath).onSnapshot(tokensDB => {
                if (tokensDB.exists) {
                    if (tokensDB.data()[browserUniqueId] === undefined) {
                        store.listenToMessages[entityId] = false;

                    } else {
                        store.listenToMessages[entityId] = true;
                    }

                } else {

                    store.listenToMessages[entityId] = false;
                }

                m.redraw();
            }, e => { console.error(e) })

        }
    } catch (e) {
        console.error(e)
    }

}

function getLastTimeEntered(ids, vnode) {
    try {


        const { groupId, questionId, subQuestionId, optionId, consequenceId } = ids;


        let path = concatenateDBPath(groupId, questionId, subQuestionId, optionId, consequenceId);
        const regex = new RegExp('/', 'gi')
        path = path.replace(regex, '-')


        if (path !== '-groups') {
            DB.collection(`users`).doc(store.user.uid).collection('chatLastEnterence').doc(path)
                .get()
                .then(time => {
                    if (time.data() !== undefined) {
                        vnode.state.lastTimeEntered = time.data().lastTime.seconds;

                        m.redraw();
                    } else {
                        vnode.state.lastTimeEntered = 0;
                    }
                })
        } else {

            vnode.state.unreadMessages = 0;
            throw new Error('couldnt find path to spesific chat (groupId, questionId, subQuestionId, optionId, consequenceId)', groupId, questionId, subQuestionId, optionId, consequenceId);
        }
    }


    catch (e) {
        console.error(e)
    }
}

module.exports = {
    listenToUserGroups,
    listenToRegisterdGroups,
    getQuestions,
    getGroupDetails,
    listenToGroupMembers,
    getQuestionDetails,
    listenSubQuestions,
    getSubQuestion,
    listenToOptions,
    listenToOption,
    listenToConsequences,
    listenToTopConsequences,
    getMyVotesOnConsequence,
    getOptionVote,
    listenToUserVote,
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
    listenToSubscription,
    listenIfGetsMessages,
    getLastTimeEntered
};