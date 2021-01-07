import store from '../../data/store';
import m from 'mithril';
import {
	DB
} from '../firebase/config';

//functions
import {
	listenToFeed,
	listenToFeedLastEntrance,
	listenToChatFeed,
	listenToUserGroups, listenToRegisterdGroups
} from '../firebase/get/get';
import {
	getRandomColorDark
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
		console.error(errorCode, errorMessage);
	});
}

function onAuth() {
	firebase.auth().onAuthStateChanged(function (user) {
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
						userColor:getRandomColorDark(),
						signIn:true
					};

					listenToFeed();
					listenToFeedLastEntrance();
					listenToChatFeed();
					
					listenToUserGroups();
					listenToRegisterdGroups();

					DB.collection('users').doc(user.uid).set(userSimpleObj).then(function () {}).catch(function (error) {
						console.error('On login, set user to DB;',error.name, error.message)
						// if(error.message == 'Missing or insufficient permissions.'){alert('Insufficient permisions')}
						// console.error('Error writing User 22: ', error);
					});

					let lastPage = sessionStorage.getItem('lastPage') || '/groups';
					m.route.set(lastPage);
				} else {
					//if user anonymous

					console.info('user is anonymous');
				


					listenToUserGroups();
					listenToRegisterdGroups();
				
					if (store.userTempName) {

						store.user.name = store.userTempName;
						store.user.userColor = getRandomColorDark()
				
						let userSimpleObj = {
							uid: store.user.uid,
							name: store.user.name,
							isAnonymous: true,
							userColor:store.user.userColor,
							signIn:true
						};
						DB.collection('users').doc(user.uid).set(userSimpleObj)
							.then(function () {})
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
	}).catch(err=>{
		console.error(err)
	});
}

