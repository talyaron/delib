import m from 'mithril';
import './Consequence.css';

//function
import { voteConsequence } from '../../../functions/firebase/set/set';
import { getMyVotesOnConsequence } from '../../../functions/firebase/get/get';
import { getColorForPercentage, calcOpacity } from '../../../functions/general'

module.exports = {
    oninit: async vnode => {
        try {

            const { groupId, questionId, subQuestionId, optionId, consequenceId, evaluationAvg, truthinessAvg } = vnode.attrs.consequence;

            vnode.state = {
                color: getColorForPercentage((evaluationAvg + 1) * 0.5 || 0),
                opacity: calcOpacity(truthinessAvg * 100) || 1,
                truthiness: 1,
                evaluation: 0,
            }

            //get truthness and evaluation from voter preivous votes
            
            let { truthiness, evaluation } = await getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId);

         
           
            if (typeof truthiness === 'number' && !isNaN(truthiness)) { vnode.state.truthiness = truthiness } else { vnode.state.truthiness = 1 };
            if (typeof evaluation === 'number' && !isNaN(evaluation)) { vnode.state.evaluation = evaluation } else { vnode.state.evaluation = 0 };


            m.redraw();
        } catch (e) {
            console.error(e)
        }
    },
    onbeforeupdate: vnode => {
        const { truthinessAvg, evaluationAvg } = vnode.attrs.consequence;
        vnode.state.color = getColorForPercentage((evaluationAvg + 1) / 2);
        vnode.state.opacity = calcOpacity(truthinessAvg * 100);


    },
    view: vnode => {
      
        try {
            const { title, description, consequenceId } = vnode.attrs.consequence;
            const { showColor } = vnode.attrs;

            return (
                <div class='consequence' key={consequenceId} style={`background: ${showColor ? vnode.state.color : 'white'}; opacity:${showColor ? vnode.state.opacity : 1}`}>
                    <h1>{title}</h1>
                    <p>{description}</p>
                    <hr></hr>
                    <div class='consequence__scores'>
                        <div class='consequence__score'>
                            <p>האם זה טוב או רע?</p>
                            <p><span>רע</span><input type='range' onchange={e => handleEval(e, vnode)} min='-1' max='1' step='0.01' defaultValue={vnode.state.evaluation} /><span>טוב</span></p>
                        </div>
                        <div class='consequence__score'>
                            <p>האם לדעתך זה יקרה?</p>
                            <p><span>לא</span><input type='range' onchange={e => handleTruthness(e, vnode)} defaultValue={vnode.state.truthiness} min='0' max='1' step='0.005' /><span> כן</span></p>
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
        const value = e.target.valueAsNumber;
        if (isNaN(value)) throw new Error('value is not a number', value);
        if (value < -1 || value > 1) throw new Error('value is out of range (-1 -->1):', value);

        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;

        vnode.state.evaluation = value;

      

        voteConsequence({ groupId, questionId, subQuestionId, optionId, consequenceId }, vnode.state.truthiness, value)
    } catch (e) {
        console.error(e)
    }


}

function handleTruthness(e, vnode) {
    try {
        const value = e.target.valueAsNumber;

        if (isNaN(value)) throw new Error('value is not a number', value);
        if (value < 0 || value > 1) throw new Error('value is out of range (0 -->1):', value);


        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;

      

        voteConsequence({ groupId, questionId, subQuestionId, optionId, consequenceId }, value, vnode.state.evaluation)
    } catch (e) {
        console.error(e)
    }
}

