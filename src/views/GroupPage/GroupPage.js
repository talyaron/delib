import m from 'mithril';
import { get } from 'lodash';

// data
import store from '../../data/store';
import lang from '../../data/languages';
import { GROUP } from '../../data/EntityTypes';


//components
import './GroupPage.css';
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import Explanation from '../Commons/Explanation/Explanation';
import NavTop from '../Commons/NavTop/NavTop';
import Chat from '../Commons/Chat/Chat';
import Spinner from '../Commons/Spinner/Spinner';
import AddPanel from '../Commons/AddPanel/AddPanel';
import Headers from './Headers/Headers';
import GroupSection from './GroupSection/GroupSection';


//functions
import {registerGroup } from '../../functions/firebase/set/set';
import { createQuestion } from '../../functions/firebase/set/setQuestion';
import { getQuestions, listenToGroupDetails, listenToChat, getLastTimeEntered } from '../../functions/firebase/get/get';
import { listenToGroupSections } from '../../functions/firebase/get/getGroup';
import { setLastPage, getIsChat, concatenateDBPath } from '../../functions/general';



let unsubscruibeTitles = () => { }


module.exports = {

    oninit: vnode => {
        const { id } = vnode.attrs;
        let groupId = id;
        let afterLogin = true;

        setLastPage();

        if (store.user.uid == undefined) {
            afterLogin = false
            m
                .route
                .set('/login');
            vnode.state.callDB = false;
        }


        vnode.state = {
            add: {
                title: '',
                description: ''
            },
            title:'',
            description:'',
            subPage: getIsChat() ? 'chat' : 'main',
            isAdmin: false,
            edit: true,
            addQuestion: false,
            questions: [false],
            unsubscribe: {},
            groupName: get(store, 'groups[' + vnode.attrs.id + '].title', 'שם הקבוצה'),
            unreadMessages: 0,
            lastTimeEntered: 0,
            language: 'he',
            openAddPanel: false,
            openHeadersPanel: false
        }



        getQuestions('on', vnode.attrs.id, vnode);
        listenToGroupDetails(vnode.attrs.id, vnode);
        if (afterLogin) {
            unsubscruibeTitles = listenToGroupSections(groupId);
        }

        vnode.state.unsubscribe.chat = listenToChat({ groupId: vnode.attrs.id });



    },
    oncreate: vnode => {
        const { id } = vnode.attrs;
        let groupId = id;
        getLastTimeEntered({ groupId }, vnode);



    },
    onbeforeupdate: vnode => {

        const { id } = vnode.attrs;
        let groupId = id;



        //check is admin
        vnode.state.isAdmin = (store.user.uid == get(store, 'groups[' + vnode.attrs.id + '].creatorId', 'aaaaa'));

        //update name of group
        vnode.state.groupName = get(store, 'groups[' + vnode.attrs.id + '].title', 'שם הקבוצה');
        document.title = `דליב - ${vnode.state.groupName}`

        //update array of questions
        let questionsArray = [];
        for (let i in store.questions[vnode.attrs.id]) {
            questionsArray.push(store.questions[vnode.attrs.id][i]);
        }
        vnode.state.questions = questionsArray;


        //get number of unread massages
        if (vnode.state.subPage === 'chat') {
            vnode.state.lastTimeEntered = new Date().getTime() / 1000
        }


        const path = concatenateDBPath(groupId);
        vnode.state.unreadMessages = store.chat[path].filter(m => {

            return m.createdTime.seconds > vnode.state.lastTimeEntered
        }).length;


        //register to DB
        registerGroup(groupId)

        //get language
        vnode.state.language = get(store.groups, `[${groupId}].language`, 'he')
        vnode.state.description = get(store.groups, `[${groupId}].description`, '');

    },

    onremove: vnode => {
        const { id } = vnode.attrs;
        let groupId = id;

        getQuestions('off', groupId, vnode);

        vnode.state.unsubscribe.chat();

        unsubscruibeTitles();

    },
    view: vnode => {
        const groupId = vnode.attrs.id
        const vsp = vnode.state;
        const { language } = vsp;
        let titles = store.groupSections[groupId] || [];


        return (
            <div class='page'>

                <div class='page__grid'>
                    <div class='page__header'>
                        <AddPanel isOpen={vsp.openAddPanel}
                            vsp={vsp}
                            buttonsObj={{
                                title: 'הוספה',
                                buttons: [
                                    {
                                        img: 'img/focus-white.svg',
                                        title: 'נושאים',
                                        alt: 'votes',
                                        class: 'addPanel__suggestions addPanel__images',
                                        onClickfn: () => { vsp.openAddPanel = false; vsp.addQuestion = true }
                                    },
                                    {
                                        img: 'img/header-2-gray.png',
                                        title: 'כותרות',
                                        alt: 'add sections',
                                        class: 'addPanel__headers addPanel__images',
                                        onClickfn: () => { vsp.openAddPanel = false; vsp.openHeadersPanel = true}
                                    }
                                ]
                            }} />
                        <Header
                            upLevelUrl='/groups'
                            topic={lang[language].groupTitle}
                            title={lang[language].groupTitle}
                            isAdmin={vnode.state.isAdmin}
                            editPageLink={`/editgroup/${vnode.attrs.id}`}
                            groupId={vnode.attrs.id}
                            showSubscribe={true}
                            language={language}
                            name={vnode.state.groupName}
                            type={GROUP}
                        />
                        <NavTop
                            level={lang[language].groupTopics}
                            current={vnode.state.subPage}
                            pvs={vnode.state}
                            mainUrl={`/group/${vnode.attrs.id}`}
                            chatUrl={`/group-chat/${vnode.attrs.id}`}
                            ids={{ groupId: vnode.attrs.id }}
                            unreadMessages={vnode.state.unreadMessages}
                            chat={lang[language].chat}
                        />

                    </div>
                    {vnode.state.subPage == 'main' ?

                        <div class='questionsWrapper' id='groupWrapper' style={`direction:${lang[language].dir}`}>
                            <Explanation description={vnode.state.description} type='group' />
                            {vnode.state.openHeadersPanel ? <Headers groupId={vnode.attrs.id} vsp={vsp} /> : null}
                            <h1>{lang[language].groupTopics}</h1>
                            {vnode.state.questions[0] === false ?
                                <Spinner />
                                :
                                <div class='questionsWrapper__inear'>
                                    {sortedTitles(titles, 'order').map(section => {
                                        return <GroupSection key={section.groupTitleId} section={section} questions={vnode.state.questions} groupId={vnode.attrs.id} />
                                    })}
                                    <GroupSection title={false} questions={vnode.state.questions} groupId={vnode.attrs.id} />

                                </div>
                            }
                        </div>

                        :
                        <Chat
                            entity='group'
                            topic='קבוצה'
                            ids={{ groupId: vnode.attrs.id }}
                            title={vnode.state.groupName}
                            description={vnode.state.description}
                            language={vnode.state.language}
                            url={m.route.get()}
                        />
                    }
                    <div class='page__footer'>
                        {vnode.state.subPage == 'main' ?
                            <div class='fav' onclick={() => { vnode.state.openAddPanel = true }} >
                                <div>+</div>
                            </div>
                            : null
                        }
                        {vnode.state.subPage == 'main' ? <NavBottom /> : null}
                        {
                            vnode.state.addQuestion ?
                                <div class='module'>
                                    <div class='moduleBox'>
                                        <h2 class='moduleTitle'>הוספת נושא</h2>
                                        <div class='moduleInputs'>
                                            <textarea
                                                class='inputGeneral'
                                                autofocus='true'
                                                placeholder='כותרת הנושא'
                                                onkeyup={(e) => { vnode.state.add.title = e.target.value }}
                                            ></textarea>
                                            <textarea
                                                class='inputGeneral'
                                                placeholder='הסבר על הנושא'
                                                onkeyup={(e) => { vnode.state.add.description = e.target.value }}
                                            ></textarea>
                                        </div>
                                        <div class='moduleButtons'>
                                            <div class='buttons confirm' onclick={() => {
                                                vnode.state.addQuestion = !vnode.state.addQuestion;
                                                createQuestion(vnode.attrs.id, store.user.uid, vnode.state.add.title, vnode.state.add.description)
                                            }}>הוספה</div>
                                            <div class='buttons cancel' onclick={() => { toggleAddQuestion(vnode) }}>ביטול</div>
                                        </div>
                                    </div>
                                </div>
                                :
                                null
                        }
                    </div>
                </div >
            </div>

        )
    }
}


function toggleAddQuestion(vnode) {
    vnode.state.addQuestion = !vnode.state.addQuestion;
}

function sortedTitles(titles, sortBy) {
    try {

        if (!Array.isArray(titles)) throw new Error`titles is not array: ${JSON.stringify(titles)}`;
        if (!sortBy) throw new Error`orderBy is empty`;

        switch (sortBy) {
            case 'order':
                return titles.sort((a, b) => a.order - b.order);
            default:
                return titles
        }

    } catch (e) {
        console.error(e)
        return []
    }

}