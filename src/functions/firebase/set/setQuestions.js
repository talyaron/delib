import { DB } from '../config';
import store from '../../../data/store';

export function createReactions({ groupId, questionId, title }) {
    return new Promise((resolve, reject) => {
        DB.collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('reactions')
            .doc('info')
            .set({ groupId, questionId, title }, { merge: true })
            .then(() => {
                resolve(true)
            })
            .catch(e => {
                reject(e)
            })
    })
}

export function setNewReaction({ groupId, questionId, subQuestionId, type }) {

    try {

        if (!groupId) throw new Error('no groupId was given');
        if (!questionId) throw new Error('no questionId was given')
        if (!type) throw new Error('no type was given')

        DB.collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .collection('reactions')
            .add({ userId: store.user.uid, reactionType: type, dateSeconds: (new Date().getTime()/1000) })
            .then(() => {
                // console.info('New reaction was set by user', store.user.uid)
            })
            .catch(e => {
                console.error(e)
            });
    } catch (e) {
        console.error(e)
    }
}