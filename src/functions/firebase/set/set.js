import m from 'mithril';
import { set, get, merge } from 'lodash';
import { DB } from '../config';
import store from '../../../data/store';
import { doc, addDoc, setDoc, collection, updateDoc, serverTimestamp } from "firebase/firestore";
import { concatenateDBPath, uniqueId, getRandomColor } from '../../general';
import { subscribeUser } from './setChats';
import { SUGGESTIONS, PARALLEL_OPTIONS } from '../../../data/evaluationTypes'


function createGroup(settings) {
    try {
        const { creatorId, title, description, callForAction, language, groupId } = settings;

        // const groupId = uniqueId()
        const groupRef = doc(DB, 'groups', groupId);

        setDoc(groupRef, {
            title,
            description,
            creatorId,
            time: new Date().getTime(),
            groupId,
            id: groupId,
            groupColor: getRandomColor(),
            callForAction,
            language,
            active: true
        }, { merge: true })
            .then(() => {

                const userSubscribeRef = doc(DB, 'users', store.user.uid, 'groupsOwned', groupId)

                setDoc(userSubscribeRef, { id: groupId, date: new Date().getTime() })
                    .then(() => { console.info(`added the group to the groups the user owns`) })
                    .catch(e => { console.error(e); sendError(e) });

                subscribeUser({ groupId, subscribe: false })
                m.route.set(`/group/${groupId}`);
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
                sendError(e)
            });
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function updateGroup(vnode) {
    try {

        const groupRef = doc(DB, 'groups', vnode.attrs.id);
        updateDoc(groupRef, { title: vnode.state.title, description: vnode.state.description, callForAction: vnode.state.callForAction || '' })
            .then(() => { m.route.set(`/group/${vnode.attrs.id}`) })
            .catch(err => { throw err })
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function registerGroup(groupId) {


    try {



        let isUserRgisterdToGroup = get(store.user, `.groupsUserTryToRegister[${groupId}]`, false);

        if (!isUserRgisterdToGroup) {
            // store.user.groupsUserTryToRegister[groupId] = true;
            set(store.user, `.groupsUserTryToRegister[${groupId}]`, true)

            const waitForUser = setInterval(() => {



                if ({}.hasOwnProperty.call(store.user, 'uid')) {

                    clearInterval(waitForUser);



                    if (!isUserRgisterdToGroup) {



                        store.groupsRegistered[groupId] = true;

                        const groupRef = doc(DB, 'users', store.user.uid, 'registerGroups', groupId);


                        setDoc(groupRef, { register: true })
                            .catch(e => { console.error(e); sendError(e) })

                        //store data from use as member in the group
                        const { displayName, email, uid, name, photoURL, phoneNumber, isAnonymous } = store.user;
                        const userObjTemp = { displayName, email, uid, name, photoURL, phoneNumber, isAnonymous }, userObj = {};


                        for (let prop in userObjTemp) {
                            if (userObjTemp[prop] !== null && userObjTemp[prop] !== undefined) {
                                userObj[prop] = userObjTemp[prop]
                            }
                        }

                        const memberRef = doc(DB, 'groups', groupId, 'members', store.user.uid)

                        setDoc(memberRef, userObj, { merge: true })
                            .catch(e => { console.error(e); sendError(e) })
                    } else {
                        console.info('user is already registered to', groupId)
                    }
                }

            }, 1000);
        }
    } catch (e) {
        console.error(e); sendError(e)

    }
}



function createSubQuestion(groupId, questionId, title, order) {
    try {
        return new Promise((resolve, reject) => {
            const subQuestionId = uniqueId();
            const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);

            setDoc(subQuestionRef, { title, order, creator: store.user.uid, orderBy: 'top', subQuestionId, id: subQuestionId, maxConfirms: 0 })
                .then(() => { resolve(subQuestionId) })
                .catch(function (error) {
                    console.error('Error adding document: ', error); sendError(e)
                    reject(undefined)
                });
        })
    } catch (e) {
        console.error(e); sendError(e);
        reject(undefined)
    }
}

function updateSubQuestion(groupId, questionId, subQuestionId, title) {
    const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);
    updateDoc(subQuestionRef, { title });
}

function updateSubQuestionProcess(groupId, questionId, subQuestionId, processType) {

    const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);
    updateDoc(subQuestionRef, { processType });

}
function updateSubQuestionOrderBy(groupId, questionId, subQuestionId, orderBy) {

    const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);
    updateDoc(subQuestionRef, { orderBy });
}

