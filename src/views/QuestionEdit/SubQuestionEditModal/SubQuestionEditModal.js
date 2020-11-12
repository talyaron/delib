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
    console.log(settings)
    const { subQuestion } = vnode.attrs;

    console.log(subQuestion.new);

    vnode.state = {
      isEdit: !subQuestion.new,
      title: vnode.attrs.title,
      showSave: false,
      showSubQuestion: true
    };
  },
  view: vnode => {
    let va = vnode.attrs,
      vs = vnode.state;
    const { subQuestion, pvs } = vnode.attrs;

    return (
      <div
        class="optionEditBox draggable"
        key={vnode.attrs.number}
        id={vnode.attrs.id}
      >

        <form class="optionEditContent" onsubmit={(e) => { handleSubmit(e, vnode) }}>
          <h2>פתיחת שאלה חדשה</h2>
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
                {/* <option
                  disabled
                  selected={!vnode.attrs.processType ? "true" : "false"}
                  value
                >
                  please select process
                </option> */}
                {settings.processesArr.map((process, index) => {

                  return (
                    <option
                      value={process}
                      selected={
                        vnode.attrs.processType === process ? true : false
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
                onchange={e => {
                  updateSubQuestionOrderBy(
                    va.groupId,
                    va.questionId,
                    va.subQuestionId,
                    e.target.value
                  );
                }}
              >
                <option value="new">הכי חדשות קודם</option>
                <option value="top">הכי מוסכמות קודם</option>
                <option value="message">אלו שדיברו עליהן לאחרונה</option>
              </select>
            </div>
            <div class="editselectors">
              <label for="nav">האם לאפשר למשתמש לנווט מחוץ לשאלה?</label>
              <select
                id='nav'
                name='nav'
                class='inputGeneral'
                onchange={e => {

                  let hasNavigation = false
                  if (e.target.value === 'true') { hasNavigation = true };

                  updateDoesUserHaveNavigation(
                    va.groupId,
                    va.questionId,
                    va.subQuestionId,
                    hasNavigation
                  );
                }}
              >
                <option value={false} selected={subQuestion.userHaveNavigation == false ? 'selected' : false}>הצגה ללא ניווט</option>
                <option value={true} selected={subQuestion.userHaveNavigation == true || subQuestion.userHaveNavigation == undefined ? 'selected' : false}>הצגה עם ניווט - שליטה של המשתמש</option>

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

            <div class="buttons buttons--cancel optionEditButton" onclick={() => { pvs.newSubQuestion.isShow = false }}>Cancel</div>
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
  const nav = elms.nav.value;
  let show = vnode.state.showSubQuestion;
 

  console.log(title, processType, orderBy, nav, show)
}
