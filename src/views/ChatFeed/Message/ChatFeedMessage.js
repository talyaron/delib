import m from 'mithril';
import { messagesShow } from '../../../data/store';
import './ChatFeedMessage.css';

//functions

import { zeroChatFeedMessages } from '../../../functions/firebase/set/set';



module.exports = {
    view: vnode => {
        try{
        const { message } = vnode.attrs;
        const { msg } = message;
        console.log(msg)

        return (
            <div class='chatFeedMessage' onclick={() => { zeroChatFeedMessages(msg.ids); m.route.set(msg.url) }}>
                <div class='chatFeedMessage__user'>
                    {msg.photoURL ? <img src={msg.photoURL} alt='user'></img> : <div>{msg.name.substring(0, 2)}</div>}
                </div>
                <div class='chatFeedMessage__texts'>
                    <div class='chatFeedMessage__username'>ב{msg.topic} {msg.title} {msg.displayName} כתב/ה</div>
                    <div class='chatFeedMessage__text'>
                        {message.msgDifference > 0 ? <div class='chatFeedMessage__unRead'>{message.msgDifference}</div> : <div />}
                        <div class='chatFeedMessage__textMain'>{msg.message}</div>
                    </div>
                    <div class='chatFeedMessage__time'>12:34</div>
                </div>
            </div>
        )
        } catch(e){
            console.error(e)
        }
    }
}