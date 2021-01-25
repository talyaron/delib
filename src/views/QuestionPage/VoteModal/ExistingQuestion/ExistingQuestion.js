import m from 'mithril';
import './ExistingQuestion.css'

module.exports = {

    oninit: vnode => {
        vnode.state = {
            newVote: true
        }
    },
    view: vnode => {
        const { openVote } = vnode.attrs;
        console.log(vnode.state.newVote)
        return (
            <div>Exisiting</div>
        )
    }
}