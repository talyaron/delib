import m from 'mithril';
import './NewGroupPage.css';
//compnents
import Header from '../../Commons/Header/Header';

module.exports = {
    view: vnode => {
        return (
            <div>
                <Header topic='קבוצות' title='יצירת קבוצה חדשה' upLevelUrl='/groups' />
                <div class='wrapper wrapper_newGroup inputs'>
                    <input class='input' type='text' placeholder='שם הקבוצה' />
                    <textarea class='input' placeholder='תאור הקבוצה' />
                    <input type='file'>בחר תמונה</input>
                </div>
            </div>
           
        )
    }
}