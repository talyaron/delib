import m from 'mithril';
import './Input.css';

//components


module.exports = {
    view:vnode=>{
        return(
            <div class='input'>
                <div class='input__send'>
                    <img src='img/send-24px.svg' alt='send' />
                </div>
                <textarea>

                </textarea>
                
            </div>
        )
    }
}