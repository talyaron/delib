import m from 'mithril';
import { DB } from '../config';
import store from '../../../data/store';
import { Reference, concatenateDBPath, uniqueId, generateChatEntitiyId, createIds,getRandomColor } from '../../general';
import { merge } from 'lodash';

function createGroup(creatorId, title, description) {
    try {
        const groupId = uniqueId()

        DB
            .collection('groups')
            .doc(groupId)
            .set({
                title: title,
                description: description,
                creatorId: creatorId,
                time: new Date().getTime(),
                groupId,
                id: groupId,
                groupColor:getRandomColor()
            })
            .then(() => {
                console.log(groupId)
                DB
                    .collection("users")
                    .doc(store.user.uid)
                    .collection("groupsOwned")
                    .doc(groupId).set({ id: groupId, date: new Date().getTime() })
                    .then(() => { console.info(`added the group to the groups the user owns`) })
                    .catch(e => { console.error(e) })
                m.route.set(`/group/${groupId}`);
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });
    } catch (e) {
        console.error(e)
    }
}

function updateGroup(vnode) {
    DB
        .collection('groups')
        .doc(vnode.attrs.id)
        .update({ title: vnode.state.title, description: vnode.state.description })
        .then(doc => {
            m
                .route
                .set(`/group/${vnode.attrs.id}`);
        })
        .catch(err => {
            console.error(err)
        })
}

function createQuestion(groupId, creatorId, title, description) {
    const questionId = uniqueId();
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .set({
            title,
            description,
            time: new Date().getTime(),
            creatorId,
            questionId,
            id: questionId
        })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

function updateQuestion(groupId, questionId, title, description, authorizationObj) {
    try {
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .update({ title, description, authorization: authorizationObj })
            .then((something) => {
                console.log('writen succesufuly');
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });
    } catch (e) {
        console.error(e)
    }
}

function createSubQuestion(groupId, questionId, title, order) {

    const subQuestionId = uniqueId()

    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .set({ title, order, creator: store.user.uid, orderBy: 'top', subQuestionId, id: subQuestionId })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

function updateSubQuestion(groupId, questionId, subQuestionId, title) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .update({ title });
}

function updateSubQuestionProcess(groupId, questionId, subQuestionId, processType) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .update({ processType });
}

function updateSubQuestionOrderBy(groupId, questionId, subQuestionId, orderBy) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .update({ orderBy });
}

function setSubQuestion(ids, settings) {
    try {
        const { title, processType, orderBy, userHaveNavigation, showSubQuestion, numberOfSubquestions } = settings;
        const { groupId, questionId, subQuestionId } = ids;


        const subQuestionRef = DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')



        if (subQuestionId === undefined) {
            //new subQuestion
            const uid = uniqueId()
            console.log('uid', uid)
            subQuestionRef.doc(uid).set({ title, processType, orderBy, groupId, questionId, subQuestionId: uid, userHaveNavigation, showSubQuestion, order: numberOfSubquestions, creator: store.user.uid })
                .then(() => { `saved subQuestion ${uid} to DB` })
                .catch(e => {
                    console.error(e)
                })
        } else {
            subQuestionRef.doc(subQuestionId).update({ title, processType, orderBy, groupId, questionId, subQuestionId, userHaveNavigation, showSubQuestion })
                .then(() => { `updated subQuestion ${subQuestionId} to DB` })
                .catch(e => {
                    console.error(e)
                })
        }
    } catch (e) {
        console.error(e)
    }



}

function deleteSubQuestion(groupId, questionId, subQuestionId) {
    try {
        DB.collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ showSubQuestion: 'deleted' })
            .then(() => { console.info('SubQuestion was deleted (and styed in db as subQuestion', subQuestionId, ')') })
            .catch(e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }

}

function updateDoesUserHaveNavigation(groupId, questionId, subQuestionId, userHaveNavigation) {
    try {
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ userHaveNavigation })
            .catch(e => {
                console.error(e)
            });
    } catch (e) {
        console.error(e)
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
            console.log('writen succesufuly');
        })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

