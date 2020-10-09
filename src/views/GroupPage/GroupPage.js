import m from 'mithril';
import { get } from 'lodash';

import { deep_value, setWrapperHeight } from '../../functions/general';
import store from '../../data/store';


//components
import './GroupPage.css';
import Group from './Group/Group';
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';
import Edit from '../Commons/Edit/Edit';
import NavBottom from '../Commons/NavBottom/NavBottom';
import NavTop from '../Commons/NavTop/NavTop';


//functions
import { createQuestion } from '../../functions/firebase/set/set';
import { getQuestions, getGroupDetails } from '../../functions/firebase/get/get';
import { setLastPage } from '../../functions/general';

module.exports = {
    oninit: vnode => {
        setLastPage();

        vnode.state = {
            add: {
                title: '',
                description: ''
            },
            isAdmin: false,
            edit: true,
            addQuestion: false,
            questions: [],
            unsubscribe: {},
            groupName: get(store, 'groups[' + vnode.attrs.id + '].title', 'שם הקבוצה')
        }

        getQuestions('on', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails = getGroupDetails(vnode.attrs.id, vnode);
    },
    oncreate: vnode => {
        setWrapperHeight('headerContainer', 'groupWrapper');
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
        setWrapperHeight('headerContainer', 'groupWrapper');
    },
    onremove: vnode => {
        getQuestions('off', vnode.attrs.id, vnode);
        vnode.state.undbGroupDetails();
    },
    view: vnode => {

        return (
            <div class='page'>
                <div class='page-grid'>
                    <Header
                        upLevelUrl='/groups'
                        topic='קבוצה'
                        title={vnode.state.groupName}
                        isAdmin={vnode.state.isAdmin}
                        editPageLink={`/editgroup/${vnode.attrs.id}`}
                        groupId={vnode.attrs.id}
                        showSubscribe={true}
                    />
                    <NavTop level={'קבוצה'} current='main' />
                    <div class='questionsWrapper' id='groupWrapper'>
                        {
                            vnode.state.questions.map((question, key) => {

                                return (
                                    <Group
                                        route={'/question/' + vnode.attrs.id + '/'}
                                        question={question}
                                        key={key}
                                    />
                                )
                            })
                        }
                    </div>
                    <div class='fav' onclick={() => { toggleAddQuestion(vnode) }} >
                        <div>+</div>
                    </div>
                    <NavBottom />
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