import m from 'mithril';
import './Feed.css';

import FeedContent from './Sub/FeedContent';

import store from '../../../data/store';

module.exports = {
    oninit: vnode => {
        vnode.state = {
            orderdFeed: [],

        }
    },    
    onbeforeupdate: vnode => {
       
        orderFeed(vnode);

    },

    view: (vnode) => {

        return (
            <div
                id='feedBox'
                class={store.showFeed ? 'feedBox showFeedBox' : 'feedBox hideFeedBox'}
                onclick={() => { store.showFeed = !store.showFeed }}
            >
                <div class='feedWrapper'>
                    {
                        vnode.state.orderdFeed.map((content, index) => {
                            return <FeedContent
                                data={content}
                            />
                        })
                    }
                </div>

            </div>

        )
    }


}

function orderFeed(vnode) {
    vnode.state.orderdFeed = [];

    for (let i in store.feed) {
        vnode.state.orderdFeed.push(store.feed[i]);
    }
    vnode.state.orderdFeed.sort(function (a, b) {
        return b.timeSeconds - a.timeSeconds;
    });

}




