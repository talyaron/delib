import m from 'mithril';

import store from '../../../data/store';
import './Description.css';



module.exports = {

    view: (vnode) => {

        return (
            <div class='questionDescription '>
                <div class='questionDescription__title'>{vnode.attrs.title}</div>
                <div class='questionSectionMain'>
                    {vnode.attrs.content}
                </div>
                <div class='questionSectionFooter'>
                    {vnode.attrs.creatorId == getUserId() ?
                        <div
                            class='buttons questionSectionAddButton'
                            onclick={() => { m.route.set(`/questionEdit/${vnode.attrs.groupId}/${vnode.attrs.questionId}`) }}
                        >עריכת הנושא</div>
                        :
                        <div />
                    }
                </div>
            </div>
        )
    }
}

function getUserId() {
    if (store.user.hasOwnProperty('uid')) {
        return store.user.uid;
    } else {
        return 'none'
    }
}

