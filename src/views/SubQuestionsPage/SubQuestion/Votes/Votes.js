import m from 'mithril';
import './Votes.css'


//components
import Option from './Option/Option';

//functions
import { listenToUserVote } from '../../../../functions/firebase/get/get';
import {logout} from '../../../../functions/firebase/googleLogin';

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
                <div class='votes__panel'>
                    {options.map(option => {
         
                        return (<Option option={option} question={question} isSelected={vnode.state.optionVoted === option.optionId} optionVoted={vnode.state.optionVoted} />)
                    })
                    }

                </div>
                {store.user.isAnonymous === true ?
                    <div class='votes__loginMessage'>
                        <div class='buttons' onclick={() => {
                            store.lastPage = m.route.get();
                            logout();
                            m.route.set('/login');
                        }}
                        >כדי להצביע עליכם להרשם עם חשבון גוגל</div>
                    </div> : null
                }
            </div>
        )
    }
}