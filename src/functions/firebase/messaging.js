import m from 'mithril';

import {
    DB
} from './config';

//model
import store from '../../data/store';
import {
    EntityModel
} from '../../data/dataTypes';

import { concatenateDBPath, setBrowserUniqueId } from '../general';
import { merge } from 'lodash';

let MESSAGING;

if ('Notification' in window) {

    // Retrieve Firebase Messaging object.
    MESSAGING = firebase.messaging();
    // Add the public key generated from the console here.
    MESSAGING.usePublicVapidKey(
        'BOXKnicJW5Cu3xwRG7buXf-JU8tS-AErJX_Ax7CsUwqZQvBvo2E-ECnE-uGvUKcgeL-1nT-cJw8qGo4dH-zrfGA'
    );

    // Callback fired if Instance ID token is updated.
    MESSAGING.onTokenRefresh(function () {
        handleTokenRefresh();
    });

    MESSAGING.onMessage(function (payload) {
        console.log('Message received. ', payload);
        // ...
    });
}

// update which enteties are subscribed
function getSubscriptions() {
    if ('Notification' in window) {
        try {
            DB.collection('tokens').doc(store.user.uid).onSnapshot(
                userTokenDB => {
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
    if ('Notification' in window) {
        try {
            // if(Object.prototype.toString().call() !== [Object ])
            MESSAGING.requestPermission()
                .then(() => {
                    console.log('Notification permission granted.');
                    handleTokenRefresh(ids, subscribe);
                })
                .catch(function (err) {
                    console.log('Unable to get permission to notify.', err);
                });
        } catch (err) {
            console.error(err);
        }
    }
}

function unsubscribeFromNotification(ids) {
    if ('Notification' in window) {
     
        // delete store.push[entity][entityId]

        // MESSAGING.getToken()
        //     .then((token) => {
        //         MESSAGING.deleteToken(token);
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
            return MESSAGING.getToken().then((token) => {
                const { groupId, questionId, subQuestionId, optionId } = ids;

                //get device unique id
                let deviceUniqueId = localStorage.getItem('deviceUniqueId');
                if (deviceUniqueId === null) {
                    deviceUniqueId = setBrowserUniqueId();
                }

                const dbPath = `${concatenateDBPath(groupId, questionId, subQuestionId, optionId)}/notifications/${store.user.uid}`;
                const tokenRef = DB.doc(dbPath);

                if(subscribe === true){
                let tokenObj = {}
                tokenObj[deviceUniqueId] = {
                    token,
                    uid: store.user.uid
                }
                tokenRef.set(tokenObj , { merge: true })
            } else {
                tokenRef.update({[deviceUniqueId]: firebase.firestore.FieldValue.delete()})
            }

                // tokenRef
                //     .get()
                //     .then((docDB) => {
                //         const tokenObj = {
                //             token,
                //             userId: store.user.uid
                //         };

                //         if (docDB.exists) {
                //             //if token exists

                //             if (typeof entityId == 'string') {
                //                 //if new entity subscribed, add it to pushentities array under token

                //                 let tokenSet = new Set(docDB.data().pushEntities);
                //                 tokenSet.add(entityId);
                //                 tokenObj.pushEntities = new Array(...tokenSet);
                //             }

                //             tokenRef.update(tokenObj);
                //         } else {
                //             if (typeof entityId == 'string') {
                //                 tokenObj.pushEntities = [entityId];
                //             }
                //             tokenRef.set(tokenObj);
                //         }
                //     })
                //     .then(() => {
                //         console.log('token saved to DB');
                //     })
                //     .catch((err) => {
                //         console.log(err);
                //     });
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