import m from 'mithril';
import { get } from 'lodash';

import './SubQuestion.css';

//componetns
import Options from './Options/Options';
import Votes from './Votes/Votes';
import Modal from '../../Commons/Modal/Modal';
import ParallelOptions from './ParallelOptions/ParallelOptions'

//model
import store from '../../../data/store';
import lang from '../../../data/languages';
import {PARALLEL_OPTIONS} from '../../../data/evaluationTypes';


//functions
import { getSubQuestion, listenToGroupDetails } from '../../../functions/firebase/get/get';
import { handleSubscription } from '../../../functions/firebase/set/set'
import { concatenateDBPath, getUser } from '../../../functions/general';


let unsubscribe = () => { };
let unsubscribeOptions = () => { };


module.exports = {
	oninit: (vnode) => {

		const { groupId, questionId, subQuestionId, title, orderBy } = vnode.attrs;

		listenToGroupDetails(groupId)

		vnode.state = {
			options: [],
			orderBy: get(store, `subQuestions[${subQuestionId}].orderBy`, orderBy),
			showModal: {
				isShow: false,
				which: 'subQuestion',
				subQuestionId: subQuestionId,
				title: title
			},
			details: { title },
			subscribed: false,
			path: concatenateDBPath(groupId, questionId, subQuestionId)
		};

		//get user before login to page
		store.lastPage =
			'/subquestions/' + vnode.attrs.groupId + '/' + questionId + '/' + subQuestionId;
		sessionStorage.setItem('lastPage', store.lastPage);

		//check to see if user logged in
		if (store.user.uid == undefined) {
			m.route.set('/login');
		}

		let va = vnode.attrs;

		unsubscribe = getSubQuestion(va.groupId, va.questionId, va.subQuestionId);

		// wait for user
		(async () => {
			await getUser();

			vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false);
		})();


	},

	onbeforeupdate: (vnode) => {
		vnode.state.orderBy = vnode.attrs.orderBy;
		vnode.state.subscribed = get(store.subscribe, `[${vnode.state.path}]`, false);


	},
	onremove: (vnode) => {
		unsubscribe();
		unsubscribeOptions();
	},
	view: (vnode) => {
		const { question, vsp, processType, language } = vnode.attrs;

		return (
			<div class="subQuestionWrapper" id="optionsWrapper">


				{switchProcess(vsp.processType, vnode)}


				{/* </div> */}
				<Modal
					showModal={vnode.state.showModal.isShow}
					whichModal={vnode.state.showModal.which}
					title={vnode.state.showModal.title}
					placeholderTitle={lang[language].title}
					placeholderDescription={lang[language].description}
					vnode={vnode}
					language={language}
				/>
			</div>
		);
	}
};

function addQuestion(vnode, type) {

	const { language } = vnode.state;

	vnode.attrs.parentVnode.state.showModal = {
		subQuestionId: vnode.attrs.subQuestionId,
		which: type,
		isShow: true,
		title: lang[language].solutions
	};
}

function switchProcess(type, vnode) {
	let options = get(store, `options[${vnode.attrs.subQuestionId}]`, []);
	options = orderOptionsBy(options, vnode.state.orderBy);

	const { processType, groupId, questionId, subQuestionId, isAlone, questionObj } = vnode.attrs;


	switch (processType) {
		case 'suggestions':
			return (
				<Options
					groupId={groupId}
					questionId={questionId}
					subQuestionId={subQuestionId}
					options={options}
					isAlone={isAlone}
				/>
			);
		case 'votes':
			return <Votes ids={{ groupId, questionId, subQuestionId }} options={options} question={questionObj} />;
		case PARALLEL_OPTIONS:
			return <Options
				groupId={groupId}
				questionId={questionId}
				subQuestionId={subQuestionId}
				options={options}
				isAlone={isAlone}
				type={processType}
			/>
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
	try {
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
	} catch (e) {
		console.error(e);

	}
}
