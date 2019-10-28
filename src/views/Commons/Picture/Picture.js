import m from 'mithril'
import './Picture.css';

//functions
import {DB} from '../../../functions/firebase/config';

module.exports = {
    view:vnode=>{
      
        return (
            <div class="addPicturesPanel" onclick={addPicture}>
            <input
              type="file"
              class="addPicture"
              id="pictuerToAdd"
              onclick={() => {}}
              onchange={event => {
                getImage(event, vnode);
              }}
            ></input>
            {vnode.attrs.logo ? (
              <img src={vnode.attrs.logo} class="imgOption" />
            ) : (
              <span> הוסיפו תמונה גודל 120 על 120 פיקסלים</span>
            )}
          </div>
        )
    }
}

function addPicture() {
    document.getElementById("pictuerToAdd").click();
  }
  
  // functions
  
  function getImage(event, vnode) {
    // imageToUpload = image.target.files[0];
    const ref = firebase.storage().ref("/groups/" + vnode.attrs.id);
    const image = event.target.files[0];
    // const name = image.name;
    const metadata = {
      contentType: image.type
    };
  //   const uid = randomUid();
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
      .catch(err=>console.error(err));
  }