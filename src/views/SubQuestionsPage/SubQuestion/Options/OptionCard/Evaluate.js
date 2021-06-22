import m from 'mithril';

//model
import { CONFIRM, LIKE, DISLIKE, PARALLEL_OPTIONS } from '../../../../../data/evaluationTypes';

//functions
import { setSelection } from './OptionCard';

module.exports = {

    view: vnode => {
        const { vp, evaluationType, processType } = vnode.attrs;
        console.log('...........', processType)
        const evaluation = evaluate(evaluationType);

        if (!(evaluationType === DISLIKE && processType === PARALLEL_OPTIONS)) {
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
        }

        function evaluate(type) {

            try {
                if (processType === PARALLEL_OPTIONS) {

                    return {
                        btnClass: "optionCard__vote",
                        imgClass: vp.state.confirm ? "voteUp" : "",
                        imgSrc: vp.state.confirm ? "img/iconmonstr-checkbox-check.svg" : "img/iconmonstr-checkbox-uncheck.svg",
                        setSelection: 'confirm'
                    }

                } else {
                    switch (type) {
                        case LIKE:
                            return {
                                btnClass: vp.state.up ? "optionCard__vote optionSelcetUp" : "optionCard__vote",
                                imgClass: vp.state.up ? "voteUp" : "",
                                imgSrc: vp.state.up ? "img/voteUpWhite.svg" : "img/voteUp.svg",
                                setSelection: 'up'
                            }
                        case DISLIKE:
                            return {
                                btnClass: vp.state.down ? "optionCard__vote optionSelcetDown" : "optionCard__vote",
                                imgClass: vp.state.down ? "voteDown" : "",
                                imgSrc: vp.state.down ? "img/voteDownWhite.svg" : "img/voteDown.svg",
                                setSelection: 'down'
                            }

                        default:
                            throw new Error(`type of evaluation is not recognized: ${type}`);
                    }
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