import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";
import { uniqueId } from '../../general';

export const createQuestion = (groupId, creatorId, title, description) => {
 
    try {
        const questionId = uniqueId();
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .set({
                title,
                description,
                time: new Date().getTime(),
                creatorId,
                questionId,
                id: questionId
            })
            .catch(function (error) {
                console.error('Error adding document: ', error); sendError(e);
            });
    } catch (e) {
        console.error(e)
    }
}

export const updateQuestion = (groupId, questionId, title, description)=> {

    try {
        DB
            .collection('groups')
            .doc(groupId)
            .collection('questions')
            .doc(questionId)
            .update({ title, description })
            .then(() => {
                console.info('writen succesufuly');
            })
            .catch(function (error) {
                console.error('Error adding document: ', error); sendError(e)
            });
    } catch (e) {
        console.error(e); sendError(e)
    }
}