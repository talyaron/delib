import { DB } from '../config';
import store from '../../../data/store';

export const updateSubQuestionToDoc = (ids) => {
    try {
        const { groupId, questionId, subQuestionId } = ids;


        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ inDoc: true })
            // .then(() => console.info('subquestion', subQuestionId, 'was updated'))
            .catch(function (error) {
                console.error('Error updating subquestion', subQuestionId, error)

            });

    } catch (e) {
        console.error(e)

    }
}

export const reorderSubQuestionsInDocument = (ids, newOrder) => {
    const { groupId, questionId, subQuestionId } = ids;

    try {


        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ orderInDoc: newOrder, inDoc: true })
            // .then(() => console.info('subquestion', subQuestionId, ' order was updated to', newOrder))
            .catch(function (error) {
                console.error('Error updating subquestion', subQuestionId, error)

            });

    } catch (e) {
        console.error(e)

    }
}