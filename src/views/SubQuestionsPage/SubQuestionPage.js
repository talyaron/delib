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

//functions
import { getSubQuestion, getGroupDetails, listenToChat, listenToOptions, getLastTimeEntered } from "../../functions/firebase/get/get";
import {  } from '../../functions/firebase/set/set';
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
            lastTimeEntered:0
        }


        listenToOptions(groupId, questionId, subQuestionId, 'top');
    },
    oncreate: vnode => {
        const page = document.getElementById('page')
        console.log('created')
        page.addEventListener('animationend',e=>{
            
            if(e.animationName === 'zoomOutEnter'){
                console.log('remove',e.animationName);
                vnode.dom.classList.remove("zoomOutEnter");
               
            }
            
        })

        
       

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
                        <div class='page-grid-subQuestion' style={!(vnode.state.details.userHaveNavigation == true || vnode.state.details.userHaveNavigation !== undefined) && vnode.state.subPage === 'main' ? '' : 'grid-template-rows: fit-content(100px) auto;'}>
                            <div class="subQuestionHeader">
                                <Header
                                    title='שאלה'
                                    upLevelUrl={vnode.state.details.userHaveNavigation || vnode.state.details.userHaveNavigation == undefined ? `/question/${groupId}/${questionId}` : false}
                                    groupId={groupId}
                                    questionId={questionId}
                                    showSubscribe={true}
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
                                    groupId={groupId}
                                    questionId={questionId}
                                    subQuestionId={subQuestionId}
                                    orderBy={vnode.state.details.orderBy}
                                    title={vnode.state.details.title}
                                    subItems={vnode.state.details.options}
                                    parentVnode={vnode}
                                    info={settings.subItems.options}
                                    processType={vnode.state.details.processType}
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
                            {vnode.state.subPage === 'main' ?
                                <div class={userCanNevigate(vnode) ? "subQuestion__arrange" : "subQuestion__arrange subQuestion__arrange--bottom"} id="questionFooter">
                                    <div
                                        class={vnode.state.details.orderBy == "new"
                                            ? "footerButton footerButtonSelected"
                                            : "footerButton"}
                                        onclick={() => {
                                            vnode.state.details.orderBy = "new";
                                        }}>
                                        <img src='img/new.svg' alt='order by newest' />
                                        <div>New</div>
                                    </div>
                                    <div
                                        class={vnode.state.details.orderBy == "top"
                                            ? "footerButton footerButtonSelected"
                                            : "footerButton"}
                                        onclick={() => {
                                            vnode.state.details.orderBy = "top";
                                        }}>
                                        <img src='img/agreed.svg' alt='order by most agreed' />
                                        <div>Agreed</div>
                                    </div>

                                    <div
                                        class={vnode.state.details.orderBy == "message"
                                            ? "footerButton footerButtonSelected"
                                            : "footerButton"}
                                        onclick={() => {
                                            vnode.state.details.orderBy = "message";
                                        }}>
                                        <img src='img/talk.svg' alt='order by last talks' />
                                        <div>Talks</div>
                                    </div>
                                </div> : null
                            }
                            {userCanNevigate(vnode) && vnode.state.subPage === 'main' ? <NavBottom /> : null}



                        </div>
                    )
                    : (<Spinner />)
                }
                < div
                    class="fav fav__subQuestion fav--blink"
                    onclick={() => {
                        vnode.state.showModal.isShow = true;
                    }}>
                    <div>
                        <div>+</div>
                    </div>

                </div >
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

function userCanNevigate(vnode) {
    return (vnode.state.details.userHaveNavigation == true || vnode.state.details.userHaveNavigation == undefined)
}
