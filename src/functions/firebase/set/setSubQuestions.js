import { DB } from '../config';
import store from '../../../data/store';

export const updateSubQuestionToDoc = (ids, inDoc=true) => {
    try {
        const { groupId, questionId, subQuestionId } = ids;

        console.log(groupId, questionId, subQuestionId)


        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ inDoc })
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

        const questionRef = DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)

        if (type === 'subQuestion') {
            questionRef.collection('subQuestions')
                .doc(elmId)
                .update({ order: newOrder, inDoc: true })
                .then(() => console.info('subquestion', elmId, ' order was updated to', newOrder))
                .catch(function (error) {
                    console.error('Error updating subquestion', subQuestionId, error)

                });
        } else if (type === 'sentence') {
            questionRef.collection('document')
                .doc(elmId)
                .update({ order: newOrder, inDoc: true })
                .then(() => console.info('sentence', elmId, ' order was updated to', newOrder))
                .catch(function (error) {
                    console.error('Error updating subquestion', subQuestionId, error)

                });
        }



    } catch (e) {
        console.error(e)

    }
}