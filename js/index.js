'use strict'

////////////////////////////////////////////////////////////////////////////
// TODO: לתקן את הניצחון
// TODO: gGame לתקן את הספירות של
// TODO: לתקן לבבות
// TODO: לתקן לבבות לשחקן 4 על 4
// TODO: לתקן שעון
// TODO: לבדוק The first clicked cell is never a mine
// TODO: לבדוק רקורסיה
// TODO: לתקן פונקציות לא טובות ומסורבלות
////////////////////////////////////////////////////////////////////////////

const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
const NORMAL = '😁'
const LOSE = '🤯'
const WIN = '😎'

var gBoard
var gLife = 3
var gTime = 0
var gIsFirstClick = true
var gIsRenderedBombs = false
var gTimerIntervalId = 0
var gStartTime
var gBombLeftCounter
var locationBombBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = createBoard()
    renderBoard(gBoard)
    gBombLeftCounter = gLevel.MINES
    document.querySelector('.bomb-left .span-bomb-left').innerText = gBombLeftCounter
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    restart()
}

function restart() {
    gGame.isOn = true
    gIsFirstClick = true
    gIsRenderedBombs = false
    gLife = 4 // לתקן ל 3 עם use life
    gTime = 0
    gGame.markedCount = 0
    gGame.shownCount = 0

    useLife()
    document.querySelector('.restart').innerText = NORMAL

    document.querySelector('.time .span-time').innerText = '0'
    clearInterval(gTimerIntervalId)
    gTimerIntervalId = 0
    onInit()
}

function createBoard() {
    const board = []
    locationBombBoard = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = {
                minesAroundCount: 0, //לחזורררררררררר
                isShown: false,
                isMine: false,
                isMarked: false
            }
            locationBombBoard.push({ i, j })
        }
    }

    console.log("locationBombBoard", locationBombBoard)
    // if (!gIsFirstClick) createRandomBombs(board, locationBombBoard)
    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr class="table-row" >\n`

        for (var j = 0; j < board[i].length; j++) {
            strHTML += `\t<td class="cell" data-i="${i}" data-j="${j}"
                           onclick="onCellClicked(this, ${i}, ${j})"
                           oncontextmenu="onCellMarked(this, event, ${i}, ${j})">
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

//DONE
function createRandomBombs(board, locationBombBoard) {
    var loc = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            console.log("board[i][j].isShown", board[i][j].isShown)
            if (board[i][j].isShown) {
                console.log("stavvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")
                console.log("locationBombBoard", locationBombBoard[loc])
                locationBombBoard.splice(loc, 1)
                loc--
            }
            loc++
        }
    }
    console.log("locationBombBoard", locationBombBoard)

    for (var i = 0; i < gLevel.MINES; i++) {
        var tempPos = getRandomIntInclusive(0, locationBombBoard.length - 1)

        var randRowIdx = locationBombBoard[tempPos].i
        var randColIdx = locationBombBoard[tempPos].j

        board[randRowIdx][randColIdx].isMine = true
        locationBombBoard.splice(tempPos, 1)
    }

    console.log("the boardddd:", board)
}

function onCellClicked(elCell, rowIdx, colIdx) {

    if (!gGame.isOn) return
    if (gBoard[rowIdx][colIdx].isShown) return
    if (gBoard[rowIdx][colIdx].isMarked) return
    console.log("stavstavstav")



    const cell = gBoard[rowIdx][colIdx]
    console.log("showwwwww", gGame.shownCount)
    console.log("cell.isMine && gLife !== 0", cell.isMine && gLife !== 0)
    if (cell.isMine && gLife !== 0) {
        elCell.innerText = BOMB
        // console.log(elCell.innerText = BOMB)
        cell.isShown = true
        return checkGameOver(gBoard, rowIdx, colIdx)
    }

    const countAround = setMinesNegsCount(gBoard, rowIdx, colIdx)
    if (!gBoard[rowIdx][colIdx].isMine && (elCell.innerText === EMPTY || elCell.innerText === FLAG)) {
        elCell.innerText = countAround === 0 ? '' : countAround
        gBoard[rowIdx][colIdx].minesAroundCount = countAround
        gBoard[rowIdx][colIdx].isShown = true
        gGame.shownCount++
        elCell.classList.add('mark')

        if (countAround === 0 || gIsFirstClick) { //  ורקורסיבי לתקן לחיצה ראשונה לא מגריל פצצות
            expandShown(gBoard, rowIdx, colIdx)

            if (gIsFirstClick) {
                startTimer()
                gIsFirstClick = false
                // console.log("rowIdx, colIdx", rowIdx, colIdx)
                // expandShownRecursive(gBoard, rowIdx, colIdx)
            }
        }
        console.log("hhihihhhi")
        checkGameOver(gBoard, rowIdx, colIdx)
    }
    console.table(gBoard)
    if (!gIsRenderedBombs) {
        createRandomBombs(gBoard, locationBombBoard)
        gIsRenderedBombs = true
        console.log("rowIdx, colIdx", rowIdx, colIdx)
        expandShownRecursive(gBoard, rowIdx, colIdx)
    }

}


