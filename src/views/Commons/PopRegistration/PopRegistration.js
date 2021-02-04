import m from 'mithril';
import './PopRegistration.css';

//data
import lang from '../../../data/languages'

module.exports = {
    view:vnode=>{
        let {language} = vnode.attrs;
        if (language === undefined) language = 'he';

        return(
            <div class='popRegistration'>
                <div class='infoCircle'>
                    <img src='img/messages-white.svg' alt='messages notifications'/>
                </div>
                <p>{lang[language].willYouRegister}</p>
                <div class='buttonsBox'>
                <button class='buttons'>{lang[language].register}</button>
                <button class='buttons buttons--cancel'>{lang[language].cancel}</button>
                </div>
            </div>
        )
    }
}