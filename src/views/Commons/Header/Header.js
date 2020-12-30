import m, { jsonp } from 'mithril';
import "regenerator-runtime/runtime.js";
import './Header.css';
import { get, set } from 'lodash';

//functions
import { subscribeUser, setNotifications } from '../../../functions/firebase/set/set';
import { listenToSubscription, listenIfGetsMessages } from '../../../functions/firebase/get/get';
import { subscribeToNotification } from '../../../functions/firebase/messaging';
import { exitOut } from '../../../functions/animations';

import store from '../../../data/store';
import { Reference, concatenateDBPath, getEntityId } from '../../../functions/general';

//components
import Aside from '../Aside/Aside';

function getUser() {

    return new Promise((resolve, reject) => {
        const int = setInterval(() => {
            if ({}.hasOwnProperty.call(store.user, 'uid')) {
                resolve(store.user)
                clearInterval(int)
            }

        }, 100)
    })
}
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
            path: concatenateDBPath(groupId, questionId, subQuestionId, optionId)
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

        vnode.state.isMenuOpen

        return (
            <div>
                <header id='headerContainer'>
                    <div class='headerContainer'>

                        <img
                            onclick={(e) => {
                                e.stopPropagation();
                                toggleMenu(vnode);
                            }}
                            class='headerHamburger'
                            src='img/hamburger.svg' />

                        <div class='headerTitle'>
                            {vnode.attrs.title}
                        </div>
                        {vnode.state.notifications ?
                            <div class='notifications notifications--on' onclick={() => { handleNotifications(false, vnode) }}>
                                <img src='img/notifications-on.svg' alt='notifications-on' />
                            </div>
                            :
                            <div class='notifications notifications--off' onclick={() => { handleNotifications(true, vnode) }}>
                                <img src='img/add_alert.svg' alt='notifications-off' />
                            </div>
                        }
                        {vnode.attrs.showSubscribe == true ?
                            <div
                                class='headerSetFeed'
                                onclick={e => {
                                    e.stopPropagation();
                                    handleSubscription(vnode);
                                }}>
                                {vnode.state.subscribed ? <div class='setButton setButton--cancel'>ביטול הרשמה</div> : <div class='setButton setButton--activate'>הרשמה</div>}
                            </div>
                            :
                            null
                        }

                        {vnode.attrs.upLevelUrl
                            ? <div
                                class='headerBack'
                                onclick={(e) => {
                                    e.stopPropagation();
                                    if (vnode.attrs.page) {
                                        const page = vnode.attrs.page.dom;
                                        
                                        exitOut(page, vnode.attrs.upLevelUrl)
                                    } else {
                                        m.route.set(vnode.attrs.upLevelUrl)
                                    }

                                }}>
                                <img src='img/back.svg' />
                            </div>
                            : <div class='headerEmptyBack' />
                        }
                    </div>
                    {!vnode.attrs.option == undefined
                        ? <div class='chatOptionHeader'>
                            אופציה: {vnode.attrs.option}
                        </div>
                        : <div />
                    }

                </header>

                <Aside isAdmin={vnode.attrs.isAdmin} editPageLink={vnode.attrs.editPageLink} isOpen={vnode.state.isMenuOpen} />

            </div>
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



    subscribeToNotification(ids, setNotificationTo)


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

function handleSubscription(vnode) {

    //path for subscription object
    const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;
    const path = concatenateDBPath(groupId, questionId, subQuestionId, optionId);

    subscribeUser({
        vnode,
        subscribe: vnode.state.subscribed
    })

    if (vnode.state.subscribed == false) {

        vnode.state.subscribed = true;
        set(store.subscribe, `[${path}]`, true)
    } else {

        vnode.state.subscribed = false;
        set(store.subscribe, `[${path}]`, false)
    }
}

function toggleMenu(vnode) {

    vnode.state.isMenuOpen = !vnode.state.isMenuOpen
}
