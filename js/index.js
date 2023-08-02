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
var gTimerIntervalId = 0
var gStartTime

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
    // console.table(gBoard)
    renderBoard(gBoard)
}

function chooseLevel(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    restart()
}

function restart() {
    gGame.isOn = true
    gIsFirstClick = true
    gLife = 3
    gTime = 0
    gIsFirstClick = true

    document.querySelector('.life1').classList.remove('hidden')
    document.querySelector('.life2').classList.remove('hidden')
    document.querySelector('.life3').classList.remove('hidden')
    document.querySelector('.restart').innerText = NORMAL

    document.querySelector('.time').innerText = '000'
    clearInterval(gTimerIntervalId)
    gTimerIntervalId = 0
    onInit()
}

function createBoard() {
    const board = []
    const locationBombBoard = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = {
                minesAroundCount: null, //לחזורררררררררר
                isShown: false,
                isMine: false,
                isMarked: false
            }
            locationBombBoard.push({ i, j })
        }
    }
    createRandomBombs(board, locationBombBoard)
    return board
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr class="table-row" >\n`

        for (var j = 0; j < gLevel.SIZE; j++) {


            strHTML += `\t<td class="cell" data-i="${i}" data-j="${j}"
                           isMine =${board[i][j].isMine}  onclick="onCellClicked(this, ${i}, ${j})"
                           oncontextmenu="onCellMarked(this, event)">
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    // console.log(elBoard)
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function createRandomBombs(board, locationBombBoard) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var tempPos = getRandomIntInclusive(0, locationBombBoard.length - 1)
        // console.log('tempPos', tempPos)

        var randRowIdx = locationBombBoard[tempPos].i
        var randColIdx = locationBombBoard[tempPos].j

        // console.log("randRowIdx", randRowIdx)
        // console.log("randColIdx", randColIdx)
        board[randRowIdx][randColIdx].isMine = true

        locationBombBoard.splice(tempPos, 1)

        // console.table(board)
    }
}

function onCellClicked(elCell, rowIdx, colIdx) {
    if (gGame.isOn === false) return
    if (gBoard[rowIdx][colIdx].isShown) return
    console.log("stavstavstav")

    const cell = gBoard[rowIdx][colIdx]
    console.log("showwwwww", gGame.shownCount)
    if (cell.isMine && gLife !== 0) {
        elCell.innerText = BOMB
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
            }
        }
        console.log("hhihihhhi")
        checkGameOver(gBoard, rowIdx, colIdx)
    }


}

function setMinesNegsCount(board, rowIdx, colIdx) {
    var count = 0
    // console.log("board", board)

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            // console.log("board[i][j]", board[i][j])
            var currCell = board[i][j]
            if (currCell.isMine) {
                count++
            }
        }
    }
    return count
}

// לחזוררררר
function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            console.log("board[i][j].minesAroundCount", board[i][j].minesAroundCount)

            if (!board[i][j].isMine && !board[i][j].isShown) { //להוסיף רק כאשר board[i][j].minesAroundCount === 0

                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)

                if (board[i][j].isMarked) continue

                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                var countAround = board[i][j].minesAroundCount
                elCell.innerText = countAround === 0 ? '' : countAround
                elCell.classList.add('mark')
                board[i][j].isShown = true
                gGame.shownCount++

                // console.log(board[i][j])

            }
        }
    }
}

function onCellMarked(elCell, event) {
    event.preventDefault()
    if (gGame.isOn === false) return
    var dataRow = +elCell.dataset.i
    var dataCol = +elCell.dataset.j
    // console.log("dataRow", dataRow)
    // console.log("dataCol", dataCol)
    // console.log(elCell)

    if (elCell.innerText === EMPTY) {
        elCell.innerText = FLAG
        gBoard[dataRow][dataCol].isMarked = true
        gGame.markedCount++
        checkGameOver(gBoard, dataRow, dataCol)
    } else if (elCell.innerText === FLAG) {
        elCell.innerText = EMPTY
        gBoard[dataRow][dataCol].isMarked = false
        gGame.markedCount--
    }
    console.log(gGame.markedCount)
}

function checkGameOver(gBoard, rowIdx, colIdx) {
    if ((gGame.markedCount <= gLevel.MINES) && (gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES))) {
        console.log("win")
        document.querySelector('.restart').innerText = WIN
        return
    }

    if (gBoard[rowIdx][colIdx].isMine) {
        useLife(gLife)
        console.log("gLife", gLife)
        if (gLife === 0) {
            console.log('Game Over!!!')
            clearInterval(gTimerIntervalId)
            gGame.isOn = false
            document.querySelector('.restart').innerText = LOSE

            setTimeout(() => {
                for (var i = 0; i < gBoard.length; i++) {
                    for (var j = 0; j < gBoard[i].length; j++) {
                        var elCellBomb = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                        elCellBomb.classList.remove('mark')
                        elCellBomb.innerText = '💥'
                    }
                }
            }, 1000);
            return
        }
    }
}

function startTimer() {
    gStartTime = Date.now()

    gTimerIntervalId = setInterval(function () {
        var delta = Date.now() - gStartTime
        var elTimer = document.querySelector('.time')
        elTimer.innerText = `${Math.floor((delta / 997))}`
    }, 1000)
}

function useLife(i) {
    var elLife = document.querySelector(`.life${i}`)
    console.log(elLife)
    elLife.classList.add('hidden')
    gLife--
}

