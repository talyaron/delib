import m from 'mithril';

import './SubQuestion.css';

//componetns
import Options from './Options/Options';
import Votes from './Votes/Votes';
import Modal from '../../Commons/Modal/Modal';

//model
import settings from '../../../data/settings';
import store from '../../../data/store';
import { EntityModel } from '../../../data/dataTypes';

//functions
import { getSubQuestion, listenToOptions, getGroupDetails } from '../../../functions/firebase/get/get';
import { subscribeToNotification, unsubscribeFromNotification } from '../../../functions/firebase/messaging';
import { get } from 'lodash';

let unsubscribe = () => { };
let unsubscribeOptions = () => { };
let subQuestionObj;

module.exports = {
	oninit: (vnode) => {

		getGroupDetails(vnode.attrs.groupId)

		vnode.state = {
			options: [],
			orderBy: get(store, `subQuestions[${vnode.attrs.subQuestionId}].orderBy`, vnode.attrs.orderBy),
			showModal: {
				isShow: false,
				which: 'subQuestion',
				subQuestionId: vnode.attrs.subQuestionId,
				title: vnode.attrs.title
			},
			details: { title: vnode.attrs.title }
		};

		//get user before login to page
		store.lastPage =
			'/subquestions/' + vnode.attrs.groupId + '/' + vnode.attrs.questionId + '/' + vnode.attrs.subQuestionId;
		sessionStorage.setItem('lastPage', store.lastPage);

		//check to see if user logged in
		if (store.user.uid == undefined) {
			m.route.set('/login');
		}

		let va = vnode.attrs;

		unsubscribe = getSubQuestion(va.groupId, va.questionId, va.subQuestionId);
		unsubscribeOptions = listenToOptions(va.groupId, va.questionId, va.subQuestionId, 'top');
	},

	onbeforeupdate: (vnode) => {
		vnode.state.orderBy = vnode.attrs.orderBy;


	},
	onremove: (vnode) => {
		unsubscribe();
		unsubscribeOptions();
	},
	view: (vnode) => {


		return (
			<div class="subQuestionWrapper" id="optionsWrapper">
				<div class={vnode.attrs.isAlone ? "questionSection questionSection--alone" : "questionSection"}>
					<h1>אפשרויות שונות</h1>
					{switchProcess(vnode.state.processType, vnode)}


				</div>
				<Modal
					showModal={vnode.state.showModal.isShow}
					whichModal={vnode.state.showModal.which}
					title={vnode.state.showModal.title}
					placeholderTitle="כותרת"
					placeholderDescription="הסבר"
					vnode={vnode} />
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
