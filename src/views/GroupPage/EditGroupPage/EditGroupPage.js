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
    onbeforeupdate: vnode => {
        vnode.state = get('store', `groups[${vnode.attrs.id}]`, vnode.state);       
    },
    view: vnode => {
        console.dir(vnode.attrs)
        return (
            <div>
                <Header topic='קבוצה' title='עדכון קבוצה' upLevelUrl='/groups' />
                <div class='wrapper wrapper_newGroup inputs'>
                    <input class='input' type='text' placeholder='שם הקבוצה' value={vnode.state.title} onkeyup={(e) =>vnode.state.title= e.target.value} />
                    <textarea class='input' placeholder='תאור הקבוצה'  value={vnode.state.description} onkeyup={(e) =>vnode.state.description= e.target.value} />
                    <input type='file'>בחר תמונה</input>
                    <input type='button' class='buttons' value="עדכון פרטי קבוצה" onclick={() => {
                        if (vnode.state.title.length > 2) {
                         
                            updateGroup(vnode);
                           
                            
                        }                        
                    }}></input>
                </div>
            </div>
           
        )
    }
}