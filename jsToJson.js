const defaultGoal = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const testCases = [
    {
        start: [0, 1, 3, 4, 2, 5, 7, 8, 6],
        goal: defaultGoal
    },
    {
        start: [1, 0, 3, 4, 2, 5, 7, 8, 6],
        goal: defaultGoal
    }, {
        start: [1, 2, 3, 4, 0, 5, 7, 8, 6],
        goal: defaultGoal
    }, {
        start: [1, 2, 3, 4, 5, 0, 7, 8, 6],
        goal: defaultGoal
    }, {
        start: [1, 2, 3, 4, 5, 6, 7, 8, 0],
        goal: defaultGoal
    }, {
        start: [3, 4, 0, 5, 6, 2, 7, 1, 8],
        goal: defaultGoal
    }, {
        start: [1, 5, 6, 3, 7, 4, 0, 2, 8],
        goal: defaultGoal
    }, {
        start: [8, 3, 0, 5, 6, 1, 7, 4, 2],
        goal: defaultGoal
    }, {
        start: [1, 2, 3, 4, 5, 6, 8, 7, 0],
        goal: defaultGoal
    },
]

require('fs').writeFileSync('./Test Boards.json', JSON.stringify(testCases, null, 4))