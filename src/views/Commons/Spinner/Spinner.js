import m from 'mithril';
import './Spinner.css';

module.exports = {

    oninit: vnode => {

    },
    view: vnode => {

        return (
            <div class="lds-css ng-scope spinner">
                <div style="width:100%;height:100%" class="lds-wedges">
                    <div>
                        <div>
                            <div>
                            </div>
                        </div>
                        <div>
                            <div>
                            </div>
                        </div>
                        <div>
                            <div>
                            </div>
                        </div>
                        <div>
                            <div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}




