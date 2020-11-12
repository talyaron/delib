import m from "mithril";
import "./SubQuestionEditModal.css";

//functions
import {
  updateSubQuestion,
  updateSubQuestionProcess,
  updateSubQuestionOrderBy,
  updateDoesUserHaveNavigation,
  setSubQuestion
} from "../../../functions/firebase/set/set";

//model
import settings from "../../../data/settings";

module.exports = {
  oninit: vnode => {
    const { subQuestion, pvs } = vnode.attrs;

    const { modalSubQuestion } = pvs;

    let { title,showSubQuestion,userHaveNavigation} = modalSubQuestion;

    console.log('geting userHaveNavigation',userHaveNavigation)
   
    if(userHaveNavigation === undefined){ userHaveNavigation = true};
    if(showSubQuestion == undefined) {showSubQuestion = true};
    console.log('userHaveNavigation',userHaveNavigation)

    vnode.state = {
      isEdit: !subQuestion.new,
      title: title,
      showSave: title.length>2?true:false,
      showSubQuestion: showSubQuestion,
      userHaveNavigation: userHaveNavigation
      
    };
  },
  view: vnode => {
  
    const { subQuestion, pvs, processType,orderBy } = vnode.attrs;

    const { modalSubQuestion } = pvs;

    const { subQuestionId } = modalSubQuestion;

    console.log('vnode.state.userHaveNavigation',vnode.state.userHaveNavigation)

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
            <div class="editselectors">
              <label for={"orderBy"}>סידור האפשרויות</label>
              <select
                id='orderBy'
                name='orderBy'
                class='inputGeneral'

              >
                <option value="new"
                  selected={
                    orderBy === 'new' ? true : false
                  }>הכי חדשות קודם</option>
                <option value="top" selected={
                    orderBy === 'top' ? true : false
                  }>הכי מוסכמות קודם</option>
                <option value="message" selected={
                    orderBy === 'message' ? true : false
                  }>אלו שדיברו עליהן לאחרונה</option>
              </select>
            </div>
            <div class="editselectors">
              <label for="nav">האם לאפשר למשתמש לנווט מחוץ לשאלה?</label>
              <select
                id='nav'
                name='nav'
                class='inputGeneral'
                onchange={e => {if (e.target.value === 'true') { vnode.state.userHaveNavigation = true } else { vnode.state.userHaveNavigation = false }}}
              >
                <option value={false} selected={vnode.state.userHaveNavigation == false ? true : false}>הצגה ללא ניווט</option>
                <option value={true} selected={vnode.state.userHaveNavigation == true || vnode.state.userHaveNavigation == undefined ? true : false}>הצגה עם ניווט - שליטה של המשתמש</option>

              </select>
            </div>
            <div class='subQuestionEdit__settings'>
              <div>
                <input type='checkbox' name='show' checked={vnode.state.showSubQuestion} id='showSubQuestion'
                  onclick={() => { vnode.state.showSubQuestion = !vnode.state.showSubQuestion }} ></input>
                <label for='showSubQuestion'>להציג</label>
              </div>
              <div>
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

            <div class="buttons buttons--cancel optionEditButton" onclick={() => { pvs.modalSubQuestion.isShow = false }}>Cancel</div>
          </div>
        </form>

      </div>
    );
  }
};

function handleSubmit(e, vnode) {
  e.preventDefault();

  let elms = e.target.elements;

  const title = elms.title.value;
  const processType = elms.processType.value;
  const orderBy = elms.orderBy.value;
  const userHaveNavigation = vnode.state.userHaveNavigation;
  let showSubQuestion = vnode.state.showSubQuestion;

  const { groupId, questionId } = vnode.attrs.pva;
  const { numberOfSubquestions, subQuestionId } = vnode.attrs.subQuestion

 
  console.log(groupId, questionId, subQuestionId)
  setSubQuestion({ groupId, questionId, subQuestionId }, { title, processType, orderBy, userHaveNavigation, showSubQuestion, numberOfSubquestions });
  
  //hide modal
  vnode.attrs.pvs.modalSubQuestion.isShow = false
}
