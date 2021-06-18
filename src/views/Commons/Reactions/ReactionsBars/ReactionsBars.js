import m from 'mithril';
import './ReactionsBars.css';

//model
import store from '../../../../data/store';

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
           console.warn('updating bars ... need to change to better mechanism');
        }, 3000)
    },
    onbeforeupdate: vnode => {

       

    },
    onremove:()=>{
        console.log('stop interval')
        clearInterval(redraw)
    },
    view: (vnode) => {
        const { groupId, questionId } = vnode.attrs.ids;
        const {reactions} = vnode.attrs;

        return (
            <div class='reactionsBars'>
                {vnode.state.reactionsBars.map((reaction, index) => {
                  
                    return (
                        <div key={index} 
                        class={reactions[index].value>=0?'reactionsBar reactionsBar--positive':'reactionsBar reactionsBar--negative'} style={`height:${10 * reaction.length}%`} >
                            {reaction.length>0?reaction.length:null}
                        </div>
                    )
                })}
            </div>
        )
    }
}

function updateBars(vnode) {
    // TODO: improve update bar that they will be get down after click
    const { subQuestionId } = vnode.attrs.ids;
    const { reactions } = vnode.attrs;
  
    let reactionsArr = store.reactions[subQuestionId] || [];
  
    const currentDate = (new Date().getTime() / 1000) - 15;

    let count = 0;

    vnode.state.reactionsBars = reactions.map((reaction, i) => {

        const reactionTypeArr =  reactionsArr.filter(rctn => rctn.reactionType === reaction.type).filter(rctn => rctn.dateSeconds > currentDate)
        count += reactionTypeArr.length;
        return reactionTypeArr;
    })

    store.reactionsNumber[subQuestionId] = count;

   reactions.map((reaction,i)=>{
       if(reaction.pressedTime < currentDate) {
           reactions[i].pressed = false;
       }
   })

    m.redraw();
}