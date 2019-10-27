import m from 'mithril';
import './NewGroupPage.css';

//model
import store from '../../../data/store';
//compnents
import Header from '../../Commons/Header/Header';

//functions
import { createGroup } from '../../../functions/firebase/set/set';

module.exports = {
    oninit: vnode => {
        vnode.state = {
            title: false,
            description:''
      }  
    },
    view: vnode => {
        return (
            <div>
                <Header topic='קבוצות' title='יצירת קבוצה חדשה' upLevelUrl='/groups' />
                <div class='wrapper wrapper_newGroup inputs'>
                    <input class='input' type='text' placeholder='שם הקבוצה' onkeyup={(e) =>vnode.state.title= e.target.value} />
                    <textarea class='input' placeholder='תאור הקבוצה' onkeyup={(e) =>vnode.state.description= e.target.value} />
                    <input type='file'>בחר תמונה</input>
                    <input type='button' class='buttons' value="יצירת קבוצה חדשה" onclick={() => {
                        if (vnode.state.title != false && vnode.state.title.length > 2) {
                            // console.log(store.user.uid, vnode.state.title, vnode.state.description)
                            createGroup(store.user.uid, vnode.state.title, vnode.state.description);
                            
                        }                        
                    }}></input>
                </div>
            </div>
           
        )
    }
}