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
                <div class='groupCard__info'>
                    <h1 class='cardTitle'>{vnode.attrs.title}</h1>
                    <p class='cardDescription'>{vnode.attrs.description}</p>
                </div>
                
            </div>
        )

    }
}

