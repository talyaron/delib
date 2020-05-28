import m from 'mithril';
import './Switch.css';

module.exports = {
    oninit: vnode => {
      vnode.state = {isChecked:true}  
    },
    oncreate: vnode => {
        vnode.dom.children[0].checked = vnode.attrs.isOn;
    },
    view: (vnode) => {
        
		return (
            <label class="switch" >
                <input type="checkbox"
                    onclick={(e) => {
                        vnode.attrs.vp.state.alertsSetting[vnode.attrs.index].isOn = e.target.checked;
                      
                       
                    }} />
				<span class="slider round" />
			</label>
		);
	}
};
