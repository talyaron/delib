import m from 'mithril';
import './Message.css';

module.exports = {

    oninit: vnode => {
        vnode.state = { show: true };
        vnode.state.show = vnode.attrs.toShow;  
    },
    view: vnode => {

        return (
            <div class={vnode.state.show ? 'messageBack' : 'messageBack hideMessage'} onclick={() => { vnode.state.show = false }}>
                <div class='messageBox'>
                    <div class='messageTitle'>{vnode.attrs.title}</div>
                    <div class='messageContent'>{vnode.attrs.content}</div>
                    <div class='messageButtons'>
                        <div class='buttons' onclick={()=>{vnode.state.show = false}}>אישור</div>
                    </div>
                </div>
            </div>
        )
    }
}




