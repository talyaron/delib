import m from 'mithril';

//components
import './Question.css';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import SubQuestionSolution from './SubQuestionsSolution/SubQuestionSolution';
import Spinner from '../Commons/Spinner/Spinner';
import Description from './Description/Description';
// import Modal from '../Commons/Modal/Modal';
import AlertsSetting from '../Commons/AlertsSetting/AlertsSetting';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTop from '../Commons/NavTop/NavTop';
import Chat from '../Commons/Chat/Chat';

//model
import store from '../../data/store';
//functions
import { getQuestionDetails, getSubQuestion, getSubQuestions } from '../../functions/firebase/get/get';
import { deep_value, getIsChat } from '../../functions/general';

module.exports = {
    oninit: vnode => {

        vnode.state = {
            title: deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.questionId}.title`, 'כותרת השאלה'),
            addOption: false,
            callDB: true,
            subItems: {
                options: [],
                subQuestions: [],
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
            showModal: {
                isShow: false,
                which: 'subQuestion'
            },
            unsbscribe: {
                subQuestions: {}
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
            subPage: getIsChat() ? 'chat' : 'main',
        }

        //get user before login to page
        store.lastPage = '/question/' + vnode.attrs.groupId + '/' + vnode.attrs.questionId;
        sessionStorage.setItem('lastPage', store.lastPage);

        //check to see if user logged in
        if (store.user.uid == undefined) {
            m
                .route
                .set('/login');
            vnode.state.callDB = false;
        } else {
            vnode.state.callDB = true;
        }

        //propare undubscribe function for question details to be used  onremove
        vnode.state.unsubscribeQuestionDetails = getQuestionDetails(vnode.attrs.groupId, vnode.attrs.questionId, vnode);

    },
    oncreate: vnode => {

        // setWrapperFromFooter('questionFooter', 'questionWrapperAll');
        if (vnode.state.callDB) {
            //subscribe to subQuestions
            vnode.state.unsbscribe.subQuestions = getSubQuestions(vnode.attrs.groupId, vnode.attrs.questionId, vnode, true);

        }
    },
    onbeforeupdate: vnode => {

        vnode.state.title = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.questionId}.title`, 'כותרת השאלה');
        vnode.state.description = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.questionId}.description`, '');

        let userRole = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.questionId}.roles.${store.user.uid}`, false);
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

    },
    view: vnode => {

        const{groupId, questionId} = vnode.attrs;

        return (
            <div class='page page-grid-question'>
                <div class='question__header'>
                    <Header
                        topic='שאלה'
                        title={vnode.state.title}
                        upLevelUrl={`/group/${vnode.attrs.groupId}`}
                        groupId={vnode.attrs.groupId}
                        showSubscribe={true}
                        questionId={vnode.attrs.questionId}
                    />
                    <NavTop level={'שאלה'} current={vnode.state.subPage} pvs={vnode.state} mainUrl={`/question/${groupId}/${questionId}`} chatUrl={`/question-chat/${groupId}/${questionId}`} ids={{groupId, questionId}} />
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
                            <h1>תת שאלות</h1>
                            <div class='subQuestionsWrapper'>

                                {vnode
                                    .state
                                    .subQuestions
                                    .map((subQuestion, index) => {

                                        return (<SubQuestionSolution
                                            key={index}
                                            groupId={vnode.attrs.groupId}
                                            questionId={vnode.attrs.questionId}
                                            subQuestionId={subQuestion.id}
                                            orderBy={subQuestion.orderBy}
                                            title={subQuestion.title}
                                            subItems={vnode.state.subItems.options}
                                            parentVnode={vnode}
                                            info={settings.subItems.options}
                                            processType={subQuestion.processType}
                                            isAlone={false} />)
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
                        ids={{groupId:vnode.attrs.groupId, questionId:vnode.attrs.questionId}}
                        title={vnode.state.title}
                        url={m.route.get()}
                    />
                }
                <NavBottom />
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
