import m from "mithril";
import "./SubQuestionPage.css";

//model
import store from "../../data/store";
import settings from "../../data/settings";
import lang from '../../data/languages';
import { SUB_QUESTION } from '../../data/EntityTypes';

//components

import SubQuestion from "./SubQuestion/SubQuestion";
import Modal from "../Commons/Modal/Modal";
import Spinner from "../Commons/Spinner/Spinner";
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTopScroll from '../Commons/NavTopScroll/NavTopScroll';
import Chat from '../Commons/Chat/Chat';
import Reactions from '../Commons/Reactions/Reactions';


//functions
import { getSubQuestion, listenToGroupDetails, listenToChat, listenToOptions, getLastTimeEntered } from "../../functions/firebase/get/get";
import { registerGroup } from '../../functions/firebase/set/set';
import { getIsChat, concatenateDBPath, getFirstUrl } from '../../functions/general';
import { listenToReactions } from '../../functions/firebase/get/getQuestions';

import { get } from "lodash";

let unsubscribe = () => { }, unsubscribeChat = () => { };
let unsubscribeReactions = () => { }

module.exports = {

    oninit: vnode => {


        const { groupId, questionId, subQuestionId } = vnode.attrs;

        const orderBy = getOrderByFromUrl(vnode);

        console.log('sub question page', orderBy)

        const firstUrl = getFirstUrl();

        //get user before login to 
        if (firstUrl === 'subquestions') {
            store.lastPage = `/${firstUrl}/${groupId}/${questionId}/${subQuestionId}/${orderBy}`;
        } else if (firstUrl === 'subquestions-chat') {
            store.lastPage = `/${firstUrl}/${groupId}/${questionId}/${subQuestionId}`;
        }
        sessionStorage.setItem("lastPage", store.lastPage);


        if (store.user.uid == undefined) {
            m
                .route
                .set('/login');

        } else {

            //should we show wiz for first new comers?
            waitToCheckIfUserSeenSuggestionsWizard(vnode);

        }


        vnode.state = {
            orderBy: orderBy,
            options: [false],
            details: {
                title: false,
                options: []
            },
            showModal: {
                isShow: false,
                which: "subQuestion",
                title: "הוספת אפשרות"
            },
            subPage: getIsChat() ? 'chat' : 'main',
            group: {
                logo: "",
                title: ""
            },
            subscribed: false,
            path: concatenateDBPath(groupId, questionId, subQuestionId),
            unreadMessages: 0,
            lastTimeEntered: 0,
            language: 'he',
            firstTimeOnSuggestions: false,
            pages: [
                { page: 'main', title: 'אפשרויות' },
                { page: 'chat', title: 'שיחה', counter: vnode.state.unreadMessages },
                { page: 'reactions', title: 'תגובות' },

            ]
        }


        listenToOptions(groupId, questionId, subQuestionId, 'top');
        unsubscribeReactions = listenToReactions({ groupId, questionId, subQuestionId });
        registerGroup(groupId);
    },
    oncreate: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;
        unsubscribe = getSubQuestion(groupId, questionId, subQuestionId);
        unsubscribeChat = listenToChat({ groupId, questionId, subQuestionId });


        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false)

        listenToGroupDetails(groupId);

        getLastTimeEntered({ groupId, questionId, subQuestionId }, vnode);


    },
    onbeforeupdate: vnode => {
        const { groupId, questionId, subQuestionId } = vnode.attrs;

        if (store.subQuestions.hasOwnProperty(subQuestionId)) {
            vnode.state.details = store.subQuestions[subQuestionId];


        }

        let groupObj = get(store, `groups[${groupId}]`, {
            logo: "",
            title: ""
        });
        vnode.state.group = groupObj;

        //get number of unread massages
        if (vnode.state.subPage === 'chat') {
            vnode.state.lastTimeEntered = new Date().getTime() / 1000
        }
        const path = concatenateDBPath(groupId, questionId, subQuestionId);
        vnode.state.unreadMessages = store.chat[path].filter(m => m.createdTime.seconds > vnode.state.lastTimeEntered).length;

        vnode.state.language = get(store.groups, `[${groupId}].language`, 'he')

    },
    onupdate: vnode => {


        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false);



    },
    onremove: () => {

        unsubscribe();
        unsubscribeChat();
        unsubscribeReactions();

    },
    view: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;
        const { language, pages } = vnode.state;

        return (
            <div class='page zoomOutEnter' id='page'>
                {vnode.state.details.title
                    ? (
                        <div class='page__grid'>
                            <div class="page__header">
                                <Header
                                    name={vnode.state.details.title}
                                    upLevelUrl={hasNevigation(vnode)}
                                    groupId={groupId}
                                    questionId={questionId}
                                    showSubscribe={true}
                                    subQuestionId={subQuestionId}
                                    language={language}
                                    type={SUB_QUESTION}
                                />
                                <NavTopScroll
                                    pages={pages}
                                    level={lang[language].solutions}
                                    current={vnode.state.subPage}
                                    pvs={vnode.state}
                                    mainUrl={`/subquestions/${groupId}/${questionId}/${subQuestionId}`}
                                    chatUrl={`/subquestions-chat/${groupId}/${questionId}/${subQuestionId}`}
                                    ids={{ groupId, questionId, subQuestionId }}
                                    isSubscribed={vnode.state.subscribed}
                                    unreadMessages={vnode.state.unreadMessages}
                                />
                            </div>
                            <div style={`direction:${lang[language].dir}`} class='page__main subQuestion__carousel carousel' id='subQuestion__carousel'>
                                <main ontouchstart={handleTouchStart} ontouchend={handleTouchStart} ontouchmove={e => handleTouchMove(e, vnode)}>
                                    <div class='subQuestion__suggestions'>
                                        <div class='subQuestion__column'>
                                            <SubQuestion
                                                vsp={vnode.state}
                                                question={vnode.state.details.title}
                                                questionObj={vnode.state.details}
                                                groupId={groupId}
                                                questionId={questionId}
                                                subQuestionId={subQuestionId}
                                                orderBy={vnode.state.details.orderBy}
                                                title={vnode.state.details.title}
                                                subItems={vnode.state.details.options}
                                                parentVnode={vnode}
                                                info={settings.subItems.options}
                                                processType={vnode.state.details.processType}
                                                showSubscribe={true}
                                                isAlone={true}
                                                language={language}
                                            />
                                            {(vnode.state.details.processType === 'suggestions' || vnode.state.details.processType === undefined) ?
                                                <div class='page__footer'>
                                                    <div class={hasNevigation(vnode) ? "subQuestion__arrange" : "subQuestion__arrange subQuestion__arrange--bottom"} id="questionFooter">
                                                        <div
                                                            class={vnode.state.details.orderBy == "new"
                                                                ? "footerButton footerButton--selected"
                                                                : "footerButton"}
                                                            onclick={() => {
                                                                vnode.state.details.orderBy = "new";
                                                            }}>
                                                            <img src='img/new.svg' alt='order by newest' />
                                                            <div>{lang[language].new}</div>
                                                        </div>
                                                        <div
                                                            class={vnode.state.details.orderBy == "top"
                                                                ? "footerButton footerButton--selected"
                                                                : "footerButton"}
                                                            onclick={() => {
                                                                vnode.state.details.orderBy = "top";
                                                            }}>
                                                            <img src='img/agreed.svg' alt='order by most agreed' />
                                                            <div>{lang[language].agreed}</div>
                                                        </div>

                                                    </div>

                                                </div> : null
                                            }
                                        </div>


                                        <Chat
                                            entity='subQuestion'
                                            topic='תת שאלה'
                                            ids={{ groupId, questionId, subQuestionId }}
                                            title={vnode.state.details.title}
                                            url={m.route.get()}
                                        />

                                        <Reactions
                                            groupId={groupId}
                                            questionId={questionId}
                                            subQuestionId={subQuestionId}
                                        />
                                    </div>
                                </main>
                            </div>
                            {/* ---------------- Footer -------------- */}
                            {hasNevigation(vnode) ? <NavBottom /> : null}




                        </div>

                    )
                    : (<Spinner />)
                }
                {
                    (vnode.state.details.processType === 'suggestions' || vnode.state.details.processType === undefined) ?
                        < div
                            class="fav fav__subQuestion fav--blink"
                            onclick={() => {
                                vnode.state.showModal.isShow = true;
                            }}>
                            <div>
                                <div>+</div>
                            </div>

                        </div >
                        :
                        null
                }
                <Modal
                    showModal={vnode.state.showModal.isShow}
                    whichModal={vnode.state.showModal.which}
                    title={vnode.state.showModal.title}
                    vnode={vnode}
                    language={language}
                />

            </div >
        );
    }
};


