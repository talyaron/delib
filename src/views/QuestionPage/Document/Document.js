import m from 'mithril';
import './Document.css'

module.exports = {

    view: vnode => {
        const {carouselColumn} = vnode.attrs;

        return (<div class={carouselColumn?'carousel__col document':'document'}>Document</div>)
    }

}