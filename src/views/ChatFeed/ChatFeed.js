import m from 'mithril';
import './ChatFeed.css';

//components
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';

module.exports = {
    view: vnode => {

        const {ids} = vnode.attrs;
        return (
            <div class='page'>
                <Header title='התכתבויות' />
                <NavBottom />
            </div>
        )
    }
}