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
import {listenToOptions, getGroupDetails } from '../../../functions/firebase/get/get';

import {concatenateURL} from '../../../functions/general';
import { get } from 'lodash';

let unsubscribe = () => { };
let unsubscribeOptions = () => { };
let subQuestionObj;

module.exports = {
	oninit: (vnode) => {

		// getGroupDetails(vnode.attrs.groupId)

		// vnode.state = {
		// 	options: [],
		// 	orderBy: get(store, `subQuestions[${vnode.attrs.subQuestionId}].orderBy`, vnode.attrs.orderBy),
		// 	showModal: {
		// 		isShow: false,
		// 		which: 'subQuestion',
		// 		subQuestionId: vnode.attrs.subQuestionId,
		// 		title: vnode.attrs.title
		// 	},
		// 	details: { title: vnode.attrs.title }
		// };

		// //get user before login to page
		// store.lastPage =
		// 	'/subquestions/' + vnode.attrs.groupId + '/' + vnode.attrs.questionId + '/' + vnode.attrs.subQuestionId;
		// sessionStorage.setItem('lastPage', store.lastPage);

		// //check to see if user logged in
		// if (store.user.uid == undefined) {
		// 	m.route.set('/login');
		// }

		const va = vnode.attrs;

		// unsubscribe = getSubQuestion(va.groupId, va.questionId, va.subQuestionId);
		unsubscribeOptions = listenToOptions(va.groupId, va.questionId, va.subQuestionId, 'top', true);
	},

	onbeforeupdate: (vnode) => {
		// vnode.state.orderBy = vnode.attrs.orderBy;
		
		
	},
	onremove: (vnode) => {
		// unsubscribe();
		unsubscribeOptions();
	},
	view: vnode => {

		const {groupId, questionId, subQuestionId} = vnode.attrs;
		console.log(concatenateURL(groupId, questionId, subQuestionId));

		const options = get(store, `options[${vnode.attrs.subQuestionId}]`, []);
		const option = options.sort((b,a)=>a.consensusPrecentage - b.consensusPrecentage)[0]
		console.log(option)
		if(option !== undefined){
		return (
			<div class='subQuestionSolution' onclick={()=>{m.route.set(concatenateURL(groupId, questionId, subQuestionId))}}>
				<h1>{option.subQuestionTitle}</h1>
				<p>{option.title}</p>
				<hr></hr>
				<div class='subQuestionSolution__info'>
					
					<div>
						<img src='img/group.svg' alt='number of voters' />
						<div>{option.totalVoters}</div>
					</div>
					<div>
						<img src='img/consensus.svg' alt='counsesnsus' />
						<div>{Math.floor(option.consensusPrecentage*100)}%</div>
					</div>
				</div>
			</div>
		);
		} else {
			return(<div class='subQuestionSolution subQuestionSolution--noAnswer' onclick={()=>{m.route.set(concatenateURL(groupId, questionId, subQuestionId))}}>
				<h1>{vnode.attrs.title}</h1>
				<p>לשאלה זאת עוד לא הוצעו תשובות. מוזמנים להיכנס לשאלה ולהציע תשובות</p>
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
