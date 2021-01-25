import m from 'mithril';
import './Input.css';

//components

//data
import store from '../../../../data/store';

//functions
import { sendMessage } from '../../../../functions/firebase/set/set';


module.exports = {
    oninit: vnode => {
        vnode.state = { message: '' }
    },
    view: vnode => {
        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;
        const { title, entity, topic, url } = vnode.attrs;
        return (
            <div class='input'>
                <button type='submit' class='input__send' onclick={() => handleSend({ title, entity, topic, url, groupId, questionId, subQuestionId, optionId, user: store.user, message: vnode.state.message, vnode })}>
                    <img src='img/send-24px.svg' alt='send' />
                </button>
                <textarea
                    value={vnode.state.message}
                    onkeyup={e => {

                        vnode.state.message = e.target.value
                     
                        //submit on enter without shift
                        if (e.key === 'Enter' && e.shiftKey === false && e.target.value.replace(/\s/g, '').length>0) {

                            handleSend({ title, entity, topic, url, groupId, questionId, subQuestionId, optionId, user: store.user, message: vnode.state.message, vnode })
                        }
                    }}>

                </textarea>

            </div>
        )
    }
}

function handleSend(options) {

   

    const { vnode } = options;
    sendMessage(options)
    vnode.state.message = '';
}