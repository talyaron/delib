import m from 'mithril';
import './NavTopScroll.css';

//functions
import { zeroChatFeedMessages, setChatLastEntrance } from '../../../functions/firebase/set/setChats';
import store from "../../../data/store";

module.exports = {

    view: vnode => {
        let { pages, level, current, pvs, mainUrl, chatUrl, ids, isSubscribed, unreadMessages, chat, reactions, activeReactions } = vnode.attrs;
        const { questionId, subQuestionId } = ids;
        console.log(pages)
        return (
            <div class='navTop'>
                {pages.map((page, i) => {
                    console.log(page.page, page.title, i)
                    return (
                        <div
                            key={i}
                            class={isSelected(current, page) ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                            onclick={() => { pvs.subPage = page.page; scrollCarousel(i) }}
                        >
                            <div>
                                {page.title}
                                {page.counter ? <div class='counter'>{page.counter}</div> : null}
                            </div>
                        </div>
                    )
                })}
                {/* <div
                    class={current == 'main' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => {  pvs.subPage = 'main';scrollCarousel(0) }}
                >
                    {level}
                </div>
               
                <div
                    class={current == 'chat' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => {  pvs.subPage = 'chat'; setChatLastEntrance(ids);scrollCarousel(1); zeroChatFeedMessages(ids, isSubscribed && true) }}
                >
                    <div>{chat}</div>
                    {unreadMessages ? <div class='counter'>{unreadMessages}</div> : null}
                </div>
                {reactions?<div
                    class={current == 'reactions' ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                    onclick={() => {  pvs.subPage = 'reactions';scrollCarousel(2) }}
                >
                    <div>{reactions}{store.reactionsNumber[subQuestionId]?<div class='counter'>{store.reactionsNumber[subQuestionId]}</div>:null}</div>
                    {activeReactions ? <div class='counter'>{activeReactions}</div> : null}
                </div>:null} */}
            </div>
        )
    }
}

function scrollCarousel(position) {

    const carouselBox = document.querySelector('.carousel');
    const carousel = document.querySelector('.carousel>main');

    const carouselWidth = carousel.clientWidth;
    const scrollX = -1 * ((position / 3) * carouselWidth)

    carouselBox.scrollTo({
        top: 0,
        left: scrollX,
        behavior: 'smooth'
    });


}

function isSelected(current, page) {
    try {

        if ('page' in page) {
            return current == page.page
        } else {
            console.info(page)
            throw new Error('no "page" in page')
        }

    } catch (e) {
        console.error(e)
    }
}