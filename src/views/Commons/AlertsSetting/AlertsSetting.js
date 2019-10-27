import m from 'mithril';
import './AlertsSetting.css';

import Switch from '../Switch/Switch';

module.exports = {
    oninit: vnode => {
        vnode.state = {
          alertsSetting:vnode.attrs.alertsSetting
      }  
    },
    onpudate: vnode => {
      console.dir(vnode.state.alertsSetting)  
    },
	view: (vnode) => {
		return (
            <div class={vnode.attrs.isAlertsSetting ? "alertsSetting_bkg" : 'hidden'}>
                <div class='alertsSetting_wrapper'>
                    <div class='popupHeader'>
                        הגדרת הודעות ל-<span>{vnode.attrs.title}</span>
                    </div>
                    <div class='alertsSetting_main'>
                        {
                            vnode.state.alertsSetting.map((alertSetting, index) => {
                                return (<div key={index}>
                                    {alertSetting.title}
                                    <Switch isOn={alertSetting.isOn} index={index} vp={vnode} />
                                </div>)
                            })
                        }
                    </div>
                </div>
			</div>
		);
    },

};


