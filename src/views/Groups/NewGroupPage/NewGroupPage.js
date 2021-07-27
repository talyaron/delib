import m from "mithril";
import "./dist/NewGroupPage.min.css";

//model
import store from "../../../data/store";
import lang from '../../../data/languages';
//compnents
import Header from "../../Commons/Header/Header";
import Picture from '../../Commons/Picture/Picture';

const optionsArray = getLangOptions(lang);

//functions
import { createGroup } from "../../../functions/firebase/set/set";
import {setWrapperHeight, uniqueId} from '../../../functions/general';

module.exports = {
  oninit: vnode => {

    vnode.state = {
      title: false,
      description: "",
      callForAction: '',
      logo: false,
      language: 'he',
      wrapperHight:window.innerHeight,
      headerHeight:0,
      groupId:uniqueId()
    };
  },
  oncreate: vnode => {
    setTimeout(()=>{
      vnode.state.wrapperHight = setWrapperHeight('pageEdit__header','wrapper_newGroup');
    
      vnode.state.headerHeight = document.getElementById('pageEdit__header').offsetHeight;
     
      m.redraw();
    },1000)
   
    window.addEventListener('resize',()=>{
      vnode.state.headerHeight = document.getElementById('pageEdit__header').offsetHeight;
      vnode.state.wrapperHight = setWrapperHeight('pageEdit__header','wrapper_newGroup');
    })
  },
  view: vnode => {
    return (
      <div class='pageEdit'>
        <div class='pageEdit__header' id='pageEdit__header'>
          <Header topic="קבוצות" title="יצירת קבוצה חדשה" upLevelUrl="/groups" />
        </div>
        <div class="wrapper wrapper_newGroup" id='wrapper_newGroup' style={`height:${vnode.state.wrapperHight}px ; margin-top:${vnode.state.headerHeight}px`}>
          <div class='inputs'>
            <select class="inputGeneral" onchange={(e) => handleLanguageChange(e, vnode)}>
              {
                optionsArray.map(lng => {
                  return (<option value={lng.key}>{lng.name}</option>)
                })

              }
            </select>
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
            <Picture logo={vnode.state.logo} id={vnode.state.groupId} />
            <input
              type="button"
              class="buttons"
              value="יצירת קבוצה חדשה"
              onclick={() => {
                if (vnode.state.title != false && vnode.state.title.length > 2) {

                  const { uid, title, description, callForAction, language } = vnode.state;
                  createGroup({ creatorId: store.user.uid, title, description, callForAction, language, groupId:vnode.state.groupId});
                }
              }}
            ></input>
          </div>
        </div>
      </div>
    );
  }
};

function handleLanguageChange(e, vnode) {

  vnode.state.language = e.target.value
}


function getLangOptions(langObj) {

  const optionsArray = []
  // get array of languages
  const languageKeys = Object.keys(langObj);
  languageKeys.map((languageKey, i) => {
    optionsArray[i] = { key: languageKey, name: langObj[languageKey].langName }
  })



  return optionsArray

}