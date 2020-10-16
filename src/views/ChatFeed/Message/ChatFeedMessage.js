import m from 'mithril';
import { messagesShow } from '../../../data/store';
import './ChatFeedMessage.css';



module.exports = {
    view: vnode => {
        const { message } = vnode.attrs;
        const { msg } = message;

        return (
            <div class='chatFeedMessage' onclick={() => { m.route.set(msg.url) }}>
                <div class='chatFeedMessage__user'>
                    <img src={msg.photoURL} alt='user'></img>
                </div>
                <div class='chatFeedMessage__texts'>
        <div class='chatFeedMessage__username'>ב{msg.topic} {msg.title} {msg.displayName} כתב/ה</div>
                    <div class='chatFeedMessage__text'>
                        {message.msgDifference>0?<div class='chatFeedMessage__unRead'>{message.msgDifference}</div>:<div />}
                        <div class='chatFeedMessage__textMain'>{msg.message}</div>
                    </div>
                    <div class='chatFeedMessage__time'>12:34</div>
                </div>
            </div>
        )
    }
}