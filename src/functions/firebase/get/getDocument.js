import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";

export const listenToSentences = (ids) => {
    try {
        const { groupId, questionId } = ids;

        if (groupId === undefined || questionId === undefined) throw new Error('no group id or question id')

        if (!(questionId in store.documentListen)) {
            store.documentListen[questionId] = true;

            DB
                .collection('groups').doc(groupId)
                .collection('questions').doc(questionId)
                .collection('document')
                .onSnapshot(sentencesDB => {
                    const tmpSentences = []
                    sentencesDB.forEach(sentenceDB => {
                        const sentenceObj = sentenceDB.data();
                        sentenceObj.sentenceId = sentenceDB.id;

                        tmpSentences.push(sentenceObj)
                    })

                  
                    store.documents[questionId] = tmpSentences;
                    m.redraw();
                })

        }


    } catch (e) {
        console.error(e)
    }

}