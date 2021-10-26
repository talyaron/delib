import m from "mithril";
import { DB } from "../config";
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";

//model
import store, { consequencesTop } from "../../../data/store";
import { SUGGESTIONS, PARALLEL_OPTIONS } from '../../../data/evaluationTypes';

//functions
import { set } from 'lodash';
import { concatentPath, concatenateDBPath, setBrowserUniqueId, getEntityId } from '../../general'
import { sendError } from '../set/set';

var unsubscribe = {};

async function getUser(uid) {
    try {

        const userRef = doc(DB, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            console.log(userSnap.data());
            let { stopRegistrationMessages, firstTimeOnSuggestions } = userSnap.data()
            if (stopRegistrationMessages === undefined) stopRegistrationMessages = false;

            store.user.stopRegistrationMessages = stopRegistrationMessages;

            //check if user is first time on suggestions
            if (firstTimeOnSuggestions === undefined) store.user.firstTimeOnSuggestions = true;

        } else {
            throw new Error(`No user with id ${uid}`)
        }


    } catch (e) {
        console.error(e); sendError(e);
    }
}

function listenToUserGroups() {



    try {

        if (!{}.hasOwnProperty.call(store.user, 'uid')) throw new Error('Cant listen to user groups, because user do not have uid')

        if (store.userGroupsListen === false) {
            store.userGroupsListen = true;

            const q = query(collection(DB, 'users', store.user.uid, 'groupsOwned'))

            const unsub = onSnapshot(q, groupsOwnedDB => {

                setTimeout(() => {
                    if (store.userGroups[0] === false) store.userGroups.splice(0, 1);
                    m.redraw()
                }, 500)

                listenToGroups(groupsOwnedDB);
                m.redraw();
            }, err => {
                console.error('On getUserGroups:', err.name, err.message); sendError(err)
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

            const registerdGroupsRef = collection(DB, 'users', store.user.uid, 'registerGroups');
            const unsub = onSnapshot(registerdGroupsRef, groupsDB => {

                listenToGroups(groupsDB);
            }, err => {
                console.error('On listenToRegisterdGroups:', err.name, err.message); sendError(e)
            })
        }
    } catch (e) {
        console.error(e); sendError(e);
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
        console.error(e); sendError(e);
    }
}

function listenToGroup(groupId) {

    try {
        if (!{}.hasOwnProperty.call(store.userGroupsListners, groupId)) {

            store.userGroupListen[groupId] = true

            const groupRef = doc(DB, 'groups', groupId)
            return onSnapshot(groupRef, groupDB => {

                if (groupDB.exists) {
                    let groupIndex = store.userGroups.findIndex(group => group.id === groupId);

                    if (store.userGroups[0] === false) store.userGroups.splice(0, 1);

                    let groupObj = groupDB.data();
                    if (!{}.hasOwnProperty.call(groupObj, 'id')) {
                        DB.collection('groups').doc(groupId).update({ id: groupId, groupId }).catch(e => { console.error(e); sendError(e) })
                    }
                    groupObj.id = groupObj.groupId = groupDB.id;
                    if (groupIndex == -1) {
                        store.userGroups.push(groupObj)
                    } else {
                        store.userGroups[groupIndex] = groupObj
                    }


                    m.redraw();




                } else {

                    DB.collection('users').doc(store.user.uid).collection('registerGroups').doc(groupId).delete().then(d => console.info(d));


                    throw new Error(`group ${groupId} do not exists. deleteing this group from user subscription`)
                }

            }, err => {
                console.error('On listenToGroup:', err.name, err.message); sendError(err)
            })
        } else {
            return () => { };
        }
    } catch (e) {
        console.error(e); sendError(e);;
    }

}

function listenToGroupMembers(groupId) {
    try {

        const membersRef = collection(DB, 'groups', groupId, 'members')
        return onSnapshot(membersRef, membersDB => {
            let members = [];
            membersDB.forEach(memberDB => {
                members.push(memberDB.data());

            })

            store.groupMembers[groupId] = members;
            m.redraw();

        }, e => { console.error(e); sendError(e); })
    } catch (e) {
        console.error(e); sendError(e);
        return () => { };
    }
}


function getQuestions(onOff, groupId, vnode) {
    if (onOff === "on") {

        const questionsRef = collection(DB, 'groups', groupId, 'questions');
        const q = query(questionsRef, orderBy("time", "desc"));

        vnode.state.unsubscribe = onSnapshot(q, questionsDb => {
            questionsDb.forEach(questionDB => {
                if (questionDB.data().id) { setStore(store.questions, groupId, questionDB.data().id, questionDB.data()); }
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

function listenToGroupDetails(groupId, vnode) {
    try {

        if (typeof groupId !== 'string') {
            console.info(groupId)
            throw new Error(' groupId is not a string')
        }

        if (!{}.hasOwnProperty.call(store.groupListen, groupId)) {
            store.groupListen[groupId] = true;

            const groupRef = doc(DB, 'groups', groupId);
            onSnapshot(groupRef, groupDB => {
                store.groups[groupId] = groupDB.data();

                m.redraw();
            }, err => {
                console.error(`At listenToGroupDetails: ${err.name}, ${err.message}`);
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


    const questionRef = doc(DB, 'groups', groupId, 'questions', questionId)

    let unsubscribe = onSnapshot(questionRef, questionDB => {
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

        //listen only once

        if (!{}.hasOwnProperty.call(store.subQuestionsListners, questionId)) {

            store.subQuestionsListners[questionId] = { listen: true };


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


            const subQuestionsRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions')

            onSnapshot(subQuestionsRef, subQuestionsDB => {
                let subQuestionsArray = [];
                let subQuestionsObj = {};

                subQuestionsDB.forEach(subQuestionDB => {
                    let subQuestionObj = subQuestionDB.data();
                    subQuestionObj.subQuestionId = subQuestionObj.id = subQuestionDB.id;

                    subQuestionsArray.push(subQuestionObj);
                    subQuestionsObj[subQuestionObj.id] = {};
                });

                store.subQuestions[groupId] = subQuestionsArray;

                m.redraw();

            });
        }
    } catch (e) {

        console.error(e); sendError(e);
    }
}

function getSubQuestion(groupId, questionId, subQuestionId, isSingle) {

    try {
        const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId)


        return onSnapshot(subQuestionRef, subQuestionDB => {
            if (subQuestionDB.exists) {
                set(store, `subQuestions[${subQuestionId}]`, subQuestionDB.data());


                m.redraw();
            } else {
                console.error(`subQuestion ${groupId}/${questionId}/${subQuestionId} dont exists `)
                m.route.set(`question/${groupId}/${questionId}`)
            }
        })
    } catch (e) {
        console.error(e); sendError(e);
    }

}

function listenToOptions(groupId, questionId, subQuestionId, order = 'top', isSingle = false) {
    try {

        if (!{}.hasOwnProperty.call(store.optionsListen, subQuestionId)) {
            //signal that this questionId options are listend to
            store.optionsListen[subQuestionId] = true;

            const optiosnRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options')


            let _orderBy = "time";
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
            let _limit = 100;
            const q = query(optiosnRef, orderBy(_orderBy), limit(_limit))

            onSnapshot(q, optionsDB => {

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
        console.error(e); sendError(e);
    }

}

function listenToUserLastReadOfOptionChat(optionId) {
    try {


        if (!{}.hasOwnProperty.call(store.optionNumberOfMessagesRead, optionId)) {

            const optionRef = doc(DB, 'users', store.user.uid, 'optionsRead', optionId)


            onSnapshot(optionRef, optionListenDB => {

                if (optionListenDB.exists()) {
                    const numberOfMessages = optionListenDB.data().numberOfMessages || 0;
                    store.optionNumberOfMessagesRead[optionId] = numberOfMessages;
                    m.redraw()
                }
            }, e => { console.error(e); sendError(e); })


        }

    } catch (e) {
        console.error(e); sendError(e);
    }
}


function listenToOption(ids) {
    try {


        const { groupId, questionId, subQuestionId, optionId } = ids;

        if (groupId === undefined) throw new Error('missing groupId');
        if (questionId === undefined) throw new Error('missing questionId');
        if (subQuestionId === undefined) throw new Error('missing subQuestionId');
        if (optionId === undefined) throw new Error('missing optionId');

        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)
        return onSnapshot(optionRef, optionDB => {

            let optionObj = optionDB.data();

            optionObj.optionId = optionDB.data().optionId;

            set(store, `option[${optionId}]`, optionObj);

            m.redraw()
        }, e => {
            console.error(e); sendError(e);;
        })

    } catch (e) {
        console.error(e); sendError(e);;
    }
}

function getOptionDetails(groupId, questionId, subQuestionId, optionId, vnode) {

    try {
        const optionRef = doc('groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)

        return onSnapshot(optionRef, optionDB => {
            store.optionsDetails[optionId] = optionDB.data();
            vnode.state.option.title = optionDB
                .data()
                .title;

            m.redraw();
        });
    } catch (err) {
        console.error(err)
    }
}

function getOptionVote(groupId, questionId, subQuestionId, optionId, creatorId, processType = SUGGESTIONS) {
    try {



        if (groupId === undefined || questionId === undefined || subQuestionId === undefined || optionId === undefined || creatorId === undefined) throw new Error("One of the Ids groupId, questionId, subQuestionId, optionId, creatorId is missing", groupId, questionId, subQuestionId, optionId, creatorId)
        const evaluationPath = concatentPath(groupId, questionId, subQuestionId, optionId)
        let evaluationTypeRef;
        if (processType === SUGGESTIONS) {
            evaluationTypeRef = evaluationPath + `/likes/${creatorId}`;
        } else if (processType === PARALLEL_OPTIONS) {
            evaluationTypeRef = evaluationPath + `/confirms/${creatorId}`;
        } else {
            throw new Error(`couldnt detect the process type (${processType})`)
        }
        const evaluationRef = doc(DB, evaluationPath);
        let unsubscribe = onSnapshot(evaluationRef, voteDB => {


            if (voteDB.exists) {

                if (processType === SUGGESTIONS) {
                    store.optionsVotes[optionId] = voteDB.data().like;
                } else if (processType === PARALLEL_OPTIONS) {
                    console.log('process type', PARALLEL_OPTIONS)
                    console.log(voteDB.data())
                    store.optionsConfirm[optionId] = voteDB.data().confirm;
                }
            } else {
                store.optionsVotes[optionId] = 0;
                console.error('voteDB do not exists.....')
            }

            console.log(store.optionsConfirm)

            m.redraw();
        });
        return unsubscribe;
    } catch (e) {
        console.error(e);
    }
}

function listenToUserVote(vnode) {
    try {

        const { groupId, questionId, subQuestionId } = vnode.attrs.ids;

        const voteRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'votes', store.user.uid)

        return onSnapshot(voteRef, voteDB => {
            if (!voteDB.exists) {
                vnode.state.optionVoted = false;
            } else {
                vnode.state.optionVoted = voteDB.data().optionVoted;
            }
            m.redraw();

        }, e => {
            console.error(e); sendError(e);
        })
    } catch (e) {
        console.error(e); sendError(e);
        return () => { };
    }
}



function listenToConsequences(groupId, questionId, subQuestionId, optionId) {
    try {
        if (!{}.hasOwnProperty.call(store.consequencesListen, optionId)) {
            store.consequencesListen[optionId] = true;

            const consequencesRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'consequences');
            onSnapshot(consequencesRef, consequencesDB => {
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
        console.error(e); sendError(e);
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
            store.consequencesTop[optionId] = [];

            const consequencesRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'consequences');
            const q = query(consequencesRef, limit(1), orderBy('totalWeightAbs', 'desc'));

            onSnapshot(q, consequencesDB => {
                let consequences = [];
                consequencesDB.forEach(consequenceDB => {
                    store.consequencesTop[optionId] = [consequenceDB.data()]
                })



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
        const consequencesRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'consequences', consequenceId, 'voters', store.user.uid);

        return getDoc(consequencesRef).then(voteDB => {
            return voteDB.data();
        }).catch(e => {
            console.error(e); sendError(e);
        })

    } catch (e) {
        console.error(e); sendError(e);
    }

}

function getSubAnswers(groupId, questionId, subQuestionId, vnode) {
    try {
        const subAnswersRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'subQuestions');

        const q = query(subAnswersRef, orderBy("time", "desc"), limit(100))

        unsubscribe = onSnapshot(q, subAnswersDB => {
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
    } catch (e) {
        console.error(e)
    }
}

function getMessages(groupId, questionId, subQuestionId, optionId, vnode) {

    const messagesRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'subQuestions', subQuestionId, 'options', optionId, 'messages');
    const q = query(messagesRef, orderBy("time", "desc"), limit(20))

    return onSnapshot(q, messagesDB => {
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


    const subItemsRef = collection(DB, 'groups', groupId, 'questions', questionId, subItemsType)

    const q = query(orderBy("totalVotes", "desc"))
    unsubscribe = onSnapshot(q, SubItemsDB => {
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
    const subQuestionRef = doc(Db, 'groups', groupId, 'questions', questionId, subItemsType, subQuestionId)

    return onSnapshot(subQuestionRef, likeDB => {
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
    const subQuestionRef = doc(Db, 'groups', groupId, 'questions', questionId, subItemsType, subQuestionId, 'like', creatorId)


    return onSnapshot(subQuestionRef, likeDB => {
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
            console.log(`${path}/subscribers/${store.user.uid}`)
            const subscriptionRef = doc(DB, `${path}/subscribers/${store.user.uid}`)

            onSnapshot(subscriptionRef, subscriberDB => {

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
        const feedRef = collection(DB, 'users', store.user.uid, 'feed');
        const q = query(feedRef, orderBy('date', 'desc'), limit(20));
        const usub = onSnapshot(q, feedDB => {

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
        const feedLastEntrenceRef = doc(DB, 'users', store.user.uid, 'feedLastEntrence', 'info');
        const unsub = onSnapshot(feedLastEntrenceRef, infoDB => {

            const { lastEntrance } = infoDB.data()
            store.feed2Info = { lastEntrance }

        }, err => {
            console.error(err)
        })
    } catch (err) {
        console.error(err)
    }
}



function listenToChat(ids) {

    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        if (groupId === undefined) throw new Error('No group id in the ids')
        let collectionRef = concatentPath(DB, groupId, questionId, subQuestionId, optionId);
        const path = concatentPath(groupId, questionId, subQuestionId, optionId)
        console.log('collectionRef', collectionRef)
        const chatRef = collection(DB, `${collectionRef}/messages`);
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

        const q = query(chatRef, where('createdTime', '>', lastRead), orderBy('createdTime', 'desc'), limit(100))
        return onSnapshot(q, messagesDB => {
            messagesDB.docChanges().forEach(function (change) {
                if (change.type === "added") {



                    if (!(path in store.chat)) { store.chat[path] = [] }
                    const messageObj = change.doc.data();
                    messageObj.messageId = change.doc.id;
                    store.chat[path].push(messageObj);
                    store.chatLastRead = change.doc.data().createdTime;
                    store.chatMessegesNotRead[path]++;


                } else if (change.type === 'removed') {
                    console.log('removed', change.doc.id)
                    store.chat[path] = store.chat[path].filter(msg => msg.messageId !== change.doc.id);
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
            console.error(e); sendError(e);
        })
    } catch (e) {
        console.error(e); sendError(e);
    }
}

function listenIfGetsMessages(ids) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        let entityId = getEntityId(ids);

        //activate listening only once
        if (!{}.hasOwnProperty.call(store.listenToMessages, entityId)) {


            const browserUniqueId = setBrowserUniqueId()

            const dbPath = `${concatentPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;

            const tokensRef = doc(DB, dbPath)
            onSnapshot(tokensRef, tokensDB => {
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
            }, e => { console.error(e); sendError(e); })

        }
    } catch (e) {
        console.error(e); sendError(e);
    }

}

function getLastTimeEntered(ids, vnode) {
    try {


        const { groupId, questionId, subQuestionId, optionId, consequenceId } = ids;


        let path = concatentPath(groupId, questionId, subQuestionId, optionId, consequenceId);
        console.log('path', path)
        const regex = new RegExp('/', 'gi')
        path = path.replace(regex, '-')
       

        if (path.length > 10) {
            console.log('users', store.user.uid, 'chatLastEnterence', path)
            const docRef = doc(DB, 'users', store.user.uid, 'chatLastEnterence', path)

            getDoc(docRef)
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
    } catch (e) {
        console.error(e); sendError(e);
    }
}

module.exports = {
    getUser,
    listenToUserGroups,
    listenToRegisterdGroups,
    getQuestions,
    listenToGroupDetails,
    listenToGroupMembers,
    listenToGroup,
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
    listenToFeedLastEntrance,
    listenToSubscription,
    listenIfGetsMessages,
    getLastTimeEntered
};