import m from 'mithril';

//components
import './Question.css';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import SubQuestion from './SubQuestions/SubQuestion';
import Spinner from '../Commons/Spinner/Spinner';
import Description from './SubSections/Description';
import Modal from '../Commons/Modal/Modal';


//model
import store from '../../data/store';
import settings from '../../data/settings';


//functions
import { getQuestionDetails, getSubQuestion, getSubItems, getSubQuestions } from '../../functions/firebase/get/get';
import { deep_value, setWrapperHeight, setWrapperFromFooter } from '../../functions/general';


module.exports = {
    oninit: vnode => {

        //get user before login to page
        store.lastPage = '/question/' + vnode.attrs.groupId + '/' + vnode.attrs.id;
        sessionStorage.setItem('lastPage', store.lastPage);


        vnode.state = {
            title: deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.id}.title`, 'כותרת השאלה'),
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
                which: ''
            },
            unsbscribe: {
                subQuestions: {}
            },
            authorized: {
                anonymous: false,
                public: false,
                registered: false
            }
        }

        //check to see if user logged in
        if (store.user.uid == undefined) {
            m.route.set('/login');
            vnode.state.callDB = false;
        } else {
            vnode.state.callDB = true;
        }

        //propare undubscribe function for question details to be used  onremove
        vnode.state.unsubscribeQuestionDetails = getQuestionDetails(vnode.attrs.groupId, vnode.attrs.id, vnode);


    },
    oncreate: vnode => {
        setWrapperHeight('questionHeadr', 'questionWrapperAll')
        setWrapperFromFooter('questionFooter', 'questionWrapperAll');
        if (vnode.state.callDB) {
            //subscribe to subItems
            vnode.state.unsbscribe.subQuestions = getSubQuestions(vnode.attrs.groupId, vnode.attrs.id, vnode, true);

        }
    },
    onbeforeupdate: vnode => {

        vnode.state.title = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.id}.title`, 'כותרת השאלה');
        vnode.state.description = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.id}.description`, '');

        let userRole = deep_value(store.questions, `${vnode.attrs.groupId}.${vnode.attrs.id}.roles.${store.user.uid}`, false);
        if (!userRole) {
            // the user is not a member in the question, he/she should login, and ask for membership
        }

    },
    onupdate: vnode => {

        setWrapperHeight('headerContainer', 'questionWrapperAll');

    },
    onremove: vnode => {
        if (typeof vnode.state.unsbscribe.subQuestions === 'function') {
            vnode.state.unsbscribe.subQuestions();
        }

        // vnode.state.unsubscribeQuestionDetails();
        // vnode.state.unsubscribeOptions();
        // vnode.state.unsubscribeQuestion();
        // vnode.state.unsubscribeGoals();
        // vnode.state.unsubscribeValues();
    },
    view: vnode => {
        
        return (
            <div>
                <div class='headerContainer' id='questionHeadr' onclick={() => { m.route.set('/group/' + vnode.attrs.groupId) }}>
                    <Header
                        topic='שאלה'
                        title={vnode.state.title}
                        upLevelUrl={`/group/${vnode.attrs.groupId}`}
                    />

                </div>
                <div class='wrapperAll' id='questionWrapperAll'>

                    <div class='wrapper'>
                        <Description
                            title='הסבר על השאלה:'
                            content={vnode.state.description}
                            groupId={vnode.attrs.groupId}
                            questionId={vnode.attrs.id}
                            creatorId={vnode.state.creatorId}
                        />
                    </div>
                    {
                        vnode.state.subQuestions.map((subQuestion, index) => {


                            return (
                                <SubQuestion
                                    groupId={vnode.attrs.groupId}
                                    questionId={vnode.attrs.id}
                                    subQuestionId={subQuestion.id}
                                    orderBy={vnode.state.orderBy}
                                    title={subQuestion.title}
                                    subItems={vnode.state.subItems.options}
                                    parentVnode={vnode}
                                    info={settings.subItems.options}
                                    processType={subQuestion.processType}
                                    isAlone={false}
                                />
                            )
                        })
                    }

                </div>

                <div class='footer' id='questionFooter'>
                    <div
                        class={vnode.state.orderBy == 'new' ? 'footerButton footerButtonSelected' : 'footerButton'}
                        onclick={() => {

                            orderBy('new', vnode)
                        }}
                    >חדש</div>
                    <div
                        class={vnode.state.orderBy == 'top' ? 'footerButton footerButtonSelected' : 'footerButton'}
                        onclick={() => {

                            orderBy('top', vnode)
                        }}
                    >Top</div>
                    <div class='footerButton'>שיחות</div>
                </div>
                {
                    vnode.state.title === 'כותרת השאלה' ?
                        <Spinner />
                        :
                        <div />
                }
                <Modal
                    showModal={vnode.state.showModal.isShow}
                    whichModal={vnode.state.showModal.which}
                    title={vnode.state.showModal.title}
                    placeholderTitle='כותרת'
                    placeholderDescription='הסבר'
                    vnode={vnode}
                />
                <Feed />
            </div>
        )
    }
}





function orderBy(order, vnode) {
    // getSubQuestion('off', vnode.attrs.groupId, vnode.attrs.id, order);

    vnode.state.unsubscribeOptions();
    vnode.state.unsubscribeOptions = getSubQuestion('on', vnode.attrs.groupId, vnode.attrs.id, order);
    vnode.state.orderBy = order
}
