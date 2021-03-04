import Mithril from "mithril";
import m from 'mithril';
import './NavTop.css';

//functions
import { zeroChatFeedMessages, setChatLastEntrance } from '../../../functions/firebase/set/set';

module.exports = {

    view: vnode => {
        let { level, current, pvs, mainUrl, chatUrl, ids, isSubscribed, unreadMessages, chat, reactions,activeReactions} = vnode.attrs;

     
        return (
            <div class='navTop'>
                <div
                    class={current == 'main' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => { m.route.set(mainUrl); pvs.subPage = 'main' }}
                >
                    {level}
                </div>
                <div
                    class={current == 'chat' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => { m.route.set(chatUrl); pvs.subPage = 'chat'; setChatLastEntrance(ids); zeroChatFeedMessages(ids, isSubscribed && true) }}
                >
                    <div>{chat}</div>
                    {unreadMessages ? <div class='counter'>{unreadMessages}</div> : null}
                </div>
                {reactions?<div
                    class={current == 'reactions' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => { m.route.set(chatUrl); pvs.subPage = 'reactions'; }}
                >
                    <div>{reactions}</div>
                    {activeReactions ? <div class='counter'>{activeReactions}</div> : null}
                </div>:null}
            </div>
        )
    }
}