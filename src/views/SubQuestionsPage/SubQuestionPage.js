import m from "mithril";
import "./SubQuestionPage.css";

//model
import store from "../../data/store";
import settings from "../../data/settings";

//components

import SubQuestion from "../Question/SubQuestions/SubQuestion";
import Modal from "../Commons/Modal/Modal";
import Spinner from "../Commons/Spinner/Spinner";
import Header from '../Commons/Header/Header';

//functions
import {getSubQuestion, getGroupDetails} from "../../functions/firebase/get/get";
import {get} from "lodash";

let unsubscribe = () => {};

module.exports = {
    oninit: vnode => {
        //get user before login to page
        store.lastPage = `/subquestions/${vnode.attrs.groupId}/${vnode.attrs.questionId}/${vnode.attrs.subQuestionId}`;
        sessionStorage.setItem("lastPage", store.lastPage);

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
            group: {
                logo: "",
                title: ""
            }
        };
    },
    oncreate: vnode => {
        unsubscribe = getSubQuestion(vnode.attrs.groupId, vnode.attrs.questionId, vnode.attrs.subQuestionId);

        getGroupDetails(vnode.attrs.groupId);
    },
    onbeforeupdate: vnode => {
        if (store.subQuestions.hasOwnProperty(vnode.attrs.subQuestionId)) {
            vnode.state.details = store.subQuestions[vnode.attrs.subQuestionId];
        }

        let groupObj = get(store, `groups[${vnode.attrs.groupId}]`, {
            logo: "",
            title: ""
        });
        vnode.state.group = groupObj;
    },
    onremove: vnode => {
        unsubscribe();
    },
    view: vnode => {
        return (
            <div>
                {vnode.state.details.title
                    ? (
                        <div>
                            <div class="subQuestionHeader">
                                <Header
                                  title={vnode.state.details.title}
                                  upLevelUrl={`/question/${vnode.attrs.groupId}/${vnode.attrs.questionId}`}
                                    groupId={vnode.attrs.groupId}
                                    questionId={vnode.attrs.questionId}
                                    showSubscribe={true}
                                    subQuestionId={vnode.attrs.subQuestionId}/>
                                <div class="title">{vnode.state.details.title}</div>
                            </div>
                            <SubQuestion
                                groupId={vnode.attrs.groupId}
                                questionId={vnode.attrs.questionId}
                                subQuestionId={vnode.attrs.subQuestionId}
                                orderBy={vnode.state.details.orderBy}
                                title={vnode.state.details.title}
                                subItems={vnode.state.details.options}
                                parentVnode={vnode}
                                info={settings.subItems.options}
                                processType={vnode.state.details.processType}
                                isAlone={true}/> {/* ------------- Fav --------------- */}
                            <div
                                class="fav"
                                onclick={() => {
                                vnode.state.showModal.isShow = true;
                            }}>
                                <div>+</div>
                            </div>
                            {/* ---------------- Footer -------------- */}
                            <div class="footer" id="questionFooter">
                                <div
                                    class={vnode.state.details.orderBy == "new"
                                    ? "footerButton footerButtonSelected"
                                    : "footerButton"}
                                    onclick={() => {
                                    vnode.state.details.orderBy = "new";
                                }}>
                                    חדשות
                                </div>
                                <div
                                    class={vnode.state.details.orderBy == "top"
                                    ? "footerButton footerButtonSelected"
                                    : "footerButton"}
                                    onclick={() => {
                                    vnode.state.details.orderBy = "top";
                                }}>
                                    הכי מוסכמות
                                </div>
                                <div
                                    class={vnode.state.details.orderBy == "message"
                                    ? "footerButton footerButtonSelected"
                                    : "footerButton"}
                                    onclick={() => {
                                    vnode.state.details.orderBy = "message";
                                }}>
                                    שיחות אחרונות
                                </div>
                            </div>
                            <Modal
                                showModal={vnode.state.showModal.isShow}
                                whichModal={vnode.state.showModal.which}
                                title={vnode.state.showModal.title}
                                placeholderTitle="כותרת"
                                placeholderDescription="הסבר"
                                vnode={vnode}/>
                        </div>
                    )
                    : (<Spinner/>)}
            </div>
        );
    }
};
