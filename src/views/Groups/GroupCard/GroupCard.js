import m from 'mithril';
import './GroupCard.css';
import store from '../../../data/store';

module.exports = {
  
    view: (vnode) => {

        return (
            <div class='card groupCard' onclick={() => { m.route.set(vnode.attrs.route + vnode.attrs.id) }}>
                <div>
                <div class='cardTitle'>{vnode.attrs.title}</div>
                <div class='cardDescription'>{vnode.attrs.description}</div>
                </div>
                <div>
                    {vnode.attrs.logo?
                    <img class='groupImg' src={vnode.attrs.logo} />
                    :
                    <div />    
                }
                </div>
            </div>
        )

    }
}

