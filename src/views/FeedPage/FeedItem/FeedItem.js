import m from 'mithril';
import './FeedItem.css';

module.exports = {
    view:vnode=>{
        const {data, message, url, change} = vnode.attrs.feedItem;
       
        if(change) console.log(JSON.parse(change));

        return(
            <div class='feedItem' onclick={()=>{m.route.set(url)}}>
                <h1>{data.title}</h1>
                <p>{message}</p>
            </div>
        )
    }
}