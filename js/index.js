'use strict'

const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
const NORMAL = '😁'
const LOSE = '🤯'
const WIN = '😎'
const LIFE = 3
const MIN_MINES = 2

var gBoard
var gLife = 0
var gIsLifeNeeded = false
var gTime = 0
var gIsFirstClick = true
var gIsRenderedBombs = false
var gTimerIntervalId = 0
var gStartTime
var gBombLeftCounter
var gEmptyCellsIndex
var gIsWin = false
var gTimeGame = 0
var gLevelName = 'easy'
var gHint = false
var gSaveCell = false

var gManualBombPlacement = false
var countManualClicked = 0
var gCounterMoves = 0

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
    document.getElementById("best-score").innerHTML = localStorage.getItem(`bestscore-${gLevelName}`)
    // fenderHint()
}

function chooseLevel(size, mines, level) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    gLevelName = level
    restart()
}

function restart() {
    gGame.isOn = true
    gIsFirstClick = true
    gIsRenderedBombs = false
    gIsLifeNeeded = gLevel.MINES !== MIN_MINES ? true : false
    gLife = gIsLifeNeeded ? LIFE : 0
    gTime = 0
    gIsWin = false
    gSaveCell = false
    gHint = false
    gGame.markedCount = 0
    gGame.shownCount = 0
    gManualBombPlacement = false
    countManualClicked = 0
    gCounterMoves = 0

    renderLife()
    document.querySelector('.restart').innerText = NORMAL
    document.querySelector('.manual').classList.remove('btn-off')
    document.querySelector(".manual").classList.remove("btn-toggle")
    document.querySelector('.safe-cell').classList.remove('btn-off')
    document.querySelector('.time .span-time').innerText = '0'
    clearInterval(gTimerIntervalId)
    gTimerIntervalId = 0
    onInit()
}

function createBoard() {
    const board = []
    gEmptyCellsIndex = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {

            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            gEmptyCellsIndex.push({ i, j })
        }
    }
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

