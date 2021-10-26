import m from 'mithril';
import { doc, addDoc, getDocs, deleteDoc, collection, updateDoc, deleteField, query, where } from "firebase/firestore";
import { DB } from '../config';


export const addGroupSection = (ids, title) => {
    try {
        const { groupId } = ids;
        if (groupId === undefined) throw new Error('groupId is not defined');
        if (title === undefined) throw new Error('title is not defined');

        const sectionsRef = doc(DB, 'groups', groupId, 'sections')

        addDoc(sectionsRef, { title, order: 100000 })
            .then(() => console.info('title', title, 'was saved to DB'))
            .catch(e => console.error(e))
    } catch (e) {
        console.error(ids)
        console.error(e)
    }
}

export const reorderGroupTitle = (groupId, groupTitleId, order) => {
    try {
        if (groupId === undefined) throw new Error('groupId is not defined');
        if (groupTitleId === undefined) throw new Error('groupTitleId is not defined');
        if (order === undefined) throw new Error('order is not defined');

        order = parseInt(order)
        console.log(groupTitleId, typeof order);

        if (typeof order !== 'number') throw new Error('order is not a number at ', groupTitleId);

        const groupTitleRef = doc(DB, 'groups', groupId, 'sections', groupTitleId)

        updateDoc(groupTitleRef, { order })
            .then(() => console.log(`title ${groupTitleId} was updated in group ${groupId} to ${order}`))
            .catch(e => console.error(e))

    } catch (e) {
        console.error(e)
    }
}

export const deleteGroupTitle = (groupId, groupTitleId) => {
    try {
        if (groupId === undefined) throw new Error`no group groupTitleId`;
        if (groupTitleId === undefined) throw new Error`No groupTitleId at ${groupId}`;

        const groupTitleRef = doc(DB, 'groups', groupId, 'sections', groupTitleId);

        deleteDoc(groupTitleRef)
            .then(() => console.log(`title ${groupTitleId} was deleted in group ${groupId} `))
            .catch(e => console.error(e))

        const questionsRef = collection(DB, 'groups', groupId, 'questions');
        const q = query(questionsRef, where('section', '==', groupTitleId));


        getDocs(q)
            .then(questionsDB => {
                questionsDB.forEach(questionDB => {

                    const questionRef = doc(DB, 'groups', groupId, 'questions', questionDB.id)
                    updateDoc(questionRef, { section: deleteField() })
                        .catch(e => console.error(e))
                })
            })

    } catch (e) {
        console.error(e)

    }
}

export const editGroupTitle = (title, groupId, groupTitleId) => {
    try {
        if (groupId === undefined) throw new Error`no group groupTitleId`;
        if (title === undefined) throw new Error`no title in ${groupId}, ${groupTitleId}`;
        if (groupTitleId === undefined) throw new Error`No groupTitleId at ${groupId}`;

        const groupTitleRef = doc(DB, 'groups', groupId, 'sections', groupTitleId);

        updateDoc(groupTitleRef, { title })
            .then(() => console.log(`title ${groupTitleId} was updated in group ${groupId} `))
            .catch(e => console.error(e))

    } catch (e) {
        console.error(e)

    }
}

export const updateGroupSection = (groupId, questionId, sectionId) => {
    try {

        const questionRef = doc(DB, 'groups', groupId,'questions', questionId)
       
            updateDoc(questionRef,{ section: sectionId })
            .catch(e => console.error(e))
    } catch (e) {
        console.error(e);
    }
}