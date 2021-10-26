import m from 'mithril';
import './Consequence.css';

//function
import { voteConsequence } from '../../../functions/firebase/set/set';
import { getMyVotesOnConsequence } from '../../../functions/firebase/get/get';
import { getColorForPercentage, calcOpacity } from '../../../functions/general'

let firstRun = true;

module.exports = {
    oninit: async vnode => {
        try {

            const {evaluationAvg, truthinessAvg } = vnode.attrs.consequence;

            vnode.state = {
                color: getColorForPercentage((evaluationAvg + 1) * 0.5 || 0),
                opacity: calcOpacity(truthinessAvg * 100) || 1,
                truthiness: 1,
                evaluation: 0,
                isAgainst: false,
                isPro: false

            }

           

          
        } catch (e) {
            console.error(e)
        }
    },
   
    view: vnode => {



        try {

        //    TODO: get truthiness
            if(firstRun){
                getTruthness(vnode)
            }
            firstRun = false;

            const { title, description, consequenceId } = vnode.attrs.consequence;

            const { showColor, proAgainstType } = vnode.attrs;

            return (
                <div class='consequence' key={consequenceId} style={`background: ${showColor ? vnode.state.color : 'white'}; opacity:${showColor ? vnode.state.opacity : 1}`}>
                    {proAgainstType === 'superSimple' ?
                        <div class='consequence__header--simple'>
                            <div
                                class={vnode.state.isPro ? 'consequence__vote consequence__vote--pro consequence__vote--proSelected' : 'consequence__vote consequence__vote--pro'}
                                onclick={() => handleVote('pro', vnode)}>
                                <img src='img/good.png' alt='for' />
                            </div>
                            <div>
                                <h1>{title}</h1>
                                <p>{description}</p>
                            </div>
                            <div
                                class={vnode.state.isAgainst?'consequence__vote consequence__vote--againstSelected':'consequence__vote consequence__vote--against'}
                                onclick={() => handleVote('against', vnode)}>
                                <img src='img/bad.png' alt='bad' />
                            </div>
                        </div>
                        :
                        <div class='consequence__header'>
                            <h1>{title}</h1>
                            <p>{description}</p>
                        </div>
                    }
                    <hr></hr>
                    {proAgainstType === 'advance' || proAgainstType === 'simple' ?
                        <div class='consequence__scores'>
                            <div class='consequence__score'>
                                <p>האם זה טוב או רע?</p>
                                <p><span>רע</span><input type='range' class='sliderRange' onchange={e => handleEval(e, vnode)} min='-1' max='1' step='0.01' defaultValue={vnode.state.evaluation} /><span>טוב</span></p>
                            </div>
                            <div class='consequence__score'>
                                <p>האם לדעתך זה יקרה?</p>
                                <p><span>לא</span><input type='range' class='sliderRange' onchange={e => handleTruthness(e, vnode)} defaultValue={vnode.state.truthiness} min='0' max='1' step='0.005' /><span> כן</span></p>
                            </div>
                        </div>
                        :
                        null
                    }
                </div>
            )
        }
        catch (e) {
            console.error(e)
        }
    }

}


async function getTruthness(vnode){
    //get truthness and evaluation from voter preivous votes
    // const { groupId, questionId, subQuestionId, optionId, consequenceId, evaluationAvg, truthinessAvg } = vnode.attrs.consequence;
    // let { truthiness, evaluation } = await getMyVotesOnConsequence(groupId, questionId, subQuestionId, optionId, consequenceId);
     
    // console.log(truthiness, evaluation);

    // if(evaluation>0){
    //     vnode.state.isPro = true;
    // } else if(evaluation<0){
    //     vnode.state.isAgainst = true
    // }



    // if (typeof truthiness === 'number' && !isNaN(truthiness)) { vnode.state.truthiness = truthiness } else { vnode.state.truthiness = 1 };
    // if (typeof evaluation === 'number' && !isNaN(evaluation)) { vnode.state.evaluation = evaluation } else { vnode.state.evaluation = 0 };
    
    
    // vnode.state.color = getColorForPercentage((evaluationAvg + 1) / 2);
    // vnode.state.opacity = calcOpacity(truthinessAvg * 100);

    // m.redraw();
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

function handleVote(vote, vnode) {
    try {
        let voteAsNumber = 0;
        if (vote == 'pro') {

            if (vnode.state.isPro) {
                voteAsNumber = 0;
                
            } else {
                voteAsNumber = 1
                
            }

            vnode.state.isPro = !vnode.state.isPro;
            vnode.state.isAgainst = false;


        } else if (vote == 'against') {

            if (vnode.state.isAgainst) {
                voteAsNumber = 0;
            } else {
                voteAsNumber = -1
                
            }

            vnode.state.isAgainst = !vnode.state.isAgainst;
            vnode.state.isPro = false;

           
        } else {
            throw new Error(`vote is either pro or agsainst: ${vote}`)
        }

        m.redraw()
        const { groupId, questionId, subQuestionId, optionId, consequenceId } = vnode.attrs.consequence;
   
        voteConsequence({ groupId, questionId, subQuestionId, optionId, consequenceId }, 1, voteAsNumber)
    } catch (e) {
        console.error(e)
    }

}