function setSubQuestionsOrder(groupId, questionId, subQuestionId, order) {
    try {
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ order })
            .then((something) => {
                console.log(`writen to ${subQuestionId} succesufuly`);
            })
            .catch(function (error) {
                console.error('Error adding document: ', error);
            });
    } catch (e) {
        console.error(e)
    }
}

function createOption(groupId, questionId, subQuestionId, type, creatorId, title, description, creatorName, subQuestionTitle) {

    const optionId = uniqueId();

    let optionRef = DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .collection('options');

    optionRef.doc(optionId).set({
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
        time: firebase
            .firestore
            .FieldValue
            .serverTimestamp(),
        consensusPrecentage: 0,
        isActive: true
    }).catch(function (error) {
        console.error('Error adding document: ', error);
    });
}

function createConsequence(groupId, questionId, subQuestionId, optionId, creatorId, title, description, goodBad, creatorName) {
    try {

        const consequenceId = uniqueId();

      const consequenceRef = DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .collection('options')
            .doc(optionId)
            .collection('consequences')
            .doc(consequenceId);

            consequenceRef
            .set({
                groupId,
                questionId,
                subQuestionId,
                optionId,
                consequenceId,
                creatorId,
                title,
                description,
                creatorName,
                time: firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp(),
                consensusPrecentage: 0,
                isActive: true
            })
            .then(() => {
                
                voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId,1,goodBad)
                
                console.info('consequence', consequenceId, 'was saved') })
            .catch(e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }

}

function voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId, truthiness, evaluation) {
    try {

        if(truthiness === undefined) throw new Error('No truthiness in voteConsequence', truthiness);
        if(evaluation === undefined) throw new Error('No evaluation in voteConsequence', evaluation)

        const userId = store.user.uid
        

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
            .doc(consequenceId)
            .collection('voters')
            .doc(userId)
            .set({
                truthiness,
                evaluation,
                userId,
                time: firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()
            }, {merge:true})
            .then(() => { console.info('consequence', consequenceId, 'was voted') })
            .catch(e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }
}

function setOptionActive(groupId, questionId, subQuestionId, optionId, isActive) {

    console.log(groupId, questionId, subQuestionId, optionId, isActive)

    try {
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .collection('options')
            .doc(optionId)
            .update({ isActive })
    } catch (err) {
        console.error(err)
    }

}

function updateOptionDescription(ids, description){
    try{
        const {groupId, questionId, subQuestionId, optionId} = ids;

        DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .collection('options')
        .doc(optionId)
        .update({description})
        .then(()=>{
            console.info(`a description was updated on option ${optionId}`)
        })
        .catch(e=>{
            console.error(e)
        })

    }catch(e){
        console.error(e)
    }
}

function setLike(groupId, questionId, subQuestionId, optionId, creatorId, like) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .collection('options')
        .doc(optionId)
        .collection('likes')
        .doc(creatorId)
        .set({ like })
        .then((newLike) => { })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

function sendMessage({ groupId, questionId, subQuestionId, optionId, message, title, entity, topic, url, vnode }) {
    try {

        if (vnode.attrs.title === undefined) throw new Error(`No title of entity in vnode`)

        let { displayName, photoURL, name, uid, userColor } = store.user;

        if (!userColor) { userColor = 'teal' }

        let ref = 'groups', location = {}
        if (groupId != undefined) {
            ref += `/${groupId}`;
            location.groupId = groupId
        } else {
            throw 'No groupId was provdided'
        }
        if (questionId != undefined) {
            ref += `/questions/${questionId}`
            location.questionId = questionId
        }
        if (subQuestionId != undefined) {
            ref += `/subQuestions/${subQuestionId}`;
            location.subQuestionId = subQuestionId;
        }
        if (optionId != undefined) {
            ref += `/options/${optionId}`;
            location.optionId = optionId;
        }


        let ids = { groupId, questionId, subQuestionId, optionId }
        ids = createIds(ids)


        if (message) {

            DB.doc(ref).collection('messages').add({
                entityTitle: vnode.attrs.title,
                location,
                displayName,
                photoURL,
                name,
                uid,
                message,
                title,
                entity,
                topic,
                url,
                ids,
                userColor,
                createdTime: firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()
            })
                .then(() => { console.log('saved correctly') })
                .catch(err => {
                    console.error(err)
                })
        }


    } catch (err) {
        console.error(err)
    }
}


function setMessage(groupId, questionId, subQuestionId, optionId, creatorId, creatorName, message, groupName, questionName, optionName) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .collection('options')
        .doc(optionId)
        .collection('messages')
        .add({
            creatorId,
            creatorName,
            time: firebase
                .firestore
                .FieldValue
                .serverTimestamp(),
            timeSeconds: new Date().getTime(),
            message,
            type: 'messages',
            groupName,
            questionName,
            optionName
        })
        .then((messageDB) => {
            DB
                .collection('groups')
                .doc(groupId)
                .collection('questions')
                .doc(questionId)
                .collection('subQuestions')
                .doc(subQuestionId)
                .collection('options')
                .doc(optionId)
                .update({
                    lastMessage: firebase
                        .firestore
                        .FieldValue
                        .serverTimestamp()
                })
                .then((doc) => {
                    console.log('updated last message');
                });
        })
        .catch((error) => {
            console.log('Error:', error);
        });
}

