import m from "mithril";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { DB } from "../config";
import store from "../../../data/store";
import { uniqueId } from '../../general';

export const createQuestion = (groupId, creatorId, title, description) => {
 
    try {
        const questionId = uniqueId();
const questionRef = doc(DB, 'groups', groupId, 'questions', questionId);


            setDoc({questionRef, 
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
        const questionRef = doc(DB, 'groups', groupId, 'questions', questionId);

        
            updateDoc(questionRef,{ title, description })
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