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
                        let x = {a:1, b:2}
                        let y = {...x}
                        console.log(y)
                        // tmpSentences.push({ ...sentenceDB.data(), sentenceId: sentenceDB.id })
                    })

                    console.log(tmpSentences)
                })
        }


    } catch (e) {
        console.error(e)
    }

}