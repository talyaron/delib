import m from 'mithril';
import Sortable from "sortablejs";

import store from '../../../data/store';


//components
import './Headers.css';
import TopicHeader from './TopicHeader'


//functions
import { setGroupTitles,deleteGroupTitle } from '../../../functions/firebase/set/setGroup';
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
        let titles = store.groupTitles[groupId] || [];


        return (
            <div class='groupHeaders'>
                <div class='groupHeaders__box'>
                    <h1>חלוקה על פי כותרות</h1>
                    <form onsubmit={e => { handleAddTitle(e, vnode) }}>
                        <input list="titles" name="title" class='inputGeneral' placeholder='הוספת כותרת' />
                        <datalist id="titles">
                            {titles.map((title, i) => <option key={i} value={title.title} />)}


                        </datalist>
                        <input type="submit" class='buttons' value='הוספה' />
                        <hr></hr>
                        <div id='sortHeaders' class='groupHeaders__wrapper'>
                            {sortedTitles(titles, 'order').map((title, i) => <div
                                class='groupHeaders__title'
                                data-order={title.order}
                                data-id={title.groupTitleId}
                                key={title.groupTitleId}>
                                <img src='img/sortHandle.svg' class='titleHandle grabbable'/>
                                <TopicHeader groupId={groupId} title={title.title} groupTitleId={title.groupTitleId}/>
                                <img src='img/delete-lightgray.svg' onclick={()=>handleDelete(groupId, title.groupTitleId)}/>
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

function handleAddTitle(e, vnode) {
    try {
        const { groupId } = vnode.attrs;
        e.preventDefault();

        let titles = store.groupTitles[groupId] || [];
        const title = e.target.children.title.value;

        //check that you dont have suc title so far, and that no such title exists

        const index = titles.findIndex(ttl => ttl.title === title)

        if (title && index === -1) {
            setGroupTitles({ groupId }, title);
            e.target.reset()
        }
    } catch (e) {
        console.error(e)
    }
}

function sortedTitles(titles, sortBy) {
    try {

        if (!Array.isArray(titles)) throw new Error`titles is not array: ${JSON.stringify(titles)}`;
        if (!sortBy) throw new Error`orderBy is empty`;

        switch (sortBy) {
            case 'order':
                return titles.sort((a, b) => a.order - b.order);
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

        let isDelete = confirm('Are you sure you want to delete this title?')
        if(isDelete){
            deleteGroupTitle(groupId, groupTitleId)
        }
    } catch (e) {
        console.error(e)
        return []
    }
}