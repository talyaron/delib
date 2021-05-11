import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";

export const listenToTopOption = (ids, type = 'consensusPrecentage') => {
    console.log('listenToTopOption......................')
    try {
        const { groupId, questionId, subQuestionId } = ids;

        if (!{}.hasOwnProperty.call(store.selectedOptionListen, subQuestionId)) {
            store.selectedOptionListen[subQuestionId] = true

            console.log('listen to subQuestion...............',subQuestionId )

            DB
                .collection("groups")
                .doc(groupId)
                .collection("questions")
                .doc(questionId)
                .collection("subQuestions")
                .doc(subQuestionId)
                .collection("options")
                .orderBy(type, 'asc')
                .limit(1)
                .onSnapshot(optionsDB => {
                    optionsDB.forEach(optionDB => {
                        if (optionDB.exists) {
                       
                            store.selectedOption[subQuestionId] = optionDB.data();
                            m.redraw();
                        }
                    })
                }, e=>console.error(e))
        }
    } catch (e) {
        console.error(e);
    }
}