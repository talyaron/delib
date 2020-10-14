import Mithril from "mithril";
import m from 'mithril';
import './NavTop.css';

module.exports = {
    
    view: vnode => {
        let  { level, current, pvs, mainUrl, chatUrl } = vnode.attrs;
        return (
            <div class='navTop'>
                <div 
                class={current=='main'?'navTop__btn navTop__btn--selected':'navTop__btn'}
                onclick={()=>{m.route.set(mainUrl); pvs.subPage='main'}}
                >
                    {level}
                    </div>
                <div 
                class={current=='chat'?'navTop__btn navTop__btn--selected':'navTop__btn'}
                onclick={()=>{m.route.set(chatUrl); pvs.subPage='chat'}}
                >
                    שיחה
                    </div>
            </div>
        )
    }
}