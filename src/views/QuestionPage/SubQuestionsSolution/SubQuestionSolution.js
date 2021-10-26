import m from 'mithril';

import './SubQuestionSolution.css';

//componetns
import Options from './Options/Options';
import Votes from './Votes/Votes';
import Modal from '../../Commons/Modal/Modal';
import Solutions from '../../QuestionPage/Solutions/Solutions';

//model
import settings from '../../../data/settings';
import store from '../../../data/store';
import { EntityModel } from '../../../data/dataTypes';
import { PARALLEL_OPTIONS, SUGGESTIONS, VOTES } from '../../../data/evaluationTypes';

//functions
import { listenToTopOptions } from '../../../functions/firebase/get/getOptions';

import { concatenateURL } from '../../../functions/general';
import { get } from 'lodash';

let unsubscribe = () => { };
let unsubscribeOptions = () => { };


module.exports = {
	oninit: vnode => {
		const { groupId, questionId, subQuestionId, processType } = vnode.attrs;
	
		listenToTopOptions(groupId, questionId, subQuestionId, processType,vnode.attrs);
	},
	view: vnode => {


		const { groupId, questionId, subQuestionId, title, creator, showSubQuestion, processType } = vnode.attrs;






		return (
			<div class='subQuestionSolution' ondragstart={e => handleSetId(e, subQuestionId)} draggable={true} id={subQuestionId} style={showSubQuestion === 'hidden' ? 'opacity:0.6;' : 'opacity: 1;'} onclick={() => { m.route.set(concatenateURL(groupId, questionId, subQuestionId)) }}>
				<div class='subQuestionSolution__header'>
					<Solutions processType={processType} title={title} subQuestionId={subQuestionId}/>
					<div class='icon'>
						{iconType(vnode)}
					</div>
				</div>

				<hr></hr>
				<div class='subQuestionSolution__info'>
					{store.user.uid == creator ?
						<div onclick={(e) => { handleEditSubQuestion(e, vnode) }}>
							<img src='img/edit.svg' alt='edit' />
						</div>
						: null
					}
					<div>
						<img src='img/group.svg' alt='number of voters' />
						{/* <div>{option.totalVoters}</div> */}
					</div>
					<div>
						<img src='img/consensus.svg' alt='counsesnsus' />
						{/* <div>{isNaN(option.consensusPrecentage) ? <div> -- </div> : <div>{Math.floor(option.consensusPrecentage * 100)}%</div>}</div> */}
					</div>

				</div>
			</div>
		);



	}
};



function addQuestion(vnode, type) {
	vnode.attrs.parentVnode.state.showModal = {
		subQuestionId: vnode.attrs.subQuestionId,
		which: type,
		isShow: true,
		title: 'הוסף אפשרות'
	};
}

function switchProcess(type, vnode) {
	let options = get(store, `options[${vnode.attrs.subQuestionId}]`, []);
	options = orderOptionsBy(options, vnode.state.orderBy);


	switch (type) {


		case settings.processes.suggestions:
			return (
				<Options
					groupId={vnode.attrs.groupId}
					questionId={vnode.attrs.questionId}
					subQuestionId={vnode.attrs.subQuestionId}
					options={options}
					isAlone={vnode.attrs.isAlone}
				/>
			);
		case settings.processes.votes:
			return <Votes />;
		default:
			return (
				<Options
					groupId={vnode.attrs.groupId}
					questionId={vnode.attrs.questionId}
					subQuestionId={vnode.attrs.subQuestionId}
					options={options}
					isAlone={vnode.attrs.isAlone}
				/>
			);
	}

}

function orderOptionsBy(options, orderBy) {
	switch (orderBy) {
		case 'new':
			return options.sort((a, b) => {
				return b.time.seconds - a.time.seconds;
			});
		case 'top':
			return options.sort((a, b) => {
				return b.consensusPrecentage - a.consensusPrecentage;
			});
		case 'message':
			for (let i in options) {
				if (!options[i].hasOwnProperty('lastMessage')) {
					options[i]['lastMessage'] = { seconds: 0 };
				}
			}

			return options.sort((a, b) => {
				return b.lastMessage.seconds - a.lastMessage.seconds;
			});
		default:
			return options.sort((a, b) => {
				return b.consensusPrecentage - a.consensusPrecentage;
			});
	}
}

function handleEditSubQuestion(e, vnode) {

	const { pvs } = vnode.attrs;



	e.stopPropagation();

	const subQuestionObj = vnode.attrs
	subQuestionObj.new = false;
	subQuestionObj.isShow = true;

	pvs.modalSubQuestion = subQuestionObj;

}


function iconType(vnode) {
	const { processType } = vnode.attrs;

	switch (processType) {
		case VOTES:
			return (<img class='subQuestionSolution__icon' src='img/votesDarkGray.svg' alt='votes' />);
		case SUGGESTIONS:
			return (<img class='subQuestionSolution__icon' src='img/suggestionsDarkGray.svg' alt='suggestions' />);
		case PARALLEL_OPTIONS:
			return (<img class='subQuestionSolution__icon' src='img/lines.svg' alt='votes' />);
		default:
			return (<img class='subQuestionSolution__icon' src='img/question.svg' alt='unknowen process' />)


	}
}

function handleSetId(e, id) {

	e.dataTransfer.setData("text", id);
	e.dataTransfer.effectAllowed = "move"
}

