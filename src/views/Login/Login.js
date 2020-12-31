import m from 'mithril';
import './Login.css';

//model
import store from '../../data/store';

//functions
import { googleLogin, anonymousLogin } from '../../functions/firebase/googleLogin';
import { getGroupDetails } from '../../functions/firebase/get/get';
import { get } from 'lodash';

module.exports = {
    oninit: vnode => {
        //get group id. and ask fo call for action

        let lastPage = sessionStorage.getItem('lastPage')

        vnode.state = {
            callForAction: '',
            groupId: ''
        };

        //get call for action
        vnode.state.groupId = lastPage.split('/')[2];
        if (vnode.state.groupId !== undefined && vnode.state.groupId.length > 5) {
            getGroupDetails(vnode.state.groupId);
        }


    },
    onbeforeupdate: vnode => {
        if (vnode.state.groupId.length > 5) {
            vnode.state.callForAction = get(store.groups, `[${vnode.state.groupId}].callForAction`, '')
        }
    },
    view: (vnode) => {
        return (
            <div
                class='page splashPage'
                href='/delib'
                oncreate={m.route.link}
            >
                <div class='centerElement'>
                    <div id='login__splashName' class={vnode.state.callForAction.length>1?'opacity07':''}>
                        Delib
                    </div>
                    <div id='login__splashSubName' class={vnode.state.callForAction.length>1?'opacity07':''}>
                        מחליטים ביחד
                    </div>
                    <h1 class='login__callForAction'>{vnode.state.callForAction}</h1>
                    <div class='anonymousLogin'>
                        <input type='text' class='inputLogin' onkeyup={e => store.userTempName = e.target.value} placeholder='רשמו כינוי' />
                        <div class="buttons loginButton" onclick={() => { anonymousLogin() }}>
                            <div>התחברות עם משתמש זמני</div>
                        </div>
                    </div>
                    <p> -- או -- </p>
                    <div class="buttons loginButton" onclick={() => { googleLogin() }}>
                        <div>התחברות עם גוגל</div>
                        <img src='img/icons8-google.svg'></img>
                    </div>

                </div>
            </div >
        )
    }
}