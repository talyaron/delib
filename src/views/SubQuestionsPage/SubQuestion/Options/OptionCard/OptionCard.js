import m from "mithril";
import { get } from 'lodash';

import "./dist/OptionCard.css";

//data
import store, { consequencesTop } from "../../../../../data/store";
import { CONFIRM, LIKE, DISLIKE, PARALLEL_OPTIONS, SUGGESTIONS } from '../../../../../data/evaluationTypes';

//functions
import { changeTextToArray, convertParagraphsToVisual } from '../../../../../functions/general';
import { enterIn } from '../../../../../functions/animations';
import { setEvaluation, updateOption, setOptionActive } from "../../../../../functions/firebase/set/set";
import { getOptionVote, listenToTopConsequences } from "../../../../../functions/firebase/get/get";

//components
import ConsequenceTop from './ConsequenceTop/ConsequenceTop';
import Evaluate from './Evaluate';

let likeUnsubscribe = () => { }, confirmUnsubscribe = () => { }

module.exports = {
    oninit: (vnode) => {
        console.log(vnode)

        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;

        vnode.state = {
            creatorName: vnode.attrs.creatorName || "אנונימי",
            title: vnode.attrs.title,
            description: vnode.attrs.description,
            up: false,
            down: false,
            confirm: false,
            consensusPrecentage: "",
            isConNegative: false,
            posBefore: {
                top: 0,
                left: 0
            },
            isAnimating: false,
            oldElement: {
                offsetTop: 0,
                offsetLeft: 0
            },
            isAdmin: false,
            isEdit: false,
            isNamed: true,
            more: vnode.attrs.more || {
                text: "",
                URL: ""
            },
            messagesRead: 0,
            confirmed: false

        };

        likeUnsubscribe = getOptionVote(groupId, questionId, subQuestionId, optionId, store.user.uid, SUGGESTIONS);
        confirmUnsubscribe = getOptionVote(groupId, questionId, subQuestionId, optionId, store.user.uid, PARALLEL_OPTIONS);

        store.optionsDetails[vnode.attrs.optionId] = {
            title: vnode.attrs.title,
            description: vnode.attrs.description
        };

        listenToTopConsequences({ groupId, questionId, subQuestionId, optionId })
    },
    onbeforeupdate: (vnode) => {

        const { groupId, optionId } = vnode.attrs.ids;

        //get admin
        vnode.state.admin = get(store.groups, `[${groupId}].creatorId`, '')

        let optionVote = store.optionsVotes[optionId];
        if (optionId in store.optionsConfirm) {
            vnode.state.confirm = store.optionsConfirm[optionId]
        }

        //set conesnsus level to string
        if (vnode.attrs.consensusPrecentage !== undefined) {
            if (vnode.attrs.consensusPrecentage >= 0) {
                vnode.state.consensusPrecentage = Math.round(vnode.attrs.consensusPrecentage * 100) + "%";
                vnode.state.isConNegative = false;
            } else {
                vnode.state.consensusPrecentage = Math.abs(Math.round(vnode.attrs.consensusPrecentage * 100)) + "% -";
                vnode.state.isConNegative = true;
            }
        }

        if (optionVote > 0) {
            vnode.state.up = true;
            vnode.state.down = false;
        } else if (optionVote < 0) {
            vnode.state.up = false;
            vnode.state.down = true;
        } else {
            vnode.state.up = false;
            vnode.state.down = false;
        }

        if ({}.hasOwnProperty.call(store.optionNumberOfMessagesRead, optionId)) {

            vnode.state.messagesRead = store.optionNumberOfMessagesRead[optionId]

        }
    },
    onupdate: (vnode) => {

        const { optionId } = vnode.attrs.ids;

        //animation
        let element = vnode.dom;
        let elementY = element.offsetTop;
        let elementX = element.offsetLeft;
        let oldElement = {
            offsetTop: 0,
            offsetLeft: 0
        };
        let toAnimate = false;

        if (store.optionsLoc.hasOwnProperty(optionId)) {
            oldElement = store.optionsLoc[optionId];
            toAnimate = store.optionsLoc[optionId].toAnimate;
        }

        let topMove = elementY - oldElement.offsetTop;
        let leftMove = elementX - oldElement.offsetLeft;

        if ((Math.abs(topMove) > 30 || Math.abs(leftMove) > 30) && toAnimate) {
            let elementDOM = document.getElementById(optionId);

            //animate
            store.optionsLoc[optionId] = {
                offsetTop: 0,
                offsetLeft: 0,
                toAnimate: false
            };

            elementDOM.velocity({
                top: -1 * topMove + "px",
                left: -1 * leftMove + "px"
            }, {
                duration: 0,
                begin: (elms) => { }
            }).velocity({
                top: "0px",
                left: "0px"
            }, {
                duration: 750,
                complete: (elms) => { }
            }, "easeInOutCubic");
        }
    },
    onremove: (vnode) => {
        likeUnsubscribe();
        confirmUnsubscribe();
    },
    view: (vnode) => {
        try {
            const { description, processType, confirms, title } = vnode.attrs;
            const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;
            const { cutoff, maxConfirms } = get(store, `subQuestions[${subQuestionId}]`, { cutoff: 0, maxConfirms: 0 });

            vnode.state.confirmed = isConfirmed();


            let consequencesTop = get(store.consequencesTop, `[${optionId}]`, []);

            const descriptionParagraphs = changeTextToArray(description)

            const isImgRegExp = new RegExp('--imgSrc|--video')

            return (
                <div
                    class={processType === PARALLEL_OPTIONS
                        ? vnode.state.confirmed ? "optionCard optionCard--parallel confirm" : "optionCard optionCard--parallel"
                        : "optionCard"}
                    id={optionId}
                    key={vnode.attrs.key}>
                    <div class="optionCard__main">
                        <Evaluate vp={vnode} evaluationType={LIKE} processType={processType} />
                        <div class="optionContent">
                            <div class="cardTitle">
                                {!vnode.state.isEdit
                                    ? (
                                        <span>{title}</span>
                                    )
                                    : (<input
                                        type="text"
                                        defaultValue={title}
                                        onkeyup={(e) => {
                                            vnode.state.title = e.target.value;
                                        }} />)}
                            </div>
                            {!vnode.state.isEdit
                                ? (
                                    <div class="optionCard__creator">
                                        {vnode.state.creatorName}
                                    </div>
                                )
                                : (
                                    <div class="optionCard__creator">
                                        <input
                                            type="checkbox"
                                            defaultChecked={vnode.state.isNamed}
                                            onchange={(e) => {
                                                isAnonymous(e, vnode);
                                            }} /> {vnode.state.isNamed
                                                ? (
                                                    <span>{vnode.state.creatorName}</span>
                                                )
                                                : (
                                                    <span>אנונימי/ת</span>
                                                )}
                                    </div>
                                )}

                            <div
                                class={isImgRegExp.test(description)
                                    ? "optionCard__description--image"
                                    : "optionCard__description"}
                                onclick={() => {
                                    if (!vnode.state.isEdit) {
                                        m
                                            .route
                                            .set(`/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`)
                                    }
                                }}>
                                {!vnode.state.isEdit
                                    ? (descriptionParagraphs.map((paragraph, index) => {
                                        return (convertParagraphsToVisual(paragraph, index))
                                    }))
                                    : (<textarea
                                        defaultValue={vnode.state.description}
                                        onkeyup={(e) => {
                                            vnode.state.description = e.target.value;
                                        }} />)}
                            </div>
                            {/* {vnode.state.more.text.length > 0 ? (
                <div>
                  {!vnode.state.isEdit ? (
                    <a
                      class="cardMore"
                      href={vnode.state.more.URL}
                      target="_blank"
                    >
                      {vnode.state.more.text}
                    </a>
                  ) : (
                      <div class="cardTitle">
                        <input
                          placeholder="טקסט"
                          type="text"
                          oninput={(e) => {
                            vnode.state.more.text = e.target.value;
                          }}
                          value={vnode.state.more.text}
                        ></input>
                        <input
                          type="url"
                          placeholder="URL"
                          oninput={(e) => {
                            vnode.state.more.URL = e.target.value;
                          }}
                          value={vnode.state.more.URL}
                        ></input>
                      </div>
                    )}
                </div>
              ) : (
                  <div>
                    {!vnode.state.isEdit ? (
                      <div />
                    ) : (
                        <div class="cardTitle">
                          <input
                            type="text"
                            oninput={(e) => {
                              vnode.state.more.text = e.target.value;
                            }}
                            placeholder="טקסט"
                            value={vnode.state.more.text}
                          ></input>
                          <input
                            type="url"
                            oninput={(e) => {
                              vnode.state.more.URL = e.target.value;
                            }}
                            placeholder="URL"
                            value={vnode.state.more.URL}
                          ></input>
                        </div>
                      )}
                  </div>
                )} */}
                        </div>
                        <Evaluate vp={vnode} evaluationType={DISLIKE} processType={processType} />
                    </div>
                    {/* options information panel */}
                    <hr></hr>
                    {consequencesTop.length > 0
                        ? <div
                            onclick={() => {
                                enterIn(document.getElementById('page'), `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`)
                            }}>
                            {consequencesTop.map(consequence => {

                                return (<ConsequenceTop
                                    consequence={consequence}
                                    ids={{
                                        groupId,
                                        questionId,
                                        subQuestionId,
                                        optionId
                                    }}
                                    key={consequence.consequenceId} />)

                            })
                            }
                        </div>
                        : <div
                            class='consequences__tip'
                            onclick={() => {
                                enterIn(document.getElementById('page'), `/option/${groupId}/${questionId}/${subQuestionId}/${optionId}`)
                            }}>יש לכם טענות בעד ונגד ההצעה?</div>
                    }
                    <hr></hr>
                    <div class="optionCard__info">
                        <div class="optionCard__infoItem">
                            <img src="img/group2.svg" /> {vnode.attrs.totalVoters}
                        </div>
                        {processType === PARALLEL_OPTIONS ?
                            <div
                                class="optionCard__infoItem">
                                <img src="img/iconmonstr-checkbox-check.svg" /> {confirms}
                            </div>
                            :
                            <div
                                class={vnode.state.isConNegative
                                    ? "optionCard__infoItem negative"
                                    : "optionCard__infoItem"}>
                                <img src="img/voteUpDown.svg" /> {vnode.state.consensusPrecentage}
                            </div>
                        }
                        <div
                            class="optionCard__infoItem"
                            onclick={() => {
                                m
                                    .route
                                    .set(`/option-chat/${groupId}/${questionId}/${subQuestionId}/${optionId}`)
                            }}>
                            <img src="img/chat.svg" /> {!isNaN(vnode.attrs.messagesCounter)
                                ? vnode.attrs.messagesCounter - vnode.state.messagesRead
                                : 0}
                        </div>
                        <div
                            class="optionCard__infoItem"
                            onclick={() => {
                                vnode.state.isEdit = !vnode.state.isEdit;
                            }}>
                            {vnode.attrs.creatorId == store.user.uid
                                ? (
                                    <div>
                                        {!vnode.state.isEdit
                                            ? (<img src="img/edit.svg" />)
                                            : (
                                                <div
                                                    class="buttons editOptionBtn"
                                                    onclick={() => {
                                                        updateOption(vnode);
                                                    }}>
                                                    אישור
                                                </div>
                                            )}
                                    </div>
                                )
                                : (<div />)}
                        </div>
                        {vnode.attrs.creatorId == store.user.uid || vnode.state.admin == store.user.uid
                            ? <div class="optionCard__infoItem" onclick={() => handleHide(vnode)}>
                                <img src="img/visibility_off-24px.svg" />
                            </div>
                            : null
                        }
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e)
        }

        function isConfirmed() {
            try {
                const { confirms } = vnode.attrs;
                const { subQuestionId } = vnode.attrs.ids;
                const { cutoff, maxConfirms } = get(store, `subQuestions[${subQuestionId}]`, { cutoff: 0, maxConfirms: 0 });
                console.log(cutoff, maxConfirms, confirms)
                if (cutoff === undefined || maxConfirms === undefined || confirms === undefined) return false

                if (typeof cutoff !== 'number' || typeof maxConfirms !== 'number' || typeof confirms !== 'number') throw new Error(`cutoff, maxConfirms or confirms are not a number, ${cutoff}, ${maxConfirms}, ${confirms}`)

                if (confirms) {
                    return confirms >= (maxConfirms * cutoff)
                }

                return false;
            } catch (e) {
                console.error(e);
                return false
            }
        }
    }
};

export function setSelection(evaluate, vnode) {

    const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;
    const { processType } = vnode.attrs;

    if (evaluate === "up") {
        vnode.state.up = !vnode.state.up;
        vnode.state.down = false;

        if (vnode.state.up) {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, 1);
        } else {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, 0);
        }
    } else if (evaluate === "down") {
        vnode.state.down = !vnode.state.down;
        vnode.state.up = false;
        if (vnode.state.down) {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, -1);
        } else {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, 0);
        }
    } else if (evaluate === "confirm") {
        vnode.state.confirm = !vnode.state.confirm;

        if (vnode.state.confirm) {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, true, processType);
        } else {
            setEvaluation(groupId, questionId, subQuestionId, optionId, store.user.uid, false, processType);
        }
    }
}

function isAnonymous(e, vnode) {
    vnode.state.isNamed = e.target.checked;
}

function handleHide(vnode) {
    try {

        const { groupId, questionId, subQuestionId, optionId } = vnode.attrs.ids;

        let isDeactivate = confirm("האם אתם בטוחים שיש להחביא אופציה זאת?");

        if (isDeactivate) {
            setOptionActive(groupId, questionId, subQuestionId, optionId, false)
        }
    } catch (err) {
        console.error(err)
    }
}
