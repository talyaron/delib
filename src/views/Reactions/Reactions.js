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

       
        unsubscribe = listenToReactions({ groupId, questionId });

        vnode.state = {
            reactions: [
                { img: 'blub.svg', value: 1, text: 'Good Idea', type: 'idea', pressed: false },
                { img: 'clapping.svg', value: 1, text: 'Well Done!', type: 'good', pressed: false },
                { img: 'focus.svg', value: -1, text: 'focus', type: 'focus', pressed: false },
                { img: 'question.svg', value: 1, text: 'I have a Question', type: 'question', pressed: false }
            ]
        }

    },

    onremove: vnode => {
     
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