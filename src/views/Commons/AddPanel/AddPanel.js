import m from 'mithril';
import './AddPanel.css'

//attrs shuold follow the schema at the bottom of the file...

module.exports = {
    view: vnode => {

        const { isOpen, vsp, buttonsObj } = vnode.attrs;
        const { title, buttons } = buttonsObj;

        return (
            <div class={isOpen ? 'addPanel addPanel--open' : 'addPanel addPanel--close'}>
                <h2>{title}</h2>
                <div class='addPanel_newQuestions'>
                    {
                        buttons.map((button, i) => {
                            return (
                                <div onclick={() => {vsp.openHeadersPanel = true; vsp.openAddPanel=false}}>
                                    <div class={button.class}>
                                        <img src={button.img} alt={button.alt} />
                                    </div>
                                    <p>{button.title}</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div >
        )
    }
}


// isOpen={vsp.openAddPanel}
// vsp={vsp}
// buttonsObj={{
//     title: 'הוספת שאלות',
//     buttons: [
//         {
//             img: 'img/votes.svg',
//             title: 'הצבעה',
//             alt: 'votes',
//             class: 'addPanel__suggestions',
//             fn: () => { vsp.openVote = true; vsp.openAddPanel = false }
//         },
//         {
//             img: 'img/suggestions.svg',
//             title: 'הצבעה',
//             alt: 'add suggestions',
//             class: 'addPanel__votes',
//             fn: () => { vsp.modalSubQuestion = { isShow: true, new: true, numberOfSubquestions: vsp.subQuestions.length }; vsp.openAddPanel = false }
//         }
//     ]
// }}