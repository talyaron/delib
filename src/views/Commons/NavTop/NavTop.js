import Mithril from "mithril";
import m from 'mithril';
import './NavTop.css';

module.exports = {
    view: vnode => {
        const { level, current } = vnode.attrs;
        return (
            <div class='navTop'>
                <div class={current=='main'?'navTop__btn navTop__btn--selected':'navTop__btn'}>{level}</div>
                <div class={current=='chat'?'navTop__btn navTop__btn--selected':'navTop__btn'}>שיחה</div>
            </div>
        )
    }
}