import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

//functions
import { listenToUserVote } from '../../../../functions/firebase/get/get';

let subscribe = () => { };

module.exports = {
    oninit: vnode => {
        vnode.state = { optionVoted: false }
        subscribe = listenToUserVote(vnode)

    },
    onremove: () => {
        subscribe();
    },
    view: vnode => {
        const { options, question } = vnode.attrs;
        console.log('question', question)

        return (
            <div class='votes'>
                <h2>הצביעו: {question.voters || 0}</h2>
                <div class='votes__panel'>
                    {options.map(option => {
                        console.log(vnode.state.optionVoted === option.optionId, vnode.state.optionVoted, option.optionId)
                        return (<Option option={option} question={question} isSelected={vnode.state.optionVoted === option.optionId} optionVoted={vnode.state.optionVoted} />)
                    })
                    }
                </div>
            </div>
        )
    }
}