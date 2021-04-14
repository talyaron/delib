import Mithril from "mithril";
import m from 'mithril';
import './NavTop.css';

//functions
import { zeroChatFeedMessages, setChatLastEntrance } from '../../../functions/firebase/set/setChats';
import store from "../../../data/store";

module.exports = {

    view: vnode => {
        let { level, current, pvs, mainUrl, chatUrl, ids, isSubscribed, unreadMessages,paper, chat, reactions,activeReactions} = vnode.attrs;
        const {subQuestionId} = ids;
     
        return (
            <div class='navTop'>
                <div
                    class={current == 'main' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => {  pvs.subPage = 'main';scrollCarousel(0) }}
                >
                    {level}
                </div>
                {paper?<div
                    class={current === 'paper' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => { pvs.subPage = 'paper'; ;scrollCarousel(1) }}
                >
                    <div>{paper}</div>
                </div>:null}
                <div
                    class={current == 'chat' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => {  pvs.subPage = 'chat'; setChatLastEntrance(ids);scrollCarousel(2); zeroChatFeedMessages(ids, isSubscribed && true) }}
                >
                    <div>{chat}</div>
                    {unreadMessages ? <div class='counter'>{unreadMessages}</div> : null}
                </div>
                {reactions?<div
                    class={current == 'reactions' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => { console.log('dfsdfsdsdd'); pvs.subPage = 'reactions';scrollCarousel(3) }}
                >
                    <div>{reactions}{store.reactionsNumber[subQuestionId]?<div class='counter'>{store.reactionsNumber[subQuestionId]}</div>:null}</div>
                    {activeReactions ? <div class='counter'>{activeReactions}</div> : null}
                </div>:null}
            </div>
        )
    }
}

function scrollCarousel(position){
    console.log(' scrollCarousel', position)
    const carouselBox = document.querySelector('#subQuestion__carousel');
    const carousel = document.querySelector('#subQuestion__carousel>main');
    console.dir(carousel)
    const carouselWidth = carousel.clientWidth;
    const scrollX = -1*((position/4)*carouselWidth)
    console.log(scrollX)
    carouselBox.scrollTo({
        top: 0,
        left: scrollX,
        behavior: 'smooth'
      });

   
}