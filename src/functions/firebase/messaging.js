import m from 'mithril';
import { getMessaging, getToken } from "firebase/messaging";
import { doc, onSnapshot } from "firebase/firestore";

const messaging = getMessaging();



import {
    DB
} from './config';

//model
import store from '../../data/store';
import {
    EntityModel
} from '../../data/dataTypes';

import { concatenateDBPath, setBrowserUniqueId } from '../general';
import { usePublicVapidKey } from '../firebase/configKey'






if ('Notification' in window) {

    // Retrieve Firebase Messaging object.


    // Add the public key generated from the console here.
    getToken(messaging, { vapidKey: 'BOXKnicJW5Cu3xwRG7buXf-JU8tS-AErJX_Ax7CsUwqZQvBvo2E-ECnE-uGvUKcgeL-1nT-cJw8qGo4dH-zrfGA' })
        .then(currentToken => {
            console.log(currentToken)
        });

    // Callback fired if Instance ID token is updated.

    // messaging.onTokenRefresh(function () {
    //     handleTokenRefresh();
    // });

    // messaging.onMessage(function (payload) {

    // });


}


// update which enteties are subscribed
function getSubscriptions() {
    if ('Notification' in window) {
        try {
            const qunsub = onSnapshot(doc(DB, 'tokens', store.user.uid), userTokenDB=>{

           
                    if (userTokenDB.exists && userTokenDB.data().pushEntities) {
                        store.push = userTokenDB.data().pushEntities;

                        m.redraw();
                    }
                }, err => {
                    console.error('On getSubscriptions:', err.name, err.message)
                })
        } catch (err) {
            if (err.message === 'Missing or insufficient permissions.') {
                console.error('Cant get subscriptions because of insufficient perpmissions')
            } else {
                console.error(err)
            }
        }
    }
}

function subscribeToNotification(ids, subscribe = true) {
    try {
        if ('Notification' in window) {


            // messaging.requestPermission()
            //     .then(() => {
            //         console.info('Notification permission granted.');
            //         handleTokenRefresh(ids, subscribe);
            //     })
            //     .catch(function (err) {
            //         console.info('Unable to get permission to notify.', err);
            //     });

        }
    } catch (e) {
        console.error(e)
    }
}

function unsubscribeFromNotification(ids) {
    if ('Notification' in window) {

        // delete store.push[entity][entityId]

        // messaging.getToken()
        //     .then((token) => {
        //         messaging.deleteToken(token);
        //     })
        //     .then(() => {
        //         DB.collection('tokens').doc(store.user.uid).get().then((userTokenDB) => {
        //             if (userTokenDB.exists && userTokenDB.data().pushEntities) {
        //                 let entitiesSet = new Set(userTokenDB.data().pushEntities);
        //                 entitiesSet.delete(entityId);
        //                 console.dir(entitiesSet);
        //                 let entitiesArray = new Array(...entitiesSet);

        //                 DB.collection('tokens').doc(store.user.uid).update({
        //                     pushEntities: entitiesArray
        //                 });
        //             }
        //         });
        //     });
    }
}

function handleTokenRefresh(ids, subscribe) {
    try {
        if ('Notification' in window) {
            return messaging.getToken().then((token) => {
                const { groupId, questionId, subQuestionId, optionId } = ids;
                console.log('handleTokenRefresh', groupId, questionId, subQuestionId, optionId)

                //get device unique id
                let deviceUniqueId = localStorage.getItem('deviceUniqueId');
                if (deviceUniqueId === null) {
                    deviceUniqueId = setBrowserUniqueId();
                }

                const dbPath = `${concatenateDBPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;
                console.log(dbPath)
                const tokenRef = DB.doc(dbPath);

                if (subscribe === true) {
                    let tokenObj = {}
                    tokenObj[deviceUniqueId] = {
                        token,
                        uid: store.user.uid
                    }
                    tokenRef.set(tokenObj, { merge: true })
                } else {
                    tokenRef.update({ [deviceUniqueId]: firebase.firestore.FieldValue.delete() })
                }


            });
        }
    } catch (e) {
        console.error(e)
    }
}

module.exports = {
    getSubscriptions,
    subscribeToNotification,
    unsubscribeFromNotification
}