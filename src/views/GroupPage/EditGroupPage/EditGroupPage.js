import m from "mithril";
import "../../Groups/NewGroupPage/NewGroupPage.css";
import { get } from "lodash";

//model
import store from "../../../data/store";
//compnents
import Header from "../../Commons/Header/Header";

//functions
import { updateGroup } from "../../../functions/firebase/set/set";
import { getGroupDetails } from "../../../functions/firebase/get/get";

module.exports = {
  oninit: vnode => {
    vnode.state = {
      title: "",
      description: "",
      logo: ""
    };
  },
  oncreate: vnode => {
    getGroupDetails(vnode.attrs.id, vnode);
  },
  onbeforeupdate: vnode => {
    vnode.state = get("store", `groups[${vnode.attrs.id}]`, vnode.state);
  },
  view: vnode => {
    console.dir(vnode.attrs);
    return (
      <div>
        <Header topic="קבוצה" title="עדכון קבוצה" upLevelUrl="/groups" />
        <div class="wrapper wrapper_newGroup inputs">
          <input
            class="input"
            type="text"
            placeholder="שם הקבוצה"
            value={vnode.state.title}
            onkeyup={e => (vnode.state.title = e.target.value)}
          />
          <textarea
            class="input"
            placeholder="תאור הקבוצה"
            value={vnode.state.description}
            onkeyup={e => (vnode.state.description = e.target.value)}
          />
          {/* add picuter */}
          <div class="addPicturesPanel" onclick={addPicture}>
            <input
              type="file"
              class="addPicture"
              id="pictuerToAdd"
              onclick={() => {}}
              onchange={event => {
                getImage(event, vnode.state.sessionUid, 1, vnode);
              }}
            ></input>
            {vnode.state.logo ? (
              <img src={vnode.state.logo} class="imgOption" />
            ) : (
              <span>הוסיפו תמונה</span>
            )}
          </div>
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
      </div>
    );
  }
};

// functions

function addPicture() {
  document.getElementById("pictuerToAdd").click();
}

// functions

function getImage(event, sessionUid, picIndex, vnode) {
  // imageToUpload = image.target.files[0];
  const ref = firebase.storage().ref("/groups/" + vnode.attrs.id);
  const image = event.target.files[0];
  // const name = image.name;
  const metadata = {
    contentType: image.type
  };
  const uid = randomUid();
  // const task = ref.child(uid).put(image, metadata);
  ref
    .put(image, metadata)
    .then(snapshot => {
      snapshot.ref.getDownloadURL().then(downloadURL=> {
        DB.collection('groups').doc(vnode.attrs.id).update({logo:downloadURL})
        .then(doc=>{
            vnode.state.logo = downloadURL;
            m.redraw();           
        })       
      });
    })
    .catch(console.error);
}
