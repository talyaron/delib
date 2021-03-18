import m from 'mithril';
import './Modal.css';

//functions
import { createOption, handleSubscription } from '../../../functions/firebase/set/set';
import {subscribeToNotification} from '../../../functions/firebase/messaging';

//data
import store from '../../../data/store';
import lang from '../../../data/languages';

module.exports = {
	oninit: (vnode) => {
		let isSubquestion = false;
		if (vnode.attrs.whichModal === 'subQuestion') {
			isSubquestion = true;
		}

		vnode.state = {
			showModal: vnode.attrs.showModal,
			isSubquestion: isSubquestion,
			ParentVnode: vnode.attrs.vnode,
			add: {
				title: '',
				description: '',
				more: { text: '', URL: '' }
			},
			isNamed: true,
			messagesNotification: false,
			newOptionsUpdte: true
		};
	},
	onbeforeupdate: (vnode) => {
		vnode.state.showModal = vnode.attrs.showModal;
	},
	view: (vnode) => {
		let vnp = vnode.state.ParentVnode;
		const { language } = vnode.attrs;

		return (
			<div>
				{vnode.state.showModal ? (
					<div class="module" style={`direction:${lang[language].dir}`}>
						<div class="moduleBox">
							<div class="moduleCreator">
								<input
									type="checkbox"
									defaultChecked={vnode.state.isNamed}
									onchange={(e) => {
										isAnonymous(e, vnode);
									}}
								/>
								{vnode.state.isNamed ? (
									<span>{lang[language].name}: {store.user.name}</span>
								) : (
										<span>{lang[language].anonymous}</span>
									)}
							</div>
							{/* <div class="moduleTitle">{vnode.attrs.title}</div> */}
							<div class="inputs">
								<textarea
									class="inputGeneral"
									autofocus="true"
									placeholder={lang[language].title}
									onkeyup={(e) => {
										vnode.state.add.title = e.target.value;
									}}
								/>
								<textarea
									class="inputGeneral inputDescription"
									placeholder={lang[language].description}
									onkeyup={(e) => {
										vnode.state.add.description = e.target.value;
									}}
								/>

							</div>
							<div class='module__subscribe'>
								<p>
									<input
										type="checkbox"
										id='getUpdateOnNewOptions'
										defaultChecked={vnode.state.isNamed}
										checked={vnode.state.newOptionsUpdte}
										onchange={(e) => {
											vnode.state.newOptionsUpdte = e.target.checked;
										}}
									/>
									<label for='getUpdateOnNewOptions'>{lang[language].getUpdateOnNewOptions}</label>
								</p>
								<p>
									<input
										type="checkbox"
										id='getMailNotifications'
										defaultChecked={vnode.state.isNamed}
										checked={vnode.state.messagesNotification}
										onchange={(e) => {
											vnode.state.messagesNotification = e.target.checked;
										}}
									/>
									<label for='getMailNotifications'>{lang[language].getMailNotifications}</label>
								</p>
							</div>
							<div class="moduleButtons">
								<div
									class="buttons confirm"
									onclick={() => {
										setNewInfo(vnp, vnode);
										toggleShowModal('off', vnode);
									}}>
									{lang[language].add}
								</div>
								<div
									class="buttons cancel"
									onclick={() => {
										toggleShowModal('off', vnode);
									}}>
									{lang[language].cancel}
								</div>
							</div>
						</div>
					</div>
				) : (
						<div />
					)}
			</div>
		);
	}
};

function setNewInfo(vnp, vnode) {
	try {

	
		//in question, questionId is called id. These is used to fix the problem
		let questionId, subQuestionId;

		if (vnp.attrs.hasOwnProperty('id')) {
			questionId = vnp.attrs.id;
			subQuestionId = vnp.state.showModal.subQuestionId;
		} else {
			questionId = vnp.attrs.questionId;
			subQuestionId = vnp.attrs.subQuestionId;
		}

		if (vnp.attrs.hasOwnProperty('id')) {
			questionId = vnp.attrs.id;
			subQuestionId = vnp.state.showModal.subQuestionId;
		} else {
			questionId = vnp.attrs.questionId;
			subQuestionId = vnp.attrs.subQuestionId;
		}

		let userName = vnode.state.isNamed ? store.user.name : 'אונוימי/ת';

		//register to updates and push notifications


		console.log(vnode.attrs.vnode.attrs);
		if (!{}.hasOwnProperty.call(vnode.attrs.vnode.attrs, 'subQuestionId')) throw new Error("Modal dosn't contain parent subQuestionId");

		if(vnode.state.newOptionsUpdte) handleSubscription(vnode.attrs.vnode);

		const optionId = createOption(
			vnp.attrs.groupId,
			questionId,
			subQuestionId,
			vnp.state.showModal.which,
			store.user.uid,
			vnode.state.add.title,
			vnode.state.add.description,
			userName,
			vnp.state.details.title || vnp.state.showModal.title
		);

		console.log('optionId',optionId)


		if(vnode.state.messagesNotification) subscribeToNotification({groupId:vnp.attrs.groupId,questionId, subQuestionId, optionId});


		// createOption(
		// 	vnp.attrs.groupId,
		// 	questionId,
		// 	subQuestionId,
		// 	vnp.state.showModal.which,
		// 	store.user.uid,
		// 	vnode.state.add.title,
		// 	vnode.state.add.description,
		// 	vnode.state.add.more.text,
		// 	vnode.state.add.more.URL
		// );

		vnp.state.showModal.isShow = false;
	} catch (e) {
		console.error(e)
	}
}

function toggleShowModal(onOff, vnode) {

	if (onOff == 'on') {
		vnode.state.showModal = true;
	} else {
		vnode.state.ParentVnode.state.showModal.isShow = false;
	}
}

function isAnonymous(e, vnode) {
	vnode.state.isNamed = e.target.checked;

}
