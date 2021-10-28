import m from 'mithril';
import './Input.css';

//components

//data
import store from '../../../../data/store';

//functions
import { sendMessage } from '../../../../functions/firebase/set/setChats';
import { getLastEntityId, concatentPath } from '../../../../functions/general';
import { get } from 'lodash';


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
                    defaultValue={vnode.state.message}
                    onkeyup={e => {

                        vnode.state.message = e.target.value

                        //submit on enter without shift
                        if (e.key === 'Enter' && e.shiftKey === false && e.target.value.replace(/\s/g, '').length > 0) {

                            handleSend({ title, entity, topic, url, groupId, questionId, subQuestionId, optionId, user: store.user, message: vnode.state.message, vnode })
                            e.target.value = '';
                        }
                    }}>

                </textarea>

            </div>
        )
    }
}

function handleSend(options) {

    const { vnode, groupId, questionId, subQuestionId, optionId } = options;
    const { pv } = vnode.attrs;

    showRequestToRegister({ groupId, questionId, subQuestionId, optionId }, pv)

    const group = store.groups[groupId];
    if (group) {
        options.group = group;
    }

    sendMessage(options)
    vnode.state.message = '';
}

async function showRequestToRegister(ids, pv) {
    try {
        const { groupId, questionId, subQuestionId, optionId } = ids;

        const entityId = getLastEntityId(ids);
        const path = concatentPath(groupId, questionId, subQuestionId, optionId);

        if (entityId === false) throw new Error('couldnt find last entity id');

        const isRegisterd = get(store.listenToMessages, `[${entityId}]`, false);

        //search first in the array of messages, if not, search in the database.
        let isUserInMessages = store.chat[path].find(msg => msg.uid === store.user.uid)

        if (!isRegisterd) {

            //check if the user is allready in messages. if he is not, then show the alert

            if (isUserInMessages === undefined) {
                pv.state.showRegistration = true;
                return false

            } else {

                //dont show
                return false
            }
        }
    } catch (e) {
        console.error(e)
    }

}