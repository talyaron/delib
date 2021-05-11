import m from 'mithril';
import { get } from 'lodash';
import './DocumentCard.css';

//data
import store from '../../../../data/store';

//functions
import { listenToTopOption } from '../../../../functions/firebase/get/getOptions';
import { concatenateURL } from '../../../../functions/general';

module.exports = {
    oninit: vnode => {
        const { groupId, questionId, subQuestionId } = vnode.attrs;
        listenToTopOption({ groupId, questionId, subQuestionId })
    },

    view: vnode => {
        const {groupId, questionId, subQuestionId, subQuestion } = vnode.attrs;

        const option = get(store.selectedOption, `[${subQuestion.subQuestionId}]`, { title: 'אין עדיין תשובה' })


        return (
            <div class='documentCard' data-id={subQuestionId} data-type='subQuestion' onclick={() => { m.route.set(concatenateURL(groupId, questionId, subQuestionId)) }}>
                <div class='documentCard__handle'>
                    <img src='img/sortHandle.svg' alt='sort sub question'/>
                </div>
                <div class='documentCard__main'>
                <h1>{subQuestion.title}</h1>
                <p>{option.title}</p>
                </div>
            </div>
        )
    }
}


