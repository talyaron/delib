import m from 'mithril';

import store from '../../../data/store';
import './Description.css';



module.exports = {

    view: (vnode) => {

        return (
            <div class='questionSection'>
                <div class='questionSectionTitle questions'>הסבר על השאלה</div>
                <div class='questionSectionMain'>
                    {vnode.attrs.content}
                </div>
                <div class='questionSectionFooter'>
                    {vnode.attrs.creatorId == getUserId() ?
                        <div
                            class='buttons questionSectionAddButton'
                            onclick={() => { m.route.set(`/questionEdit/${vnode.attrs.groupId}/${vnode.attrs.questionId}`) }}
                        >עריכת שאלה</div>
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

