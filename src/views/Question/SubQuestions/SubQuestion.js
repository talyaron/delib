import m from 'mithril';

import './SubQuestion.css';

//componetns
import Suggests from './Suggests/Options';
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
			<div class="wrapper subQuestionWrapper" id="optionsWrapper">
				<div class="questionSection">
					<div
						class="questionSectionTitle questions"
						style={`color:${vnode.attrs.info.colors.color};`}>

						{
							store.push.includes(vnode.attrs.subQuestionId) ?
								<div onclick={() => { unsubscribeFromNotification(vnode.attrs.subQuestionId) }}>
									<img src="img/round_speaker_notes_off_white_24dp.png" />
								</div>
								:
								<div onclick={() => { subscribeToNotification(vnode.attrs.subQuestionId) }}>
									<img src="img/round_speaker_notes_white_24dp.png" />
								</div>
						}
						<div >{vnode.attrs.title}</div>
						<div class="addOptionButton" onclick={() => { vnode.state.showModal.isShow = true; }}>
							הוספת פתרון
						</div>
						{vnode.attrs.isAlone ? (
							<div

								onclick={() => {
									m.route.set(`/question/${vnode.attrs.groupId}/${vnode.attrs.questionId}`);
								}}>
								<img src="img/icons8-back-24.png" />
							</div>
						) : (
								<div
									onclick={() => {
										m.route.set(
											`/subquestions/${vnode.attrs.groupId}/${vnode.attrs.questionId}/${vnode.attrs
												.subQuestionId}`
										);
									}}>
									<img src="img/icons8-advertisement-page-24-white.png" />
								</div>
							)}
					</div>
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
				<Suggests
					groupId={vnode.attrs.groupId}
					questionId={vnode.attrs.questionId}
					subQuestionId={vnode.attrs.subQuestionId}
					options={options}
				/>
			);
		case settings.processes.votes:
			return <Votes />;
		default:
			return (
				<Suggests
					groupId={vnode.attrs.groupId}
					questionId={vnode.attrs.questionId}
					subQuestionId={vnode.attrs.subQuestionId}
					options={options}
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
