import m from 'mithril';
import './Consequence.css';

//function
import { voteConsequence } from '../../../functions/firebase/set/set';

module.exports = {
    oninit: vnode => {
        vnode.state = {
            color: 'white',
            opacity: 1,
            truthiness: 1,
            evaluation: 0,
        }
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
                        <span>רע</span><input type='range' onchange={e => handleEval(e, vnode)} min='-100' max='100' defaultValue='0' /><span>טוב</span>
                    </div>
                    <div class='consequence__score'>
                        <span>לא נכון</span><input type='range' onchange={e => handleTruthness(e, vnode)} defaultValue='100' /><span> נכון</span>
                    </div>
                </div>
            </div>
        )
    }
}
function handleEval(e, vnode) {
    try {
        const value = e.target.valueAsNumber*0.01;
        const valueForColor = (e.target.valueAsNumber + 100) * 0.005;
        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;
        console.log(vnode.attrs.consequence)


        if (valueForColor > 0.4 && valueForColor < 0.6) {
            vnode.state.color = 'white'
        } else {

            let color = getColorForPercentage(valueForColor)
            console.log(color)
            vnode.state.color = color;

        }

        vnode.state.evaluation = value;
       
        voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId, vnode.state.truthiness, value)
    } catch (e) {
        console.error(e)
    }


}

function handleTruthness(e, vnode) {
    try {
        const value = e.target.valueAsNumber;
        const levelOpacity = .6;
        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;

        let opacity = ((value * 0.01) * levelOpacity) + (1 - levelOpacity)
        console.log(opacity)
        vnode.state.opacity = opacity;
        vnode.state.truthiness = value;

        voteConsequence(groupId, questionId, subQuestionId, optionId, consequenceId, value*0.01, vnode.state.evaluation)
    } catch (e) {
        console.error(e)
    }
}

var percentColors = [
    { pct: 0.0, color: { r: 0xff, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
    { pct: 1.0, color: { r: 0x00, g: 0xff, b: 0 } }];

var getColorForPercentage = function (pct) {
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
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};