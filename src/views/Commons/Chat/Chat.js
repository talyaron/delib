import m from 'mithril';
import './Chat.css';

//components
import Message from './Message/Message';
import Input from './Input/Input';

//functions
import {concatenatePath} from '../../../functions/general'

//data
import store from '../../../data/store';

module.exports = {
    oncreate:vnode=>{
        const chatWrapper = vnode.dom.children[0];
       
        chatWrapper.scrollTo(0, chatWrapper.scrollHeight)
          
    },
    onupdate:vnode=>{
        const chatWrapper = vnode.dom.children[0];
       
        chatWrapper.scrollTo({
            top: chatWrapper.scrollHeight,
            left: 0,
            behavior: 'smooth'});
    },
    view: vnode => {

        const {ids, title, entity, topic, url} = vnode.attrs;
        const{groupId, questionId, subQuestionId, optionId} = ids;

       
        const path = concatenatePath(groupId, questionId, subQuestionId, optionId);

        if(!(path in store.chat)){store.chat[path] = []}
        
        return (
            <div class='chat'>
                <div class='chatWrapper'>
                    {
                        store.chat[path].map((message, index)=>{
                        
                            return(<Message key={index} message={message} me={message.uid === store.user.uid}/>)
                        })
                    }
                    
                    
                </div>
                <Input ids={ids} entity={entity} title={title} name={entity} topic={topic} url={url}/>
            </div>
        )
    }
}