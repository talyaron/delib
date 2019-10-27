import m from 'mithril';
import './Aside.css';

//model
import store from '../../../data/store';

//functions
import { logout} from '../../../functions/firebase/googleLogin';

module.exports = {

    view: (vnode) => {
        return (
            <aside id='aside'>
                <div class='topAside'>
                    <p>{store.user.name}</p>
                </div>
                <div class='menuAside'>
                    {store.user.name?
                        <div onclick={() => { logout() }}>התנתקות</div>
                        :
                        <div onclick={() => {
                            store.lastPage = m.route.get();
                            m.route.set('/logingoogle')
                        }}>התחברות</div>
                    }
                    {vnode.attrs.isAdmin?
                        <div onclick={(e) => { editPage(e, vnode) }}>עריכת הדף</div>
                        :
                        <div />
                    }
                    <div>המכון לדמוקרטיה דיונית</div>
                    <div>תודות</div>
                </div>
            </aside>
        )
    }
}

function editPage(e,vnode) {
    e.stopPropagation();
    console.log(m.route.param())
    store.editEntity = m.route.param();
    store.editEntity['entity'];
    m.route.set(vnode.attrs.editPageLink);

}