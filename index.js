// -- Start Tunables --

// Choose which boards to use
// true = Bonus Portion Boards, false = Original Problem
const useBonusChallengeBoards = true

// Set verbosity level here
// 0 - Print Start and Goal Boards
// 1 - Print All Steps
const Verbosity = 0

// -- End Tunables --

// Load test boards from data file
const TestBoards = useBonusChallengeBoards ? require('./Challenge Boards.json') : require('./Test Boards.json')

// Initialize open and closed list, gets reset when going to a new board
let openList = new Set()
let closedList = new Set()

// Initialize expanded nodes
let expandedNodes = 0

// Global board dimensionality, in case a 4x4/5x5 gets mixed in later
let Dimensions = 0

// Create structure for the node
class Node {
    /**
     * 
     * @param {Array} board 
     * @param {Node} parent 
     * @param {*} g 
     * @param {*} h 
     */
    constructor(board, parent, g, h) {
        this.board = board
        this.parent = parent
        this.g = g
        this.h = h
    }

    dump() { // Prints this node
        console.log(this.board[0], '|', this.board[1], '|', this.board[2])
        console.log(this.board[3], '|', this.board[4], '|', this.board[5])
        console.log(this.board[6], '|', this.board[7], '|', this.board[8])
    }
}

/**
 * Gets neighboring states in relation to the blank space
 * @param {Node} node The node class to get neighbors of
 * @returns {Array} Array of child nodes
 */
function getNeighbor(node) {
    let neighbors = []

    let emptyLocation = node.board.indexOf(0)
    if (emptyLocation == -1) throw new Error(`Empty Location not found on board ${node.board}`)

    // Left
    if (![0, 3, 6].includes(emptyLocation)) { // Makes sure it is not on left side of board
        let swapped = [...node.board] // Copies board
        swapped[emptyLocation] = swapped[emptyLocation - 1] // Replace Left element
        swapped[emptyLocation - 1] = 0

        if (checkBoard(swapped)) {// Returns T/F if board is acceptable
            neighbors.push(swapped)
            openList.add(JSON.stringify(swapped))
        }
    }

    // Right
    if (![2, 5, 8].includes(emptyLocation)) {
        let swapped = [...node.board] // Copies board
        swapped[emptyLocation] = swapped[emptyLocation + 1] // Replace Right element
        swapped[emptyLocation + 1] = 0

        if (checkBoard(swapped)) {// Returns T/F if board is acceptable
            neighbors.push(swapped)
            openList.add(JSON.stringify(swapped))
        }
    }

    // Up
    if (![0, 1, 2].includes(emptyLocation)) {
        let swapped = [...node.board] // Copies board
        swapped[emptyLocation] = swapped[emptyLocation - 3] // Replace Up element
        swapped[emptyLocation - 3] = 0

        if (checkBoard(swapped)) {// Returns T/F if board is acceptable
            neighbors.push(swapped)
            openList.add(JSON.stringify(swapped))
        }
    }

    // Down
    if (![6, 7, 8].includes(emptyLocation)) {
        let swapped = [...node.board] // Copies board
        swapped[emptyLocation] = swapped[emptyLocation + 3] // Replace Down element
        swapped[emptyLocation + 3] = 0

        if (checkBoard(swapped)) {// Returns T/F if board is acceptable
            neighbors.push(swapped)
            openList.add(JSON.stringify(swapped))
        }
    }

    return neighbors
}

/**
 * Checks board to see if it has been expanded already (closed list)
 * @param {Array} board Checks a potential board to see if it can be used
 */
function checkBoard(board) {
    for (let i of closedList) {
        if (i === JSON.stringify(board)) return false
    }
    return true
}

/**
 * Finds the G and H value of neihbors and returns the node to expand
 * @param {Array} neighbors 
 * @param {Node} node
 * @returns {Node} New step node
 */
function evaluateNeighbors(neighbors, node, goal) {
    let lowest = {}

    // Get g (will be same for all neighbors)
    let g = node.g + 1

    for (let i of neighbors) {
        let h = calculateHeuristic(i, goal)
        let f = g + h

        if (!lowest.f || lowest.f > f) {
            lowest = { f, g, h, neighbor: i }
        }
    }

    // If there were neighbors, create new node from lowest costing neighbor
    if (lowest !== {}) {
        lowest = new Node(lowest.neighbor, node, lowest.g, lowest.h)
        closedList.add(JSON.stringify(lowest.board))
    }
    return lowest
}

function calculateHeuristic(board, goal) {
    let h = 0
    for (let i = 1; i < goal.length; i++) {
        let b = board.indexOf(i)
        let g = goal.indexOf(i)
        if (b == -1 || g == -1) throw new Error(`${i} couldn't be found in either ${board} or ${goal}`)
        h += Math.abs(b % Dimensions - g % Dimensions) + Math.abs(b / Dimensions - g / Dimensions)
    }
    return h
}

/**
 * Checks to see if the node is the goal condition
 * @param {Node} node The node to check
 * @param {Array} goal The goal board
 */
function checkForSolved(node, goal) {
    if (JSON.stringify(node.board) == JSON.stringify(goal)) return true
    return false
}

function checkForSolvability(row) {
    let inversions = 0
    for (let i in row)
        for (let j in row) {
            if (j > i) continue
            if (row[i] == 0 || row[j] == 0) continue;
            if (row[i] < row[j]) inversions++
        }
    if (row.length % 2 == inversions % 2) return false
    else return true
}

/**
 * Main Code Here
 */

for (let i of TestBoards) {
    // Check for solvability before starting
    if (JSON.stringify(i.goal) == JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 0]) && !checkForSolvability(i.start)) {
        console.log(`Board ${i.start} is not solvable`)
        continue
    }

    // Set Dimensionality, skip if invalid dimensions
    Dimensions = Math.sqrt(i.start.length)
    if (Dimensions !== parseInt(Dimensions)) {
        console.log(`Board ${i.start} has invalid dimensionality`)
    }

    // Create starting node
    let startNode = new Node(i.start, null, 0, 0)
    let path = [startNode]
    let curNode = startNode

    // Console log the start
    console.log(`---------------------\n`)
    console.log(`Start Node:`)
    startNode.dump()

    let solved = false
    let solvable = true

    while (!solved) {
        solved = checkForSolved(curNode, i.goal)

        // Get start node neighbors
        let neighbors = getNeighbor(curNode)
        if (neighbors.length == 0) {
            if (path.length == 0) {
                console.log(`Board ${i.start} is not solvable\nRealized after ${expandedNodes} nodes expanded`)
                break
            }
            curNode = path.pop()
            continue
        }

        // Get the next node
        let nextNode = evaluateNeighbors(neighbors, curNode, i.goal)

        // Go back if no node was found
        if (!nextNode) {
            curNode = path.pop()
        } else {
            path.push(nextNode)
            curNode = nextNode
            if (Verbosity) {
                console.log(`\nGoing to next neighbor\n`)
                curNode.dump()
            }
            solved = checkForSolved(nextNode, i.goal)
        }
        expandedNodes++
    }

    if (solvable) {
        // Ending Console log
        console.log(`\nGoal Reached:\n`)
        curNode.dump()
        console.log('\n\n---------------------\n')
        console.log(`Expanded Nodes: ${expandedNodes}`)
        console.log(`Path Length: ${path.length}`)
        console.log('\n---------------------\n')
    }

    // Reset Variables for next board
    expandedNodes = 0
    openList.clear()
    closedList.clear()
}