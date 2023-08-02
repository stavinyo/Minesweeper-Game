'use strict'
const BOMB = '💣'
const EMPTY = ''
const FLAG = '🚩'
var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}


function onInit() {
    gBoard = createBoard()
    // console.table(gBoard)
    renderBoard(gBoard)
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


            strHTML += `\t<td data-i="${i}" data-j="${j}"
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

        board[randRowIdx][randColIdx].isMine = true

        locationBombBoard.splice(tempPos, 1)

        console.table(board)
    }
}

function onCellClicked(elCell, rowIdx, colIdx) {

    const cell = gBoard[rowIdx][colIdx]
    if (cell.isMine) elCell.innerText = BOMB



    var countAround = setMinesNegsCount(gBoard, rowIdx, colIdx)

    console.log(`countAround ${rowIdx} ${colIdx}: ${countAround}`)
    if (!gBoard[rowIdx][colIdx].isMine && elCell.innerText === EMPTY) {
        elCell.innerText = countAround
        gBoard[rowIdx][colIdx].minesAroundCount = countAround
        console.log(gBoard)
        expandShown(gBoard, rowIdx, colIdx)
        gGame.shownCount++
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

            if (!board[i][j].isMine) { //להוסיף רק כאשר board[i][j].minesAroundCount === 0

                board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)

                if (board[i][j].isMarked) continue

                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.innerText = board[i][j].minesAroundCount
                board[i][j].isShown = true

                // console.log(board[i][j])

            }
        }
    }
}

function onCellMarked(elCell, event) {
    event.preventDefault()

    var dataRow = +elCell.dataset.i
    var dataCol = +elCell.dataset.j
    // console.log("dataRow", dataRow)
    // console.log("dataCol", dataCol)
    // console.log(elCell)

    if (elCell.innerText === EMPTY) {
        elCell.innerText = FLAG
        gBoard[dataRow][dataCol].isMarked = true
    } else if (elCell.innerText === FLAG) {
        elCell.innerText = EMPTY
        gBoard[dataRow][dataCol].isMarked = false
    }
}
