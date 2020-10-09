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
        return(
            <form class='input'>
                <div class='input__send' onclick={()=>handleSend({groupId, questionId, subQuestionId, optionId, user:store.user, message:vnode.state.message})}>
                    <img src='img/send-24px.svg' alt='send' />
                </div>
                <textarea onkeyup={e=>{
                    console.log(e.target.value)
                    vnode.state.message = e.target.value}}>

                </textarea>
                
            </form>
        )
    }
}

function handleSend(options){
    console.log(options)
    sendMessage(options)
}