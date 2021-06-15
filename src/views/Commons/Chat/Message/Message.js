import m from 'mithril';
import './Message.css';

//model
import store from '../../../../data/store';

//functions
import { timeParse } from '../../../../functions/general';
import { sendMessage } from '../../../../functions/firebase/set/setChats';

module.exports = {
    view: vnode => {
        const { me, message, isSameUser } = vnode.attrs;

        return (
            <div class={me == true ? 'message message--me' : 'message'}>
                {!isSameUser ?
                    <div class='message__user'>
                        {message.photoURL ? <img src={message.photoURL} alt='user'></img> : <div style={`background:${message.userColor}`}>{message.name.substring(0, 5)}</div>}
                    </div>
                    :
                    <div class='message__user' />
                }
                <div class='message__texts'>
                    {!isSameUser ? <div class='message__username'>{message.name}</div> : <div />}
                    <div class='message__text'>
                        <div>{message.message}</div>
                        {store.user.uid === message.uid?<img src='img/delete-lightgray.svg' alt='delete' onclick={deleteMessage} />:null}
                    </div>
                    <div class='message__time'>{timeParse(new Date(message.createdTime.seconds * 1000))}</div>
                </div>
            </div>
        )

        function deleteMessage() {
           
            const { messageId, ids } = message
            const { groupId, questionId, subQuestionId, optionId } = ids;
            let toDelete = confirm('Are you sure you want to delete the message?')
            if (toDelete) {
                sendMessage({ groupId, questionId, subQuestionId, optionId, messageId, toDelete, vnode });
            }
        }
    }
}