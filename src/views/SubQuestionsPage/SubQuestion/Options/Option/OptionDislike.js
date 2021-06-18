import m from 'mithril';

//functions
import {setSelection} from './Option';

module.exports = {
    view:vnode=>{
        const{vp} = vnode.attrs;
        return(
            <div
              class={
                vp.state.down ? "optionCard__vote optionSelcetDown" : "optionCard__vote"
              }
              onclick={() => {
                setSelection("down", vp);
              }}
            >
              <img
                class={vp.state.down ? "voteDown" : ""}
                src={vp.state.down ? "img/voteDownWhite.svg" : "img/voteDown.svg"}
              />
            </div>
        )
    }
}