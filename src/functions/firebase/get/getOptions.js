import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";
import {VOTES, SUGGESTIONS, PARALLEL_OPTIONS} from '../../../data/evaluationTypes'

export const listenToTopOption = (ids, type = 'consensusPrecentage') => {
 
    try {
        const { groupId, questionId, subQuestionId } = ids;

        if (!{}.hasOwnProperty.call(store.selectedOptionListen, subQuestionId)) {
            store.selectedOptionListen[subQuestionId] = true

      

            DB
                .collection("groups")
                .doc(groupId)
                .collection("questions")
                .doc(questionId)
                .collection("subQuestions")
                .doc(subQuestionId)
                .collection("options")
                .orderBy(type, 'desc')
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

export const listenToOptionsConfirmed = (ids,minmumConfirms)=>{
    try {
        const { groupId, questionId, subQuestionId } = ids;
        if (!{}.hasOwnProperty.call(store.subQuestionOptionsConfirmedListen, subQuestionId)) {
            store.subQuestionOptionsConfirmedListen[subQuestionId] = true

            DB
            .collection("groups")
            .doc(groupId)
            .collection("questions")
            .doc(questionId)
            .collection("subQuestions")
            .doc(subQuestionId)
            .collection("options")
            .where('numberOfConfirms','>=',minmumConfirms)
            .orderBy('numberOfConfirms', 'desc')
            .onSnapshot(optionsDB => {
                const confirmedOptions = [];
                optionsDB.forEach(optionDB => {
                    if (optionDB.exists) {
                        const optionObj = optionDB.data();
                        optionObj.optionId = optionDB.id;

                        confirmedOptions.push(optionObj);
                        
                        
                    }
                })
                store.subQuestionOptionsConfirmed[subQuestionId] = confirmedOptions;
                console.log(store.subQuestionOptionsConfirmed[subQuestionId])
                m.redraw();
            }, e=>console.error(e))

        }

    } catch (error) {
        
    }
}

export const listenToTopOptions = ( groupId, questionId, subQuestionId, processType, subQuestion)=> {

	
	switch (processType) {
		case VOTES:
			listenToTopOption({ groupId, questionId, subQuestionId });
			break;
		case SUGGESTIONS:

			listenToTopOption({ groupId, questionId, subQuestionId });

			break;
		case PARALLEL_OPTIONS:
		
			let { maxConfirms, cutoff } = subQuestion;

			if (cutoff !== undefined && maxConfirms !== undefined) {

				cutoff = parseInt(cutoff);
				maxConfirms = parseInt(maxConfirms);

				const minmumConfirms = maxConfirms * (cutoff / 100);
		
				listenToOptionsConfirmed({ groupId, questionId, subQuestionId }, minmumConfirms)
			}
			break;

		default:
			listenToTopOption({ groupId, questionId, subQuestionId });
			break;
	}
}