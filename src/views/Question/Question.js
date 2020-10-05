import m from 'mithril';

//components
import './Question.css';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import SubQuestion from './SubQuestions/SubQuestion';
import Spinner from '../Commons/Spinner/Spinner';
import Description from './SubSection/Description';
import Modal from '../Commons/Modal/Modal';
import AlertsSetting from '../Commons/AlertsSetting/AlertsSetting';

//model
import store from '../../data/store';
// import settings from '../../data/settings'; functions
import {getQuestionDetails, getSubQuestion, getSubQuestions} from '../../functions/firebase/get/get';
import {deep_value, setWrapperHeight, setWrapperFromFooter} from '../../functions/general';

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
            }
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
        setWrapperHeight('questionHeadr', 'questionWrapperAll')
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
    onupdate: vnode => {

        setWrapperHeight('headerContainer', 'questionWrapperAll');

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

        return (
            <div>
                <div
                    class='headerContainer'
                    id='questionHeadr'
                    onclick={() => {
                    m
                        .route
                        .set('/group/' + vnode.attrs.groupId)
                }}>
                    <Header
                        topic='שאלה'
                        title={vnode.state.title}
                        upLevelUrl={`/group/${vnode.attrs.groupId}`}
                        groupId={vnode.attrs.groupId}
                        showSubscribe={true}
                        questionId={vnode.attrs.questionId}/>
                        

                </div>
                <div class='wrapperSubQuestions' id='questionWrapperAll'>

                    <div class='wrapper'>
                        <Description
                            title='הסבר על השאלה:'
                            content={vnode.state.description}
                            groupId={vnode.attrs.groupId}
                            questionId={vnode.attrs.questionId}
                            creatorId={vnode.state.creatorId}/>
                    </div>
                    <div class='subQuestionsWrapper'>
                        {vnode
                            .state
                            .subQuestions
                            .map((subQuestion, index) => {

                                return (<SubQuestion
                                    groupId={vnode.attrs.groupId}
                                    questionId={vnode.attrs.questionId}
                                    subQuestionId={subQuestion.id}
                                    orderBy={subQuestion.orderBy}
                                    title={subQuestion.title}
                                    subItems={vnode.state.subItems.options}
                                    parentVnode={vnode}
                                    info={settings.subItems.options}
                                    processType={subQuestion.processType}
                                    isAlone={false}/>)
                            })
}
                    </div>

                </div>

                {vnode.state.title === 'כותרת השאלה'
                    ? <Spinner/>
                    : <div/>
}
                {/* <Modal
                    showModal={vnode.state.showModal.isShow}
                    whichModal={vnode.state.showModal.which}
                    title={vnode.state.showModal.title}
                    placeholderTitle='כותרת'
                    placeholderDescription='הסבר'
                    vnode={vnode}
                    id={vnode.attrs.questionId}
                /> */}
                <Feed/>
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
                ]}/>
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
