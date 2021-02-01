import m from 'mithril'
import './Picture.css';

//functions
import { DB } from '../../../functions/firebase/config';
import { constant } from 'lodash';

module.exports = {
  oninit: vnode => {
    vnode.state = { filePercent: false }
  },
  view: vnode => {

    return (
      <div class="addPicturesPanel" onclick={addPicture}>
        <input
          type="file"
          class="addPicture"
          id="pictuerToAdd"
          onclick={() => { }}
          onchange={event => {
            getImage(event, vnode);
          }}
        ></input>
        {vnode.state.filePercent ?
          <div class='uploader'>
            <div style={`width: ${vnode.state.filePercent}%`} />
          </div>
          :

          vnode.attrs.logo ? (
            <img src={vnode.attrs.logo} class="imgOption" />
          ) : (


              <span>הוסיפו תמונה</span>



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
  try {
    // imageToUpload = image.target.files[0];
    const ref = firebase.storage().ref("/groups/" + vnode.attrs.id);
    const image = event.target.files[0];
    // const name = image.name;
    const metadata = {
      contentType: image.type
    };
    
    const uploadImg = ref.put(image, metadata)
    

    console.log(uploadImg)
    uploadImg.on('state_changed', snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      vnode.state.filePercent = progress;
      m.redraw()
    }, e => {
      console.error(e)
      vnode.state.filePercent = false
      m.redraw();
    }, () => { //when finshed upload

      uploadImg.snapshot.ref.getDownloadURL().then(function (downloadURL) {

        vnode.state.logo = downloadURL;

        DB.collection('groups').doc(vnode.attrs.id).update({ logo: downloadURL })
          .then(() => {
            vnode.state.logo = downloadURL;
            vnode.state.filePercent = false
            m.redraw();
          })
      });
    })
  } catch (e) {
    console.error(e);
    vnode.state.filePercent = false
    m.redraw();
  }
}

