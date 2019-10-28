import m from 'mithril';
import {DB} from '../config';
import store from '../../../data/store';
import { Reference } from '../../general';

function createGroup(creatorId, title, description) {
	DB.collection('groups')
		.add({
			title: title,
			description: description,
			creatorId: creatorId,
			time: new Date().getTime()
		})
		.then(function(docRef) {
			DB.collection('users').doc(creatorId).collection('groupsOwned').doc(docRef.id).set({
				id: docRef.id,
				date: new Date().getTime()
			});
			m.route.set(`/group/${docRef.id}`);
		})		
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function updateGroup(vnode) {
	DB.collection('groups').doc(vnode.attrs.id).update({
		title: vnode.state.title,
		description:vnode.state.description
	}).then(doc => {
		m.route.set(`/group/${vnode.attrs.id}`);
	}).catch(err => {
		console.error(err)
	})
}

function createQuestion(groupId, creatorId, title, description) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.add({
			title: title,
			description: description,
			time: new Date().getTime(),
			creatorId
		})
		.then((something) => {
			DB.collection('groups').doc(groupId).collection('questions').doc(something.id).update({ id: something.id });
			console.log(something.id);
			console.log('writen succesufuly');
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function updateQuestion(groupId, questionId, title, description, authorizationObj) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.update({
			title,
			description,
			authorization: authorizationObj
		})
		.then((something) => {
			console.log('writen succesufuly');
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function createSubQuestion(groupId, questionId, title, order) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.add({
			title,
			order,
			creator: store.user.uid,
			orderBy: 'top'
		})
		.then(function(docRef) {
			console.log('doc wrirten succesfully');
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function updateSubQuestion(groupId, questionId, subQuestionId, title) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.update({ title });
}

function updateSubQuestionProcess(groupId, questionId, subQuestionId, processType) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.update({ processType });
}

function updateSubQuestionOrderBy(groupId, questionId, subQuestionId, orderBy) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.update({ orderBy });
}

function updateSubQuestionsOrder(groupId, questionId, newOrderArray) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.update({
			subQuestions: {
				order: newOrderArray
			}
		})
		.then((something) => {
			console.log('writen succesufuly');
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function setSubQuestionsOrder(groupId, questionId, subQuestionId, order) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.update({
			order
		})
		.then((something) => {
			console.log(`writen to ${subQuestionId} succesufuly`);
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function createOption(
	groupId,
	questionId,
	subQuestionId,
	type,
	creatorId,
	title,
	description,
	creatorName,
	subQuestionTitle
) {
	let optionRef = DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.collection('options');

	optionRef
		.add({
			groupId,
			questionId,
			creatorId,
			type,
			title,
			description,
			creatorName,
			subQuestionTitle,
			time: firebase.firestore.FieldValue.serverTimestamp(),
			consensusPrecentage: 0
		})
		.then((newOption) => {
			optionRef.doc(newOption.id).update({ id: newOption.id });
		})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function setLike(groupId, questionId, subQuestionId, optionId, creatorId, like) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.collection('options')
		.doc(optionId)
		.collection('likes')
		.doc(creatorId)
		.set({ like })
		.then((newLike) => {})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

function setMessage(
	groupId,
	questionId,
	subQuestionId,
	optionId,
	creatorId,
	creatorName,
	message,
	groupName,
	questionName,
	optionName
) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.collection('options')
		.doc(optionId)
		.collection('messages')
		.add({
			creatorId,
			creatorName,
			time: firebase.firestore.FieldValue.serverTimestamp(),
			timeSeconds: new Date().getTime(),
			message,
			type: 'messages',
			groupName,
			questionName,
			optionName
		})
		.then((messageDB) => {
			DB.collection('groups')
				.doc(groupId)
				.collection('questions')
				.doc(questionId)
				.collection('subQuestions')
				.doc(subQuestionId)
				.collection('options')
				.doc(optionId)
				.update({
					lastMessage: firebase.firestore.FieldValue.serverTimestamp()
				})
				.then((doc) => {
					console.log('updated last message');
				});
		})
		.catch((error) => {
			console.log('Error:', error);
		});
}

function createSubItem(subItemsType, groupId, questionId, creatorId, creatorName, title, description) {
	let subQuestionRef = DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection(subItemsType);

	let addObj = {
		groupId,
		questionId,
		creatorId,
		title,
		description,
		author: creatorName,
		time: firebase.firestore.FieldValue.serverTimestamp(),
		consensusPrecentage: 0,
		roles: {},
		totalVotes: 0
	};
	addObj.roles[creatorId] = 'owner';

	subQuestionRef.add(addObj).then((newItem) => {}).catch(function(error) {
		console.error('Error adding document: ', error);
	});
}

function updateSubItem(subItemsType, groupId, questionId, subQuestionId, title, description) {
	let subQuestionRef = DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection(subItemsType)
		.doc(subQuestionId);

	let updateObj = {
		title,
		description,
		time: firebase.firestore.FieldValue.serverTimestamp()
	};

	subQuestionRef.update(updateObj).then((newOption) => {}).catch(function(error) {
		console.error('Error updating document: ', error);
	});
}

function setLikeToSubItem(subItemsType, groupId, questionId, subQuestionId, creatorId, isUp) {
	let subQuestionRef = DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection(subItemsType)
		.doc(subQuestionId)
		.collection('likes')
		.doc(creatorId);

	if (isUp) {
		subQuestionRef.set({ like: 1 });
		console.log('set like to ', subQuestionId);
	} else {
		subQuestionRef.set({ like: 0 });
		console.log('unset like to ', subQuestionId);
	}
}

function setSubAnswer(groupId, questionId, subQuestionId, creatorId, creatorName, message) {
	DB.collection('groups')
		.doc(groupId)
		.collection('questions')
		.doc(questionId)
		.collection('subQuestions')
		.doc(subQuestionId)
		.collection('subAnswers')
		.add({
			groupId,
			questionId,
			subQuestionId,
			creatorId,
			author: creatorName,
			creatorId,
			time: firebase.firestore.FieldValue.serverTimestamp(),
			message
		})
		.then((newLike) => {})
		.catch(function(error) {
			console.error('Error adding document: ', error);
		});
}

//add a path ([collection1, doc1, collection2, doc2, etc])
function addToFeed(addRemove, pathArray, refString, collectionOrDoc) {
	if (addRemove == 'add') {
		DB.collection('users')
			.doc(store.user.uid)
			.collection('feeds')
			.doc(refString)
			.set({
				path: refString,
				time: new Date().getTime(),
				type: collectionOrDoc,
				refString
			})
			.then(() => {
				console.log('added entety to DB', refString);
				store.subscribed[refString] = true;
				console.dir(store.subscribed);
			})
			.catch((error) => {
				console.error('Error writing document: ', error);
			});
	} else {
		DB.collection('users')
			.doc(store.user.uid)
			.collection('feeds')
			.doc(refString)
			.delete()
			.then(function() {
				delete store.subscribed[refString];
			})
			.catch(function(error) {
				console.error('Error removing document: ', error);
			});
	}
}

function updateOption(vnode) {
	let creatorName = vnode.state.isNamed?vnode.state.creatorName:'אנונימי/ת' 
	DB.collection('groups')
		.doc(vnode.attrs.groupId)
		.collection('questions')
		.doc(vnode.attrs.questionId)
		.collection('subQuestions')
		.doc(vnode.attrs.subQuestionId)
		.collection('options')
		.doc(vnode.attrs.optionId)
		.update({
			creatorUid:store.user.uid,			
			creatorName,			
			title: vnode.state.title,
			description: vnode.state.description,
			more: {
				text: vnode.state.more.text || '',
				URL: vnode.state.more.URL || ''
			}
		});
}

module.exports = {
	updateOption,
	addToFeed,
	createGroup,
	updateGroup,
	createQuestion,
	updateQuestion,
	createSubQuestion,
	updateSubQuestion,
	setSubQuestionsOrder,
	createOption,
	createSubItem,
	updateSubItem,
	setLikeToSubItem,
	setLike,
	setMessage,
	setSubAnswer,
	updateSubQuestionProcess,
	updateSubQuestionOrderBy
};
