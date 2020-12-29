import m from "mithril";
import "./NewGroupPage.css";

//model
import store from "../../../data/store";
//compnents
import Header from "../../Commons/Header/Header";
import Picture from '../../Commons/Picture/Picture';

//functions
import { createGroup } from "../../../functions/firebase/set/set";

module.exports = {
  oninit: vnode => {
    vnode.state = {
      title: false,
      description: "",
      callForAction:'',
      logo: false
    };
  },
  view: vnode => {
    return (
      <div>
        <Header topic="קבוצות" title="יצירת קבוצה חדשה" upLevelUrl="/groups" />
        <div class="wrapper wrapper_newGroup inputs">
          <input
            class="inputGeneral"
            type="text"
            placeholder="שם הקבוצה"
            onkeyup={e => (vnode.state.title = e.target.value)}
          />
          <textarea
            class="inputGeneral"
            placeholder="תאור הקבוצה"
            onkeyup={e => (vnode.state.description = e.target.value)}
          />
          <textarea
            class="inputGeneral"
            placeholder="קריאה לפעולה - תופיעה בדף הכניסה לאפליקציה"
            onkeyup={e => (vnode.state.callForAction = e.target.value)}
          />
          <Picture logo={vnode.state.logo} id={vnode.attrs.id} />
          <input
            type="button"
            class="buttons"
            value="יצירת קבוצה חדשה"
            onclick={() => {
              if (vnode.state.title != false && vnode.state.title.length > 2) {

                createGroup(
                  store.user.uid,
                  vnode.state.title,
                  vnode.state.description,
                  vnode.state.callForAction
                );
              }
            }}
          ></input>
        </div>
      </div>
    );
  }
};
