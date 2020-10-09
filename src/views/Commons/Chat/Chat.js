import m from 'mithril';
import './Chat.css';

//components
import Message from './Message/Message';
import Input from './Input/Input';

module.exports = {
    view: vnode => {

        const {ids} = vnode.attrs;
        return (
            <div class='chat'>
                <div class='chatWrapper'>
                    <Message />
                    <Message />

                    <Message me={true}/>
                    <Message />
                    <Message />
                    <Message />
                    <Message me={true}/>
                    <Message />
                    <Message />
                    <Message />
                </div>
                <Input ids={ids}/>
            </div>
        )
    }
}