function setSubQuestion(ids, settings) {

    return new Promise((resolve, reject) => {
        try {

            const { title, processType, orderBy, userHaveNavigation, showSubQuestion, numberOfSubquestions, proAgainstType } = settings;
            let { cutoff } = settings;
            cutoff = parseInt(cutoff);

            if (!cutoff) cutoff = false;
            const { groupId, questionId, subQuestionId } = ids;
            const subQuestionsRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions');


            if (subQuestionId === undefined) {
                //new subQuestion
                const uid = uniqueId()
                const subQuestionRef = doc(subQuestionsRef, uid);
                setDoc(subQuestionRef, { title, processType, orderBy, groupId, questionId, subQuestionId: uid, userHaveNavigation, showSubQuestion, order: numberOfSubquestions, proAgainstType, creator: store.user.uid, cutoff })
                    .then(() => { console.info(`saved subQuestion ${uid} to DB`); resolve(uid) })
                    .catch(e => {
                        console.error(e); sendError(e)
                        reject(undefined)
                    })
            } else {
                const subQuestionRef = doc(subQuestionsRef, subQuestionId);
                updateDoc(subQuestionRef, { title, processType, orderBy, groupId, questionId, subQuestionId, userHaveNavigation, showSubQuestion, proAgainstType, cutoff })
                    .then(() => { console.info(`updated subQuestion ${subQuestionId} to DB`); resolve(subQuestionId) })
                    .catch(e => {
                        console.error(e); sendError(e);
                        reject(undefined);
                    })
            }
        } catch (e) {
            console.error(e); sendError(e);
            reject(undefined)
        }
    })




}

function deleteSubQuestion(groupId, questionId, subQuestionId) {
    try {

        const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);

        updateDoc(subQuestionRef, { showSubQuestion: 'deleted' })
            .then(() => { console.info('SubQuestion was deleted (and styed in db as subQuestion', subQuestionId, ')') })
            .catch(e => { console.error(e); sendError(e) })
    } catch (e) {
        console.error(e); sendError(e)
    }

}

function updateDoesUserHaveNavigation(groupId, questionId, subQuestionId, userHaveNavigation) {
    try {
        const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);

        updateDoc(subQuestionRef, { userHaveNavigation })
            .catch(e => {
                console.error(e); sendError(e)
            });
    } catch (e) {
        console.error(e); sendError(e)
    }

}

function updateSubQuestionsOrder(groupId, questionId, newOrderArray) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .update({
            subQuestions: {
                order: newOrderArray
            }
        })
        .then((something) => {
            console.info('writen succesufuly');
        })
        .catch(function (error) {
            console.error('Error adding document: ', error); sendError(e)
        });
}

function setSubQuestionsOrder(groupId, questionId, subQuestionId, order) {
    try {

        const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId);

        updateDoc(subQuestionRef, { order })
            .then(() => {
                console.info(`writen to ${subQuestionId} succesufuly`);
            })
            .catch(function (error) {
                console.error('Error adding document: ', error); sendError(e)
            });
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function createOption(groupId, questionId, subQuestionId, type, creatorId, title, description, creatorName, subQuestionTitle, isVote = false) {

    const optionId = uniqueId();
    try {

        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId);


        setDoc(optionRef, {
            groupId,
            questionId,
            subQuestionId,
            optionId,
            id: optionId,
            creatorId,
            type,
            title,
            description,
            creatorName,
            subQuestionTitle,
            time: serverTimestamp(),
            consensusPrecentage: 0,
            isActive: true,
            isVote
        }).catch(function (error) {
            console.error('Error adding document: ', error); sendError(e)
        });

        return optionId;
    } catch (e) {
        console.error(e); sendError(e);
        return false;
    }
}

