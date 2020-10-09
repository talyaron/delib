import m from 'mithril';
import './Message.css';

module.exports = {
    view: vnode => {
        return (
            <div class='message'>
                <div class='message__user'>
                    <img src='https://233e5r7tfnv3se11m26d4k8g-wpengine.netdna-ssl.com/wp-content/uploads/2017/07/shutterstock_141020407.jpg' alt='user'></img>
                </div>
                <div class='message__texts'>
                    <div class='message__username'>username</div>
                    <div class='message__text'>
                        bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                        bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                        bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla
                    </div>
                    <div class='message__time'>12:34</div>
                </div>
            </div>
        )
    }
}