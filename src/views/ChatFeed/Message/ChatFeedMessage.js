import m from 'mithril';
import { messagesShow } from '../../../data/store';
import './ChatFeedMessage.css';



module.exports = {
    view: vnode => {
        const { message } = vnode.attrs;
        const {msg} = message;

        return (
            <div class='chatFeedMessage' onclick={()=>{m.route.set(msg.url)}}>
                <div class='message__user'>
                    <img src='https://233e5r7tfnv3se11m26d4k8g-wpengine.netdna-ssl.com/wp-content/uploads/2017/07/shutterstock_141020407.jpg' alt='user'></img>
                </div>
                <div class='message__texts'>
                    <div class='message__username'>{msg.displayName}</div>
                    <div class='message__text'>
                        {msg.message}
                    </div>
                    <div class='message__time'>12:34</div>
                </div>
            </div>
        )
    }
}