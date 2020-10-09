import m from 'mithril';
import './Group.css';

//data
import store from '../../../data/store';

//functions
import {getRandomColor} from '../../../functions/general'

module.exports = {

    view: (vnode) => {

        return (
            <div class='card groupCard' onclick={() => { m.route.set(vnode.attrs.route + vnode.attrs.id) }}>
                <div class='groupCard__img' style={vnode.attrs.logo? 
                    `background-image: url(${vnode.attrs.logo})`
                    :`background:${getRandomColor()}`}>
                   
                </div>
                <div>
                    <div class='cardTitle'>{vnode.attrs.title}</div>
                    <div class='cardDescription'>{vnode.attrs.description}</div>
                </div>
                
            </div>
        )

    }
}

