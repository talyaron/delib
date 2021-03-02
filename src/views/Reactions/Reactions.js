import m from 'mithril';
import './Reactions.css';

//model
import store from '../../data/store';

//functions
import { listenToReactions } from '../../functions/firebase/get/getQuestions';

//components
import Header from '../Commons/Header/Header';
import ReactionsMenu from './ReactionsMenu/ReactionsMenu';
import ReactionsBars from './ReactionsBars/ReactionsBars';

let unsubscribe = () => { };

module.exports = {
    oninit: vnode => {
        const { groupId, questionId } = vnode.attrs;

        //get user before login to page
        store.lastPage = `/reactions/${groupId}/${questionId}`;
        sessionStorage.setItem('lastPage', store.lastPage);

        console.log('on init .... listen......')
        unsubscribe = listenToReactions({ groupId, questionId });

        vnode.state = {
            reactions: [
                { img: 'edit.svg', value: 1, text: 'like', type: 'testType1', pressed: false },
                { img: 'edit.svg', value: 1, text: 'intresting', type: 'testType2', pressed: false },
                { img: 'edit.svg', value: -1, text: 'focus', type: 'testType3', pressed: false },
                { img: 'edit.svg', value: -1, text: 'stop', type: 'testType4', pressed: false }
            ]
        }

    },

    onremove: vnode => {
        console.log('...... unsubscribe......')
        unsubscribe();
    },
    view: (vnode) => {
        const { groupId, questionId } = vnode.attrs;
        const reactions = store.reactions[questionId] || [];

        return (
            <div class='page page__grid'>
                <Header upLevelUrl={`/question/${groupId}/${questionId}`} />
                <ReactionsBars reactions={vnode.state.reactions} ids={{ groupId, questionId }} />
                <ReactionsMenu ids={{ groupId, questionId }} reactions={vnode.state.reactions} />
            </div>
        )
    }
}