//USED HALP
function expandShownRecursive(gBoard, rowIdx, colIdx, visitedCells = new Set()) {
    if (rowIdx < 0 || rowIdx >= gBoard.length || colIdx < 0 || colIdx >= gBoard[0].length) return;

    var cellKey = `${rowIdx}-${colIdx}`
    if (visitedCells.has(cellKey)) return

    visitedCells.add(cellKey)

    var currCount = setMinesNegsCount(gBoard, rowIdx, colIdx)
    if (currCount > 0) {
        document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).innerText = currCount
        document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).classList.add('mark')
        return;
    }

    document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).innerText = EMPTY
    document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).classList.add('mark')

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            expandShownRecursive(gBoard, i, j, visitedCells)
        }
    }
}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            console.log("boarddddd:", board)
            var currCell = board[i][j]
            console.log("board[i][j].isMine", i, j, board[i][j].isMine)
            if (currCell.isMine) {
                console.log("currCell.isMine count", count)
                count++
            }
        }
    }
    console.log("count:::", count)
    return count
}

function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            console.log("board[i][j].minesAroundCount", board[i][j].minesAroundCount)

            if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {

                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                var countAround = board[i][j].minesAroundCount
                elCell.innerText = countAround === 0 ? '' : countAround
                elCell.classList.add('mark')
                board[i][j].isShown = true

                gGame.shownCount++
            }
        }
    }
    console.log("gGame.shownCount", gGame.shownCount)
}

function onCellMarked(elCell, event, i, j) {
    event.preventDefault()
    if (gGame.isOn === false) return
    if (elCell.innerHTML === BOMB) return
    if (gBoard[i][j].isShown) return

    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    if (gBoard[i][j].isMarked) {
        gGame.markedCount++
        bombLeftCounter(true)
        renderCell({ i, j }, FLAG)
    } else {
        gGame.markedCount--
        bombLeftCounter(false)
        renderCell({ i, j }, EMPTY)
    }

    checkGameOver(gBoard, i, j)
}

function renderCell(location, value) {

    // Select the elCell and set the value
    const elCell = document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`)
    elCell.innerHTML = value
}

function checkGameOver(gBoard, rowIdx, colIdx) {
    if ((gGame.markedCount <= gLevel.MINES) && (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES))) {
        console.log("win")
        document.querySelector('.restart').innerText = WIN
        gGame.isOn = false
        return
    }

    if (gBoard[rowIdx][colIdx].isMine && gBoard[rowIdx][colIdx].isShown && !gBoard[rowIdx][colIdx].isMarked) {
        useLife(gLife)
        bombLeftCounter()
        console.log("gLife", gLife)
        if (gLife === 0) {
            gameOver()
        }
    }
}

function gameOver() {
    console.log('Game Over!!!')
    clearInterval(gTimerIntervalId)
    gGame.isOn = false
    document.querySelector('.restart').innerText = LOSE
    boomsAllCells()
}

function boomsAllCells() {
    setTimeout(() => {
        let mySound = new Audio('audio/boom.wav')
        mySound.play()

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {

                var elCellBomb = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (gBoard[i][j].isMine) elCellBomb.innerText = '💥'

                // elCellBomb.classList.remove('mark')
            }
        }



    }, 1000);
    return
}

function startTimer() {
    gStartTime = Date.now()

    gTimerIntervalId = setInterval(function () {
        var delta = Date.now() - gStartTime
        var elTimer = document.querySelector('.time .span-time')
        elTimer.innerText = `${Math.floor((delta / 997))}`
    }, 1000)
}

function useLife(isPositive = true) {
    if (isPositive) gLife--
    if (!isPositive) gLife++

    document.querySelector('.life-container').innerHTML = '<div class="life life1">❤️</div>'.repeat(gLife)
}

function bombLeftCounter(isPositive = true) {
    if (isPositive) gBombLeftCounter--
    if (!isPositive) gBombLeftCounter++


    document.querySelector('.bomb-left .span-bomb-left').innerText = gBombLeftCounter
}

