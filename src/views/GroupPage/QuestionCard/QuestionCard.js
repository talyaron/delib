import m from "mithril";
import "./QuestionCard.css";

//data
import store from "../../../data/store";

//functions
import { getRandomColor } from '../../../functions/general'

module.exports = {
  oninit: vnode => {
    vnode.state = { owned: false };

    checkIfGroupOwnedByUser(vnode);
  },
  onbeforeupdate: vnode => {
    checkIfGroupOwnedByUser(vnode);
  },

  view: vnode => {
    const {id, title, description} = vnode.attrs.question
    return (
      <div
        class={
          vnode.state.owned ? "card questionCard questionOwned" : "card questionCard"
        }
        onclick={() => {
          m.route.set(vnode.attrs.route + id);
        }}
        draggable={true}
        id={id}
        ondragstart={e=>handleSetId(e, id)}
      >

        <div class='questionCard__info'>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    );
  }
};

function checkIfGroupOwnedByUser(vnode) {

  if (vnode.attrs.hasOwnProperty("question")) {
    if (
      vnode.attrs.question.hasOwnProperty("creatorId") &&
      vnode.attrs.question.creatorId == store.user.uid
    ) {
      vnode.state.owned = true;
    }
  }
}


function handleSetId(e, id){
  console.log('start', id)
  e.dataTransfer.setData("text", id);
  e.dataTransfer.effectAllowed = "move"
}
