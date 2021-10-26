import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";
import { doc, addDoc, deleteDoc,  collection, updateDoc} from "firebase/firestore";

export const createSentence = (ids, text, type, order = 1000) => {
    try {
        const { groupId, questionId } = ids;
        if (typeof text != 'string' || text.length === 0) throw new Error`text is not a string or text is empty: ${text}`;
        if (typeof type != 'string' || type.length === 0) throw new Error`type is not a string or type is empty: ${type}`;
        if (typeof order != 'number') throw new Error`no order was given: ${order}`;

        const userObj = JSON.parse(JSON.stringify(store.user));

        const docmentRef = collection(DB, 'groups', groupId, 'questions', questionId, 'document');

        addDoc(docmentRef, { text, type, order, creator: userObj })
            .catch(e => console.error(e))


    } catch (e) {
        console.error(e)
    }

}



export const updateSentence = ({ groupId, questionId, sentenceId, text, type, order }) => {
    try {

        if (typeof text != 'string' || text.length === 0) throw new Error`text is not a string or text is empty: ${text}`;
        if (typeof type != 'string' || type.length === 0) throw new Error`type is not a string or type is empty: ${type}`;
        if (typeof order != 'number') throw new Error`no order was given: ${order}`;

        const userObj = JSON.parse(JSON.stringify(store.user));

        if (sentenceId === false) {
            createSentence({ groupId, questionId }, text, type, order);
        } else {
            const sentenceRef = doc(DB, 'groups', groupId, 'questions', questionId, 'document', sentenceId);

            updateDoc(sentenceRef, { text, type, order })
                .catch(e => console.error(e))
        }



    } catch (e) {
        console.error(e)
    }

}

export const deleteSentence = ids => {
    const { groupId, questionId, sentenceId } = ids;

    try {
        const sentenceRef = doc(DB, 'groups', groupId, 'questions', questionId, 'document', sentenceId);

        deleteDoc(sentenceRef)
            .catch(e => console.error(e))
    } catch (e) {
        console.error(e)
    }
}