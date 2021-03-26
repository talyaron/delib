import m from 'mithril';
import './Chat.css';

//components
import Message from './Message/Message';
import Input from './Input/Input';
import Explanation from '../../Commons/Explanation/Explanation';
import PopRegistration from '../../Commons/PopRegistration/PopRegistration';

//functions
import { concatenateDBPath } from '../../../functions/general'


//data
import store from '../../../data/store';

module.exports = {
    oninit: vnode => {
        vnode.state = { userUid: '',showRegistration:false }
    },
    oncreate: vnode => {
        const chatWrapper = vnode.dom.children[0];

        chatWrapper.scrollTo(0, chatWrapper.scrollHeight)

    },
    onupdate: vnode => {


        //scroll to bottom
        const chatWrapper = vnode.dom.children[1];

        chatWrapper.scrollTo({
            top: chatWrapper.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    },
    view: vnode => {

        const { ids, title, description, entity, language, topic, url } = vnode.attrs;
        const { groupId, questionId, subQuestionId, optionId } = ids;


        const path = concatenateDBPath(groupId, questionId, subQuestionId, optionId);

        if (!(path in store.chat)) { store.chat[path] = [] }

       

        return (
            <div class='chat'>
               
                <div class='chatWrapper'>
                    {
                        store.chat[path].map((message, index) => {

                            return (<Message key={index} message={message} me={message.uid === store.user.uid} isSameUser={message.isSameUser} />)
                        })
                    }


                </div>
                <Input ids={ids} entity={entity} title={title} name={entity} topic={topic} url={url} pv={vnode} />
                {vnode.state.showRegistration?<PopRegistration pv={vnode} language={language} ids={{groupId, questionId, subQuestionId, optionId}}/>:null}
            </div>
        )
    }
}

