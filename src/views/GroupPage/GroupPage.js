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


//functions
import { createQuestion } from '../../functions/firebase/set/set';
import { getQuestions, getGroupDetails,listenToChat } from '../../functions/firebase/get/get';
import { setLastPage,getIsChat } from '../../functions/general';

module.exports = {

    oninit: vnode => {
        setLastPage();

        
        

        vnode.state = {
            add: {
                title: '',
                description: ''
            },
            subPage: getIsChat()?'chat':'main',
            isAdmin: false,
            edit: true,
            addQuestion: false,
            questions: [],
            unsubscribe: {},
            groupName: get(store, 'groups[' + vnode.attrs.id + '].title', 'שם הקבוצה')
            
        }
        
        getQuestions('on', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails = getGroupDetails(vnode.attrs.id, vnode);


       vnode.state.unsubscribe.chat = listenToChat({groupId:vnode.attrs.id});

            
            
    },
    onbeforeupdate: vnode => {
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


    },
    onupdate: vnode => {

    },
    onremove: vnode => {
        getQuestions('off', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails();
        vnode.state.unsubscribe.chat();
    },
    view: vnode => {

        return (
            <div class='page'>
                <div class='page-grid' style= {vnode.state.subPage == 'main' ?'':`grid-template-rows: 52px 40px auto;`}>
                    <Header
                        upLevelUrl='/groups'
                        topic='קבוצה'
                        title={vnode.state.groupName}
                        isAdmin={vnode.state.isAdmin}
                        editPageLink={`/editgroup/${vnode.attrs.id}`}
                        groupId={vnode.attrs.id}
                        showSubscribe={true}
                    />
                    <NavTop level={'קבוצה'} current={vnode.state.subPage} pvs={vnode.state} mainUrl={`/group/${vnode.attrs.id}`} chatUrl={`/group-chat/${vnode.attrs.id}`} ids={{groupId:vnode.attrs.id}}/>
                    {vnode.state.subPage == 'main' ?
                        <div class='questionsWrapper' id='groupWrapper'>
                            {
                                vnode.state.questions.map((question, key) => {

                                    return (
                                        <QuestionCard
                                            route={'/question/' + vnode.attrs.id + '/'}
                                            question={question}
                                            key={key}
                                        />
                                    )
                                })
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
                    {vnode.state.subPage == 'main' ?<NavBottom />:null}
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
                            <div />
                    }
                </div >
            </div>

        )
    }
}


function toggleAddQuestion(vnode) {
    vnode.state.addQuestion = !vnode.state.addQuestion;
}