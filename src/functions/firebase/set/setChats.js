import m from "mithril";
import { doc, addDoc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit, updateDoc, serverTimestamp } from "firebase/firestore";
import { DB } from "../config";
import store from "../../../data/store";

import { createIds, concatenateDBPath, generateChatEntitiyId } from '../../general'

export function sendMessage({ groupId, questionId, subQuestionId, optionId, message, title, entity, topic, url, vnode, group, toDelete, messageId }) {
    try {
        if (toDelete == undefined) {
            if (vnode.attrs.title === undefined) throw new Error(`No title of entity in vnode`);
        }





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

        if (!group) group = {};

        if (message) {

            let { displayName, photoURL, name, uid, userColor } = store.user;
            if (!userColor) { userColor = 'teal' }
           
            const messagesRef = collection(DB, ref + '/messages');

            addDoc(messagesRef, {
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
                createdTime:serverTimestamp()
            })

        }
        
        if (toDelete && messageId) {
            const messageRef = doc(DB, ref + '/messages/' + messageId);

            deleteDoc(messageRef)
                .then(() => { console.info('message deleted') })
                .catch(err => {
                    console.error(err)
                })
        }


    } catch (err) {
        console.error(err)
    }
}

export function setZeroChatCounter() {
    try {
        const messageRef = doc(DB, 'users', store.user.uid, 'messagesCounter', 'counter')

        setDoc(messageRef, { messages: 0 })
            .catch(e => {
                console.error(e)
            })
    } catch (e) {
        console.error(e)
    }
}

export function zeroChatFeedMessages(ids, isSubscribed = true) {
    try {
        if (isSubscribed) {
            if (ids === undefined) throw new Error('No ids were in the message')

            const path = generateChatEntitiyId(ids)
            const chatFeedMessagesRef = doc('users', store.user.uid, 'messages', path);

            setDoc(chatFeedMessagesRef, { msgDifference: 0 }, { merge: true }).catch(e => console.error(e))
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

        const subscriberRef = doc(DB, `${subscriptionPath}/subscribers/${uid}`);
        const chatRef = doc(DB, 'users',uid,'messages',chatEntityId);

        if (subscribe === false) {
            //if user is not subscribed then subscribe the user



            setDoc(subscriberRef, { user: { uid, displayName, email, photoURL } }) //add the user to subscribers
                .then(() => {
                    console.info('User subscribed succsefuly to entity');
                    
                    

                    setDoc(chatRef, {  //add initial counter
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

            deleteDoc(subscriberRef)
                .then(() => {
                    deleteDoc(chatRef).then(() => {
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
            const lastEntrenceRef = doc(DB, 'users', store.user.uid, 'chatLastEnterence', path)

            setDoc(lastEntrenceRef, { lastTime: firebase.firestore.FieldValue.serverTimestamp() })
                .catch(e => { console.error(e) })
        } else {
            throw new Error('couldnt find path to spesific chat (groupId, questionId, subQuestionId, optionId, consequenceId)', groupId, questionId, subQuestionId, optionId, consequenceId)
        }
    } catch (e) {
        console.error(e)
    }

}
