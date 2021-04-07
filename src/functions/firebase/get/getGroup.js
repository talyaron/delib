import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";

//functions
import { cond, constant, orderBy, set } from 'lodash';
import { concatenateDBPath, setBrowserUniqueId, getEntityId } from '../../general'
import { sendError } from '../set/set';

export const listenToGroupTitles = groupId => {

    try {
        if (groupId === undefined) throw new Error('group id is missing');

        console.log('listenToGroupTitles', groupId)
        console.log(store.groupTitlesListen)
        if (!{}.hasOwnProperty.call(store.groupTitlesListen, groupId)) {

            store.groupTitlesListen[groupId] = [];
            if (!{}.hasOwnProperty.call(store.groupTitles, groupId)) {
                store.groupTitles[groupId] = []
            }
           
            return DB
                .collection('groups').doc(groupId)
                .collection('titles')
                .onSnapshot(titlesDB => {
                  
                    const titles = []
                    titlesDB.forEach(titleDB => {
                        titles.push(titleDB.data())
                    });
                    store.groupTitles[groupId] = [...titles];
                  
                    m.redraw();
                })
        } else {

            return () => { };
        }
    } catch (e) {
        console.error(e)
        return () => { }
    }
}