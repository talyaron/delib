import m from "mithril";
import store from "../../data/store";
import settings from '../../data/settings';

//components
import SubQuestion from "../Question/SubQuestions/SubQuestion";
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
      details:{
          title:false,
            options:[]
        }
    };
  },
  oncreate: vnode => {
    unsubscribe = getSubQuestion(
      vnode.attrs.groupId,
      vnode.attrs.questionId,
      vnode.attrs.subQuestionId
     
    );
  },
  onbeforeupdate: vnode => {
    
    if (store.subQuestions.hasOwnProperty(vnode.attrs.subQuestionId)) {
      vnode.state.details = store.subQuestions[vnode.attrs.subQuestionId] 
    }    
     
  },
  onremove: vnode => {
    unsubscribe();
  },
  view: vnode => {
    return (
      <div>
        {vnode.state.details.title  ? (
          <SubQuestion
            groupId={vnode.attrs.groupId}
            questionId={vnode.attrs.questionId}
            subQuestionId={vnode.attrs.subQuestionId}
            orderBy={vnode.state.orderBy}
            title={vnode.state.details.title}
            subItems={vnode.state.details.options}
            parentVnode={vnode}
            info={settings.subItems.options}
            processType={vnode.state.details.processType}
          />
        ) : (
          <Spinner />
        )}
      </div>
    );
  }
};
