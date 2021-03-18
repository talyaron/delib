import m from 'mithril';
import './PopRegistration.css';

//data
import lang from '../../../data/languages';


//functions
import {subscribeToNotification} from '../../../functions/firebase/messaging';
import {dontShowPopAgain} from '../../../functions/firebase/set/set';

module.exports = {
    view:vnode=>{
        let {language, pv} = vnode.attrs;
        if (language === undefined) language = 'he';

        return(
            <div class='popRegistration'>
                <div class='infoCircle'>
                    <img src='img/messages-white.svg' alt='messages notifications'/>
                </div>
                <p>{lang[language].willYouRegister}</p>
                <div class='buttonsBox'>
                <button class='buttons' onclick={()=>handleRegistration(vnode)}>{lang[language].register}</button>
                <button class='buttons buttons--cancel' onclick={()=>{handleCancel(vnode)}}>{lang[language].cancel}</button>
                <button class='buttons buttons--danger' onclick={()=>{handleStopPop(vnode)}}>{lang[language].dontShowAgain}</button>
                </div>
            </div>
        )
    }
}

function handleRegistration(vnode){
   const {ids, pv} = vnode.attrs;



    subscribeToNotification(ids, true);
    pv.state.showRegistration = false;
}

function handleCancel(vnode){
    const {ids, pv} = vnode.attrs;
    pv.state.showRegistration = false;
}

function handleStopPop(vnode){
    const {ids, pv} = vnode.attrs;
   

    dontShowPopAgain()
    pv.state.showRegistration = false;
}