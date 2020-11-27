import m from 'mithril';
import './Consequence.css';

//function
import { voteConsequence } from '../../../functions/firebase/set/set';
import { getMyVotesOnConsequence } from '../../../functions/firebase/get/get';
import {getColorForPercentage, calcOpacity} from '../../../functions/general'

module.exports = {
    oninit: async vnode => {
        try{
        vnode.state = {
            color: 'white',
            opacity: 1,
            truthiness: 1,
            evaluation: 0,
        }

        //get truthness and evaluation from voter preivous votes
        const { groupId, questionId, subQuestionId, optionId, consequenceId, evaluationAvg, truthinessAvg } = vnode.attrs.consequence;
        let { truthiness, evaluation } = await getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId);

        if (truthiness !== undefined) {vnode.state.truthiness = truthiness} else {truthiness = 1};
        if (evaluation !== undefined) {vnode.state.evaluation = evaluation } else {evaluation = 0};
        vnode.state.color = getColorForPercentage((evaluationAvg + 1) * 0.5 || 0);
        vnode.state.opacity = calcOpacity(truthinessAvg * 100);

        m.redraw();
        } catch(e){
            console.error(e)
        }
    },
    onbeforeupdate: vnode => {
        const { truthinessAvg, evaluationAvg, title } = vnode.attrs.consequence;
        vnode.state.color = getColorForPercentage((evaluationAvg + 1) / 2);
        vnode.state.opacity = calcOpacity(truthinessAvg * 100);


    },
    view: vnode => {
        try {
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
        catch (e) {
            console.error(e)
        }
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

