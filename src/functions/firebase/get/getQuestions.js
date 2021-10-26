import m from 'mithril';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";
import store from '../../../data/store';
import { DB } from '../config';

export function cheackIfReactionExists({ groupId, questionId }) {

    try {

        return new Promise((resolve, reject) => {
            const reactionsRef = doc(DB, 'groups', groupId, 'questions', questionId, 'reactions', 'info')

            getDoc(reactionsRef)
                .then(reactionsInfoDB => {

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

export function listenToReactions({ groupId, questionId, subQuestionId }) {
    try {


        //create reaction in store, if don't exists
        if (!{}.hasOwnProperty.call(store.reactions, subQuestionId)) store.reactions[subQuestionId] = [];

        const currentDate = (new Date().getTime() / 1000) - 60;
         
        
            const reactionsRef = collection(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', questionId, 'reactions')
        
        const q = query(reactionsRef, where('dateSeconds', '>', currentDate))
        return onSnapshot(q, reactionsDB => {

            reactionsDB.docChanges().forEach((change) => {
                if (change.type === "added") {

                    store.reactions[subQuestionId].push(change.doc.data())
                }

            })

            m.redraw()

        }, e => { console.error(e) })
    } catch (e) {
        console.error(e)
    }
}