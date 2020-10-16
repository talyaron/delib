import m from 'mithril';
import './Message.css';

module.exports = {
    view: vnode => {
        const { me, message } = vnode.attrs;
        return (
            <div class={me == true ? 'message message--me' : 'message'}>
                <div class='message__user'>
                    {message.photoURL ? <img src={message.photoURL} alt='user'></img> : <div style={`background:${message.userColor}`}>{message.name.substring(0, 5)}</div>}
                </div>
                <div class='message__texts'>
                    <div class='message__username'>{message.name}</div>
                    <div class='message__text'>
                        {message.message}
                    </div>
                    <div class='message__time'>12:34</div>
                </div>
            </div>
        )
    }
}