function voteOption(ids, settings) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        const { addVote } = settings;


        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'votes', store.user.uid)


        const updateObj = {
            optionVoted: optionId,
            voter: {
                voterId: store.user.uid,
                name: store.user.name,
                photoURL: store.user.photoURL || ""
            }
        }


        if (addVote) {
            setDoc(optionRef, updateObj, { margin: true })
                .then(() => { console.info(`Option ${optionId} was voted for`) })
                .catch(e => {
                    // console.error(e); sendError(e)

                    let errRexExp = new RegExp('No document to update');
                    if (errRexExp.test(e.message)) {
                        optionRef.set(updateObj)
                            .then(() => { console.info(`A vote to option ${optionId} was added`) })
                            .catch(e => { console.error(e) })
                    } else {
                        console.error(e);

                    }
                })
        } else {
            deleteDoc(optionRef)
                .then(() => { console.info(`Option ${optionId} was deleted`) })
                .catch(e => { console.error(e); sendError(e) })
        }


    } catch (e) {
        console.error(e); sendError(e)
    }
}

function createConsequence(groupId, questionId, subQuestionId, optionId, creatorId, title, description, goodBad, creatorName) {
    try {

        const consequenceId = uniqueId();

        const consequenceRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'consequences', consequenceId);



        consequenceRef
        setDoc(consequenceRef, {
            groupId,
            questionId,
            subQuestionId,
            optionId,
            consequenceId,
            creatorId,
            title,
            description,
            creatorName,
            time: serverTimestamp(),
            consensusPrecentage: 0,
            isActive: true
        })
            .then(() => {

                voteConsequence({ groupId, questionId, subQuestionId, optionId, consequenceId }, 1, goodBad)

                console.info('consequence', consequenceId, 'was saved')
            })
            .catch(e => { console.error(e); sendError(e) })
    } catch (e) {
        console.error(e); sendError(e)
    }

}

function voteConsequence(ids, truthiness, evaluation) {
    try {

        const { groupId, questionId, subQuestionId, optionId, consequenceId } = ids;

        if (truthiness === undefined) throw new Error('No truthiness in voteConsequence', truthiness);
        if (evaluation === undefined) throw new Error('No evaluation in voteConsequence', evaluation);

        if (isNaN(truthiness)) throw new Error('truthiness is not a number', value);
        if (truthiness < 0 || truthiness > 1) throw new Error('truthiness is out of range (0 -->1):', truthiness);

        if (isNaN(evaluation)) throw new Error('evaluation is not a number', value);
        if (evaluation < -1 || evaluation > 1) throw new Error('evaluation is out of range (-1 --> 1):', evaluation);


        const userId = store.user.uid
        const userRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', questionId, 'options', optionId, 'consequences', consequenceId, 'voters', userId)

        setDoc(userRef, {
            truthiness,
            evaluation,
            userId,
            time: serverTimestamp()
        }, { merge: true })
            .then(() => { console.info('consequence', consequenceId, 'was voted') })
            .catch(e => { console.error(e); sendError(e) })
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function setOptionActive(groupId, questionId, subQuestionId, optionId, isActive) {

    try {
        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)
        updateDoc(optionRef, { isActive })
    } catch (err) {
        console.error(err)
    }

}

function updateOptionDescription(ids, description) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)

        updateDoc(optionRef, { description })
            .then(() => {
                console.info(`a description was updated on option ${optionId}`)
            })
            .catch(e => {
                console.error(e); sendError(e)
            })

    } catch (e) {
        console.error(e); sendError(e)
    }
}

