import m from 'mithril';
import './ReactionsBars.css';

//model
import store from '../../../data/store';

//functions


//components

let redraw;


module.exports = {
    oninit: vnode => {
        const { groupId, questionId } = vnode.attrs.ids;

        vnode.state = {
            reactionsBars: []
        }


    },
    oncreate: vnode => {
        redraw = setInterval(() => {
            updateBars(vnode)
           
        }, 500)
    },
    onbeforeupdate: vnode => {

       

    },
    onremove:()=>{
        clearInterval(redraw)
    },
    view: (vnode) => {
        const { groupId, questionId } = vnode.attrs.ids;

        return (
            <div class='reactionsBars'>
                {vnode.state.reactionsBars.map((reaction, index) => {
                    return (
                        <div key={index} class='reactionsBar' style={`height:${10 * reaction.length}%`} >
                            dfgd
                        </div>
                    )
                })}
            </div>
        )
    }
}

function updateBars(vnode) {
    const { questionId } = vnode.attrs.ids;
    const { reactions } = vnode.attrs;
    let reactionsArr = store.reactions[questionId] || [];
  
    const currentDate = (new Date().getTime() / 1000) - 5;


    vnode.state.reactionsBars = reactions.map((reaction, i) => {

        return reactionsArr.filter(rctn => rctn.reactionType === reaction.type).filter(rctn => rctn.dateSeconds > currentDate)
    })

    m.redraw();
}