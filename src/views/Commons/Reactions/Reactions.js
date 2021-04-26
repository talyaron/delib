import m from 'mithril';
import './Reactions.css';

//model
import store from '../../../data/store';

//functions


//components
import ReactionsMenu from './ReactionsMenu/ReactionsMenu';
import ReactionsBars from './ReactionsBars/ReactionsBars';



module.exports = {
    oninit: vnode => {






        vnode.state = {
            reactions: [
                { img: 'blub.svg', value: 1, text: 'Good Idea', type: 'idea', pressed: false },
                { img: 'clapping.svg', value: 1, text: 'Well Done!', type: 'good', pressed: false },
                { img: 'focus.svg', value: -1, text: 'focus', type: 'focus', pressed: false },
                { img: 'question.svg', value: 1, text: 'I have a Question', type: 'question', pressed: false },
                { img: 'agree.svg', value: 1, text: 'Agree', type: 'agree', pressed: false },
                { img: 'disagree.svg', value: -1, text: 'Disagree', type: 'disagree', pressed: false }
            ]
        }

    },


    view: (vnode) => {
        const { groupId, questionId, subQuestionId,carouselColumn } = vnode.attrs;
        const reactions = store.reactions[subQuestionId] || [];

        return (
            <div class={carouselColumn?'carousel__col reactions':'reactions'}>

                <ReactionsBars reactions={vnode.state.reactions} ids={{ groupId, questionId, subQuestionId }} />
                <ReactionsMenu ids={{ groupId, questionId, subQuestionId }} reactions={vnode.state.reactions} />
            </div>
        )
    }
}