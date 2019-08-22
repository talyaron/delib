import DB from './config';
import store from '../../data/store';

// Retrieve Firebase Messaging object.
const MESSAGING = firebase.messaging();

// Add the public key generated from the console here.
MESSAGING.usePublicVapidKey("BOXKnicJW5Cu3xwRG7buXf-JU8tS-AErJX_Ax7CsUwqZQvBvo2E-ECnE-uGvUKcgeL-1nT-cJw8qGo4dH-zrfGA");


exports.subscribeToNotification = (entityObj, entityId) => {
    try {
        
        MESSAGING.requestPermission()
            .then(function () {
                console.log('Notification permission granted.');
                handleTokenRefresh()
                
            })

            .catch(function (err) {
                console.log('Unable to get permission to notify.', err);
            });
    } catch (err) {
        console.error(err)
    }
}

exports.unsubscribeFromNotification = (entity, entityId) => {
    console.log('unsubscribeFromNotification')
    // delete store.push[entity][entityId]
    console.dir(store)
    delete store.push[entity][entityId];

    MESSAGING.getToken()
        .then(token => {
            MESSAGING.deleteToken(token)
        })
        .then(() => {
            DB.collection('tokens')
                .where('userId', '==', store.user.uid)
                .get()
                .then(tokensDB => {
                    tokensDB.forEach(tokenDB => {
                        tokenDB.delete();
                       
                    })
                })
                

        })
}

// Callback fired if Instance ID token is updated.
MESSAGING.onTokenRefresh(function () {
    handleTokenRefresh();
});

MESSAGING.onMessage(function (payload) {
    console.log('Message received. ', payload);
    // ...
});

function handleTokenRefresh() {
    return MESSAGING.getToken().then(token => {
        console.log(token);
       
        DB.collection("tokens").add({
            token,
            userId: store.user.uid
        }).then(() => {
            console.log('token saved to DB')

        }).catch(err => {
            console.log(err);
        })
    })
}
