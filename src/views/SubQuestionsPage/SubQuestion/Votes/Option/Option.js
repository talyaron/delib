import m from 'mithril';
import './Option.css';

//data
import store from '../../../../../data/store';

//functions
import { voteOption } from '../../../../../functions/firebase/set/set';

module.exports = {
    view: vnode => {
        const { option, question, isSelected } = vnode.attrs;
     
        const voters = question.voters || 10000000;


        return (
            <div class='optionVote'>
                <div class='optionVote__percent'>{Math.round((option.votes / voters) * 100) || 0}%</div>
                <div class='optionVote__column' style={`height:${(option.votes / voters) * 100}%`}></div>
                {store.user.isAnonymous === false ?
                    <div class={isSelected ? 'optionVote__button optionVote__button--selected' : 'optionVote__button'} onclick={() => { handleVote(vnode) }}>{option.title}</div>
                    : null
                }
            </div>
        )
    }
}

function handleVote(vnode) {
    const { option, isSelected, optionVoted } = vnode.attrs;
    const { groupId, questionId, subQuestionId, optionId } = option;

    const addVote = !(isSelected === true && optionVoted !== false)

    voteOption({ groupId, questionId, subQuestionId, optionId }, { addVote })

}