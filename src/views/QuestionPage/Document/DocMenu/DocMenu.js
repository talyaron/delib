import m from 'mithril';
import './DocMenu.css'

module.exports = {
    oninit: vnode => {
     vnode.state = {}
    },
    view: vnode => {
        
       return (
           <div class='docMenu'>
               <div>H</div>
               <div>P</div>
           </div>
       )

        
    }
}


