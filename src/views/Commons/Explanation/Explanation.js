import m from 'mithril';

import store from '../../../data/store';
import './Explanation.css';



module.exports = {

    view: vnode => {
       const {creatorId, groupId, questionId} = vnode.attrs;
       console.log(questionId, creatorId, getUserId())

        if (vnode.attrs.description) {
            return (
                <div class='explanation'>

                    <div>
                        {vnode.attrs.description}
                    </div>
                    <div class='explanation__footer'>
                        {creatorId === getUserId() && questionId !== undefined?
                            <div class='buttons buttonOutlineGray buttons--small' onclick={()=>m.route.set(`/questionEdit/${groupId}/${questionId}`)}>עריכה</div>
                            :null 
                    }
                    </div>
                </div>
            )
        }
    }
}

function getUserId() {
    if (store.user.hasOwnProperty('uid')) {
        return store.user.uid;
    } else {
        return 'none'
    }
}

