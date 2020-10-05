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
    },
    view:vnode=>{
        return(
            <div class='page'>
                <Header title='חדשות' showSubscribe={false}/>
                <div class='wrapper2'>
                    {store.feed2.map(feedItem=>{
                        return( <FeedItem feedItem={feedItem} key={feedItem.feedItemId}/>)
                    })}
                </div>
                <NavBottom />
            </div>
        )
    }
}