import m from "mithril";
import "./SubQuestionPage.css";

//model
import store from "../../data/store";
import settings from "../../data/settings";

//components

import SubQuestion from "./SubQuestion/SubQuestion";
import Modal from "../Commons/Modal/Modal";
import Spinner from "../Commons/Spinner/Spinner";
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTop from '../Commons/NavTop/NavTop';
import Chat from '../Commons/Chat/Chat';
import AddPanel from '../QuestionPage/AddPanel/AddPanel';

//functions
import { getSubQuestion, getGroupDetails, listenToChat, listenToOptions, getLastTimeEntered } from "../../functions/firebase/get/get";
import { registerGroup } from '../../functions/firebase/set/set';
import { getIsChat, concatenateDBPath } from '../../functions/general';

import { get } from "lodash";

let unsubscribe = () => { }, unsubscribeChat = () => { };


module.exports = {

    oninit: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;

        //get user before login to page
        store.lastPage = `/subquestions/${groupId}/${questionId}/${subQuestionId}`;
        sessionStorage.setItem("lastPage", store.lastPage);

        if (store.user.uid == undefined) {
            m
                .route
                .set('/login');

        }

        vnode.state = {
            orderBy: "top",
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
            lastTimeEntered: 0
        }


        listenToOptions(groupId, questionId, subQuestionId, 'top');

        registerGroup(groupId);
    },
    oncreate: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;
        unsubscribe = getSubQuestion(groupId, questionId, subQuestionId);
        unsubscribeChat = listenToChat({ groupId, questionId, subQuestionId });


        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false)

        getGroupDetails(groupId);

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


    },
    onupdate: vnode => {


        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false);



    },
    onremove: vnode => {

        unsubscribe();
        unsubscribeChat();

    },
    view: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;

        return (
            <div class='page zoomOutEnter' id='page'>
                {vnode.state.details.title
                    ? (
                        <div class='page__grid'>
                            <div class="page__header">
                                <Header
                                    title='שאלה'
                                    upLevelUrl={hasNevigation(vnode)}
                                    groupId={groupId}
                                    questionId={questionId}
                                    showSubscribe={false}
                                    subQuestionId={subQuestionId}
                                />
                                <NavTop
                                    level={'פתרונות'}
                                    current={vnode.state.subPage}
                                    pvs={vnode.state}
                                    mainUrl={`/subquestions/${groupId}/${questionId}/${subQuestionId}`}
                                    chatUrl={`/subquestions-chat/${groupId}/${questionId}/${subQuestionId}`}
                                    ids={{ groupId, questionId, subQuestionId }}
                                    isSubscribed={vnode.state.subscribed}
                                    unreadMessages={vnode.state.unreadMessages}
                                />

                            </div>
                            {vnode.state.subPage === 'main' ?
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
                                    isAlone={true} />
                                :
                                <Chat
                                    entity='subQuestion'
                                    topic='תת שאלה'
                                    ids={{ groupId, questionId, subQuestionId }}
                                    title={vnode.state.details.title}
                                    url={m.route.get()}
                                />
                            }

                            {/* ---------------- Footer -------------- */}
                            <div class='page__footer'>
                                {vnode.state.subPage === 'main' && vnode.state.details.processType === 'suggestions' ?
                                    <div class={hasNevigation(vnode) ? "subQuestion__arrange" : "subQuestion__arrange subQuestion__arrange--bottom"} id="questionFooter">
                                        <div
                                            class={vnode.state.details.orderBy == "new"
                                                ? "footerButton footerButton--selected"
                                                : "footerButton"}
                                            onclick={() => {
                                                vnode.state.details.orderBy = "new";
                                            }}>
                                            <img src='img/new.svg' alt='order by newest' />
                                            <div>חדשות</div>
                                        </div>
                                        <div
                                            class={vnode.state.details.orderBy == "top"
                                                ? "footerButton footerButton--selected"
                                                : "footerButton"}
                                            onclick={() => {
                                                vnode.state.details.orderBy = "top";
                                            }}>
                                            <img src='img/agreed.svg' alt='order by most agreed' />
                                            <div>מוסכמות</div>
                                        </div>

                                        {/* <div
                                        class={vnode.state.details.orderBy == "message"
                                            ? "footerButton footerButton--selected"
                                            : "footerButton"}
                                        onclick={() => {
                                            vnode.state.details.orderBy = "message";
                                        }}>
                                        <img src='img/talk.svg' alt='order by last talks' />
                                        <div>Talks</div>
                                    </div> */}
                                    </div> : null
                                }
                                {hasNevigation(vnode) && vnode.state.subPage === 'main' ? <NavBottom /> : null}


                            </div>
                        </div>
                    )
                    : (<Spinner />)
                }
                {vnode.state.details.processType === 'suggestions' ?
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
                    placeholderTitle="כותרת"
                    placeholderDescription="הסבר"
                    vnode={vnode} />

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
