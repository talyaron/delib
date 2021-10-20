import m from 'mithril';
import "regenerator-runtime/runtime.js";
import './Header.css';
import { get } from 'lodash';

//model
import lang from '../../../data/languages'
import { GROUP, QUESTION, SUB_QUESTION, OPTION } from '../../../data/EntityTypes';


//functions
import { subscribeUser, setNotifications } from '../../../functions/firebase/set/setChats';
import { listenToSubscription, listenIfGetsMessages } from '../../../functions/firebase/get/get';
import { subscribeToNotification } from '../../../functions/firebase/messaging';
import { exitOut } from '../../../functions/animations';

import store from '../../../data/store';
import { Reference, concatentPath, getEntityId, getUser } from '../../../functions/general';

//components
import Aside from '../Aside/Aside';


let entityId = '';

module.exports = {
    oninit: vnode => {

        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;


        entityId = getEntityId({ groupId, questionId, subQuestionId, optionId });

        vnode.state = {
            previousCount: 0,
            refArray: [
                'groups',
                groupId,
                'questions',
                questionId,
                'subQuestions',
                subQuestionId,
                'options',
                optionId,
                'messages'
            ],
            refString: '',
            isMenuOpen: false,
            subscribed: false,
            notifications: get(store.listenToMessages, `[${entityId}]`, false),
            path: concatentPath(groupId, questionId, subQuestionId, optionId),
            language: 'he'
        }
        //set refernce string
        let reference = new Reference(vnode.state.refArray, 'array', 'collection');
        vnode.state.refString = reference.fromArrayToSring();

        // on groups, check for subscription
        (async () => {
            await getUser();

            if (groupId !== undefined) {

                await listenToSubscription(vnode.state.path);

                vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false);

                listenIfGetsMessages({ groupId, questionId, subQuestionId, optionId })

            }
        })();



    },
    onbeforeupdate: vnode => {

        if ({}.hasOwnProperty.call(store.subscribe, vnode.state.path)) {
            vnode.state.subscribed = store.subscribe[vnode.state.path];
        }

        vnode.state.notifications = get(store.listenToMessages, `[${entityId}]`, false);
    },
    onupdate: vnode => {

        //make counter jump if new message
        onNewMessageJumpCounter(vnode);


    },
    view: (vnode) => {
        const { name, notifications } = vnode.attrs
        vnode.state.isMenuOpen;
        const language = vnode.attrs.language || 'he';

        return (

            <header id='headerContainer'>
                <div class='header__title'>

                    <img src={entityIcon(vnode)} /><div>{name}</div>

                </div>
                <div class='header__nav'>

                    <img
                        onclick={(e) => toggleMenu(e, vnode)}
                        class='headerHamburger'
                        src='img/hamburger.svg' alt='menu' />
                    <div class='header__wrap'>
                        <div class='header__notifications'>
                            {notifications !== false ?
                                vnode.state.notifications ?
                                    <div class='notifications notifications--on' onclick={() => { handleNotifications(false, vnode) }}>
                                        <img src='img/notifications-on.svg' alt='notifications-on' />
                                    </div>
                                    :
                                    <div class='notifications notifications--off' onclick={() => { handleNotifications(true, vnode) }}>
                                        <img src='img/add_alert.svg' alt='notifications-off' />
                                    </div>
                                :
                                null
                            }
                            {vnode.attrs.showSubscribe == true ?
                                <div
                                    class='headerSetFeed'
                                    onclick={e => {
                                        e.stopPropagation();
                                        handleSubscription(vnode);
                                    }}>
                                    {vnode.state.subscribed ? <div class='setButton setButton--cancel'>{lang[language].unfollow}</div> : <div class='setButton setButton--activate'>{lang[language].follow}</div>}
                                </div>
                                :
                                null
                            }
                        </div>
                        {vnode.attrs.upLevelUrl
                            ? <div
                                class='headerBack'
                                onclick={e => handleBack(e, vnode)}>
                                <img src='img/back.svg' />
                            </div>
                            : <div class='headerEmptyBack' />
                        }
                    </div>
                </div>
                {!vnode.attrs.option == undefined
                    ? <div class='chatOptionHeader'>
                        אופציה: {vnode.attrs.option}
                    </div>
                    : null
                }

                <Aside isAdmin={vnode.attrs.isAdmin} editPageLink={vnode.attrs.editPageLink} isOpen={vnode.state.isMenuOpen} />
            </header>




        )
    }
}

function handleNotifications(setNotificationTo, vnode) {
    vnode.state.notifications = setNotificationTo;

    const ids = {}
    const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;
    if (groupId !== undefined) { ids.groupId = groupId };
    if (questionId !== undefined) { ids.questionId = questionId };
    if (subQuestionId !== undefined) { ids.subQuestionId = subQuestionId };
    if (optionId !== undefined) { ids.optionId = optionId };



    subscribeToNotification(ids, setNotificationTo);
    subscribeUser({ subscribe: !setNotificationTo, groupId, questionId, subQuestionId, optionId })


}

function onNewMessageJumpCounter(vnode) {
    if (vnode.state.previousCount != store.numberOfNewMessages) {
        document
            .getElementById('newFeedCounter')
            .style
            .transform = 'translateY(-5px)';

        setTimeout(() => {
            document
                .getElementById('newFeedCounter')
                .style
                .transform = 'translateY(0px)';
        }, 300)
    }
    vnode.state.previousCount = store.numberOfNewMessages
}



function toggleMenu(e, vnode) {
    e.stopPropagation();
    vnode.state.isMenuOpen = !vnode.state.isMenuOpen
}

function handleSubscription(vnode) {

    try {

        //path for subscription object
        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;
        console.log(groupId, questionId, subQuestionId, optionId)
        const path = concatenateDBPath(groupId, questionId, subQuestionId, optionId);

        console.log('subscribed:', vnode.state.subscribed)

        subscribeUser({
            groupId, questionId, subQuestionId, optionId, subscribe: vnode.state.subscribed
        })

        if (vnode.state.subscribed == false) {

            vnode.state.subscribed = true;
            set(store.subscribe, `[${path}]`, true)
        } else {

            vnode.state.subscribed = false;
            set(store.subscribe, `[${path}]`, false)
        }
    } catch (e) {
        console.error(e)
    }
}

function handleBack(e, vnode) {

    e.stopPropagation();
    if (vnode.attrs.page) {
        const page = vnode.attrs.page.dom;

        exitOut(page, vnode.attrs.upLevelUrl)
    } else {
        m.route.set(vnode.attrs.upLevelUrl)
    }


}

function entityIcon(vnode) {
    const { type } = vnode.attrs;

    switch (type) {
        case GROUP:
            return 'img/iconfinder_vector_881_17_3914264.svg';
        case QUESTION:
            return 'img/focus.svg';
        case SUB_QUESTION:
            return 'img/question.svg';
        case OPTION:
            return 'img/iconfinder__Arrows_circle_decision_direction_motion_options_7316445.svg'
        default:
            return 'img/logo-48px.png';
    }
}
