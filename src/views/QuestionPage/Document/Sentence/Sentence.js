import m from 'mithril';
import { get } from 'lodash';
import './Sentence.css';

import { HEADER, PARAGRAPH } from './sentenceTypes';

//function
import { updateSentence, deleteSentence } from '../../../../functions/firebase/set/setDocument';


module.exports = {
    oninit: vnode => {
        vnode.state = { isEdit: false }
    },
    view: vnode => {
        const { text, sentenceId, type } = vnode.attrs.sentence;
        const { order } = vnode.attrs;

        return (
            <div class={`sentence ${sentenceClass(type)}`} data-id={sentenceId} data-type='sentence'>
                <div class='documentCard__handle'>
                    <img src='img/sortHandle.svg' alt='sort sub question' />
                </div>
                <div class='sentence__main'>
                    {switchEdit()}
                </div>
            </div>
        )

        function switchEdit() {
            if (text && !vnode.state.isEdit) {
                return (<h2 onclick={() => {vnode.state.isEdit = true }}>{text}</h2>)
            }
            if (!text && !vnode.state.isEdit) {
                return (<p class='sentence__add' onclick={() => { vnode.state.isEdit = true }}>{'add'}</p>)
            }
            if (vnode.state.isEdit) {
                return (
                    <div class='sentence__edit'>
                        <textarea defaultValue={text} placeholder='enter text' onkeyup={e => handleInput(e, vnode)} />
                        <img src='img/delete-lightgray.svg' alt='delete sentence' onclick={handleDeleteSentence} />
                    </div>
                )
            }

            return (<textarea defaultValue={text} placeholder='enter text' onkeyup={e => handleInput(e, vnode)} />)
        }

        function handleDeleteSentence() {

            const { groupId, questionId } = vnode.attrs;
            const { sentenceId } = vnode.attrs.sentence;
        
            deleteSentence({ groupId, questionId, sentenceId })
        }
    }
}



function handleInput(e, vnode) {
    const { groupId, questionId, order } = vnode.attrs;
   
    const { sentenceId, type } = vnode.attrs.sentence;
    
    if (e.key === 'Enter') {
        updateSentence({ groupId, questionId, sentenceId, text: e.target.value, type, order });
        vnode.state.isEdit = false;
    }
}





function sentenceClass(type) {

    try {
        switch (type) {
            case HEADER:
                return 'sentence__header';
            case PARAGRAPH:
                return 'sentence__paragraph';
            default:
                return '';
        }
    } catch (e) {
        console.error(e)
    }
}
