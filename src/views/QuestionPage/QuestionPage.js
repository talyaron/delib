import m from 'mithril';
import { get } from 'lodash';
import './QuestionPage.css';

//model
import store from '../../data/store';
import lang from '../../data/languages'
import { QUESTION } from '../../data/EntityTypes';

//components

import Header from '../Commons/Header/Header';
import SubQuestionSolution from './SubQuestionsSolution/SubQuestionSolution';
import Spinner from '../Commons/Spinner/Spinner';
import Explanation from '../Commons/Explanation/Explanation';
import AlertsSetting from '../Commons/AlertsSetting/AlertsSetting';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTopScroll from '../Commons/NavTopScroll/NavTopScroll';
import Chat from '../Commons/Chat/Chat';
import SubQuestionEditModal from './SubQuestionEditModal/SubQuestionEditModal';
import AddPanel from '../Commons/AddPanel/AddPanel';
import VoteModal from './VoteModal/VoteModal';
import Document from './Document/Document';


;
//functions
import { getQuestionDetails, getSubQuestion, getLastTimeEntered, listenToChat, listenToGroup } from '../../functions/firebase/get/get';
import { registerGroup } from '../../functions/firebase/set/set';
import { deep_value, getIsChat, concatenateDBPath, getLanguage } from '../../functions/general';
import { cssForCarousel } from '../../functions/carousel';



