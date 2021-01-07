import m from 'mithril';
import './VoteModal.css'

//components
import NewQuestion from './NewQuestion/NewQuestion';
import ExisitingQuestion from './ExistingQuestion/ExistingQuestion'

//functions
import { uniqueId } from '../../../functions/general';

module.exports = {

    oninit: vnode => {
        vnode.state = {
            newVote: true

        }
    },
    view: vnode => {
        const { openVote } = vnode.attrs;
        console.log(vnode.state.newVote)
        return (
            <div class='background'>
                <div class='optionEditBox'>
                    <div class='optionEditContent'>
                        <h2>הצבעה</h2>
                        <div class='voteModal__bar'>
                            <span class={vnode.state.newVote ? 'voteModal__text--selected' : 'voteModal__text--unselected'}>הצבעה חדשה</span>
                            <label class="switch" >
                                <input
                                    type="checkbox"
                                    checked={vnode.state.newVote}
                                    onclick={(e) => {
                                        // vp.state.alertsSetting[vnode.attrs.index].isOn = e.target.checked;

                                        vnode.state.newVote = !vnode.state.newVote;
                                    }} />
                                <span class="slider round" />
                            </label>
                            <span class={vnode.state.newVote ? 'voteModal__text--unselected' : 'voteModal__text--selected'}>מתוך שאלה קיימת</span>
                        </div>
                        {vnode.state.newVote ? <NewQuestion /> : <ExisitingQuestion />}
                        <div class='buttonsBox'>
                            <div class='buttons buttons--cancel'>ביטול</div><div class='buttons'>יצירה</div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}