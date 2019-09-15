import m from "mithril";

//model
import store from '../../../data/store';
//functions
import { setLastPage} from '../../../functions/general'


module.exports = {
    oninit: vnode => {
        setLastPage();

        //if no page set and edit setting route to groups....
        if (store.editEntity == false) {
            m.route.set('/groups')
        }


    },
    view: vnode => {
        return (
            <div>Edit</div>
        )
    }
}

function showEditComponent(vnode) {
    
}