function createRandomBombs(board, gEmptyCellsIndex) {
    var countLocation = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {

            if (board[i][j].isShown) {
                gEmptyCellsIndex.splice(countLocation, 1)
                countLocation--
            }
            countLocation++
        }
    }

    for (var i = 0; i < gLevel.MINES; i++) {
        var tempPos = getRandomIntInclusive(0, gEmptyCellsIndex.length - 1)

        var randRowIdx = gEmptyCellsIndex[tempPos].i
        var randColIdx = gEmptyCellsIndex[tempPos].j

        board[randRowIdx][randColIdx].isMine = true
        gEmptyCellsIndex.splice(tempPos, 1)
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function onCellClicked(elCell, rowIdx, colIdx) {
    const currCell = gBoard[rowIdx][colIdx]
    if (gManualBombPlacement) {
        if (currCell.isMine === true) return
        document.querySelector('.span-bomb-left').innerText = ++gBombLeftCounter
        currCell.isMine = true
        return
    }

    if (!gGame.isOn) return
    if (currCell.isShown) return
    if (currCell.isMarked) return


    if (gHint) {
        showHints(elCell, gBoard, rowIdx, colIdx)
        // showHints(rowIdx, colIdx)
        return
    }
    gCounterMoves++
    document.querySelector(".manual").classList.add('btn-off')
    checkIsMine(elCell, rowIdx, colIdx)
    const countAround = setMinesNegsCount(gBoard, rowIdx, colIdx)
    putNumberInCell(currCell, countAround, elCell, rowIdx, colIdx)
    checkRenderedBombs(rowIdx, colIdx)

    console.table(gBoard)
}

function checkIsMine(elCell, rowIdx, colIdx) {
    if (gBoard[rowIdx][colIdx].isMine) {
        elCell.innerText = BOMB

        countShownCount(gBoard, rowIdx, colIdx)
        return checkGameOver(gBoard, rowIdx, colIdx)
    }
}

function putNumberInCell(currCell, countAround, elCell, rowIdx, colIdx) {
    if (currCell.isMine) {
        elCell.innerText = BOMB
        return
    }
    if (!currCell.isMine && (!currCell.isShown || currCell.isMarked)) {
        elCell.innerText = countAround === 0 ? '' : countAround
        currCell.minesAroundCount = countAround
        countShownCount(gBoard, rowIdx, colIdx)
        elCell.classList.add('mark')
        gEmptyCellsIndex.splice()

        if (countAround === 0 || gIsFirstClick) {
            expandShown(gBoard, rowIdx, colIdx)
            if (gIsFirstClick) {
                startTimer()
                gIsFirstClick = false
            }
        }
        checkGameOver(gBoard, rowIdx, colIdx)
    }
}

function checkRenderedBombs(rowIdx, colIdx) {
    if (!gManualBombPlacement && countManualClicked === 2) {
        gIsRenderedBombs = true
        if (gBoard[rowIdx][colIdx].isMine) return
        return expandShownRecursive(gBoard, rowIdx, colIdx)
    }

    if (!gIsRenderedBombs) {
        createRandomBombs(gBoard, gEmptyCellsIndex)
        gIsRenderedBombs = true
        expandShownRecursive(gBoard, rowIdx, colIdx)
    }
}

function expandShownRecursive(gBoard, rowIdx, colIdx, visitedCells = new Set()) {
    if (rowIdx < 0 || rowIdx >= gBoard.length || colIdx < 0 || colIdx >= gBoard[0].length) return;

    var cellKey = `${rowIdx}-${colIdx}`
    if (visitedCells.has(cellKey)) return

    visitedCells.add(cellKey)
    var currCount = setMinesNegsCount(gBoard, rowIdx, colIdx)
    if (currCount > 0) {
        document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).innerText = currCount
        document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`).classList.add('mark')
        // gGame.shownCount++
        countShownCount(gBoard, rowIdx, colIdx)
        return
    }
    if (currCount === 0)
        countShownCount(gBoard, rowIdx, colIdx)
    // gGame.shownCount++

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

            var currCell = board[i][j]
            if (currCell.isMine) {
                count++
            }
        }
    }
    return count
}

function expandShown(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {

                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

                var countAround = board[i][j].minesAroundCount
                elCell.innerText = countAround === 0 ? '' : countAround
                elCell.classList.add('mark')
                countShownCount(gBoard, i, j)
            }
        }
    }
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
    var currCell = gBoard[rowIdx][colIdx]

    if (currCell.isMine && currCell.isShown && !currCell.isMarked) {
        if (gIsLifeNeeded) useLife(gLife)
        bombLeftCounter()
        if (gLife === 0) {
            gameOver()
        }
    }

    if ((gLevel.SIZE ** 2 === gGame.shownCount + gGame.markedCount) && (gBombLeftCounter === 0)) {
        document.querySelector('.restart').innerText = WIN
        gGame.isOn = false

        clearInterval(gTimerIntervalId)
        let mySound = new Audio('audio/Win.wav')
        mySound.play()
        gIsWin = true
        bestScore()
        return
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
    let mySound = new Audio('audio/boom.wav')
    mySound.play()

    setTimeout(() => {

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {

                var elCellBomb = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                if (gBoard[i][j].isMine) elCellBomb.innerText = '💥'

                // elCellBomb.classList.remove('mark')
            }
        }
    }, 500);
    return
}

function startTimer() {
    gStartTime = Date.now()
    gTimeGame
    gTimerIntervalId = setInterval(function () {
        var delta = Date.now() - gStartTime
        var elTimer = document.querySelector('.time .span-time')

        gTimeGame = (delta / 1000).toFixed(3)
        elTimer.innerText = `${gTimeGame}`
    }, 37)


}

function useLife(isPositive = true) {
    if (isPositive) gLife--
    if (!isPositive) gLife++
    renderLife()
}

function renderLife() {
    document.querySelector('.life-container').innerHTML = '<div class="life life1">❤️</div>'.repeat(gLife)
}

function bombLeftCounter(isPositive = true) {
    if (isPositive) gBombLeftCounter--
    if (!isPositive) gBombLeftCounter++
    document.querySelector('.bomb-left .span-bomb-left').innerText = gBombLeftCounter
}

function countShownCount(board, i, j) {
    var currCell = board[i][j]

    if (currCell.isShown) return

    gGame.shownCount++
    currCell.isShown = true
}




//-----------------------Local Storage-------------------//
function bestScore() {

    const bestScore = parseInt(localStorage.getItem(`bestscore-${gLevelName}`), 10);
    // const bestScore = localStorage.getItem(`bestscore-${gLevelName}`)
    if (bestScore < gTimeGame || !gIsWin) return;
    if (typeof (Storage) !== "undefined") {
        localStorage.setItem(`bestscore-${gLevelName}`, gTimeGame);
        document.getElementById("best-score").innerHTML = localStorage.getItem(`bestscore-${gLevelName}`);
    } else {
        console.log("no local storage work's")
    }
}
//---------------------------------------------------------//





//-----------------------HINTS--------------------------//
function useHint() {
    if (gIsFirstClick) {
        alert("This option is only available after your first click")
        return
    }
    gHint = true
}

function showHints(elCell, gBoard, rowIdx, colIdx) {
    var currCell = gBoard[rowIdx][colIdx]
    if (gBoard[rowIdx][colIdx].isMine) {
        elCell.innerText = BOMB
        // elCell.classList.add('hint-back')
        showHint(elCell, gBoard, rowIdx, colIdx)
    }

    const countAround = setMinesNegsCount(gBoard, rowIdx, colIdx)
    putNumberInCellHint(currCell, countAround, elCell, rowIdx, colIdx)

    console.table(gBoard)
    gHint = false
}

function putNumberInCellHint(currCell, countAround, elCell, rowIdx, colIdx) {
    if (currCell.isMine) elCell.innerText = BOMB
    else {
        elCell.innerText = countAround === 0 ? '' : countAround
        currCell.minesAroundCount = countAround
    }
    // elCell.classList.add('hint-back')
    showHint(elCell, gBoard, rowIdx, colIdx)
    expandShownHint(gBoard, rowIdx, colIdx)
}

function expandShownHint(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue

            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
            var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

            var countAround = board[i][j].minesAroundCount

            if (board[i][j].isMine) elCell.innerText = BOMB
            else {
                elCell.innerText = countAround === 0 ? '' : countAround
                board[i][j].minesAroundCount = countAround
            }
            // elCell.classList.add('hint-back')
            showHint(elCell, board, i, j)
        }
    }
}

function showHint(elCell, board, rowIdx, colIdx) {

    elCell.classList.add('hint-back')

    setTimeout(() => {
        elCell.classList.remove('hint-back')
        var currCell = board[rowIdx][colIdx]

        if (currCell.isShown && currCell.isMine)
            elCell.innerText = BOMB
        else if (currCell.isMarked)
            elCell.innerText = FLAG
        else if (!currCell.isShown)
            elCell.innerText = EMPTY
        // if (currCell.isShown || currCell.isMarked) return


    }, 1000);
}
//---------------------------------------------------------------------//




//--------------------------SAFE CELL----------------------------------//
function showSafeCell() {
    if (gSaveCell || gIsFirstClick) {
        return
    }

    var randIdx = getRandomIntInclusive(0, gEmptyCellsIndex.length - 1)
    var rowIdx = gEmptyCellsIndex[randIdx].i
    var colIdx = gEmptyCellsIndex[randIdx].j

    while (gBoard[rowIdx][colIdx].isMine || gBoard[rowIdx][colIdx].isShown) {
        randIdx = getRandomIntInclusive(0, gEmptyCellsIndex.length - 1)
        rowIdx = gEmptyCellsIndex[randIdx].i
        colIdx = gEmptyCellsIndex[randIdx].j

    }

    const elCell = document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`)

    elCell.classList.add('hint-back')
    setTimeout(() => {
        elCell.classList.remove('hint-back')
    }, 1000);

    document.querySelector('.safe-cell').classList.add('btn-off')
    gSaveCell = true
}
//---------------------------------------------------------------------//




//--------------------Manually positioned mines----------------------//


function ManualBombPlacement() {
    if (countManualClicked > 1 || gCounterMoves != 0) return
    changeTitelBtn()


    gManualBombPlacement = !gManualBombPlacement
    countManualClicked++

    if (countManualClicked === 1) {
        document.querySelector('.span-bomb-left').innerText = 0
        gBombLeftCounter = 0
    }
}

function changeTitelBtn() {
    document.querySelector(".manual").classList.toggle("btn-toggle")

    if (document.querySelector(".manual").innerText === 'Click !!!') {
        document.querySelector(".manual").innerText = 'Manual'
        document.querySelector('.manual').classList.add('btn-off')
    }
    else document.querySelector(".manual").innerText = 'Click !!!'
}
