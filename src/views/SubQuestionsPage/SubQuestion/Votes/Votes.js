import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

//functions
import {listenToVote} from '../../../../functions/firebase/get/get';

let subscribe = ()=>{};

module.exports = {
    oninit: vnode => {
        vnode.state = { optionVoted:false }
        subscribe = listenToVote(vnode)

    },
    onremove: () => {
        subscribe();
    },
    view: vnode => {
        const { options,question } = vnode.attrs;
      console.log('option voted for', vnode.state.optionVoted)

        return (
            <div class='votes'>
                {options.map(option => {
                    console.log(vnode.state.optionVoted === option.optionId, vnode.state.optionVoted ,option.optionId)
                    return (<Option option={option} question={question} isSelected={vnode.state.optionVoted === option.optionId} optionVoted={vnode.state.optionVoted} />)
                })
                }
            </div>
        )
    }
}