import m from 'mithril';
import './Evaluation.css';



module.exports = {

    view: (vnode) => {
        return (
            <div class='questionSection'>
                <div class='questionSectionTitle questions'>אילוצים של חברי הקבוצה</div>
                <div class='questionSectionMain'>
                    אילוצים....
                </div>
                <div class='questionSectionFooter'>
                    <div class='buttons questionSectionAddButton'>הוסף אילוץ</div>
                </div>
            </div>
        )
    }
}

