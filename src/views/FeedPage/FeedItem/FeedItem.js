import m from 'mithril';
import './FeedItem.css';

module.exports = {
    view:vnode=>{
        const {data, message, url, isNew} = vnode.attrs.feedItem;
       
        return(
            <div class={isNew?'feedItem feedItem--new':'feedItem'} onclick={()=>{m.route.set(url)}}>
                
                <h1>{data.title}</h1>
                <p>{message}</p>
            </div>
        )
    }
}