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
        const { subQuestionId, subQuestion } = vnode.attrs;

        const option = get(store.selectedOption, `[${subQuestion.subQuestionId}]`, { title: 'אין עדיין תשובה' })


        return (
            <div class='documentCard'
                data-id={subQuestionId}

            >
                <h1>{subQuestion.title}</h1>
                <p>{option.title}</p>
            </div>
        )
    }
}


