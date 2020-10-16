import m from 'mithril';
    import './Input.css';

//components

//data
import store from '../../../../data/store';

//functions
import {sendMessage} from '../../../../functions/firebase/set/set';


module.exports = {
    oninit:vnode=>{
        vnode.state = {message:''}
    },
    view:vnode=>{
        const {groupId, questionId, subQuestionId, optionId} = vnode.attrs.ids;
        const {title, entity, topic, url} = vnode.attrs;
        return(
            <form class='input' onsubmit={e=>handleSend(e,{title, entity, topic, url, groupId, questionId, subQuestionId, optionId, user:store.user, message:vnode.state.message, vnode})}>
                <button type='submit' class='input__send' >
                    <img src='img/send-24px.svg' alt='send' />
                </button>
                <textarea onkeyup={e=>{
                    console.log(e.target.value)
                    vnode.state.message = e.target.value}}>

                </textarea>
                
            </form>
        )
    }
}

function handleSend(e,options){
    e.preventDefault();
    console.log(options)
    sendMessage(options)
    e.target.reset();
}