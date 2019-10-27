import m from 'mithril';
import '../../Groups/NewGroupPage/NewGroupPage.css';
import { get } from 'lodash';

//model
import store from '../../../data/store';
//compnents
import Header from '../../Commons/Header/Header';

//functions
import { updateGroup } from '../../../functions/firebase/set/set';
import { getGroupDetails } from '../../../functions/firebase/get/get';

module.exports = {
    oninit: vnode => {
        vnode.state = {
            title: '',
            description:''
      }  
    },
    oncreate: vnode => {
        getGroupDetails(vnode.attrs.id, vnode);
    },
    onupdate: vnode => {
        let groupObj = get('store', `groups[${vnode.attrs.id}]`, vnode.state);
        vnode.state.title = groupObj.title;
        vnode.state.description = groupObj.description;
    },
    view: vnode => {
        return (
            <div>
                <Header topic='קבוצות' title='יצירת קבוצה חדשה' upLevelUrl='/groups' />
                <div class='wrapper wrapper_newGroup inputs'>
                    <input class='input' type='text' placeholder='שם הקבוצה' value={vnode.state.title} onkeyup={(e) =>vnode.state.title= e.target.value} />
                    <textarea class='input' placeholder='תאור הקבוצה'  value={vnode.state.description} onkeyup={(e) =>vnode.state.description= e.target.value} />
                    <input type='file'>בחר תמונה</input>
                    <input type='button' class='buttons' value="יצירת קבוצה חדשה" onclick={() => {
                        if (vnode.state.title != false && vnode.state.title.length > 2) {
                         
                            updateGroup(store.user.uid, vnode.state.title, vnode.state.description);
                            
                        }                        
                    }}></input>
                </div>
            </div>
           
        )
    }
}