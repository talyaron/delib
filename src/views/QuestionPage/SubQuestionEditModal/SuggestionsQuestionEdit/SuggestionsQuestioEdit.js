import m from 'mithril';

module.exports = {
    view: vnode => {

        const {orderBy, proAgainstType} =vnode.attrs;

        return <div>
            <div class="editselectors">
              <label for={"orderBy"}>סידור האפשרויות</label>
              <select
                id='orderBy'
                name='orderBy'
                class='inputGeneral'

              >
                <option value="new"
                  selected={
                    orderBy === 'new' ? true : false
                  }>הכי חדשות קודם</option>
                <option value="top" selected={
                  orderBy === 'top' ? true : false
                }>הכי מוסכמות קודם</option>
                <option value="message" selected={
                  orderBy === 'message' ? true : false
                }>אלו שדיברו עליהן לאחרונה</option>
              </select>
            </div>
            <div class="editselectors">
              <label for={"proAgainstType"}>סוג הבעד ונגד</label>
              <select
                id='proAgainstType'
                name='proAgainstType'
                class='inputGeneral'
                onchange={e=>{vnode.state.proAgainstType = e.target.value}}
              >
                <option value="superSimple"
                  selected={
                    proAgainstType === 'superSimple' ? true : false
                  }>בעד ונגד פשוט</option>
                <option value="simple" selected={
                  proAgainstType === 'simple' ? true : false
                }>טווח של בעד ונגד</option>
                <option value="advance" selected={
                  proAgainstType === 'advance' ? true : false
                }>טווח של בעד ונגד וייתכנות</option>
              </select>
            </div>
            <div class="editselectors">
              <label for="nav">האם לאפשר למשתמש לנווט מחוץ לשאלה?</label>
              <select
                id='nav'
                name='nav'
                class='inputGeneral'
                onchange={e => { if (e.target.value === 'true') { vnode.state.userHaveNavigation = true } else { vnode.state.userHaveNavigation = false } }}
              >
                <option value={false} selected={vnode.state.userHaveNavigation == false ? true : false}>הצגה ללא ניווט</option>
                <option value={true} selected={vnode.state.userHaveNavigation == true || vnode.state.userHaveNavigation == undefined ? true : false}>הצגה עם ניווט - שליטה של המשתמש</option>

              </select>
            </div>
        </div>
    }
}