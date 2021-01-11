import m from 'mithril';
import './Option.css'

import {voteOption} from '../../../../../functions/firebase/set/set';

module.exports = {
    view: vnode => {
        const {option, question} = vnode.attrs;
      const voters=question.voters || 100000000000;

      console.log(voters)
      console.log(question)

         return (
            <div class='optionVote'>
                <div class='optionVote__column' style={`height:${(option.votes/voters)*100}%`}></div>
               <div class='optionVote__button' onclick={()=>{handleVote(vnode)}}>{option.title}</div>
            </div>
        )
    }
}

function handleVote(vnode){
    const {option} = vnode.attrs;
    const {groupId, questionId, subQuestionId, optionId} = option;

    voteOption({groupId, questionId, subQuestionId, optionId},{addVote:true})

}