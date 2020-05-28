import m from 'mithril';
import './Header.css';


//functions
import { addToFeed } from '../../../functions/firebase/set/set';
import store from '../../../data/store';
import { Reference } from '../../../functions/general';

//components
import Aside from '../Aside/Aside';

module.exports = {
    oninit: vnode => {
       
        vnode.state = {
            previousCount: 0,
            subscribed: false,
            refArray: [
                'groups', vnode.attrs.groupId,
                'questions', vnode.attrs.questionId,
                'subQuestions', vnode.attrs.subQuestionId,
                'options', vnode.attrs.optionId,
                'messages'
            ],
            refString: '',
            isMenuOpen:false
        }
        //set refernce string
        let reference = new Reference(vnode.state.refArray, 'array', 'collection');
        vnode.state.refString = reference.fromArrayToSring();

    },
    onbeforeupdate: vnode => {

        //does this feed is subscribed?
        if (store.subscribed.hasOwnProperty(vnode.state.refString)) {
            vnode.state.subscribed = true;

        } else {
            vnode.state.subscribed = false;

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
                    <div class='headerContainer' >

                        <img onclick={(e) => {
                            e.stopPropagation();
                            toggleMenu(vnode);
                        }} class='headerHamburger' src='img/icons8-menu-24.png' />
                        <div class='headerTitle'>
                            {vnode.attrs.topic}: {vnode.attrs.title}
                        </div>
                        <div
                            class='headerSetFeed'
                            onclick={(e) => {
                                e.stopPropagation();
                                subscribeToFeed(vnode);
                            }}><img src={vnode.state.subscribed ? 'img/icons8-rss-32-white.png' : 'img/icons8-rss-32-gray.png'} />
                        </div>
                        <div
                            class='headerMessage'
                            onclick={(e) => {
                                e.stopPropagation();
                                store.showFeed = !store.showFeed;
                                store.numberOfNewMessages = 0;
                            }}

                        >
                            <img src='img/icons8-secured-letter-32.png' />
                            <div
                                class='headerMesaggeCounter'
                                id='newFeedCounter'
                            > {store.numberOfNewMessages}</div>
                        </div>
                        {vnode.attrs.upLevelUrl ?
                            <div class='headerBack' onclick={(e) => {
                                e.stopPropagation();
                                m.route.set(vnode.attrs.upLevelUrl)
                            }}>
                                <img src='img/icons8-back-24.png' />
                            </div>
                            :
                            <div class='headerEmptyBack' />
                        }
                    </div>
                    {!vnode.attrs.option == undefined ?
                        <div class='chatOptionHeader'>
                            אופציה: {vnode.attrs.option}
                        </div>
                        :
                        <div />
                    }

                </header>
                <Aside isAdmin={vnode.attrs.isAdmin} editPageLink={vnode.attrs.editPageLink} />
            </div>
        )
    }
}


function onNewMessageJumpCounter(vnode) {
    if (vnode.state.previousCount != store.numberOfNewMessages) {
        document.getElementById('newFeedCounter').style.transform = 'translateY(-5px)';

        setTimeout(() => {
            document.getElementById('newFeedCounter').style.transform = 'translateY(0px)';
        }, 300)
    }
    vnode.state.previousCount = store.numberOfNewMessages
}

function subscribeToFeed(vnode) {

    if (!vnode.state.subscribed) {
        addToFeed('add',
            vnode.state.refArray,
            vnode.state.refString,
            'collection');

        vnode.state.subscribed = true;
    } else {
        addToFeed('remove',
            vnode.state.refArray,
            vnode.state.refString,
            'collection');

        vnode.state.subscribed = false;
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



