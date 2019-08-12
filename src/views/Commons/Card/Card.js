import m from 'mithril';
// import './Card.css';

module.exports = {
    view: (vnode) => {
        return (
            <div class="col s12 m6 l4 right" dir='rtl'>
                <div class="card blue-grey darken-1">
                    <div class="card-content white-text">
                        <span class="card-title">{vnode.attrs.title}</span>
                        <p>{vnode.attrs.explanation}</p>
                    </div>
                    <div class="card-action">
                        <a
                            href={"/team/" + vnode.attrs.id}
                            oncreate={m.route.link}
                            onupdate={m.route.link}
                        >{vnode.attrs.linkText}</a>

                    </div>
                </div>
            </div>
        )
    }
}