import m from 'mithril';
import './Consequence.css';

//function
import { voteConsequence } from '../../../functions/firebase/set/set';
import { getMyVotesOnConsequence } from '../../../functions/firebase/get/get';

module.exports = {
    oninit: async vnode => {
        vnode.state = {
            color: 'white',
            opacity: 1,
            truthiness: 1,
            evaluation: 0,
        }

        //get truthness and evaluation from voter preivous votes
        const { groupId, questionId, subQuestionId, optionId, consequenceId, evaluationAvg, truthinessAvg } = vnode.attrs.consequence;
        let { truthiness, evaluation } = await getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId);

        if (truthiness !== undefined) vnode.state.truthiness = truthiness;
        if (evaluation !== undefined) vnode.state.evaluation = evaluation;
        vnode.state.color = getColorForPercentage((evaluationAvg + 1) * 0.5 || 0);
        vnode.state.opacity = calcOpacity(truthinessAvg * 100);

        m.redraw();
    },
    onbeforeupdate: vnode => {
        const { truthinessAvg, evaluationAvg, title } = vnode.attrs.consequence;
        vnode.state.color = getColorForPercentage((evaluationAvg + 1) / 2);
        vnode.state.opacity = calcOpacity(truthinessAvg * 100);
       

    },
    view: vnode => {
        const { title, description, consequenceId } = vnode.attrs.consequence

        return (
            <div class='consequence' key={consequenceId} style={`background: ${vnode.state.color}; opacity:${vnode.state.opacity}`}>
                <h1>{title}</h1>
                <p>{description}</p>
                <hr></hr>
                <div class='consequence__scores'>
                    <div class='consequence__score'>
                        <p>האם זה טוב או רע?</p>
                        <p><span>רע</span><input type='range' onchange={e => handleEval(e, vnode)} min='-100' max='100' defaultValue={vnode.state.evaluation * 100} /><span>טוב</span></p>
                    </div>
                    <div class='consequence__score'>
                        <p>האם לדעתך זה יקרה?</p>
                        <p><span>לא</span><input type='range' onchange={e => handleTruthness(e, vnode)} defaultValue={vnode.state.truthiness * 100} /><span> כן</span></p>
                    </div>
                </div>
            </div>
        )
    }
}
function handleEval(e, vnode) {
    try {
        const value = e.target.valueAsNumber * 0.01;

        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;

        vnode.state.evaluation = value;

        voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId, vnode.state.truthiness * .01, value)
    } catch (e) {
        console.error(e)
    }


}

function handleTruthness(e, vnode) {
    try {
        const value = e.target.valueAsNumber;

        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;

        voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId, value * 0.01, vnode.state.evaluation)
    } catch (e) {
        console.error(e)
    }
}

function calcOpacity(value) {
    const levelOpacity = .6;
    return ((value * 0.01) * levelOpacity) + (1 - levelOpacity)
}

const percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }];

const getColorForPercentage = function (pct) {

    for (var i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    var lower = percentColors[i - 1];
    var upper = percentColors[i];
    var range = upper.pct - lower.pct;
    var rangePct = (pct - lower.pct) / range;
    var pctLower = 1 - rangePct;
    var pctUpper = rangePct;
    var color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    if (pct > 0.4 && pct < 0.6) { return 'white' };

    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};