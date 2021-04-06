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
            .then(()=>console.info('title', title, 'was saved to DB'))
            .catch(e => console.error(e))
    } catch (e) {
        console.error(ids)
        console.error(e)
    }
}