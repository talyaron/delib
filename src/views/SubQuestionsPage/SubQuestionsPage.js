import m from "mithril";
import store from "../../data/store";
import settings from '../../data/settings';

//components
import SubQuestion from "../Question/SubQuestions/SubQuestions";
import Spinner from '../Commons/Spinner/Spinner';

//functions
import { getSubQuestion } from "../../functions/firebase/get/get";
import {set} from 'lodash';

let unsubscribe = () => {};

module.exports = {
  oninit: vnode => {
    //get user before login to page
    store.lastPage = `/subquestions/${vnode.attrs.groupId}/${
      vnode.attrs.questionId
    }/${vnode.attrs.subQuestionId}`;
    sessionStorage.setItem("lastPage", store.lastPage);

    vnode.state = {
      orderBy: "new",
      options: [false],
      subQuestion:{
          title:false,
            options:[]
        }
    };
  },
  oncreate: vnode => {
    unsubscribe = getSubQuestion(
      vnode.attrs.groupId,
      vnode.attrs.questionId,
      vnode.attrs.subQuestionId,
      vnode.state.orderBy,
      vnode
    );
  },
  onbeforeupdate:vnode=>{
        set(vnode.state, 'subQuestion', store.subQuestions[vnode.attrs.subQuestionId]|| {});
        console.dir(vnode.state)
  },
  onremove: vnode => {
    unsubscribe();
  },
  view: vnode => {
    return (
      <div>
        {vnode.state.subQuestion.title  ? (
          <SubQuestion
            groupId={vnode.attrs.groupId}
            questionId={vnode.attrs.questionId}
            subQuestionId={vnode.attrs.subQuestionId}
            orderBy={vnode.state.orderBy}
            title={vnode.state.subQuestion.title}
            subItems={vnode.state.subQuestion.options}
            parentVnode={vnode}
            info={settings.subItems.options}
            processType={vnode.state.subQuestion.processType}
          />
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
};
