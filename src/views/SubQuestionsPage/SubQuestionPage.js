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
import { getSubQuestion, getGroupDetails, listenToChat } from "../../functions/firebase/get/get";
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
            path: concatenateDBPath(groupId, questionId, subQuestionId)
        }
    },
    oncreate: vnode => {
        const { groupId, questionId, subQuestionId } = vnode.attrs;
        unsubscribe = getSubQuestion(groupId, questionId, subQuestionId);
        unsubscribeChat = listenToChat({ groupId, questionId, subQuestionId });


        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false)

        getGroupDetails(groupId);
        console.log(vnode.state.details)
    },
    onbeforeupdate: vnode => {
        const { groupId, subQuestionId } = vnode.attrs;

        if (store.subQuestions.hasOwnProperty(subQuestionId)) {
            vnode.state.details = store.subQuestions[subQuestionId];

        }

        let groupObj = get(store, `groups[${groupId}]`, {
            logo: "",
            title: ""
        });
        vnode.state.group = groupObj;
    },
    onupdate: vnode => {
        vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false)
    },
    onremove: vnode => {
        unsubscribe();
        unsubscribeChat();
    },
    view: vnode => {

        const { groupId, questionId, subQuestionId } = vnode.attrs;
        return (
            <div class='page'>
                {vnode.state.details.title
                    ? (
                        <div class='page-grid-subQuestion' style={!(vnode.state.details.userHaveNavigation == true || vnode.state.details.userHaveNavigation !== undefined) && vnode.state.subPage === 'main'? '' : 'grid-template-rows: fit-content(100px) auto;'}>
                            <div class="subQuestionHeader">
                                <Header
                                    title={vnode.state.details.title}
                                    upLevelUrl={vnode.state.details.userHaveNavigation || vnode.state.details.userHaveNavigation == undefined ? `/question/${groupId}/${questionId}` : false}
                                    groupId={groupId}
                                    questionId={questionId}
                                    showSubscribe={true}
                                    subQuestionId={subQuestionId}
                                />
                                <NavTop
                                    level={'תת שאלה'}
                                    current={vnode.state.subPage}
                                    pvs={vnode.state}
                                    mainUrl={`/subquestions/${groupId}/${questionId}/${subQuestionId}`}
                                    chatUrl={`/subquestions-chat/${groupId}/${questionId}/${subQuestionId}`}
                                    ids={{ groupId, questionId, subQuestionId }}
                                    isSubscribed={vnode.state.subscribed} />

                            </div>
                            {vnode.state.subPage === 'main' ?
                                <SubQuestion
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
                                    ids={{ groupId: groupId, questionId: questionId, subQuestionId }}
                                    title={vnode.state.details.title}
                                    url={m.route.get()}
                                />
                            }

                            {/* ---------------- Footer -------------- */}
                            {vnode.state.subPage === 'main' ?
                                <div class="subQuestion__arrange" id="questionFooter">
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
                            {(vnode.state.details.userHaveNavigation == true || vnode.state.details.userHaveNavigation == undefined) && vnode.state.subPage === 'main' ? <NavBottom /> : null}



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
