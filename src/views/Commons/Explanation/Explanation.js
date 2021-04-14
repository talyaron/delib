import m from 'mithril';

import store from '../../../data/store';
import './Explanation.css';



module.exports = {

    view: vnode => {
        const { creatorId, groupId, questionId } = vnode.attrs;

        if (vnode.attrs.description) {
            return (
                <div class='explanation'>

                    <div>
                        {vnode.attrs.description}
                    </div>
                    <div class='explanation__footer'>
                        {switchButtons( vnode)}
                    </div>
                </div>
            )
        }
    }
}

function switchButtons( vnode) {
    try {
        const { creatorId, groupId, questionId, type } = vnode.attrs;
        switch (type) {
            case 'question':
                return <div class='buttons buttonOutlineGray buttons--small' onclick={() => m.route.set(`/questionEdit/${groupId}/${questionId}`)}>עריכה</div>
            case 'group':
                return <div class='buttons buttonOutlineGray buttons--small'>עריכה</div>
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

