'use strict'


//-------------------boards and mats------------------//
function createMat(rowIdx, colIdx) {
    const mat = []
    for (var i = 0; i < rowIdx; i++) {
        const row = []
        for (var j = 0; j < colIdx; j++) {
            row.push('👽')
        }
        mat.push(row)
    }
    return mat
}





function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            if (currCell.type === FLOOR && currCell.gameElement === null)
                emptyCells.push({ i, j })
        }
    }

    if (!emptyCells.length) return null
    return emptyCells
}



//-----------------Rendering-------------//
// --> Renders into an already made board in the HTML


// --> location such as: {i: 2, j: 7}
function renderCell(location, value) {

    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}



//-----------------randoms num & color-------------//
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
    // The maximum is exclusive and the minimum is inclusive
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}



//--------------extra shit and sheet--------------//
function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function openCloseModal() {
    gElModal.classList.toggle('hidden');
    /* <div class='modal hidden'>modal</div> */
}

function playSound() {
    const audio = new Audio('####.mp3')
    audio.play()
}

function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
        case 'd':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
        case 'w':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
        case 's':
            moveTo(i + 1, j)
            break
    }
}



