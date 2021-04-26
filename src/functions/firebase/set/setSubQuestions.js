import { DB } from '../config';
import store from '../../../data/store';

export const updateSubQuestionToDoc = (ids) => {
    const { groupId, questionId, subQuestionId } = ids;
    console.log(groupId, questionId, subQuestionId)
    try {


        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .collection('subQuestions')
            .doc(subQuestionId)
            .update({ inDoc: true })
            .then(() => console.log('subquestion', subQuestionId, 'was updated'))
            .catch(function (error) {
                console.error('Error updating subquestion', subQuestionId, error)

            });

    } catch (e) {
        console.error(e)

    }
}