import m from 'mithril';
import { messagesShow } from '../../../data/store';
import './ChatFeedMessage.css';

//functions

import { zeroChatFeedMessages } from '../../../functions/firebase/set/set';



module.exports = {
    view: vnode => {
        try {
            const { message } = vnode.attrs;
            const { msg } = message;
            console.log(msg)
let groupName = false
            if(msg.group){
                groupName = msg.group.title;
            }

            return (
                <div class='chatFeedMessage' onclick={() => { zeroChatFeedMessages(msg.ids); m.route.set(msg.url) }}>

                    <div class='chatFeedMessage__texts'>
                        <div class='chatFeedMessage__username'>{groupName&&groupName!= msg.title?`${groupName}: `:null}{msg.title} </div>
                        <div class='chatFeedMessage__text'>
                            {message.msgDifference > 0 ? <div class='chatFeedMessage__unRead'>{message.msgDifference}</div> : null}
                            <div class='chatFeedMessage__textMain'>
                                <div class='chatFeedMessage__user'>
                                    {msg.photoURL ? <img src={msg.photoURL} alt='user'></img> : <div>{msg.name.substring(0, 2)}</div>}
                                </div>
                                <span> {msg.message}</span>
                            </div>
                        </div>
                        <div class='chatFeedMessage__time'>12:34</div>
                    </div>
                </div>
            )
        } catch (e) {
            console.error(e)
        }
    }
}