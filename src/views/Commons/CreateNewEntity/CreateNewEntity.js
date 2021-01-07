import m from 'mithril';

import './CreateNewEntity.css';

module.exports = {

    view: vnode => {
        const{entity, func} = vnode.attrs;
        return (
            <div class='createNewEntity'>
                <h2>אין לכם עדיין {entity}</h2>
                <h2>מוזמנים ליצור</h2>
                <div class='buttons' onclick={()=>func()}>יצירה</div>
            </div>
        )
    }
}
