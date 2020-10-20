import m from "mithril";
import "./SubQuestion.css";

//functions
import {
  updateSubQuestion,
  updateSubQuestionProcess,
  updateSubQuestionOrderBy,
  updateDoesUserHaveNavigation
} from "../../../functions/firebase/set/set";

//model
import settings from "../../../data/settings";

module.exports = {
  oninit: vnode => {
    vnode.state = {
      isEdit: true,
      title: vnode.attrs.title
    };
  },
  view: vnode => {
    let va = vnode.attrs,
      vs = vnode.state;
      const {subQuestion} = vnode.attrs;
      console.log(subQuestion)

    return (
      <div
        class="optionEditBox draggable"
        key={vnode.attrs.number}
        id={vnode.attrs.id}
      >
        <div class="optionEditContent">
          <div>
            <div class="optionEditContentText">
              {vnode.state.isEdit ? (
                <div>כותרת: {vnode.state.title}</div>
              ) : (
                <input
                  type="text"
                  value={vnode.state.title}
                  onkeyup={e => {
                    vnode.state.title = e.target.value;
                  }}
                />
              )}
            </div>
            <div class="optionEditContentSettings">
              <div class="optionEditEdit">
                <div
                  class="buttons optionEditButton"
                  onclick={() => {
                    vnode.state.isEdit = !vnode.state.isEdit;
                    if (vnode.state.isEdit) {
                      updateSubQuestion(
                        va.groupId,
                        va.questionId,
                        va.subQuestionId,
                        vs.title
                      );
                    }
                  }}
                >
                  {vnode.state.isEdit ? "עריכה" : "שמירה"}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="editselectors">
              <label for={vnode.attrs.id + "select"}>סוג התהליך</label>
              <select
                id={vnode.attrs.id + "select"}
                onchange={e => {
                  updateSubQuestionProcess(
                    va.groupId,
                    va.questionId,
                    va.subQuestionId,
                    e.target.value
                  );
                }}
              >
                <option
                  disabled
                  selected={!vnode.attrs.processType ? "true" : "false"}
                  value
                >
                  please select process
                </option>
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
              <label for={vnode.attrs.id + "orderBy"}>סידור האפשרויות</label>
              <select
                id={vnode.attrs.id + "orderBy"}
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
              <label for={vnode.attrs.id + "orderBy"}>האם לאפשר למשתמש לנווט מחוץ לשאלה?</label>
              <select
                id={vnode.attrs.id + "orderBy"}
                onchange={e => {

                  let hasNavigation = false
                  if(e.target.value === 'true'){hasNavigation = true};

                  updateDoesUserHaveNavigation(
                    va.groupId,
                    va.questionId,
                    va.subQuestionId,
                    hasNavigation
                  );
                }}
              >
                <option value={false} selected={subQuestion.userHaveNavigation == false?'selected':false}>הצגה ללא ניווט</option>
                <option value={true} selected={subQuestion.userHaveNavigation == true || subQuestion.userHaveNavigation == undefined?'selected':false}>הצגה עם ניווט - שליטה של המשתמש</option>
               
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
