import m from 'mithril';
import './Reactions.css';

//model
import store from '../../data/store';

//functions
import { listenToReactions } from '../../functions/firebase/get/getQuestions';

//components
import Header from '../Commons/Header/Header';
import ReactionsMenu from './ReactionsMenu/ReactionsMenu';

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
                { img: 'edit.svg', value: 1, text: 'like', type: 'testType1' },
                { img: 'edit.svg', value: 1, text: 'intresting', type: 'testType2' },
                { img: 'edit.svg', value: -1, text: 'focus', type: 'testType3' },
                { img: 'edit.svg', value: -1, text: 'stop', type: 'testType4' }
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
                Reactions: {groupId}, {questionId}
                <ReactionsMenu ids={{ groupId, questionId }} reactions={vnode.state.reactions} />
            </div>
        )
    }
}