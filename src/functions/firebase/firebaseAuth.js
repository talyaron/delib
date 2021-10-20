import store from '../../data/store';
import m from 'mithril';
import {
	DB
} from '../firebase/config';

import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";


//functions
import {
	getUser,
	listenToFeed,
	listenToFeedLastEntrance,
	listenToUserGroups, listenToRegisterdGroups
} from '../firebase/get/get';
import { listenToChatFeed, listenToBageMessages } from '../firebase/get/getChats';
import {
	getRandomColorDark
} from '../general';
import {
	getSubscriptions
} from '../firebase/messaging';
import {
	constant, merge
} from 'lodash';

const auth = getAuth();

function AnonymousLogin() {
	signInAnonymously(auth)
		.then(() => { console.log('Anonymous login') })
		.catch(error => {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			console.error(errorCode, errorMessage);
		});
}

function onAuth() {
	onAuthStateChanged(auth, user => {
		try {
			store.user = user;

			if (user) {
				getSubscriptions();

				console.info('User', store.user.uid, 'is signed in.');
				if (!user.isAnonymous) {
					console.info('user', user.displayName, 'is logged in');
					user.name = user.displayName;
					let userSimpleObj = {
						uid: store.user.uid,
						name: store.user.name,
						email: store.user.email,
						isAnonymous: false,
						userColor: getRandomColorDark(),
						signIn: true,
						groupsUserTryToRegister: {}
					};
					getUser(store.user.uid);
					listenToFeed();
					listenToFeedLastEntrance();
					listenToChatFeed();

					listenToUserGroups();
					listenToRegisterdGroups();

					listenToBageMessages()

					const userRef = doc(DB, 'users', user.uid);
					setDoc(userRef, userSimpleObj, { merge: true })
						.then(function () { }).catch(function (error) {
							console.error('On login, set user to DB;', error.name, error.message)
							// if(error.message == 'Missing or insufficient permissions.'){alert('Insufficient permisions')}
							// console.error('Error writing User 22: ', error);
						});

					let lastPage = sessionStorage.getItem('lastPage') || '/groups';
					m.route.set(lastPage);
				} else {
					//if user anonymous

					console.info('user is anonymous');
					getUser(store.user.uid);

					listenToUserGroups();
					listenToRegisterdGroups();

					if (store.userTempName) {

						store.user.name = store.userTempName;
						store.user.userColor = getRandomColorDark()

						let userSimpleObj = {
							uid: store.user.uid,
							name: store.user.name,
							isAnonymous: true,
							userColor: store.user.userColor,
							signIn: true,
							groupsUserTryToRegister: {}
						};
						
						const userRef = doc(DB, 'users', user.uid);
						setDoc(userRef, userSimpleObj)
							.then(function () { })
							.catch(function (error) {

								console.error('Error writing User: ', error);
							});
					} else {


						getAnonymousName(store.user.uid);
					}

					let lastPage = sessionStorage.getItem('lastPage') || '/groups';

					m.route.set(lastPage);
				}
			} else {
				console.info('User is signed out.');
				store.user = {};
				store.push = [false];
				m.redraw();
			}
		} catch (err) {

			console.error(err)
		}
	});
}

module.exports = {
	onAuth,
	AnonymousLogin
};

function getAnonymousName(userId) {
	DB.collection('users').doc(userId).get().then((userDB) => {
		store.user.name = userDB.data().name;
		store.user.userColor = userDB.data().userColor || 'teal'

		m.redraw();
	}).catch(err => {
		console.error(err)
	});
}

