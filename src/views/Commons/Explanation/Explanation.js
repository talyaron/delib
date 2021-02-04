import m from 'mithril';

import store from '../../../data/store';
import lang from '../../../data/languages'
import './Explanation.css';



module.exports = {

    view: (vnode) => {

        const language = vnode.attrs.language || 'he';
        const entity = vnode.attrs.entity || 'option';

        return (
            <div class='explanation'>
                <h1>{lang[language][entity]}: {vnode.attrs.title}</h1>
                <p>
                    {vnode.attrs.description}
                </p>
                {/* <div class='qexplanation__footer'>
                    
                </div> */}
            </div>
        )
    }
}

function getUserId() {
    if (store.user.hasOwnProperty('uid')) {
        return store.user.uid;
    } else {
        return 'none'
    }
}