module.exports = {
    oninit: vnode => {

        const { groupId, questionId } = vnode.attrs;

        let subQuestions = get(store.subQuestions, `[${groupId}]`, [])
        subQuestions = subQuestions.sort((a, b) => a.order - b.order);

        vnode.state = {
            title: deep_value(store.questions, `${groupId}.${questionId}.title`, 'כותרת השאלה'),
            creatorId: deep_value(store.questions, `${groupId}.${questionId}.creatorId`, ''),
            addOption: false,
            callDB: true,
            subItems: {
                options: [],
                subQuestions,
                goals: [],
                values: []
            },
            subQuestions: [],
            add: {
                title: '',
                description: ''
            },
            orderBy: 'top',
            options: {},
            scrollY: false,
            subAnswers: {}, //used to set sub answers to each sub question
            subAnswersUnsb: {}, //used to unsubscribe
            modalSubQuestion: { isShow: false, new: true },
            openAddPanel: false,
            openVote: false,
            unsbscribe: {
                subQuestions: {},
                chat: () => { }
            },
            authorized: {
                anonymous: false,
                public: false,
                registered: false
            },
            isAlertsSetting: false,
            showModal: {
                isShow: true,
                which: 'subQuestion',
                subQuestionId: ''
            },
            showFav: true,
            subPage: getIsChat() ? 'chat' : 'main',
            unreadMessages: 0,
            lastTimeEntered: 0,
            language: 'he',
            pages: [
                { page: 'main', title: 'נושאים' },
                { page: 'document', title: 'מסמך מסכם' },
                { page: 'chat', title: 'שיחה', counter: vnode.state.unreadMessages }

            ]
        }

        //get user before login to page
        store.lastPage = '/question/' + groupId + '/' + questionId;
        sessionStorage.setItem('lastPage', store.lastPage);

        //check to see if user logged in
        if (store.user.uid == undefined) {
            m.route.set('/login');
            vnode.state.callDB = false;
        } else {
            vnode.state.callDB = true;
        }

        //propare undubscribe function for question details to be used  onremove
        vnode.state.unsubscribeQuestionDetails = getQuestionDetails(groupId, questionId, vnode); //it will then listen to subQuestions
        vnode.state.unsbscribe.chat = listenToChat({ groupId, questionId });



        registerGroup(groupId);
        listenToGroup(groupId);



    },
    oncreate: vnode => {

        const { groupId, questionId } = vnode.attrs;
        getLastTimeEntered({ groupId, questionId }, vnode);

        
        
        window.addEventListener('resize',()=>{
            document.querySelector('#carousel__main').style.gridTemplateColumns = `${cssForCarousel(vnode)}`
        })
    },
    onbeforeupdate: vnode => {



        const { groupId, questionId } = vnode.attrs;

        vnode.state.title = deep_value(store.questions, `${groupId}.${questionId}.title`, 'כותרת השאלה');
        vnode.state.creatorId = deep_value(store.questions, `${groupId}.${questionId}.creatorId`, '');
        vnode.state.description = deep_value(store.questions, `${groupId}.${questionId}.description`, '');
        let subQuestions = get(store.subQuestions, `[${groupId}]`, [])

        vnode.state.subQuestions = subQuestions.sort((a, b) => a.order - b.order);
        let userRole = deep_value(store.questions, `${groupId}.${questionId}.roles.${store.user.uid}`, false);
        if (!userRole) {
            // the user is not a member in the question, he/she should login, and ask for
            // membership
        }

        //get number of unread massages
        if (vnode.state.subPage === 'chat') {
            vnode.state.lastTimeEntered = new Date().getTime() / 1000
        }
        const path = concatenateDBPath(groupId, questionId);
        vnode.state.unreadMessages = store.chat[path].filter(m => m.createdTime.seconds > vnode.state.lastTimeEntered).length;

        //get language
        vnode.state.language = getLanguage(groupId);

    },

    onremove: vnode => {

        const { groupId, questionId } = vnode.attrs;

        if (typeof vnode.state.unsbscribe.subQuestions === 'function') {
            vnode
                .state
                .unsbscribe
                .subQuestions();
        }

        vnode.state.unsbscribe.chat();



    },
    view: vnode => {

        const vsp = vnode.state;
        const { language } = vsp;
        const { pages } = vnode.state;
        const { groupId, questionId } = vnode.attrs;

       
        return (
            <div class='page page__grid'>
                <AddPanel
                    isOpen={vsp.openAddPanel}
                    vsp={vsp}
                    buttonsObj={{
                        title: 'הוספת שאלות',
                        buttons: [
                            {
                                img: 'img/votes.svg',
                                title: 'הצבעה',
                                alt: 'votes',
                                class: 'addPanel__suggestions',
                                onClickfn: () => { vsp.openVote = true; vsp.openAddPanel = false }
                            },
                            {
                                img: 'img/suggestions.svg',
                                title: 'הצעות',
                                alt: 'add suggestions',
                                class: 'addPanel__votes',
                                onClickfn: () => { vsp.modalSubQuestion = { isShow: true, new: true, numberOfSubquestions: vsp.subQuestions.length }; vsp.openAddPanel = false }
                            }
                        ]
                    }} />

                <div class='page__header'>
                    <Header
                        name={vnode.state.title}
                        upLevelUrl={`/group/${vnode.attrs.groupId}`}
                        groupId={vnode.attrs.groupId}
                        showSubscribe={true}
                        questionId={vnode.attrs.questionId}
                        type={QUESTION}
                    />
                    <NavTopScroll level={'שאלות'}
                        pages={pages}
                        current={vnode.state.subPage}


                        pvs={vnode.state}
                        mainUrl={`/question/${groupId}/${questionId}`}
                        chatUrl={`/question-chat/${groupId}/${questionId}`}
                        ids={{ groupId, questionId }}
                    />


                </div>

                <div class='carousel' >
                    <main style={`grid-template-columns:${cssForCarousel(vnode)};`} id='carousel__main'>
                        <div class='carousel__col'>
                            {vnode.state.title === 'כותרת השאלה' ?
                                <Spinner /> :
                                <div class='wrapperSubQuestions' id='questionWrapperAll'>
                                    <Explanation description={vnode.state.description} creatorId={vnode.state.creatorId} ids={{ groupId, questionId }} type='question' />
                                    <h1>שאלות </h1>

                                    <div class='subQuestionsWrapper'>

                                        {vnode.state.subQuestions.map((subQuestion, index) => {

                                            return (<SubQuestionSolution
                                                key={subQuestion.id}
                                                creator={subQuestion.creator}
                                                groupId={vnode.attrs.groupId}
                                                questionId={vnode.attrs.questionId}
                                                subQuestionId={subQuestion.id}
                                                orderBy={subQuestion.orderBy}
                                                title={subQuestion.title}
                                                subItems={vnode.state.subItems.options}
                                                parentVnode={vnode}
                                                info={settings.subItems.options}
                                                processType={subQuestion.processType}
                                                userHaveNavigation={subQuestion.userHaveNavigation}
                                                proAgainstType={subQuestion.proAgainstType}
                                                showSubQuestion={subQuestion.showSubQuestion}
                                                numberOfSubquestions={vnode.state.subQuestions.length}
                                                isAlone={false}
                                                pvs={vnode.state}
                                            />)

                                        })
                                        }
                                    </div>

                                </div>


                            }
                        </div>
                        <Document carouselColumn={true} />

                        <Chat
                            carouselColumn={true}
                            entity='question'
                            topic='שאלה'
                            ids={{ groupId: vnode.attrs.groupId, questionId: vnode.attrs.questionId }}
                            title={vnode.state.title}
                            description={vnode.state.description}
                            language={vnode.state.language}
                            url={m.route.get()}
                        />


                    </main>
                </div>


                <div class='page__footer'>
                    <NavBottom />
                </div>
                <AlertsSetting
                    isAlertsSetting={vnode.state.isAlertsSetting}
                    title={vnode.state.title}
                    alertsSetting={[{
                        title: 'הודעות חדשות',
                        ids: {
                            groupId: vnode.attrs.groupId,
                            questionId: vnode.attrs.questionId
                        },
                        isOn: true
                    }
                    ]} />
                < div
                    class={vnode.state.showFav && vnode.state.subPage === 'main' ? "fav fav__subQuestion fav--blink" : "hidden"}
                    onclick={() => {
                        vnode.state.openAddPanel = true;
                        vnode.state.showFav = false
                        // vnode.state.modalSubQuestion = { isShow: true, new: true, numberOfSubquestions: vnode.state.subQuestions.length };
                    }}>
                    <div>
                        <div>+</div>
                    </div>

                </div >
                {vnode.state.openVote ? <VoteModal vsp={vnode.state} ids={{ groupId, questionId }} /> : null}
                {vnode.state.modalSubQuestion.isShow ?
                    <div class='background'>
                        <SubQuestionEditModal
                            subQuestion={vnode.state.modalSubQuestion}
                            pvs={vnode.state}
                            pva={vnode.attrs}
                        />
                    </div>
                    : null
                }

            </div>
        )
    }
}

function orderBy(order, vnode) {


    vnode
        .state
        .unsubscribeOptions();
    vnode.state.unsubscribeOptions = getSubQuestion('on', vnode.attrs.groupId, vnode.attrs.questionId, order);
    vnode.state.orderBy = order
}




