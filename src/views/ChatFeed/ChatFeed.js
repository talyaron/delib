import m from 'mithril';
import './ChatFeed.css';

//components
import Header from '../Commons/Header/Header';
import NavBottom from '../Commons/NavBottom/NavBottom';
import ChatFeedMessage from './Message/ChatFeedMessage';

//data
import store, { messagesShow } from '../../data/store';

module.exports = {
    view: vnode => {

        const { ids } = vnode.attrs;
        return (
            <div class='page page-grid-feed'>
               <Header title='התכתבויות' />
                <div class='scroll'>
                    <div class='chatFeed__wrapper'>
                        {
                            store.chatFeed.map((message, index) => {    
                          
                                return <ChatFeedMessage message={message} key={index} />
                            })
                        }
                    </div>
                </div>
                
                <NavBottom />
            </div>
        )
    }
}