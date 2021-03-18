import m from 'mithril';
import './FeedPage.css';

//data
import store, { feed } from '../../data/store';

//functions 
import {setToFeedLastEntrance} from '../../functions/firebase/set/set';

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

      
    },
    oncreate:vnode=>{
        window.scrollTo(0,document.body.scrollHeight);

        const feed = document.querySelector('#feed__main');
        console.dir(feed)
       
        feed.scrollTo(0, feed.scrollHeight)

    },
    onbeforeupdate:vnode=>{
      
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
    onremove:()=>{
        setToFeedLastEntrance();
    },
    view:vnode=>{

        return(
            <div class='page page__grid'>
                <Header title='חדשות' showSubscribe={false}/>
                <div class='feed__main' id='feed__main'>
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