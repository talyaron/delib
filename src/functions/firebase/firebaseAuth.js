import store from '../../data/store';
import m from 'mithril';
import {
	DB
} from '../firebase/config';

//functions
import {
	listenToFeeds
} from '../firebase/get/get';
import {
	getRandomName
} from '../general';
import {
	getSubscriptions
} from '../firebase/messaging';
import {
	constant
} from 'lodash';

function AnonymousLogin() {
	firebase.auth().signInAnonymously().catch(function (error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode, errorMessage);
	});
}

function onAuth() {
	firebase.auth().onAuthStateChanged(function (user) {
		try {
			store.user = user;

			if (user) {
				getSubscriptions();
				
				console.log('User', store.user.uid, 'is signed in.');
				if (!user.isAnonymous) {
					console.log('user', user.displayName, 'is logged in');
					user.name = user.displayName;
					let userSimpleObj = {
						uid: store.user.uid,
						name: store.user.name,
						email: store.user.email,
						isAnonymous: false
					};

					listenToFeeds();

					DB.collection('users').doc(user.uid).set(userSimpleObj).then(function () {}).catch(function (error) {
						console.error('On login, set user to DB;',error.name, error.message)
						// if(error.message == 'Missing or insufficient permissions.'){alert('Insufficient permisions')}
						// console.error('Error writing User 22: ', error);
					});

					let lastPage = sessionStorage.getItem('lastPage') || '/groups';
					m.route.set(lastPage);
				} else {
					//if user anonymous

					console.log('user is anonymous');
					console.log(store.user);
					// let lastPage = sessionStorage.getItem('lastPage') || '/login'
					if (store.userTempName) {
						console.log('store.userTempName', store.userTempName);
						store.user.name = store.userTempName;
						console.log(store.user.name);

						let userSimpleObj = {
							uid: store.user.uid,
							name: store.user.name,
							isAnonymous: true
						};
						DB.collection('users').doc(user.uid).set(userSimpleObj)
							.then(function () {})
							.catch(function (error) {
								console.log(error)
								console.error('Error writing User: ', error);
							});
					} else {
						getAnonymousName(store.user.uid);
					}

					let lastPage = sessionStorage.getItem('lastPage') || '/groups';
					console.log(lastPage);
					m.route.set(lastPage);
				}
			} else {
				console.log('User is signed out.');
				store.user = {};
				store.push = [false];
				m.redraw();
			}
		} catch (err) {
			console.log(err)
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
		console.log('uid:', userDB.data().uid);
		console.log('store.user.name', store.user.name);
		m.redraw();
	}).catch(err=>{
		console.error(err)
	});
}