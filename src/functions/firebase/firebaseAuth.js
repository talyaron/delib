import store from '../../data/store';
import m from 'mithril';
import DB from '../firebase/config';

//functions
import { listenToFeeds } from '../firebase/get/get';
import { getRandomName } from '../general';
import { getSubscriptions } from '../firebase/messaging';

function AnonymousLogin() {
    firebase.auth().signInAnonymously().catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage)
    });
}

function onAuth() {
    firebase.auth().onAuthStateChanged(function (user) {
        store.user = user;

        if (user) {
            getSubscriptions();
            console.dir(user)
            console.log('User', store.user.uid, 'is signed in.');
            if (!user.isAnonymous) {
                console.log('user', user.displayName, 'is logged in')
                let userSimpleObj = {
                    uid: store.user.uid,
                    name: store.user.displayName,
                    email: store.user.email,
                    isAnonymous: false
                }

                listenToFeeds();
                

                DB.collection("users").doc(user.uid).set(userSimpleObj).then(function () {

                }).catch(function (error) {
                    console.error("Error writing User: ", error);
                });

                let lastPage = sessionStorage.getItem('lastPage') || '/groups'
                m.route.set(lastPage);
            } else {
                //if user anonymous

                console.log('user is anonymous')
                console.log(store.user)
                // let lastPage = sessionStorage.getItem('lastPage') || '/login'
                store.user.userName = store.userTempName || getRandomName();

                let userSimpleObj = {
                    uid: store.user.uid,
                    name: store.user.userName,                   
                    isAnonymous:true
                }
                DB.collection("users").doc(user.uid).set(userSimpleObj).then(function () {

                }).catch(function (error) {
                    console.error("Error writing User: ", error);
                });

                let lastPage = sessionStorage.getItem('lastPage') || '/groups'
                console.log(lastPage)
                m.route.set(lastPage);
            }
        } else {

            console.log('User is signed out.');
            store.user = {};
            store.push = [false];
            m.redraw();
        }

    });
}

module.exports = { onAuth, AnonymousLogin }