function createSubItem(subItemsType, groupId, questionId, creatorId, creatorName, title, description) {
    let subQuestionRef = DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection(subItemsType);

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

    subQuestionRef
        .add(addObj)
        .then((newItem) => { })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

function updateSubItem(subItemsType, groupId, questionId, subQuestionId, title, description) {
    let subQuestionRef = DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection(subItemsType)
        .doc(subQuestionId);

    let updateObj = {
        title,
        description,
        time: firebase
            .firestore
            .FieldValue
            .serverTimestamp()
    };

    subQuestionRef
        .update(updateObj)
        .then((newOption) => { })
        .catch(function (error) {
            console.error('Error updating document: ', error);
        });
}

function setLikeToSubItem(subItemsType, groupId, questionId, subQuestionId, creatorId, isUp) {
    let subQuestionRef = DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection(subItemsType)
        .doc(subQuestionId)
        .collection('likes')
        .doc(creatorId);

    if (isUp) {
        subQuestionRef.set({ like: 1 });
        console.log('set like to ', subQuestionId);
    } else {
        subQuestionRef.set({ like: 0 });
        console.log('unset like to ', subQuestionId);
    }
}

function setSubAnswer(groupId, questionId, subQuestionId, creatorId, creatorName, message) {
    DB
        .collection('groups')
        .doc(groupId)
        .collection('questions')
        .doc(questionId)
        .collection('subQuestions')
        .doc(subQuestionId)
        .collection('subAnswers')
        .add({
            groupId,
            questionId,
            subQuestionId,
            creatorId,
            author: creatorName,
            creatorId,
            time: firebase
                .firestore
                .FieldValue
                .serverTimestamp(),
            message
        })
        .then((newLike) => { })
        .catch(function (error) {
            console.error('Error adding document: ', error);
        });
}

//add a path ([collection1, doc1, collection2, doc2, etc])
function addToFeed(addRemove, pathArray, refString, collectionOrDoc) {
    if (addRemove == 'add') {
        DB
            .collection('users')
            .doc(store.user.uid)
            .collection('feeds')
            .doc(refString)
            .set({
                path: refString,
                time: new Date().getTime(),
                type: collectionOrDoc,
                refString
            })
            .then(() => {
                console.log('added entety to DB', refString);
                store.subscribed[refString] = true;
                console.dir(store.subscribed);
            })
            .catch((error) => {
                console.error('Error writing document: ', error);
            });
    } else {
        DB
            .collection('users')
            .doc(store.user.uid)
            .collection('feeds')
            .doc(refString)
            .delete()
            .then(function () {
                delete store.subscribed[refString];
            })
            .catch(function (error) {
                console.error('Error removing document: ', error);
            });
    }
}

function setToFeedLastEntrance() {
    try {
        DB.collection('users').doc(store.user.uid).collection('feedLastEntrence').doc('info')
            .set({ lastEntrance: new Date().getTime() })
            .catch(err => { console.error(err) });
    } catch (err) {
        console.error(err)
    }
}


function updateOption(vnode) {
    let creatorName = vnode.state.isNamed
        ? vnode.state.creatorName
        : 'אנונימי/ת'
    DB
        .collection('groups')
        .doc(vnode.attrs.groupId)
        .collection('questions')
        .doc(vnode.attrs.questionId)
        .collection('subQuestions')
        .doc(vnode.attrs.subQuestionId)
        .collection('options')
        .doc(vnode.attrs.optionId)
        .update({
            creatorUid: store.user.uid,
            creatorName,
            title: vnode.state.title,
            description: vnode.state.description,
            more: {
                text: vnode.state.more.text || '',
                URL: vnode.state.more.URL || ''
            }
        });
}
function subscribeUser(settings) {
    try {
        const { groupId, questionId, subQuestionId, optionId, title, entityType } = settings.vnode.attrs;
        const { subscribe } = settings;

        // console.log(groupId, questionId, subQuestionId, optionId, subscribe);



        // DB.doc(`groups/${groupId}`).get().then(groupDB=>{console.log(groupDB.data())}
        // ) build path for the enenties subscription collection
        const subscriptionPath = concatenateDBPath(groupId, questionId, subQuestionId, optionId);
        let chatEntityId = generateChatEntitiyId({ groupId, questionId, subQuestionId, optionId });

        console.log(subscriptionPath)
        console.log(chatEntityId)
        console.log('is subscribed:', subscribe)

        const { uid, displayName, email, photoURL } = store.user


        if (subscribe === false) {
            //if user is not subscribed then subscribe the user

            DB
                .doc(subscriptionPath)
                .collection('subscribers')
                .doc(uid)
                .set({ user: { uid, displayName, email, photoURL } }) //add the user to subscribers
                .then(() => {
                    console.info('User subscribed succsefuly to entity');
                    DB.collection('users').doc(uid)
                        .collection('chat').doc(chatEntityId).set({  //add initial counter
                            msgNumber: 0,
                            msgLastSeen: 0,
                            msgDifference: 0
                        }).catch(e => {
                            console.error('Error in saving new chat following on the user', e)
                        })
                })
                .catch(err => console.error(err))
        } else {
            DB
                .doc(subscriptionPath)
                .collection('subscribers')
                .doc(uid)
                .delete()
                .then(() => {
                    DB.collection('users').doc(uid)
                        .collection('chat').doc(chatEntityId).delete().then(() => {
                            console.info('User unsubscribed succsefuly from entity')
                        }).catch(e => {
                            console.error(e)
                        })

                })
                .catch(err => console.error(err))
        }

    } catch (err) {
        console.error(err)
    }

}

function zeroChatFeedMessages(ids, isSubscribed = true) {
    try {
        if (isSubscribed) {
            if (ids === undefined) throw new Error('No ids were in the message')

            const path = generateChatEntitiyId(ids)

            DB.collection('users').doc(store.user.uid).collection('chat').doc(path).update({ msgDifference: 0 }).catch(e => console.error(e))
        }
    } catch (e) {
        console.error(e)
    }
}

function setNotifications(ids, isSubscribed) {

    try {

        const { groupId, questionId, subQuestionId, optionId } = ids;

        const path = `${concatenateDBPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;

        if (isSubscribed) {
            DB.doc(path).set({ username: store.user.name, email: store.user.email || null }).catch(e => { console.error(e) })
        } else {
            DB.doc(path).delete().catch(e => { console.error(e) })
        }
    } catch (e) {
        console.error(e)
    }


}

module.exports = {
    updateOption,
    addToFeed,
    createGroup,
    updateGroup,
    createQuestion,
    updateQuestion,
    createSubQuestion,
    updateSubQuestion,
    setSubQuestion,
    deleteSubQuestion,
    setSubQuestionsOrder,
    createOption,
    updateOptionDescription,
    createConsequence,
    voteConsequence,
    setOptionActive,
    createSubItem,
    updateSubItem,
    setLikeToSubItem,
    setLike,
    sendMessage,
    setMessage,
    setSubAnswer,
    updateSubQuestionProcess,
    updateSubQuestionOrderBy,
    updateDoesUserHaveNavigation,
    subscribeUser,
    setToFeedLastEntrance,
    zeroChatFeedMessages,
    setNotifications
};