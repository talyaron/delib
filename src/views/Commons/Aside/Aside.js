import m from 'mithril';
import './Aside.css';

//model
import store from '../../../data/store';

//functions
import { logout } from '../../../functions/firebase/googleLogin';

module.exports = {
    oncreate: vnode => {
        console.dir(vnode.dom)
        
        vnode.dom.style.transform = 'scale(0)';
        vnode.dom.style.right = '0px';
        vnode.dom.addEventListener('animationend', e => {

            if (e.animationName === 'close') {
                vnode.dom.style.transform = 'scale(0)';
                vnode.dom.style.right = '0px';
            }
            console.log(e)
        })

        vnode.dom.addEventListener('animationstart', e => {
            if (e.animationName === 'open') {
                vnode.dom.style.transform = 'scale(1)';
            }

            console.log(e)
        })
    },
    view: (vnode) => {

        const { isOpen } = vnode.attrs;

        return (
            <aside id='aside' class={isOpen ? 'asideOpen' : 'asideClose'}>
                <div class='topAside'>
                    <p>{store.user.name}</p>
                </div>
                <div class='menuAside'>
                    {store.user.name ?
                        <div onclick={() => { logout() }}>התנתקות</div>
                        :
                        <div onclick={() => {
                            store.lastPage = m.route.get();
                            m.route.set('/logingoogle')
                        }}>התחברות</div>
                    }
                    {vnode.attrs.isAdmin ?
                        <div onclick={(e) => { editPage(e, vnode) }}>עריכת הדף</div>
                        :
                        <div />
                    }
                    <div><a href='http://delib.org'>המכון לדמוקרטיה דיונית</a></div>
                    <div>תודות</div>
                </div>
            </aside>
        )
    }
}

function editPage(e, vnode) {
    e.stopPropagation();

    store.editEntity = m.route.param();
    store.editEntity['entity'];
    m.route.set(vnode.attrs.editPageLink);

}