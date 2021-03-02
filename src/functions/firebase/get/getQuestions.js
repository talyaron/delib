import m from 'mithril';
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

        const currentDate = (new Date().getTime()/1000)-60;
        console.log(currentDate)

        return DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('reactions')
            .where('dateSeconds', '>',currentDate)
            .onSnapshot(reactionsDB => {
                console.log('go....')

                reactionsDB.docChanges().forEach((change) => {
                    if (change.type === "added") {
                       
                        store.reactions[questionId].push(change.doc.data())
                    }
                   
                })
                console.log('finished reading........')
                console.log(store.reactions[questionId]);
                m.redraw()

            }, e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }
}