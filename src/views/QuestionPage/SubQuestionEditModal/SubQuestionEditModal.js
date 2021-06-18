import m from "mithril";
import "./SubQuestionEditModal.css";

//functions
import {
  deleteSubQuestion,
  setSubQuestion
} from "../../../functions/firebase/set/set";

//model
import settings from "../../../data/settings";
import {PARALLEL_OPTIONS} from '../../../data/evaluationTypes';

//components
import SuggestionsQuestionEdit from './SuggestionsQuestionEdit/SuggestionsQuestioEdit';
import ParallelOptionsEdit from './ParallelOptionsEdit/ParallelOptionsEdit';


module.exports = {
  oninit: vnode => {
    const { subQuestion, pvs } = vnode.attrs;

    const { modalSubQuestion } = pvs;

    let { title, showSubQuestion, userHaveNavigation, proAgainstType } = modalSubQuestion;


    if (userHaveNavigation === undefined) { userHaveNavigation = true };
    if (showSubQuestion == undefined) { showSubQuestion = true };
    if (title === undefined) { title = '' }

    vnode.state = {
      isEdit: !subQuestion.new,
      title: title,
      showSave: title.length > 2 ? true : false,
      showSubQuestion: showSubQuestion,
      userHaveNavigation: userHaveNavigation,
      proAgainstType: proAgainstType || 'superSimple',
      processType: 'suggestions'


    };
  },
  view: vnode => {

    const { pvs } = vnode.attrs;
    const { modalSubQuestion } = pvs;
    const { subQuestionId, orderBy, processType } = modalSubQuestion;
    const { proAgainstType } = vnode.state;



    return (
      <div
        class="optionEditBox draggable"
        key={vnode.attrs.number}
        id={vnode.attrs.id}

      >

        <form class="optionEditContent" onsubmit={(e) => { handleSubmit(e, vnode) }}>
          {subQuestionId === undefined ? <h2>פתיחת שאלה חדשה</h2> : <h2>עריכת שאלה</h2>}
          <div>
            <div class="optionEditContentText">


              <input
                type="text"
                name='title'
                value={vnode.state.title}
                placeholder='שם השאלה'
                class='inputGeneral'
                onkeyup={e => {
                  vnode.state.title = e.target.value;
                  if (e.target.value.length > 2) {
                    vnode.state.showSave = true;
                  } else {
                    vnode.state.showSave = false;
                  }
                }}
              />

            </div>

          </div>
          <div>
            <div class="editselectors">
              <label for='processType'>סוג התהליך</label>
              <select
                id='processType'
                name='processType'
                class='inputGeneral'
                onchange={handleTypeChange}
              >

                {settings.processesArr.map((process, index) => {

                  return (
                    <option
                      value={process}
                      selected={
                        processType === process ? true : false
                      }
                      key={index}
                      id={vnode.attrs.id + "select"}
                    >
                      {process}
                    </option>
                  );
                })}
              </select>
            </div>
            {vnode.state.processType === 'suggestions' ? <SuggestionsQuestionEdit orderBy={orderBy} proAgainstType={proAgainstType} /> : null}
            {vnode.state.processType === PARALLEL_OPTIONS ? <ParallelOptionsEdit /> : null}
            <div class='subQuestionEdit__settings'>
              <div>
                <input type='checkbox' name='show' checked={vnode.state.showSubQuestion == 'userSee'} id='showSubQuestion'
                  onclick={() => { handleCheckUserSee(vnode) }} ></input>
                <label for='showSubQuestion'>להציג</label>
              </div>
              <div onclick={() => handleDelete(vnode)}>
                <img src='img/delete.svg' alt='delete question' />
              </div>
            </div>
          </div>
          <div class='buttonsBox'>
            <button
              type='submit'
              class={vnode.state.showSave ? "buttons optionEditButton" : "buttons buttons--nonactive optionEditButton"}

            >
              שמירה
            </button>

            <div class="buttons buttons--cancel optionEditButton" onclick={() => { pvs.showFav = true; pvs.modalSubQuestion.isShow = false }}>Cancel</div>
          </div>
        </form>

      </div>
    );

    function handleTypeChange(ev) {
    
      vnode.state.processType = ev.target.value;
    }
  }
};

function handleSubmit(e, vnode) {
  try {
    e.preventDefault();

    let elms = e.target.elements;
    const { subQuestion, pvs, pva } = vnode.attrs;

    const title = elms.title.value;
    const processType = elms.processType.value;
    const orderBy = ('orderBy' in elms) ? elms.orderBy.value : false;
    const proAgainstType = ('proAgainstType' in elms) ? elms.proAgainstType.value : false;
    const cutoff = ('cutoff' in elms) ? elms.cutoff.value : false;

    const userHaveNavigation = vnode.state.userHaveNavigation;
    let showSubQuestion = vnode.state.showSubQuestion;
   

    const { groupId, questionId } = pva;
    const { numberOfSubquestions, subQuestionId } = subQuestion;

    setSubQuestion({ groupId, questionId, subQuestionId }, { title, processType, orderBy, userHaveNavigation, showSubQuestion, numberOfSubquestions, proAgainstType,cutoff });

    //hide modal
    pvs.modalSubQuestion.isShow = false;
    pvs.showFav = true;
  } catch (e) {
    console.error(e)
  }
}

function handleCheckUserSee(vnode) {
  if (vnode.state.showSubQuestion === 'userSee') {
    vnode.state.showSubQuestion = 'hidden'
  } else {
    vnode.state.showSubQuestion = 'userSee'
  }

}

function handleDelete(vnode) {
  try {
    let toDelete = confirm('האם למחוק את ההודעה?');

    if (toDelete) {

      const { subQuestion, pva, pvs } = vnode.attrs;
      const { groupId, questionId } = pva;
      const { subQuestionId } = subQuestion;

      deleteSubQuestion(groupId, questionId, subQuestionId);
      pvs.modalSubQuestion.isShow = false;
    }
  } catch (e) {
    console.error(e)
  }
}
