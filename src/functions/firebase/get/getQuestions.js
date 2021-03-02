import store from '../../../data/store';
import { DB } from '../config';

export function cheackIfReactionExists({ groupId, questionId }) {
    console.log(groupId, questionId);
    try {

        return new Promise((resolve, reject) => {

            DB.collection('groups')
                .doc(groupId)
                .collection('questions')
                .doc(questionId)
                .collection('reactions')
                .doc('info')
                .get()
                .then(reactionsInfoDB => {
                    console.log(reactionsInfoDB.exists)
                    if (reactionsInfoDB.exists) resolve(reactionsInfoDB.data());
                    else resolve(false)
                })
                .catch(e => {
                    console.error(e);
                    reject(e)
                })
        })
    } catch (e) {
        console.error(e)
    }
}

export function listenToReactions({ groupId, questionId }) {
    try {

        console.log('listenToReactions', groupId, questionId)

        //create reaction in store, if don't exists
        if (!{}.hasOwnProperty.call(store.reactions, questionId)) store.reactions[questionId] = [];

        return DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('reactions')
            .onSnapshot(reactionsDB => {
                console.log('go....')

                reactionsDB.forEach(reactionDB => {

                    console.log(reactionDB.data())
                    console.log(store.reactions)

                    if (reactionDB.id !== 'info') {
                        store.reactions[questionId].push(reactionDB.data())

                        console.log(reactionDB.data().date.seconds)




                        console.log(store.reactions[questionId])

                    }


                    // store.reactions[questionId].push(reactionDB.data())
                })

            }, e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }
}