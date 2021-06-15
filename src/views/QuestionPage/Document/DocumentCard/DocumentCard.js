import m from 'mithril';
import { get } from 'lodash';
import './DocumentCard.css';

//data
import store from '../../../../data/store';

//functions
import { listenToTopOption } from '../../../../functions/firebase/get/getOptions';
import { concatenateURL,changeTextToArray,convertParagraphsToVisual } from '../../../../functions/general';

module.exports = {
    oninit: vnode => {
        const { groupId, questionId, subQuestionId } = vnode.attrs;
        listenToTopOption({ groupId, questionId, subQuestionId })
    },

    view: vnode => {
        const {groupId, questionId, subQuestionId, subQuestion } = vnode.attrs;

        const option = get(store.selectedOption, `[${subQuestion.subQuestionId}]`, { title: 'אין עדיין תשובה' })
        const descriptionParagraphs = changeTextToArray(option.description);

        return (
            <div class='documentCard' id={subQuestionId} ondragstart={e => handleSetId(e, subQuestionId)} data-id={subQuestionId} data-type='subQuestion' onclick={() => { m.route.set(concatenateURL(groupId, questionId, subQuestionId)) }} draggable={true}>
                <div class='documentCard__handle'>
                    <img src='img/sortHandle.svg' alt='sort sub question'/>
                </div>
                <div class='documentCard__main'>
                <h1>{subQuestion.title}</h1>
                <p>{option.title}</p>
                <div class='description__text'  >
                        {
                            descriptionParagraphs.map((paragaph, index) => {

                                return (convertParagraphsToVisual(paragaph, index))
                            })
                        }

                    </div>
                </div>
            </div>
        )
    }
}


function handleSetId(e, id) {

	e.dataTransfer.setData("text", id);
	e.dataTransfer.effectAllowed = "move"
}


