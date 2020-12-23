import m from 'mithril';
import { get } from 'lodash';

import { deep_value, setWrapperHeight } from '../../functions/general';
import store from '../../data/store';


//components
import './GroupPage.css';
import QuestionCard from './QuestionCard/QuestionCard';
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTop from '../Commons/NavTop/NavTop';
import Chat from '../Commons/Chat/Chat';
import Spinner from '../Commons/Spinner/Spinner';


//functions
import { createQuestion, setChatLastEntrance } from '../../functions/firebase/set/set';
import { getQuestions, getGroupDetails, listenToChat, getLastTimeEntered } from '../../functions/firebase/get/get';
import { setLastPage, getIsChat, concatenateDBPath} from '../../functions/general';




module.exports = {

    oninit: vnode => {
        setLastPage();

        if (store.user.uid == undefined) {
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
            subPage: getIsChat() ? 'chat' : 'main',
            isAdmin: false,
            edit: true,
            addQuestion: false,
            questions: [false],
            unsubscribe: {},
            groupName: get(store, 'groups[' + vnode.attrs.id + '].title', 'שם הקבוצה'),
            unreadMessages: 0,
            lastTimeEntered:0
        }

        getQuestions('on', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails = getGroupDetails(vnode.attrs.id, vnode);


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
            console.log( m.createdTime.seconds , vnode.state.lastTimeEntered,  m.createdTime.seconds > vnode.state.lastTimeEntered)
            return m.createdTime.seconds > vnode.state.lastTimeEntered}).length;
    },
    onupdate: vnode => {

    },
    onremove: vnode => {
        const { id } = vnode.attrs;
        let groupId = id;

        getQuestions('off', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails();
        vnode.state.unsubscribe.chat();

        setChatLastEntrance({ groupId })
        
    },
    view: vnode => {



        return (
            <div class='page'>
                <div class='page-grid' style={vnode.state.subPage == 'main' ? '' : `grid-template-rows: 52px 40px;`}>
                    <Header
                        upLevelUrl='/groups'
                        topic='קבוצה'
                        title='קבוצה'
                        isAdmin={vnode.state.isAdmin}
                        editPageLink={`/editgroup/${vnode.attrs.id}`}
                        groupId={vnode.attrs.id}
                        showSubscribe={true}
                    />
                    <NavTop
                        level={'נושאים שונים של הקבוצה'}
                        current={vnode.state.subPage}
                        pvs={vnode.state}
                        mainUrl={`/group/${vnode.attrs.id}`}
                        chatUrl={`/group-chat/${vnode.attrs.id}`}
                        ids={{ groupId: vnode.attrs.id }}
                        unreadMessages={vnode.state.unreadMessages}
                    />


                    {vnode.state.subPage == 'main' ?

                        <div class='questionsWrapper' id='groupWrapper'>
                            <div class='title'>קבוצה: {vnode.state.groupName}</div>
                            <h1>נושאים שונים של הקבוצה</h1>
                            {vnode.state.questions[0] === false ?
                                <Spinner />
                                :
                                <div class='questionsWrapper__inear'>
                                    {vnode.state.questions.map((question, key) => {

                                        return (
                                            <QuestionCard
                                                route={'/question/' + vnode.attrs.id + '/'}
                                                question={question}
                                                key={key}
                                            />
                                        )
                                    })}
                                </div>
                            }
                        </div>

                        :
                        <Chat
                            entity='group'
                            topic='קבוצה'
                            ids={{ groupId: vnode.attrs.id }}
                            title={vnode.state.groupName}
                            url={m.route.get()}
                        />
                    }
                    {vnode.state.subPage == 'main' ?
                        <div class='fav' onclick={() => { toggleAddQuestion(vnode) }} >
                            <div>+</div>
                        </div>
                        : null
                    }
                    {vnode.state.subPage == 'main' ? <NavBottom /> : null}
                    {
                        vnode.state.addQuestion ?
                            <div class='module'>
                                <div class='moduleBox'>
                                    <div class='moduleTitle'>הוספת שאלה</div>
                                    <div class='moduleInputs'>
                                        <textarea
                                            class='moduleQuestionTitle'
                                            autofocus='true'
                                            placeholder='כותרת השאלה'
                                            onkeyup={(e) => { vnode.state.add.title = e.target.value }}
                                        ></textarea>
                                        <textarea
                                            class='moduleQuestionTitle moduleDescription'
                                            placeholder='הסבר על השאלה'
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
                </div >
            </div>

        )
    }
}


function toggleAddQuestion(vnode) {
    vnode.state.addQuestion = !vnode.state.addQuestion;
}