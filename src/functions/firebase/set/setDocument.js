import m from "mithril";
import { DB } from "../config";
import store from "../../../data/store";

export const createSentence = (ids, text, type, order = 1000) => {
    try {
        const { groupId, questionId } = ids;
        if (typeof text != 'string' || text.length === 0) throw new Error`text is not a string or text is empty: ${text}`;
        if (typeof type != 'string' || type.length === 0) throw new Error`type is not a string or type is empty: ${type}`;
        if (typeof order != 'number') throw new Error`no order was given: ${order}`;

        const userObj = JSON.parse(JSON.stringify(store.user));

        DB
            .collection('groups').doc(groupId)
            .collection('questions').doc(questionId)
            .collection('document').add({ text, type, order, creator: userObj })
            .then(() => console.info('sentence was saved to db'))
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

        console.log(sentenceId)
        if (sentenceId === false) {
            createSentence({ groupId, questionId }, text, type, order);
        } else {
            DB
                .collection('groups').doc(groupId)
                .collection('questions').doc(questionId)
                .collection('document').doc(sentenceId)
                .update({ text, type, order })
                .then(() => console.info('sentence was updated to db'))
                .catch(e => console.error(e))
        }



    } catch (e) {
        console.error(e)
    }

}

export const deleteSentence = ids => {
    const {groupId, questionId, sentenceId} = ids;

    try{
        DB
        .collection('groups').doc(groupId)
        .collection('questions').doc(questionId)
        .collection('document').doc(sentenceId)
        .delete()
        .then(()=>console.info(`sentence ${sentenceId} was deleted`))
        .catch(e=>console.error(e))
    } catch(e){
        console.error(e)
    }
}