function hasNevigation(vnode) {
    try {

        const { groupId, questionId, subQuestionId } = vnode.attrs;

        const userHasNevigation = vnode.state.details.userHaveNavigation || vnode.state.details.userHaveNavigation == undefined;
        const isUserCreator = (vnode.state.details.creator === store.user.uid || vnode.state.group.creatorId === store.user.uid)
        return !userHasNevigation && !isUserCreator ? false : `/question/${groupId}/${questionId}`;
    } catch (e) {
        console.error(e)
        return false;
    }
}




function waitToCheckIfUserSeenSuggestionsWizard(vnode) {
    let count = 1;
    const int = setInterval(() => {




        if (count > 20 || store.user.firstTimeOnSuggestions !== undefined) {

            vnode.state.firstTimeOnSuggestions = store.user.firstTimeOnSuggestions || false;
            clearInterval(int);
        }
        count++
    }, 500)
}

function getOrderByFromUrl(vnode) {

    let { orderBy } = vnode.attrs;
    if (orderBy === undefined) orderBy = 'top';
    if (orderBy !== 'top' && orderBy !== 'new') orderBy = 'new';
    return orderBy
}
let touchPointStart = 0, touchPointStartY = 0, isMoving = false;
function handleTouchStart(e) {
    try {
        isMoving = true;
        if (e.touches[0]) {
            touchPointStart = e.touches[0].clientX;
            touchPointStartY = e.touches[0].clientY;
        }
    } catch (e) {
        console.error(e)
    }

}


