import m from 'mithril';
import './VoteModal.css'

//data
import store from '../../../data/store';

//components
import NewQuestion from './NewQuestion/NewQuestion';
import ExisitingQuestion from './ExistingQuestion/ExistingQuestion'

//functions
import { setSubQuestion,createOption} from '../../../functions/firebase/set/set';

module.exports = {

    oninit: vnode => {
        vnode.state = {
            newVote: true,
            hasName:false,
            title:'',
            options:[]
        }
    },
    view: vnode => {
        const { vsp } = vnode.attrs;
   
        return (
            <div class='background'>
                <div class='optionEditBox'>
                    <div class='optionEditContent'>
                        <h2>הצבעה</h2>
                        <label>השאלה</label>
                        <input class='inputGeneral' placeholder='מה השאלה?' onkeyup={e=>handleName(e, vnode)}></input>
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
                        {vnode.state.newVote ? <NewQuestion vsp={vnode.state} /> : <ExisitingQuestion />}
                        <div class='buttonsBox'>
                            <div 
                            onclick={()=>{vsp.showFav=true; vsp.openVote = false}}
                            class='buttons buttons--cancel'>ביטול</div>
                            <div 
                            onclick={()=>{handleSubmit(vnode); vsp.openVote = false}}
                            class={vnode.state.hasName?'buttons':'buttons buttons--nonactive'}>יצירה</div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}

function handleName(e, vnode){
    console.log(e.target.value)
    if(e.target.value.length>2){
        vnode.state.hasName = true;
        vnode.state.title = e.target.value;

    } else {
        vnode.state.hasName = false;
        vnode.state.title = '';
    }
   
};

async function handleSubmit(vnode){
    if(vnode.state.hasName){
        const {title, options} = vnode.state;
        const {vsp} = vnode.attrs;
        const {groupId, questionId} = vnode.attrs.ids;

      //create subQuestion
      const subQuestionId = await setSubQuestion({groupId, questionId}, { title, processType:'votes', orderBy:'new', userHaveNavigation:false, showSubQuestion:true, numberOfSubquestions:0, proAgainstType:'superSimple' })
        console.log(subQuestionId)
      options.forEach(option=>{
          if(option.title.length>0){
            createOption(groupId, questionId, subQuestionId, 'votes', store.user.uid, option.title, '', '', title, true)
          }
      })

      vsp.showFav=true; 
    }
}