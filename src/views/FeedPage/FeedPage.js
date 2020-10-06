import m from 'mithril';
import './FeedPage.css';

//data
import store, { feed } from '../../data/store'

//components
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import FeedItem from './FeedItem/FeedItem';

module.exports = {
    oninit:vnode=>{
        store.lastPage = '/groups';
        sessionStorage.setItem('lastPage', store.lastPage);

        const used = []
        vnode.state = {
            feed:sortAndOrderFeed(store.feed2),
            feedLength:store.feed2.length
        };

        console.log(store.feed2)
    },
    oncreate:vnode=>{
        window.scrollTo(0,document.body.scrollHeight);

    },
    onbeforeupdate:vnode=>{
        console.log(store.feed2)
        const feedTemp = sortAndOrderFeed(store.feed2);
       

        if(vnode.state.feedLength< store.feed2.length){
            feedTemp[feedTemp.length-1].isNew = true;
            
        }

        vnode.state.feed =feedTemp ;
    },
    onupdate:vnode=>{

        //scroll if new item
        if(vnode.state.feedLength< store.feed2.length){
            window.scrollTo(0,document.body.scrollHeight);
            vnode.state.feedLength = store.feed2.length;
        }
    },
    view:vnode=>{
        return(
            <div class='page feedPage'>
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