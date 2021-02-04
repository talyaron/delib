import m from "mithril";
import "./NavBottom.css";

//functions
import { setToFeedLastEntrance } from '../../../functions/firebase/set/set';

//data
import store from '../../../data/store'

module.exports = {
  oninit: vnode => {
    vnode.state = { feedLength: 0, showInstall: true };

    vnode.state.feedLength = getNumberOfNewFeeds();


  },
  oncreate: vnode => {

    const installBtn = vnode.dom.children.installBtn;

   



  },
  onbeforeupdate: vnode => {

    vnode.state.feedLength = getNumberOfNewFeeds();

  },
  view: (vnode) => {

    const { showInstall } = vnode.state;
    return (
      <nav class="navBottom">
        <div class="navBottom__btn" onclick={() => { m.route.set('/groups') }}>
          <div class="navBottom__btnInfo">
            <img src="img/home-24px.svg" alt="feed" />
            <div class="navBottom__btnText">Groups</div>
          </div>
        </div>
        <div class="navBottom__btn" onclick={handleFeed}>
          <div class="navBottom__btnInfo">
            {vnode.state.feedLength > 0 ?
              <div class='counter'>{vnode.state.feedLength}</div>
              : null
            }
            <img src="img/feed.svg" alt="feed" />
            <div class="navBottom__btnText">Feed</div>
          </div>
        </div>
        <div class="navBottom__btn" onclick={() => { m.route.set('/chatfeed') }}>
          <div class="navBottom__btnInfo">
            {store.chatFeedCounter > 0 ?
              <div class='counter'>{store.chatFeedCounter}</div>
              : null
            }
            <img src="img/messages.svg" alt="messafges" />
            <div class="navBottom__btnText">Messages</div>
          </div>
        </div>
        {showInstall ? <div class="navBottom__btn" id='installBtn' >
          <div class="navBottom__btnInfo">

            <img src="img/addToHome.svg" alt="messafges" />
            <div class="navBottom__btnText">Install</div>
          </div>
        </div> : null}
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
  if (numberOfNewFeedItems > 99) return 99;
  return numberOfNewFeedItems;
}
