import m from 'mithril';

import store from '../../../data/store';
import lang from '../../../data/languages'
import './Explanation.css';



module.exports = {

    view: (vnode) => {

        if (vnode.attrs.description) {
            return (
                <div class='explanation'>

                    <div>
                        {vnode.attrs.description}
                    </div>
                    {/* <div class='qexplanation__footer'>
                    
                </div> */}
                </div>
            )
        }
    }
}

function getUserId() {
    if (store.user.hasOwnProperty('uid')) {
        return store.user.uid;
    } else {
        return 'none'
    }
}

