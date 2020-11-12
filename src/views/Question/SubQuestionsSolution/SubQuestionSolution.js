import m from 'mithril';

import './SubQuestionSolution.css';

//componetns
import Options from './Options/Options';
import Votes from './Votes/Votes';
import Modal from '../../Commons/Modal/Modal';

//model
import settings from '../../../data/settings';
import store from '../../../data/store';
import { EntityModel } from '../../../data/dataTypes';

//functions
import { listenToOptions, getGroupDetails } from '../../../functions/firebase/get/get';

import { concatenateURL } from '../../../functions/general';
import { get } from 'lodash';

let unsubscribe = () => { };
let unsubscribeOptions = () => { };
let subQuestionObj;

module.exports = {
	oninit: (vnode) => {

		

		const va = vnode.attrs;

	
		unsubscribeOptions = listenToOptions(va.groupId, va.questionId, va.subQuestionId, 'top', true);
	},
	onremove: (vnode) => {
		// unsubscribe();
		unsubscribeOptions();
	},
	view: vnode => {

		const { groupId, questionId, subQuestionId, title, creator, pvs } = vnode.attrs;

	
		const options = get(store, `options[${vnode.attrs.subQuestionId}]`, []);
		const option = options.sort((b, a) => a.consensusPrecentage - b.consensusPrecentage)[0]

		if (option !== undefined) {
			return (
				<div class='subQuestionSolution' onclick={() => { m.route.set(concatenateURL(groupId, questionId, subQuestionId)) }}>
					<h1>{title}</h1>
					<p>{option.title}</p>
					<hr></hr>
					<div class='subQuestionSolution__info'>
						{store.user.uid == creator ? 
						<div onclick={(e)=>{handleEditSubQuestion(e, vnode)}}>
							<img src='img/edit.svg' alt='edit' />
						</div>
							: null
						}
						<div>
							<img src='img/group.svg' alt='number of voters' />
							<div>{option.totalVoters}</div>
						</div>
						<div>
							<img src='img/consensus.svg' alt='counsesnsus' />
							<div>{Math.floor(option.consensusPrecentage * 100)}%</div>
						</div>

					</div>
				</div>
			);
		} else {
			return (<div class='subQuestionSolution subQuestionSolution--noAnswer' onclick={() => { m.route.set(concatenateURL(groupId, questionId, subQuestionId)) }}>
				<h1>{vnode.attrs.title}</h1>
				<p>לשאלה זאת עוד לא הוצעו תשובות. מוזמנים להיכנס לשאלה ולהציע תשובות</p>
				<hr></hr>
				{store.user.uid == creator ?
				
					<div class='subQuestionSolution__info'>
						<div onclick={(e)=>{handleEditSubQuestion(e, vnode)}}>
							<img src='img/edit.svg' alt='edit' />
						</div>
					</div>
					: null
				}
			</div>)
		}
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

function handleEditSubQuestion(e, vnode){

	const {pvs,processType,orderBy, groupId, questionId, subQuestionId,title } = vnode.attrs;
	
	console.log('vnode.attrs',vnode.attrs)

	e.stopPropagation(); 

	const subQuestionObj = vnode.attrs
	subQuestionObj.new = false;
	subQuestionObj.isShow = true;

	pvs.modalSubQuestion =subQuestionObj ;
	
}
