import m from 'mithril';
import './Group.css';

//data
import store from '../../../data/store';

//functions
import {getRandomColor} from '../../../functions/general'

module.exports = {
    oncreate:vnode=>{
        m.redraw()
    },

    view: (vnode) => {

        const {groupColor, logo, id, description,title, route} = vnode.attrs;

        return (
            <div class='card groupCard' onclick={() => { m.route.set(route + id) }}>
                <div class='groupCard__img' style={logo? 
                    `background-image: url(${logo})`
                    :`background:${groupColor}`}>
                   
                </div>
                <div class='groupCard__info'>
                    <h1 class='cardTitle'>{title}</h1>
                    <p class='cardDescription'>{description}</p>
                </div>
                
            </div>
        )

    }
}

