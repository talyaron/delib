import m from "mithril";
import "./NavBottom.css";

//functions
import { setToFeedLastEntrance } from '../../../functions/firebase/set/set';

//data
import store from '../../../data/store'

module.exports = {
  oninit: vnode => {
    vnode.state = { feedLength: 0 };

    vnode.state.feedLength = getNumberOfNewFeeds();
  },
  oncreate: vnode => {
   

    
    

  },
  onbeforeupdate: vnode => {
    
    vnode.state.feedLength = getNumberOfNewFeeds();
    
  },
  view: (vnode) => {
    return (
      <nav class="navBottom">
        <div class="navBottom__btn">
          <div class="navBottom__btnInfo">
            <img src="img/home-24px.svg" alt="feed" />
            <div class="navBottom__btnText">Groups</div>
          </div>
        </div>
        <div class="navBottom__btn" onclick={handleFeed}>
          <div class="navBottom__btnInfo">
            {vnode.state.feedLength>0?
            <div class='counter'>{vnode.state.feedLength}</div>
            :null
          }
            <img src="img/feed.svg" alt="feed" />
            <div class="navBottom__btnText">Feed</div>
          </div>
        </div>
        <div class="navBottom__btn">
          <div class="navBottom__btnInfo">
            <img src="img/feed.svg" alt="feed" />
            <div class="navBottom__btnText">Feed</div>
          </div>
        </div>
      </nav>
    );
  }
};

function handleFeed() {
  setToFeedLastEntrance()
  m.route.set('/feed')
}

function getNumberOfNewFeeds() {
  const numberOfNewFeedItems = store.feed2.filter(feedItem => (feedItem.date.seconds) * 1000 > store.feed2Info.lastEntrance).length;
  if (numberOfNewFeedItems>99) return 99;
  return numberOfNewFeedItems;
}
