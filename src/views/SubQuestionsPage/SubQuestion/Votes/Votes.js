import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

//functions
import { listenToUserVote } from '../../../../functions/firebase/get/get';
import { logout } from '../../../../functions/firebase/googleLogin';
import { voteOption } from '../../../../functions/firebase/set/set';

//data
import store from '../../../../data/store';

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


        return (
            <div class='votes'>
                <h2>הצביעו: {question.voters || 0}</h2>
                <div class='votes__panel' style={`grid-template-columns: repeat(${options.length}, 1fr);`}>
                    {options.map(option => {

                        const isSelected = vnode.state.optionVoted === option.optionId

                        return (<div>
                            <Option option={option} question={question} optionVoted={vnode.state.optionVoted} />
                            {store.user.isAnonymous === false ?
                                <div class={isSelected ? 'optionVote__button optionVote__button--selected' : 'optionVote__button'} onclick={() => { handleVote(vnode,option) }}>{option.title}</div>
                                : null
                            }

                        </div>)
                    })
                    }

                </div>
                {store.user.isAnonymous === true ?
                    <div class='votes__modelBackground'>
                        <div class='votes__loginMessage'>
                            <p>כדי להצביע עליכם להרשם עם חשבון גוגל</p>
                            <div class='buttons' onclick={() => {
                                store.lastPage = m.route.get();
                                logout();
                                m.route.set('/login');
                            }}
                            >מעבר להרשמה</div>
                        </div>
                    </div> : null
                }
            </div>
        )
    }
}

function handleVote(vnode, option) {
    const {  isSelected, optionVoted } = vnode.attrs;
    const { groupId, questionId, subQuestionId, optionId } = option;

    const addVote = !(isSelected === true && optionVoted !== false)

    voteOption({ groupId, questionId, subQuestionId, optionId }, { addVote })

}