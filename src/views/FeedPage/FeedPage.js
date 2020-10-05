import m from 'mithril';
import './FeedPage.css';

//data
import store from '../../data/store'

//components
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';

module.exports = {
    oninit:vnode=>{
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);
    },
    view:vnode=>{
        return(
            <div class='page'>
                <Header title='חדשות'/>
                <NavBottom />
            </div>
        )
    }
}