function setEvaluation(groupId, questionId, subQuestionId, optionId, creatorId, evauluation, processType = SUGGESTIONS) {

    try {


        if (groupId === undefined || questionId === undefined || subQuestionId === undefined || optionId === undefined || creatorId === undefined) throw new Error("One of the Ids groupId, questionId, subQuestionId, optionId, creatorId is missing", groupId, questionId, subQuestionId, optionId, creatorId)




        if (processType === SUGGESTIONS) {
            const userLikeRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'likes', creatorId);

            setDoc(userLikeRef, { like: evauluation })
                .then(() => { console.log(`like: ${evauluation}`) })
                .catch(function (error) {
                    console.error('Error adding document: ', error);
                });
        } else if (processType === PARALLEL_OPTIONS) {
            const userLikeRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'confirms', creatorId);

            setDoc(userLikeRef, { confirm: evauluation })
                .catch(function (error) {
                    console.error('Error adding document: ', error);
                });
        }
    } catch (e) {
        console.error(e);
    }
}




function setMessage(groupId, questionId, subQuestionId, optionId, creatorId, creatorName, message, groupName, questionName, optionName) {

    const messagesRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId, 'messages')

    addDoc(messagesRef, {
        creatorId,
        creatorName,
        time: serverTimestamp(),
        timeSeconds: new Date().getTime(),
        message,
        type: 'messages',
        groupName,
        questionName,
        optionName
    })
        .then(() => {
            const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)

            updateDoc(optionRef, { lastMessage: serverTimestamp() })
                .catch(e => {
                    console.error(e); sendError(e)
                })
        })
        .catch((error) => {
            console.error('Error:', error); sendError(e)
        });
}

function createSubItem(subItemsType, groupId, questionId, creatorId, creatorName, title, description) {
    let subQuestionsRef = collection(DB, 'groups', groupId, 'questions', questionId);


    let addObj = {
        groupId,
        questionId,
        creatorId,
        title,
        description,
        author: creatorName,
        time: firebase
            .firestore
            .FieldValue
            .serverTimestamp(),
        consensusPrecentage: 0,
        roles: {},
        totalVotes: 0
    };
    addObj.roles[creatorId] = 'owner';


    addDoc(subQuestionsRef, addObj)
        .then((newItem) => { })
        .catch(function (error) {
            console.error('Error adding document: ', error); sendError(e)
        });
}

function updateSubItem(subItemsType, groupId, questionId, subQuestionId, title, description) {
    let subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, subItemsType, subQuestionId)

    let updateObj = {
        title,
        description,
        time: firebase
            .firestore
            .FieldValue
            .serverTimestamp()
    };


    updateDoc(subQuestionRef, updateObj)
        .then((newOption) => { })
        .catch(function (error) {
            console.error('Error updating document: ', error); sendError(e)
        });
}

function setLikeToSubItem(subItemsType, groupId, questionId, subQuestionId, creatorId, isUp) {


    const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, subItemsType, subQuestionId, 'likes', creatorId)


    if (isUp) {
        setDoc(subQuestionRef, { like: 1 });

    } else {
        setDoc(subQuestionRef, { like: 0 });

    }
}

function setSubAnswer(groupId, questionId, subQuestionId, creatorId, creatorName, message) {

    const subAnswersRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'subAnswers')

    addDoc(subAnswersRef, {
        groupId,
        questionId,
        subQuestionId,
        creatorId,
        author: creatorName,
        creatorId,
        time: serverTimestamp(),
        message
    })
        .then((newLike) => { })
        .catch(function (error) {
            console.error('Error adding document: ', error); sendError(e)
        });
}

//add a path ([collection1, doc1, collection2, doc2, etc])
function addToFeed(addRemove, pathArray, refString, collectionOrDoc) {
    const feedRef = doc(DB, 'users', store.user.uid, 'feeds', refString);

    if (addRemove == 'add') {


        setDoc(feedRef, {
            path: refString,
            time: new Date().getTime(),
            type: collectionOrDoc,
            refString
        }).then(() => {

            store.subscribed[refString] = true;
            console.dir(store.subscribed);
        }).catch((error) => {
            console.error('Error writing document: ', error); sendError(e)
        });
    } else {

        deleteDoc(feedRef)
            .then(() => {
                delete store.subscribed[refString];
            })
            .catch(function (error) {
                console.error('Error removing document: ', error); sendError(e)
            });
    }
}

