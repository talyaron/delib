import m from 'mithril';
import { logout } from '../../functions/firebase/googleLogin';

module.exports = {
    view: vnode => {
        return (
            m('input', {type:'button', onclick:logout}, logout)
        )
    }
}