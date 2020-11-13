import m from 'mithril';
import { get } from 'lodash';
import Sortable from "sortablejs";

//components
import './Question.css';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import SubQuestionSolution from './SubQuestionsSolution/SubQuestionSolution';
import Spinner from '../Commons/Spinner/Spinner';
import Description from './Description/Description';
import AlertsSetting from '../Commons/AlertsSetting/AlertsSetting';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTop from '../Commons/NavTop/NavTop';
import Chat from '../Commons/Chat/Chat';
import SubQuestionEditModal from './SubQuestionEditModal/SubQuestionEditModal';

//model
import store from '../../data/store';
//functions
import { getQuestionDetails, getSubQuestion, listenSubQuestions, listenToChat } from '../../functions/firebase/get/get';
import { setSubQuestionsOrder } from '../../functions/firebase/set/set';
import { deep_value, getIsChat } from '../../functions/general';

module.exports = {
    oninit: vnode => {

        const { groupId, questionId } = vnode.attrs;

        let subQuestions = get(store.subQuestions, `[${groupId}]`, [])
        subQuestions = subQuestions.sort((a, b) => a.order - b.order);

        vnode.state = {
            title: deep_value(store.questions, `${groupId}.${questionId}.title`, 'כותרת השאלה'),
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
            showModal: {
                isShow: false,
                which: 'subQuestion'
            },
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
            subPage: getIsChat() ? 'chat' : 'main'

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
        vnode.state.unsbscribe.chat = listenToChat({ groupId, questionId })

    },
    oncreate: vnode => {

        const { groupId, questionId } = vnode.attrs;

        let waitForUser = setInterval(() => {
            if ({}.hasOwnProperty.call(store.user, 'uid') && {}.hasOwnProperty.call(vnode.state, 'creatorId')) {
                console.log('staring')
                if (store.user.uid == vnode.state.creatorId) {

                    let sortOptions = document.getElementById("sortOptions");

                    let sortOptionsObj = Sortable.create(sortOptions, {
                        animation: 150,
                        onEnd: evt => {
                            //set order to DB
                            let elements = evt.target.children;
                            for (let i = 0; i < elements.length; i++) {
                                setSubQuestionsOrder(
                                    groupId,
                                    questionId,
                                    elements[i].id,
                                    i
                                );
                            }
                        }
                    });
                } else {
                    console.log('user is not admin')
                }

                clearInterval(waitForUser)

            } else {
                console.log('waiting for the user')
            }
        }, 200)

    },
    onbeforeupdate: vnode => {

        console.log(vnode)

        const { groupId, questionId } = vnode.attrs;

        vnode.state.title = deep_value(store.questions, `${groupId}.${questionId}.title`, 'כותרת השאלה');
        vnode.state.description = deep_value(store.questions, `${groupId}.${questionId}.description`, '');
        let subQuestions = get(store.subQuestions, `[${groupId}]`, [])
        vnode.state.subQuestions = subQuestions.sort((a, b) => a.order - b.order);
        let userRole = deep_value(store.questions, `${groupId}.${questionId}.roles.${store.user.uid}`, false);
        if (!userRole) {
            // the user is not a member in the question, he/she should login, and ask for
            // membership
        }

    },

    onremove: vnode => {
        if (typeof vnode.state.unsbscribe.subQuestions === 'function') {
            vnode
                .state
                .unsbscribe
                .subQuestions();
        }

        vnode.state.unsbscribe.chat()

    },
    view: vnode => {

        const { groupId, questionId } = vnode.attrs;

        return (
            <div class='page page-grid-question' style={vnode.state.subPage == 'main' ? '' : `grid-template-rows: fit-content(200px) auto`}>
                <div class='question__header'>
                    <Header
                        topic='שאלה'
                        title={vnode.state.title}
                        upLevelUrl={`/group/${vnode.attrs.groupId}`}
                        groupId={vnode.attrs.groupId}
                        showSubscribe={true}
                        questionId={vnode.attrs.questionId}
                    />
                    <NavTop level={'שאלה'} current={vnode.state.subPage} pvs={vnode.state} mainUrl={`/question/${groupId}/${questionId}`} chatUrl={`/question-chat/${groupId}/${questionId}`} ids={{ groupId, questionId }} />
                    <Description
                        title='הסבר'
                        content={vnode.state.description}
                        groupId={vnode.attrs.groupId}
                        questionId={vnode.attrs.questionId}
                        creatorId={vnode.state.creatorId}
                    />

                </div>
                {vnode.state.subPage === 'main' ?
                    <div class='question__main'>

                        <div class='wrapperSubQuestions' id='questionWrapperAll'>
                            <h1>שאלות </h1>
                            <div class='subQuestionsWrapper' id={vnode.state.creatorId === store.user.uid ? 'sortOptions' : ''}>

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
                                        showSubQuestion={subQuestion.showSubQuestion}
                                        numberOfSubquestions={vnode.state.subQuestions.length}
                                        isAlone={false}
                                        pvs={vnode.state}
                                    />)

                                })
                                }
                            </div>

                        </div>

                        {vnode.state.title === 'כותרת השאלה'
                            ? <Spinner />
                            : <div />
                        }

                    </div>
                    :
                    <Chat
                        entity='question'
                        topic='שאלה'
                        ids={{ groupId: vnode.attrs.groupId, questionId: vnode.attrs.questionId }}
                        title={vnode.state.title}
                        url={m.route.get()}
                    />
                }
                {vnode.state.subPage == 'main' ? <NavBottom /> : null}
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
                    class="fav fav__subQuestion fav--blink"
                    onclick={() => {
                        vnode.state.modalSubQuestion = { isShow: true, new: true, numberOfSubquestions: vnode.state.subQuestions.length };
                    }}>
                    <div>
                        <div>+</div>
                    </div>

                </div >
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
    // getSubQuestion('off', vnode.attrs.groupId, vnode.attrs.questionId, order);

    vnode
        .state
        .unsubscribeOptions();
    vnode.state.unsubscribeOptions = getSubQuestion('on', vnode.attrs.groupId, vnode.attrs.questionId, order);
    vnode.state.orderBy = order
}
