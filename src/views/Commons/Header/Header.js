import m from 'mithril';
import "regenerator-runtime/runtime.js";
import './Header.css';
import { get, set } from 'lodash';

//functions
import { subscribersCUD } from '../../../functions/firebase/set/set';
import { listenToSubscription } from '../../../functions/firebase/get/get';

import store from '../../../data/store';
import { Reference, concatenatePath } from '../../../functions/general';

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

module.exports = {
    oninit: vnode => {

        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs;

        vnode.state = {
            previousCount: 0,
            subscribed: false,
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
            path: concatenatePath(groupId, questionId, subQuestionId, optionId)
        }
        //set refernce string
        let reference = new Reference(vnode.state.refArray, 'array', 'collection');
        vnode.state.refString = reference.fromArrayToSring();

        // on groups, check for subscription
        (async () => {
            await getUser();

            if (groupId !== undefined) {

                vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false)
                listenToSubscription(vnode.state.path)
            }
        })();

    },
    onbeforeupdate: vnode => {

        if ({}.hasOwnProperty.call(store.subscribe, vnode.state.path)) {
            vnode.state.subscribed = store.subscribe[vnode.state.path];
        }
    },
    onupdate: vnode => {

        //make counter jump if new message
        onNewMessageJumpCounter(vnode);

    },
    view: (vnode) => {

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

                        {vnode.attrs.showSubscribe == true ?
                            <div
                                class='headerSetFeed'
                                onclick={e => {
                                    e.stopPropagation();
                                    handleSubscription(vnode);
                                }}>
                                {vnode.state.subscribed ? <div class='setButton setButton--activate'>הרשמה</div> : <div class='setButton setButton--cancel'>ביטול הרשמה</div>}
                            </div>
                            :
                            null
                        }
                        {vnode.attrs.upLevelUrl
                            ? <div
                                class='headerBack'
                                onclick={(e) => {
                                    e.stopPropagation();
                                    m
                                        .route
                                        .set(vnode.attrs.upLevelUrl)
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
                <Aside isAdmin={vnode.attrs.isAdmin} editPageLink={vnode.attrs.editPageLink} />
            </div>
        )
    }
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
    const path = concatenatePath(groupId, questionId, subQuestionId, optionId);

    subscribersCUD({
        vnode,
        subscribe: !vnode.state.subscribed
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
    const aside = document.getElementById('aside');

    if (vnode.state.isMenuOpen) {
        //close menu
        aside.style.right = '-260px';
    } else {
        //open menu
        aside.style.right = '0px';
    }

    vnode.state.isMenuOpen = !vnode.state.isMenuOpen
}
