import m from 'mithril';
import './ReactionsMenu.css';

//model
// import store from '../../data/store';

//functions
import { setNewReaction } from '../../../functions/firebase/set/setQuestions';

//components




module.exports = {
    oninit: vnode => {
        const { groupId, questionId, reactions } = vnode.attrs;

        // vnode.state = {
        //     reactions: [...reactions]
        // }


    },
    view: (vnode) => {
        const { groupId, questionId } = vnode.attrs.ids;

        // const { reactions } = vnode.attrs;


        return (
            <div class='reactionsMenu'>
                {vnode.attrs.reactions.map((reaction, index) => {
                    return (
                        <div key={index} class={reaction.pressed === true ? 'reactionsMenu__button reactionsMenu__button--pressed' : 'reactionsMenu__button'} onclick={() => handleReaction({ vnode, type: reaction.type, index })}>
                            <img src={`img/${reaction.img}`} alt={reaction.text} />
                            <p>{reaction.text}</p>
                        </div>
                    )
                })}
            </div>
        )
    }
}

function handleReaction({ type, vnode, index }) {
    console.log(type, vnode)
    const { groupId, questionId } = vnode.attrs.ids;

    if (vnode.attrs.reactions[index].pressed === false) {

        vnode.attrs.reactions[index].pressed = true;
        vnode.attrs.reactions[index].pressedTime = (new Date().getTime()/1000)
        m.redraw()


        setNewReaction({ groupId, questionId, type })
    }
}