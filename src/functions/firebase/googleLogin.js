import m from 'mithril';
import store from '../../data/store';

import DB from '../firebase/config';

function googleLogin() {

    var provider = new firebase.auth.GoogleAuthProvider();


    firebase.auth().signInWithPopup(provider).then(function (result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        // store.user = result.user;
        console.log(`user is logged in with google`);
        
        let lastPage = sessionStorage.getItem('lastPage') || '/groups'
        m.route.set(lastPage)
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });

    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
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