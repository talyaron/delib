import m from "mithril";
import "../../Groups/NewGroupPage/NewGroupPage.css";
import { get } from "lodash";


//model
import store from "../../../data/store";
//compnents
import Header from "../../Commons/Header/Header";
import Picture from '../../Commons/Picture/Picture';
import Members from '../Members/Members'

//functions
import { updateGroup } from "../../../functions/firebase/set/set";
import { getGroupDetails } from "../../../functions/firebase/get/get";

module.exports = {
  oninit: vnode => {
    vnode.state = {
      title: "",
      description: "",
      logo: "",
      callForAction: ''
    };
  },
  oncreate: vnode => {
    getGroupDetails(vnode.attrs.id, vnode);
  },
  onbeforeupdate: vnode => {
    vnode.state = get(store, `groups[${vnode.attrs.id}]`, vnode.state);

  },
  view: vnode => {

    return (
      <div>
        <Header topic="קבוצה" title="עדכון קבוצה" upLevelUrl="/groups" />
        <div class="wrapper wrapper_newGroup inputs">
          <input
            class="inputGeneral"
            type="text"
            placeholder="שם הקבוצה"
            value={vnode.state.title}
            onkeyup={e => (vnode.state.title = e.target.value)}
          />
          <textarea
            class="inputGeneral"
            placeholder="תאור הקבוצה"
            value={vnode.state.description}
            onkeyup={e => (vnode.state.description = e.target.value)}
          />
          <textarea
            class="inputGeneral"
            placeholder="משפט קריאה לפעולה - יופיע בדף הלוגאין"
            value={vnode.state.callForAction}
            onkeyup={e => (vnode.state.callForAction = e.target.value)}
          />
          <Picture logo={vnode.state.logo} id={vnode.attrs.id} />
          <input
            type="button"
            class="buttons"
            value="עדכון פרטי קבוצה"
            onclick={() => {
              if (vnode.state.title.length > 2) {
                updateGroup(vnode);
              }
            }}
          ></input>
        </div>
        <Members groupId={vnode.attrs.id} />
      </div>
    );
  }
};

// functions


