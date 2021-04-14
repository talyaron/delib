import m from "mithril";
import { DB } from "../config";
import store, { consequencesTop } from "../../../data/store";

//functions
import { cond, constant, orderBy, set } from 'lodash';
import { concatenateDBPath, setBrowserUniqueId, getEntityId } from '../../general'
import { sendError } from '../set/set';

export const listenToGroupSections = groupId => {

    try {
        if (groupId === undefined) throw new Error('group id is missing');


        if (!{}.hasOwnProperty.call(store.groupSectionsListen, groupId)) {

            store.groupSectionsListen[groupId] = [];
            if (!{}.hasOwnProperty.call(store.groupSections, groupId)) {
                store.groupSections[groupId] = []
            }

            return DB
                .collection('groups').doc(groupId)
                .collection('sections')
                .onSnapshot(sectionsDB => {

                    const sections = []
                    sectionsDB.forEach(sectionDB => {
                        const sectionObj = sectionDB.data();
                        sectionObj.groupTitleId = sectionDB.id
                        sections.push(sectionObj)
                    });
                    store.groupSections[groupId] = [...sections];
                   

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