import m from "mithril";
import "./NavBottom.css";

module.exports = {
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

function handleFeed(){
  m.route.set('/feed')
}
