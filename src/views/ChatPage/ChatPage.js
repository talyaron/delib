//core
import m from 'mithril';

//Components
import Header from '../Commons/Header/Header';
import Feed from '../Commons/Feed/Feed';

//css
import './ChatPage.css';

//controls
import store from '../../data/store';
import { getQuestionDetails, getOptionDetails, getMessages } from '../../functions/firebase/get/get';
import { setMessage, addToFeed } from '../../functions/firebase/set/set';
import { deep_value, setWrapperHeight } from '../../functions/general';

//Data
import {DB} from '../../functions/firebase/config';

module.exports = {
    oninit: vnode => {

        vnode.state = {
            groupTitle: '',
            questionTitle: '',
            option: { title: '' },
            optionTitle: '',
            optionDescription: '',
            messages: [],
            messagesIds: {} // used to check if message is new
        }

        //set last page for login screen
        store.lastPage = `/optionchat/${vnode.attrs.groupId}/${vnode.attrs.questionId}/${vnode.attrs.subQuestionId}/${vnode.attrs.optionId}`;
        sessionStorage.setItem('lastPage', store.lastPage);

        //update details from DB

        vnode.state.unsbOptionDetails = getOptionDetails(vnode.attrs.groupId, vnode.attrs.questionId, vnode.attrs.subQuestionId, vnode.attrs.optionId, vnode);
        vnode.state.unsbGetMessages = getMessages(vnode.attrs.groupId, vnode.attrs.questionId, vnode.attrs.subQuestionId, vnode.attrs.optionId, vnode);


    },

    onupdate: vnode => {




        window.scrollTo(0, document.body.scrollHeight);
        setWrapperHeight('headerContainer', 'chatWrapper')

        //check if chat was changed (usualy by feed)
        if (vnode.attrs.optionId != vnode.state.previuos) {

            vnode.state.unsbOptionDetails();
            vnode.state.unsbGetMessages();

            getNamesOfQuestionAndGroup(vnode);

            vnode.state.unsbOptionDetails = getOptionDetails(vnode.attrs.groupId, vnode.attrs.questionId, vnode.attrs.subQuestionId, vnode.attrs.optionId, vnode);
            vnode.state.unsbGetMessages = getMessages(vnode.attrs.groupId, vnode.attrs.questionId, vnode.attrs.subQuestionId, vnode.attrs.optionId, vnode);

        }
        vnode.state.previuos = vnode.attrs.optionId

    },
    onremove: vnode => {

        // getQuestionDetails(vnode.attrs.groupId, vnode.attrs.questionId, vnode);
        vnode.state.unsbGetMessages();


    },
    view: vnode => {

        return (
            <div class='page'>
                <Header
                    groupId={vnode.attrs.groupId}
                    questionId={vnode.attrs.questionId}
                    subQuestionId={vnode.attrs.subQuestionId}
                    optionId={vnode.attrs.optionId}
                    groupTitle={vnode.state.groupTitle}
                    questionTitle={vnode.state.questionTitle}
                    optionTitle={vnode.state.option.title}
                    topic='אופציה'
                    title={vnode.state.option.title}
                    upLevelUrl={`/subquestions/${vnode.attrs.groupId}/${vnode.attrs.questionId}/${vnode.attrs.subQuestionId}`}
                    entityId={vnode.attrs.optionId}
                />
                <div class='chatWrapper' id='chatWrapper'>
                    <div class='chatOptionDescription'>
                        הסבר: {vnode.state.optionDescription}
                    </div>
                    {
                        vnode.state.messages.map((message, index) => {
                            return (
                                <div class={message.isNew ? 'message newMessage' : 'message'}>
                                    <span>{message.creatorName}</span>: {message.message}
                                </div>
                            )
                        })
                    }
                </div>
                <form class='chatBox'>
                    <img src='img/icons8-paper-plane-32.png' onclick={(e) => { sendMessageBtn(e, vnode) }}></img>
                    <textarea
                        class='chatInput'
                        autofocus
                        onkeyup={(e) => { sendMessageEnter(e, vnode) }}
                        value={vnode.state.input} />
                </form>
                <Feed />
            </div>
        )
    }
}

function updateDetials(vnode) {
    //update details

    // vnode.state.questionTitle = deep_value(store.questions, `[${vnode.attrs.groupId}][${vnode.attrs.questionId}].title`, 'כותרת השאלה');
    vnode.state.questionTitle = deep_value(store.questions, `[${vnode.attrs.groupId}][${vnode.attrs.questionId}].title`, 'כותרת השאלה');
    vnode.state.optionTitle = deep_value(store.optionsDetails, `[${vnode.attrs.optionId}].title`, 'כותרת האפשרות');
    vnode.state.optionDescription = deep_value(store.optionsDetails, `[${vnode.attrs.optionId}].description`, 'תאור האפשרות');
}

function sendMessageEnter(e, vnode) {
    e.preventDefault();
    vnode.state.input = e.target.value;
    //get input

    if (e.key == "Enter") {
        sendMessage(vnode)

    }

}

function sendMessageBtn(e, vnode) {
    e.stopPropagation();
    sendMessage(vnode);

}

function sendMessage(vnode) {

    let va = vnode.attrs;
    if (vnode.state.input.length > 0) {

        setMessage(
            va.groupId,
            va.questionId,
            va.subQuestionId,
            va.optionId,
            store.user.uid,
            store.user.name || 'אנונימי',
            vnode.state.input,
            vnode.state.groupTitle,
            vnode.state.questionTitle,
            vnode.state.option.title,
        )
        vnode.state.input = ''
    }
}

function getNamesOfQuestionAndGroup(vnode) {
    DB.collection('groups').doc(vnode.attrs.groupId)
        .collection('questions').doc(vnode.attrs.questionId).get().then(questionDB => {
            vnode.state.questionTitle = questionDB.data().title
        })

    DB
        .collection('groups').doc(vnode.attrs.groupId).get().then(groupDB => {
            vnode.state.groupTitle = groupDB.data().title
        })

}





