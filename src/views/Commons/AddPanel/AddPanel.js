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

