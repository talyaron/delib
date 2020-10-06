import m from 'mithril';
import './FeedPage.css';

//data
import store from '../../data/store'

//components
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import FeedItem from './FeedItem/FeedItem';

module.exports = {
    oninit:vnode=>{
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);

        const used = []
        vnode.state = {feed:sortAndOrderFeed(store.feed2)};

        console.log(store.feed2)
    },
    onbeforeupdate:vnode=>{
        console.log(store.feed2)
        vnode.state.feed = sortAndOrderFeed(store.feed2);
    },
    view:vnode=>{
        return(
            <div class='page'>
                <Header title='חדשות' showSubscribe={false}/>
                <div class='wrapper2'>
                    {vnode.state.feed.map(feedItem=>{
                        return( <FeedItem feedItem={feedItem} key={feedItem.feedItemId}/>)
                    })}
                </div>
                <NavBottom />
            </div>
        )
    }
}

function sortAndOrderFeed(incomingFeed){

    return incomingFeed.sort((a,b)=>a.date.seconds - b.date.seconds);

}