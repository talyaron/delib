import m from 'mithril';
import ParallelOptionsEdit from './dist/parallelOptionsEdit.css'

module.exports = {
    oninit: vnode => {
        vnode.state = {
            cutoff: 20
        }
    },
    view: vnode => {
        return (<div>
            <div class="editselectors">
                <label for='processType'>אחוז ההסכמה</label>
                <div class='editselectors__range'>
                    <span>0</span><input type='range' min={0} max={100} defaultValue={vnode.state.cutoff} onchange={handleCutoffChange} name='cutoff' /><span>100</span>
                    <div />
                </div>
                <div />
                <div class='editselectors__subExplanation'>כדי שהצעה תתקבל, יש לזכות בהסכמה של {vnode.state.cutoff}% מהמצביעים</div>
            </div>
        </div>);

        function handleCutoffChange(ev) {
            vnode.state.cutoff = ev.target.valueAsNumber/100;
        }
    }
}