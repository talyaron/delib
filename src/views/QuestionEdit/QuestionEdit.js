import m from "mithril";
import Sortable from "sortablejs";

import store from "../../data/store";
import {
  getQuestionDetails,
  getSubQuestions
} from "../../functions/firebase/get/get";
import {
  updateQuestion,
  setSubQuestionsOrder,
  createSubQuestion
} from "../../functions/firebase/set/set";
import { setWrapperHeight } from "../../functions/general";

import "./QuestionEdit.css";

import Header from "../Commons/Header/Header";


module.exports = {
  oninit: vnode => {
    //get user before login to page
    store.lastPage =
      "/questionEdit/" + vnode.attrs.groupId + "/" + vnode.attrs.questionId;
    sessionStorage.setItem("lastPage", store.lastPage);
    if (store.user.uid == undefined) {
      m.route.set("/login");
    }

    vnode.state = {
      title: "כותרת שאלה",
      description: "תאור שאלה",
      unsbscribe: {
        details: {},
        subQuestions: {}
      },
      editabels: {
        title: false,
        description: false
      },
      subQuestions: [],
      subQuestionsArray: [],
      addSubQuestin: false,
      newSubQuestion: "",
      authorized: {
        anonymous: false,
        public: false,
        registered: false
      }
    };

    vnode.state.unsbscribe.details = getQuestionDetails(
      vnode.attrs.groupId,
      vnode.attrs.questionId,
      vnode
    );

  
  },
  oncreate: vnode => {
    setWrapperHeight("headerContainer", "questionEditWrapperAll");

   
  },
  onremove: vnode => {
    vnode.state.unsbscribe.details();
    // vnode.state.unsbscribe.subQuestions();
  },
  view: vnode => {
    try {
      return (
        <div>
          <Header
            title={vnode.state.title}
            topic="עריכת שאלה"
            description={vnode.state.description}
            upLevelUrl={`/question/${vnode.attrs.groupId}/${vnode.attrs.questionId
              }`}
          />
          <div class="wrapperAll" id="questionEditWrapperAll">
            <h2>מידע כללי</h2>
            <div class="questionIntro">
              {!vnode.state.editabels.title ? (
                <div
                  class="questionIntroTitle"
                  onclick={e => {
                    e.stopPropagation();
                    vnode.state.editabels.title = true;
                  }}
                >
                  <div class="subTitleEdit">כותרת:</div>
                  <div> {vnode.state.title}</div>
                </div>
              ) : (
                  <div>
                    <input
                      type="text"
                      value={vnode.state.title}
                      class="questionIntroTitle"
                      onkeyup={e => {
                        updateField("title", e.target.value, vnode);
                      }}
                    />
                    <div
                      class="buttons questionIntroButton"
                      onclick={e => {
                        e.stopPropagation();
                        vnode.state.editabels.title = false;
                        updateQuestion(
                          vnode.attrs.groupId,
                          vnode.attrs.questionId,
                          vnode.state.title,
                          vnode.state.description,
                          vnode.state.authorized
                        );
                      }}
                    >
                      שמירה
                </div>
                  </div>
                )}
              {vnode.state.editabels.description ? (
                <div>
                  <textarea
                    value={vnode.state.description}
                    class="questionIntroDescription_texterae"
                    onkeyup={e => {
                      updateField("description", e.target.value, vnode);
                    }}
                  />
                  <div
                    class="buttons questionIntroButton"
                    onclick={e => {
                      e.stopPropagation();
                      vnode.state.editabels.description = false;
                      updateQuestion(
                        vnode.attrs.groupId,
                        vnode.attrs.questionId,
                        vnode.state.title,
                        vnode.state.description,
                        vnode.state.authorized
                      );
                    }}
                  >
                    שמירה
                </div>
                </div>
              ) : (
                  <div
                    class="questionIntroDescription"
                    onclick={e => {
                      e.stopPropagation();
                      vnode.state.editabels.description = true;
                    }}
                  >
                    <div class="subTitleEdit">הסבר: </div>
                    <div> {vnode.state.description}</div>
                  </div>
                )}
            </div>

          </div>
        </div>
      );
    } catch (e) {
      console.error(e)
    }
  }
};

function updateField(field, value, vnode) {
  vnode.state[field] = value;
}

function setCheckboxValue(e, vnode) {
  vnode.state.authorized[e.target.value] = e.target.checked;

  updateQuestion(
    vnode.attrs.groupId,
    vnode.attrs.questionId,
    vnode.state.title,
    vnode.state.description,
    vnode.state.authorized
  );
}