function setToFeedLastEntrance() {
    try {

        const infoRef = doc(DB, 'users', store.user.uid, 'feedLastEntrence', 'info')

        setDoc(infoRef, { lastEntrance: new Date().getTime() })
            .catch(err => { console.error(err) });
    } catch (err) {
        console.error(err)
    }
}


function updateOption(vnode) {
    const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;
    try {
        let creatorName = vnode.state.isNamed
            ? vnode.state.creatorName
            : 'אנונימי/ת'

        const optionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId, 'options', optionId)

        updateDoc(optionRef, {
            creatorUid: store.user.uid,
            creatorName,
            title: vnode.state.title,
            description: vnode.state.description,

        }).catch(e => {
            console.error(e); sendError(e);
        })
    } catch (e) {
        console.error(e); sendError(e)
    }
}





function setNotifications(ids, isSubscribed) {

    try {

        const { groupId, questionId, subQuestionId, optionId } = ids;

        const path = `${concatenateDBPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;

        if (isSubscribed) {
            DB.doc(path).set({ username: store.user.name, email: store.user.email || null }).catch(e => { console.error(e); sendError(e) })
        } else {
            DB.doc(path).delete().catch(e => { console.error(e); sendError(e) })
        }
    } catch (e) {
        console.error(e); sendError(e)
    }


}


function setNumberOfMessagesMark(ids, numberOfMessages = 0) {

    try {
        const { optionId } = ids;
        if (optionId === undefined) throw new Error("option doesnt have optionId");

        const optionRef = doc(DB, 'users', store.user.uid, 'optionsRead', optionId)

        setDoc(optionRef, { numberOfMessages })
            .catch(e => { console.error(e); sendError(e) })

    } catch (e) {
        console.error(e); sendError(e)
    }
}



function dontShowPopAgain() {
    try {
        const userRef = doc(DB, 'users', store.user.uid)

        updateDoc(userRef, { stopRegistrationMessages: true })
            .then(() => console.info('user will not recive pop messages again'))
            .catch(e => { console.error(e); sendError(e); })
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function markUserSeenSuggestionsWizard() {
    try {
        const userRef = doc(DB, 'users', store.user.uid)
        updateDoc(userRef, { firstTimeOnSuggestions: false })
            .then(() => { console.info('user seen wizared') })
            .catch(e => { console.error(e); sendError(e) })
    } catch (e) {
        console.error(e); sendError(e)
    }
}



function handleSubscription(vnode) {

    try {

        //path for subscription object
        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;

        const path = concatenateDBPath(groupId, questionId, subQuestionId, optionId);

        subscribeUser({
            groupId, questionId, subQuestionId, optionId, subscribe: vnode.state.subscribed
        })

        if (vnode.state.subscribed == false) {

            vnode.state.subscribed = true;
            set(store.subscribe, `[${path}]`, true)
        } else {

            vnode.state.subscribed = false;
            set(store.subscribe, `[${path}]`, false)
        }
    } catch (e) {
        console.error(e); sendError(e)
    }
}

function sendError(e) {
    try {

        const errorsRef = collection(DB, 'errors');
        if ('uid' in store.user) {
            addDoc(errorsRef, {
                message: e.message,
                user: store.user,
                date: serverTimestamp()
            })
                .catch(e => {
                    console.error(e);
                })
        }
    } catch (e) {
        console.error(e);
    }
}


module.exports = {
    updateOption,
    addToFeed,
    createGroup,
    updateGroup,
    registerGroup,
    createSubQuestion,
    updateSubQuestion,
    setSubQuestion,
    deleteSubQuestion,
    setSubQuestionsOrder,
    createOption,
    voteOption,
    updateOptionDescription,
    createConsequence,
    voteConsequence,
    setOptionActive,
    createSubItem,
    updateSubItem,
    setLikeToSubItem,
    setEvaluation,
    setMessage,
    setSubAnswer,
    updateSubQuestionProcess,
    updateSubQuestionOrderBy,
    updateDoesUserHaveNavigation,
    setToFeedLastEntrance,
    setNotifications,
    setNumberOfMessagesMark,
    dontShowPopAgain,
    markUserSeenSuggestionsWizard,
    handleSubscription,
    sendError
};