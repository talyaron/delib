import m from 'mithril';
import './ReactionsMenu.css';

//model
// import store from '../../data/store';

//functions
import {setNewReaction} from '../../../functions/firebase/set/setQuestions';

//components




module.exports = {
    oninit: vnode => {
        const { groupId, questionId,reactions} = vnode.attrs;

        


    },
    view: (vnode) => {
        const { groupId, questionId } = vnode.attrs.ids;
        
        const { reactions } = vnode.attrs;


        return (
            <div class='reactionsMenu'>
                {reactions.map((reaction, index) => {
                    return (
                        <div key={index} class='reactionsMenu__button' onclick={() => handleReaction({vnode, type: reaction.type })}>
                            <img src={`img/${reaction.img}`} alt={reaction.text} />
                            <p>{reaction.text}</p>
                        </div>
                    )
                })}
            </div>
        )
    }
}

function handleReaction({type, vnode}){
    console.log(type ,vnode)
    const {groupId, questionId} = vnode.attrs.ids;

    setNewReaction({groupId, questionId, type})
}