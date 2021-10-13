import m from 'mithril';
import {  signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import store from '../../data/store';

import { DB } from '../firebase/config';

const provider = new GoogleAuthProvider();
const auth = getAuth();

function googleLogin() {

    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            store.user = result.user;
            console.log(`user is logged in with google`);
            let lastPage = sessionStorage.getItem('lastPage') || '/groups'
            m.route.set(lastPage)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);

            console.error(errorCode, errorMessage, email, credential)
            // ...
        });

    // var provider = new firebase.auth.GoogleAuthProvider();


    // firebase.auth().signInWithPopup(provider).then(function (result) {
    //     // This gives you a Google Access Token. You can use it to access the Google API.
    //     var token = result.credential.accessToken;
    //     // The signed-in user info.
    //     // store.user = result.user;
    //     console.log(`user is logged in with google`);

    //     let lastPage = sessionStorage.getItem('lastPage') || '/groups'
    //     m.route.set(lastPage)
    // }).catch(function (error) {
    //     // Handle Errors here.
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     // The email of the user's account used.
    //     var email = error.email;
    //     // The firebase.auth.AuthCredential type that was used.
    //     var credential = error.credential;
    //     console.error(errorCode, errorMessage, email, credential)
    //     // ...
    // });

    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
}

function anonymousLogin() {
    if (store.userTempName) {
        firebase.auth().signInAnonymously().catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // ...
        });
    } else {
        console.log('User didnot provide username')
    }
}

function logout() {
    firebase.auth().signOut()
        .then(function () {
            console.log('logout')
        })
        .catch(function (error) {
            console.error(error)
        });
}


module.exports = { googleLogin, anonymousLogin, logout };