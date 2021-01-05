import m from 'mithril';

import store from '../../../data/store';


//components
import './Members.css';



//functions

import { listenToGroupMembers } from '../../../functions/firebase/get/get';



let subscribeToMembers = ()=>{};

module.exports = {

    oninit: vnode => {

        const { groupId } = vnode.attrs;

        subscribeToMembers = listenToGroupMembers(groupId);

    },
    onremove:vnode=>{
        subscribeToMembers();
    },
    view: vnode => {
        const { groupId } = vnode.attrs;

        return (
            <div class='members'>
                <div class='members__numberOfMembers'>
                <p>מספר חברי הקבוצה
                    {{}.hasOwnProperty.call(store.groupMembers, groupId) ?
                        <span> {store.groupMembers[groupId].length}</span>
                        :
                        <span> 0</span>
                    }
                    </p>
                </div>
                <div class='members__header'>
                    <div>שם</div>
                    <div>שם</div>
                    <div>דוא״ל</div>

                </div>
                {{}.hasOwnProperty.call(store.groupMembers, groupId) ?
                    store.groupMembers[groupId].map(member => {
                        return (<div class='members__member' key={member.uid}>
                            <div>{member.photoURL ? <img src={member.photoURL} alt='photo of user' /> : "אנונימי"}</div>
                            <div>{member.name ? member.name : "אנונימי"}</div>
                            <div>{member.email ? member.email : "אין אימייל"}</div>
                        </div>)
                    }) : null

                }
            </div>
        )
    }
}