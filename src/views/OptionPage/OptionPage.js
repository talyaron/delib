import m from 'mithril';
import './OptionPage.css';

//data
import store from '../../data/store';

//function
import { get } from 'lodash';
import { listenToOption, listenToChat, listenToConsequences } from '../../functions/firebase/get/get';


// components
import Header from '../Commons/Header/Header';
import NavTop from '../Commons/NavTop/NavTop';
import NavBottom from '../Commons/NavBottom/NavBottom';
import Chat from '../Commons/Chat/Chat';
import ModalConsequnce from "./ModalConsequence/ModalConsequence";
import Consequence from './Consequence/Consequence';
import Description from './Description/Description'

let unsubscribe = () => { };
let unsubscribeChat = () => { };

module.exports = {
    oninit: vnode => {

        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;

        store.lastPage = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`;

        if (store.user.uid == undefined) {
            m
                .route
                .set('/login');

        }


        vnode.state = {
            option: get(store, `option[${optionId}]`, {}),
            subPage: 'main',
            subscribed: false,
            showModal: false,
            consequences: store.consequences[optionId] || [],
            orderBy: 'new'
        };

        //get user before login to page
        store.lastPage = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`;
        sessionStorage.setItem("lastPage", store.lastPage);

        unsubscribe = listenToOption({ groupId, questionId, subQuestionId, optionId });
        unsubscribeChat = listenToChat({ groupId, questionId, subQuestionId, optionId })
        listenToConsequences(groupId, questionId, subQuestionId, optionId)

    },
    onbeforeupdate: vnode => {
        const { optionId } = vnode.attrs;
        vnode.state.option = get(store, `option[${optionId}]`, {})
        vnode.state.consequences = store.consequences[optionId] || [];
    },
    onremove: vnode => {
        unsubscribe();
        unsubscribeChat();
    },
    view: vnode => {
        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;
        const { option, subPage, consequences } = vnode.state;


        return (
            <div class='page page-grid-option' style={subPage == 'main' ? '' : `grid-template-rows: fit-content(100px) auto;`}>
                <div class='optionPage__header'>
                    <Header
                        title={option.title}
                        upLevelUrl={`/subquestions/${groupId}/${questionId}/${subQuestionId}`}
                        groupId={groupId}
                        questionId={questionId}
                        showSubscribe={true}
                        subQuestionId={subQuestionId}
                    />
                    <NavTop
                        level={'אפשרות'}
                        current={vnode.state.subPage}
                        pvs={vnode.state}
                        mainUrl={`/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`}
                        chatUrl={`/option-chat/${groupId}/${questionId}/${subQuestionId}/${optionId}`}
                        ids={{ groupId, questionId, subQuestionId, optionId }}
                        isSubscribed={vnode.state.subscribed}
                    />
                </div>
                {subPage === 'main' ?
                    <div class='optionPage__main'>
                        הסבר: {option.description}
                        <Description />
                        <h2>אם הפתרון הזה ייבחר,  אילו דברים יקרו?</h2>

                        {consequences.map(consequence => {
                            if (consequence.consequenceId === '9e48bfb6c4b465a0da6') {
                                console.log(consequence)
                            }
                            return <Consequence consequence={consequence} />
                        })}
                        {vnode.state.subPage === 'main' ?
                            <div class="subQuestion__arrange" id="questionFooter">
                                <div
                                    class={vnode.state.orderBy == "new"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "new";
                                    }}>
                                    <img src='img/new.svg' alt='order by newest' />
                                    <div>חדש</div>
                                </div>
                                <div
                                    class={vnode.state.orderBy == "top"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "top";
                                    }}>
                                    <img src='img/truth.svg' alt='order by most agreed' />
                                    <div>אמינות</div>
                                </div>

                                <div
                                    class={vnode.state.orderBy == "message"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "message";
                                    }}>
                                    <img src='img/talk.svg' alt='order by last talks' />
                                    <div>שיחות אחרונות</div>
                                </div>
                            </div> : null
                        }

                        < div
                            class="fav fav__subQuestion fav--blink"
                            onclick={() => {
                                vnode.state.showModal = true;
                                console.log('vnode.state.showModal', vnode.state.showModal)
                            }}>
                            <div>
                                <div>+</div>
                            </div>

                        </div >
                        {vnode.state.showModal ?
                            <ModalConsequnce
                                pvs={vnode.state}
                                pva={vnode.attrs}
                            />
                            :
                            null
                        }
                    </div>
                    :
                    <Chat
                        entity='option'
                        topic='אפשרות'
                        ids={{ groupId: groupId, questionId: questionId, subQuestionId, optionId }}
                        title={option.title}
                        url={m.route.get()}
                    />
                }
                {subPage === 'main' ? <NavBottom /> : null}
            </div>
        )
    }
}