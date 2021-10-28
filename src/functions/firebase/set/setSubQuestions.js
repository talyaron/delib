import { DB } from '../config';

import { doc, updateDoc } from "firebase/firestore";

export const updateSubQuestionToDoc = (ids, inDoc = true) => {
    try {
        const { groupId, questionId, subQuestionId } = ids;

        const subQuestionRef = doc(DB, 'groups', groupId, 'questions', questionId, 'subQuestions', subQuestionId)


        updateDoc(subQuestionRef, { inDoc })
            // .then(() => console.info('subquestion', subQuestionId, 'was updated'))
            .catch(function (error) {
                console.error('Error updating subquestion', subQuestionId, error)

            });

    } catch (e) {
        console.error(e)

    }
}

export const reorderSubQuestionsInDocument = (ids, newOrder) => {
    const { groupId, questionId, elmId, type } = ids;



    try {

        const questionPath = `groups/${groupId}/questions/${questionId}`;

        if (type === 'subQuestion') {

            const questionRef = doc(DB, questionPath + `/subQuestions/${elmId}`)

            updateDoc(questionRef, { order: newOrder, inDoc: true })
                .then(() => console.info('subquestion', elmId, ' order was updated to', newOrder))
                .catch(function (error) {
                    console.error('Error updating subquestion', subQuestionId, error)

                });
        } else if (type === 'sentence') {
            const questionRef = doc(DB, questionPath + `/document/${elmId}`)


            updateDoc(questionRef, { order: newOrder, inDoc: true })
                .then(() => console.info('sentence', elmId, ' order was updated to', newOrder))
                .catch(function (error) {
                    console.error('Error updating subquestion', subQuestionId, error)

                });
        }

    } catch (e) {
        console.error(e)

    }
}