function handleTouchMove(e, vnode) {
    try {
        const moveDistance = 10;

        const touchPoint = e.touches[0].clientX
        const touchPointY = e.touches[0].clientY;
        const distanceY = Math.abs(touchPointStartY - touchPointY);
        const distanceX = Math.abs(touchPointStart - touchPointY)

        if ((touchPoint > touchPointStart + moveDistance) && isMoving && distanceY < distanceX) {

            isMoving = false;
            scrollSides('right', vnode)
        } else if ((touchPoint < touchPointStart - moveDistance) && isMoving && distanceY < distanceX) {

            isMoving = false;
            scrollSides('left', vnode)
        }
    } catch (e) {
        console.error(e)
    }
}

function scrollSides(direction, vnode) {
    try {

        const carouselBox = document.querySelector('#subQuestion__carousel');
        const carousel = document.querySelector('#subQuestion__carousel>main');

        const carouselWidth = carousel.clientWidth;
        const scrollX = -1 * ((1 / 3) * carouselWidth)

        switch (direction) {
            case 'left':
                carouselBox.scrollBy({
                    top: 0,
                    left: -1 * scrollX,
                    behavior: 'smooth'
                });
                isMoving = false
                break;
            case 'right':
                carouselBox.scrollBy({
                    top: 0,
                    left: scrollX,
                    behavior: 'smooth'
                });
                isMoving = false
            default:

        }

        setTimeout(() => {
            const scrollPortion = -1 * (carouselBox.scrollLeft / carouselWidth);

            if (scrollPortion < 0.2) vnode.state.subPage = 'main'
            else if (scrollPortion > 0.2 && scrollPortion < 0.5) vnode.state.subPage = 'chat'
            else if (scrollPortion > 0.5) vnode.state.subPage = 'reactions'

        }, 500)

    } catch (e) {
        console.error(e)
    }


}