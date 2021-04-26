import m from 'mithril';

import store from '../../../data/store';
import './Explanation.css';



module.exports = {

    view: vnode => {
        const { description } = vnode.attrs;



        return (
            <div class='explanation'>

                <div>
                    {description?description:<span>אנא רשמו הסבר על הקבוצה</span>}
                </div>
                <div class='explanation__footer'>
                    {switchButtons(vnode)}
                </div>
            </div>
        )

    }
}

function switchButtons(vnode) {
    try {
        const { creatorId, type, ids } = vnode.attrs;
        const { groupId, questionId } = ids;
     
        switch (type) {
            case 'question':
                return <div class='buttons buttonOutlineGray buttons--small' onclick={() => m.route.set(`/questionEdit/${groupId}/${questionId}`)}>עריכה</div>
            case 'group':
                return <div class='buttons buttonOutlineGray buttons--small' onclick={() => m.route.set(`/editgroup/${groupId}`)}>עריכה</div>
            default:
                return null
        }
    } catch (e) {
        console.error(e);
        return null
    }
}

function getUserId() {
    if (store.user.hasOwnProperty('uid')) {
        return store.user.uid;
    } else {
        return 'none'
    }
}

