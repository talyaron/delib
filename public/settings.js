const settings = {
    pages: {
        groups: {
            link:'/groups'
        }
    },
    subItems: {
        options: {
            name: 'אפשרויות לפתרון',
            type: 'option',
            add: 'הוספת פתרון',
            colors: {
                color: 'white',
                background: 'green',
                backgroundItem: 'white'
            }
        },
        subQuestions: {
            name: "שאלות המשך",
            type: 'subQuestion',
            add: 'הוספת תת-שאלה',
            colors: {
                color: 'white',
                background: 'blue',
                backgroundItem: 'lightblue'
            }
        },
        goals: {
            name: "מטרות",
            type: 'goal',
            add: 'הוספת מטרה קבוצתית',
            colors: {
                color: 'white',
                background: 'red',
                backgroundItem: 'rgb(250, 148, 148)'
            }
        },
        values: {
            name: "ערכים",
            type: 'value',
            add: 'הוספת  ערך',
            colors: {
                color: 'white',
                background: 'lime',
                backgroundItem: '#91ff91'
            }
        }
    },
    roles: {
        groups: {
            read: {
                owner: true,
                member: true,
                editor: true,
                nonMember: true,
                anonymous: true
            },
            write: {
                owner: true,
                editor: true
            }
        },
        questions: {
            read: {
                owner: true,
                member: true,
                editor: true,
                nonMember: true,
                anonymous: true
            },
            write: {
                owner: true,
                editor: true
            }
        },
        subQuestions: {
            read: {
                owner: true,
                member: true,
                editor: true,
                nonMember: true,
                anonymous: true
            },
            write: {
                owner: true,
                editor: true
            }
        }
    },
    processes: {
        suggestions: 'suggestions',
        votes: 'votes'
    },
    processesArr: [
        'suggestions',
        'votes'
    ]
}

export default settings; 