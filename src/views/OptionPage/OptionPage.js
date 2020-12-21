import m from 'mithril';
import './OptionPage.css';

//data
import store from '../../data/store';

//function
import { get } from 'lodash';
import { listenToOption, listenToChat, listenToConsequences } from '../../functions/firebase/get/get';
import { randomizeArray } from '../../functions/general';


// components
import Header from '../Commons/Header/Header';
import NavTop from '../Commons/NavTop/NavTop';
import Spinner from '../Commons/Spinner/Spinner';
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
            consequences: store.consequences[optionId] || [false],
            orderBy: 'new'
        };

        //get user before login to page
        store.lastPage = `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`;
        sessionStorage.setItem("lastPage", store.lastPage);

        unsubscribe = listenToOption({ groupId, questionId, subQuestionId, optionId });
        unsubscribeChat = listenToChat({ groupId, questionId, subQuestionId, optionId })
        listenToConsequences(groupId, questionId, subQuestionId, optionId)

        sortBy(vnode)

    },
    onbeforeupdate: vnode => {
        const { optionId } = vnode.attrs;
        vnode.state.option = get(store, `option[${optionId}]`, {})
        vnode.state.consequences = store.consequences[optionId] || [];



        if (vnode.state.orderBy !== 'random') { sortBy(vnode) }

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
                        title="פתרון"
                        upLevelUrl={`/subquestions/${groupId}/${questionId}/${subQuestionId}`}
                        groupId={groupId}
                        questionId={questionId}
                        showSubscribe={true}
                        subQuestionId={subQuestionId}
                    />
                    <NavTop
                        level={'בעד ונגד'}
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

                        <Description option={option} />
                        <div class='optionPage__consequences'>
                            <h1 class='optionPage__question'>אם פתרון זה יקרה, אילו דברים רעים או טובים יקרו?
                            <div
                                    class='buttons buttonOutlineWhite buttons--small'
                                    onclick={() => {
                                        vnode.state.showModal = true;

                                    }}
                                >הוספת תשובה</div>
                            </h1>

                            <h3>{consequencesExplanation(vnode)}</h3>
                            <div class='consequencesWrapper'>
                                {consequences[0] === false ? <Spinner /> :
                                    consequences.map(consequence => {

                                        return <Consequence consequence={consequence} key={consequence.consequenceId} showColor={showColor(vnode)} />
                                    })
                                }
                            </div>
                        </div>
                        {vnode.state.subPage === 'main' ?
                            <div class="optionPage__menu" id="questionFooter">
                                <div
                                    class={vnode.state.orderBy == "new"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "new";
                                        sortBy(vnode)
                                    }}>
                                    <img src='img/newGray.svg' alt='order by newest' />
                                    <div>חדש</div>
                                </div>
                                <div
                                    class={vnode.state.orderBy == "for"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "for";
                                        sortBy(vnode)
                                    }}>
                                    <img src='img/voteUpGray.svg' alt='order by newest' />
                                    <div>בעד</div>
                                </div>
                                <div
                                    class={vnode.state.orderBy == "against"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "against";
                                        sortBy(vnode)
                                    }}>
                                    <img src='img/voteDownGray.svg' alt='order by most agreed' />
                                    <div>נגד</div>
                                </div>

                                <div
                                    class={vnode.state.orderBy == "random"
                                        ? "footerButton footerButtonSelected"
                                        : "footerButton"}
                                    onclick={() => {
                                        vnode.state.orderBy = "random";
                                        sortBy(vnode)
                                    }}>
                                    <img src='img/random.svg' alt='order by last talks' />
                                    <div>אקראי</div>
                                </div>
                            </div> : null
                        }

                        < div
                            class="fav fav__subQuestion fav--blink"
                            onclick={() => {
                                vnode.state.showModal = true;

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


function sortBy(vnode) {
    const { optionId } = vnode.attrs;
    const { orderBy } = vnode.state;
    let k = [];

    let consequences = store.consequences[optionId] || [];

    switch (orderBy) {
        case 'new':
            vnode.state.consequences = consequences.sort((a, b) => b.time.seconds - a.time.seconds);
            break;
        case 'for':
            vnode.state.consequences = consequences.filter(el => el.totalWeight > 0).sort((a, b) => b.totalWeight - a.totalWeight);
            break;
        case 'against':
            vnode.state.consequences = consequences.filter(el => el.totalWeight < 0).sort((a, b) => a.totalWeight - b.totalWeight);
            break;
        case 'random':

            store.consequences[optionId] = randomizeArray(consequences);
            break;
        default:

            vnode.state.consequences = consequences.sort((a, b) => b.time.seconds - a.time.seconds);

    }

}

function consequencesExplanation(vnode) {
    switch (vnode.state.orderBy) {
        case 'new':

            return "מסודר על פי סדר הכתיבה"

        case 'for':
            return "הסברים בעד"

        case 'against':
            return "הסברים נגד"

        case 'random':

            return "מסודר אקראי"
            break;
        default:
            return ""


    }
}

function showColor(vnode) {
    switch (vnode.state.orderBy) {
        case 'new':

            return false

        case 'for':
            return true

        case 'against':
            return true

        case 'random':

            return false

        default:
            return true


    }
}
