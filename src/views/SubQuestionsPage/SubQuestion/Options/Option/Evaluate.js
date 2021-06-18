import m from 'mithril';
import { setSelection } from './OptionCard';

module.exports = {
    view: vnode => {
        const { vp, evaluationType } = vnode.attrs;
      
        const evaluation = evaluate(evaluationType);
        
        return (
            <div
                class={evaluation.btnClass}
                onclick={() => {
                    setSelection(evaluation.setSelection, vp);
                }}
            >
                <img
                    class={evaluation.imgClass}
                    src={evaluation.imgSrc}
                />
            </div>
        );

        function evaluate(type) {
            try {
                switch (type) {
                    case 'like':
                        return {
                            btnClass: vp.state.up ? "optionCard__vote optionSelcetUp" : "optionCard__vote",
                            imgClass: vp.state.up ? "voteUp" : "",
                            imgSrc: vp.state.up ? "img/voteUpWhite.svg" : "img/voteUp.svg",
                            setSelection: 'up'
                        }
                    case 'dislike':
                        return {
                            btnClass: vp.state.down ? "optionCard__vote optionSelcetDown" : "optionCard__vote",
                            imgClass: vp.state.down ? "voteDown" : "",
                            imgSrc: vp.state.down ? "img/voteDownWhite.svg" : "img/voteDown.svg",
                            setSelection: 'down'
                        }
                    case 'confirm':
                        return {
                            btnClass: vp.state.up ? "optionCard__vote optionSelcetUp" : "optionCard__vote",
                            imgClass: vp.state.up ? "voteUp" : "",
                            imgSrc: vp.state.up ? "img/voteUpWhite.svg" : "img/voteUp.svg",
                            setSelection: 'up'
                        }
                    default:
                        throw new Error(`type of evaluation is not recognized: ${type}`);
                }
            } catch (e) {
                console.error(e);
                return {
                    btnClass: vp.state.up ? "optionCard__vote optionSelcetUp" : "optionCard__vote",
                    imgClass: vp.state.up ? "voteUp" : "",
                    imgSrc: vp.state.up ? "img/voteUpWhite.svg" : "img/voteUp.svg",
                    setSelection: 'up'
                }
            }
        }
    }

}