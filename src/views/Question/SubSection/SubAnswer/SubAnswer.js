import m from 'mithril';

import './SubAnswer.css';

module.exports = {

    view: vnode => {

        return (
            <div class='subAnswerCard'>
                <div class='subAnswerText'>{vnode.attrs.message}</div>
                <div class='subAnswerAuthor'>{vnode.attrs.author}</div>
            </div>
        )
    }
}

