import m from 'mithril';
import './Message.css';

//functions
import {timeParse} from '../../../../functions/general';

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
                        {message.message}
                    </div>
                    <div class='message__time'>{timeParse(new Date(message.createdTime.seconds*1000))}</div>
                </div>
            </div>
        )
    }
}