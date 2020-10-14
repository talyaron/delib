import m from 'mithril';
import './Chat.css';

//components
import Message from './Message/Message';
import Input from './Input/Input';

module.exports = {
    view: vnode => {

        const {ids, title, entity, topic, url} = vnode.attrs;
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
                <Input ids={ids} entity={entity} title={title} name={entity} topic={topic} url={url}/>
            </div>
        )
    }
}