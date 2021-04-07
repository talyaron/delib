import m from 'mithril';
import { set, get } from 'lodash';
import { DB } from '../config';
import store from '../../../data/store';

export const setGroupTitles = (ids, title) => {
    try {
        const { groupId } = ids;
        if (groupId === undefined) throw new Error('groupId is not defined');
        if (title === undefined) throw new Error('title is not defined');

        DB
            .collection('groups').doc(groupId)
            .collection('titles').add({ title, order: 100000 })
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

        if ( typeof order !== 'number') throw new Error('order is not a number at ', groupTitleId);

        DB
            .collection('groups').doc(groupId)
            .collection('titles').doc(groupTitleId)
            .update({ order })
            .then(()=>console.log(`title ${groupTitleId} was updated in group ${groupId} to ${order}`))
            .catch(e => console.error(e))

    } catch (e) {
        console.error(e)
    }
}

export const  deleteGroupTitle = (groupId, groupTitleId)=>{
    try{
        if (groupId === undefined ) throw new Error `no group groupTitleId`;
        if (groupTitleId === undefined) throw new Error`No groupTitleId at ${groupId}`;

        DB
            .collection('groups').doc(groupId)
            .collection('titles').doc(groupTitleId)
            .delete()
            .then(()=>console.log(`title ${groupTitleId} was deleted in group ${groupId} `))
            .catch(e => console.error(e))
       
    } catch (e) {
        console.error(e)
        
    }
}