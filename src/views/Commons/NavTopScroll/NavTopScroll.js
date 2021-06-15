import m from 'mithril';
import './NavTopScroll.css';

//functions
import { zeroChatFeedMessages, setChatLastEntrance } from '../../../functions/firebase/set/setChats';
import store from "../../../data/store";

module.exports = {

    view: vnode => {
        let { pages, level, current, pvs, mainUrl, chatUrl, ids, isSubscribed, unreadMessages, chat, reactions, activeReactions } = vnode.attrs;
        const { questionId, subQuestionId } = ids;
       
        return (
            <div class='navTop'>
                {pages.map((page, i) => {
                   
                    return (
                        <div
                            key={i}
                            class={isSelected(current, page) ? 'navTop__btn navTop__btn--selected' : 'navTop__btn'}
                            onclick={() => { pvs.subPage = page.page; scrollCarousel(pages,i) }}
                        >
                            <div>
                                {page.title}
                                {page.counter ? <div class='counter'>{page.counter}</div> : null}
                            </div>
                        </div>
                    )
                })}
                
            </div>
        )
    }
}

function scrollCarousel(pages, position) {

    const carouselBox = document.querySelector('.carousel');
    const carousel = document.querySelector('.carousel>main');

    const carouselWidth = carousel.clientWidth;
    const scrollX = -1 * ((position / pages.length) * carouselWidth);
   
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