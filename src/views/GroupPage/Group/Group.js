import m from "mithril";
import "./Group.css";

//data
import store from "../../../data/store";

//functions
import {getRandomColor} from '../../../functions/general'

module.exports = {
  oninit: vnode => {
    vnode.state = { owned: false };

    checkIfGroupOwnedByUser(vnode);
  },
  onbeforeupdate: vnode => {
    checkIfGroupOwnedByUser(vnode);
  },

  view: vnode => {
    return (
      <div
        class={
          vnode.state.owned ? "questionCard questionOwned" : "card groupCard"
        }
        onclick={() => {
          m.route.set(vnode.attrs.route + vnode.attrs.question.id);
        }}
      >
        <div class='groupCard__img' style={`background:${getRandomColor()}`}></div>
        <div class='groupCard__info'>
          <div class="cardTitle">{vnode.attrs.question.title}</div>
          <div class="cardDescription">{vnode.attrs.question.description}</div>
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
