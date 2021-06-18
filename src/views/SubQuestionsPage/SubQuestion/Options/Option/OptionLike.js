import m from 'mithril';
import {setSelection} from './Option';

module.exports = {
    view:vnode=>{
        let {vp} = vnode.attrs;

        return(
            <div
              class={vp.state.up ? "optionCard__vote optionSelcetUp" : "optionCard__vote"}
              onclick={() => {
                setSelection("up", vp);
              }}
            >
              <img
                class={vp.state.up ? "voteUp" : ""}
                src={vp.state.up ? "img/voteUpWhite.svg" : "img/voteUp.svg"}
              />
            </div>
        )
    }
}