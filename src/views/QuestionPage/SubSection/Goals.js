import m from 'mithril';
import './Goals.css';



module.exports = {

    view: (vnode) => {
        return (
            <div class='questionSection'>
                <div class='questionSectionTitle questions'>מטרות של חברי הקבוצה</div>
                <div class='questionSectionMain'>
                    מטרות....
                </div>
                <div class='questionSectionFooter'>
                    <div class='buttons questionSectionAddButton'>הוסף מטרה</div>
                </div>
            </div>
        )
    }
}

