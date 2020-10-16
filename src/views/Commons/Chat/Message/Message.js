import m from 'mithril';
import './Message.css';

module.exports = {
    view: vnode => {
        const {me, message} = vnode.attrs;
        return (
            <div class={me==true?'message message--me': 'message'}>
                <div class='message__user'>
                    <img src={message.photoURL} alt='user'></img>
                </div>
                <div class='message__texts'>
                    <div class='message__username'>{message.displayName}</div>
                    <div class='message__text'>
                        {message.message}
                    </div>
                    <div class='message__time'>12:34</div>
                </div>
            </div>
        )
    }
}