import m from 'mithril';
import store from '../../../data/store';
import { DB } from '../config';

export function cheackIfReactionExists({ groupId, questionId }) {
 
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

export function listenToReactions({ groupId, questionId, subQuestionId}) {
    try {


        //create reaction in store, if don't exists
        if (!{}.hasOwnProperty.call(store.reactions, subQuestionId)) store.reactions[subQuestionId] = [];

        const currentDate = (new Date().getTime()/1000)-60;
      

        return DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .collection('reactions')
            .where('dateSeconds', '>',currentDate)
            .onSnapshot(reactionsDB => {

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