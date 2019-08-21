import m from 'mithril';
import './Login.css';

//model
import store from '../../data/store';

//functions
import { googleLogin } from '../../functions/firebase/googleLogin';

module.exports = {
    view: (vnode) => {
        return (
            <div
                class='page splashPage'
                href='/delib'
                oncreate={m.route.link}
            >
                <div class='centerElement'>
                    <div id='splashName'>
                        Delib
                    </div>
                    <div id='splashSubName'>
                        מחליטים ביחד
                    </div>
                    <div class="buttons loginButton" onclick={() => { googleLogin() }}>
                        <div>התחברות עם גוגל</div>
                        <img src='img/icons8-google.svg'></img>
                    </div>
                </div>
            </div >
        )
    }
}