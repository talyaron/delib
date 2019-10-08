import m from 'mithril';

import DB from './config';

//model
import store from '../../data/store';
import { EntityModel } from '../../data/dataTypes';

if ('Notification' in window) {

	// Retrieve Firebase Messaging object.
	const MESSAGING = firebase.messaging();
	// Add the public key generated from the console here.
	MESSAGING.usePublicVapidKey(
		'BOXKnicJW5Cu3xwRG7buXf-JU8tS-AErJX_Ax7CsUwqZQvBvo2E-ECnE-uGvUKcgeL-1nT-cJw8qGo4dH-zrfGA'
	);

	// Callback fired if Instance ID token is updated.
	MESSAGING.onTokenRefresh(function() {
		handleTokenRefresh();
	});

	MESSAGING.onMessage(function(payload) {
		console.log('Message received. ', payload);
		// ...
	});
} 

// update which enteties are subscribed
function getSubscriptions() {
    if ('Notification' in window) {
        DB.collection('tokens').doc(store.user.uid).onSnapshot((userTokenDB) => {
            if (userTokenDB.exists && userTokenDB.data().pushEntities) {
                store.push = userTokenDB.data().pushEntities;
                console.dir(store.push);
                m.redraw();
            }
        });
    }
}

function subscribeToNotification(entityId) {
    if ('Notification' in window) {
        try {
            // if(Object.prototype.toString().call() !== [Object ])
            MESSAGING.requestPermission()
                .then(function () {
                    console.log('Notification permission granted.');
                    handleTokenRefresh(entityId);
                })
                .catch(function (err) {
                    console.log('Unable to get permission to notify.', err);
                });
        } catch (err) {
            console.error(err);
        }
    }
}

function unsubscribeFromNotification(entityId) {
    if ('Notification' in window) {
        console.log('unsubscribeFromNotification', entityId);
        // delete store.push[entity][entityId]

        MESSAGING.getToken()
            .then((token) => {
                MESSAGING.deleteToken(token);
            })
            .then(() => {
                DB.collection('tokens').doc(store.user.uid).get().then((userTokenDB) => {
                    if (userTokenDB.exists && userTokenDB.data().pushEntities) {
                        let entitiesSet = new Set(userTokenDB.data().pushEntities);
                        entitiesSet.delete(entityId);
                        console.dir(entitiesSet);
                        let entitiesArray = new Array(...entitiesSet);

                        DB.collection('tokens').doc(store.user.uid).update({ pushEntities: entitiesArray });
                    }
                });
            });
    }
}

function handleTokenRefresh(entityId) {
    if ('Notification' in window) {
        return MESSAGING.getToken().then((token) => {
            const tokenRef = DB.collection('tokens').doc(store.user.uid);

            tokenRef
                .get()
                .then((docDB) => {
                    const tokenObj = {
                        token,
                        userId: store.user.uid
                    };

                    if (docDB.exists) {
                        //if token exists

                        if (typeof entityId == 'string') {
                            //if new entity subscribed, add it to pushentities array under token

                            let tokenSet = new Set(docDB.data().pushEntities);
                            tokenSet.add(entityId);
                            tokenObj.pushEntities = new Array(...tokenSet);
                        }

                        tokenRef.update(tokenObj);
                    } else {
                        if (typeof entityId == 'string') {
                            tokenObj.pushEntities = [entityId];
                        }
                        tokenRef.set(tokenObj);
                    }
                })
                .then(() => {
                    console.log('token saved to DB');
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }
}

module.exports = { getSubscriptions, subscribeToNotification, unsubscribeFromNotification };
