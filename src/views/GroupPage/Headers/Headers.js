import m from 'mithril';
import Sortable from "sortablejs";

import store from '../../../data/store';


//components
import './Headers.css';
import TopicHeader from './TopicHeader'


//functions
import { addGroupSection,deleteGroupTitle } from '../../../functions/firebase/set/setGroup';
import { reorderGroupTitle } from '../../../functions/firebase/set/setGroup';



module.exports = {

    oninit: vnode => {



    },
    oncreate: vnode => {
        const { groupId } = vnode.attrs;
        let sortHeaders = document.getElementById("sortHeaders");

        let sortHeadersObj = Sortable.create(sortHeaders, {
            animation: 150,
            handle:'.titleHandle',
            onEnd: evt => {
                //set order to DB
                const elements = [...evt.target.children];

                elements.map((elm, i) => {

                    reorderGroupTitle(groupId, elm.dataset.id, i)
                })
            }
        });
    },
    view: vnode => {
        const { groupId, vsp } = vnode.attrs;
        let sections = store.groupSections[groupId] || [];


        return (
            <div class='groupHeaders'>
                <div class='groupHeaders__box'>
                    <h1>חלוקה על פי כותרות</h1>
                    <form onsubmit={e => { handleAddSection(e, vnode) }}>
                        <input list="sections" name="section" class='inputGeneral' placeholder='הוספת כותרת' />
                        <datalist id="sections">
                            {sections.map((section, i) => <option key={i} value={section.title} />)}


                        </datalist>
                        <input type="submit" class='buttons' value='הוספה' />
                        <hr></hr>
                        <div id='sortHeaders' class='groupHeaders__wrapper'>
                            {sortedTitles(sections, 'order').map((section, i) => <div
                                class='groupHeaders__title'
                                data-order={section.order}
                                data-id={section.groupTitleId}
                                key={section.groupTitleId}>
                                <img src='img/sortHandle.svg' class='titleHandle grabbable'/>
                                <TopicHeader groupId={groupId} section={section.title} groupTitleId={section.groupTitleId}/>
                                <img src='img/delete-lightgray.svg' onclick={()=>handleDelete(groupId, section.groupTitleId)}/>
                            </div>)}
                        </div>
                        <hr />
                        <div class='buttonsBox' onclick={() => vsp.openHeadersPanel = false}>
                            <div class='buttons buttonOutlineGray'>Close</div>
                        </div>
                    </form>
                </div>

            </div>
        )
    }
}

function handleAddSection(e, vnode) {
    try {
        const { groupId } = vnode.attrs;
        e.preventDefault();

        let sections = store.groupSections[groupId] || [];
        const section = e.target.children.section.value;

        //check that you dont have suc section so far, and that no such section exists

        const index = sections.findIndex(ttl => ttl.title === section)

        if (section && index === -1) {
            addGroupSection({ groupId }, section);
            e.target.reset()
        }
    } catch (e) {
        console.error(e)
    }
}

function sortedTitles(sections, sortBy) {
    try {

        if (!Array.isArray(sections)) throw new Error`sections is not array: ${JSON.stringify(sections)}`;
        if (!sortBy) throw new Error`orderBy is empty`;

        switch (sortBy) {
            case 'order':
                return sections.sort((a, b) => a.order - b.order);
            default:
                return titles
        }

    } catch (e) {
        console.error(e)
        return []
    }

}

function handleDelete(groupId, groupTitleId){
    try{
        if (groupId === undefined ) throw new Error `no group id`;
        if (groupTitleId === undefined) throw new Error`No groupTitleId at ${groupId}`;

        let isDelete = confirm('Are you sure you want to delete this section?')
        if(isDelete){
            deleteGroupTitle(groupId, groupTitleId)
        }
    } catch (e) {
        console.error(e)
        return []
    }
}