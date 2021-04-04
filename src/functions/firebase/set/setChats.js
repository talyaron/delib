import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";

import {createIds,concatenateDBPath,generateChatEntitiyId} from '../../general'

export function sendMessage({ groupId, questionId, subQuestionId, optionId, message, title, entity, topic, url, vnode, group }) {
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

        if(!group) group = {};

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
                group,
                createdTime: firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()
            })
                .then(() => { console.info('message saved correctly') })
                .catch(err => {
                    console.error(err)
                })
        }


    } catch (err) {
        console.error(err)
    }
}

export function setZeroChatCounter(){
    try{
        DB
        .collection('users').doc(store.user.uid)
        .collection('messagesCounter').doc('counter')
        .set({messages:0})
        .catch(e=>{
            console.error(e)
        })
    }catch(e){
        console.error(e)
    }
}

export function zeroChatFeedMessages(ids, isSubscribed = true) {
    try {
        if (isSubscribed) {
            if (ids === undefined) throw new Error('No ids were in the message')

            const path = generateChatEntitiyId(ids)

            DB.collection('users').doc(store.user.uid).collection('messages').doc(path).set({ msgDifference: 0 }, { merge: true }).catch(e => console.error(e))
        }
    } catch (e) {
        console.error(e)
    }
}



export function subscribeUser(settings) {
    try {

        const { groupId, questionId, subQuestionId, optionId, subscribe } = settings;
        console.log(settings)

        //build path for the enenties subscription collection
        const subscriptionPath = concatenateDBPath(groupId, questionId, subQuestionId, optionId);
        let chatEntityId = generateChatEntitiyId({ groupId, questionId, subQuestionId, optionId });


        const { uid, displayName, email, photoURL } = store.user;

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
                        .collection('messages').doc(chatEntityId).set({  //add initial counter
                            msgNumber: 0,
                            msgLastSeen: 0,
                            msgDifference: 0
                        })
                        .then(() => { console.log('user subscribed in messages') })
                        .catch(e => {
                            console.error(e)
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
                        .collection('messages').doc(chatEntityId).delete().then(() => {
                            console.info('User unsubscribed succsefuly from entity')
                        })
                        .then(() => { console.log('user unsubscribed in messages') })
                        .catch(e => {
                            console.error(e)
                        })

                })
                .catch(err => console.error(err))
        }

    } catch (err) {
        console.error(err)
    }

}

export function setChatLastEntrance(ids) {
    try {
        const { groupId, questionId, subQuestionId, optionId, consequenceId } = ids;


        let path = concatenateDBPath(groupId, questionId, subQuestionId, optionId, consequenceId);
        const regex = new RegExp('/', 'gi')
        path = path.replace(regex, '-')

        if (path !== '-groups') {
            DB.collection(`users`).doc(store.user.uid).collection('chatLastEnterence').doc(path)
                .set({ lastTime: firebase.firestore.FieldValue.serverTimestamp() })
                .catch(e => { console.error(e) })
        } else {
            throw new Error('couldnt find path to spesific chat (groupId, questionId, subQuestionId, optionId, consequenceId)', groupId, questionId, subQuestionId, optionId, consequenceId)
        }
    } catch (e) {
        console.error(e)
    }

}
