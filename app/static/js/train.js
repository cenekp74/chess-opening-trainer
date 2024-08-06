import {INPUT_EVENT_TYPE, COLOR, Chessboard, BORDER_TYPE} from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/Chessboard.js"
import {MARKER_TYPE, Markers} from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/extensions/markers/Markers.js"
import {PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog} from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/extensions/promotion-dialog/PromotionDialog.js"
import {Accessibility} from "https://cdn.jsdelivr.net/npm/cm-chessboard@8/src/extensions/accessibility/Accessibility.js"
import {Chess} from "https://cdn.jsdelivr.net/npm/chess.mjs@1/src/chess.mjs/Chess.js"

function inputHandler(event) {
    if(event.type === INPUT_EVENT_TYPE.movingOverSquare) {
        return // ignore this event
    }
    if(event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
        event.chessboard.removeMarkers(MARKER_TYPE.dot)
        event.chessboard.removeMarkers(MARKER_TYPE.bevel)
    }
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        const moves = window.chess.moves({square: event.squareFrom, verbose: true})
        for (const move of moves) { // draw dots on possible squares
            if (move.promotion && move.promotion !== "q") {
                continue
            }
            if (event.chessboard.getPiece(move.to)) {
                event.chessboard.addMarker(MARKER_TYPE.bevel, move.to)
            } else {
                event.chessboard.addMarker(MARKER_TYPE.dot, move.to)
            }
        }
        return moves.length > 0
    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        const move = {from: event.squareFrom, to: event.squareTo, promotion: event.promotion}
        const result = window.chess.move(move)
        if (result) {
            event.chessboard.state.moveInputProcess.then(() => { // wait for the move input process has finished
                event.chessboard.setPosition(window.chess.fen(), true).then(() => { // update position, maybe castled and wait for animation has finished
                    checkMove(move)
                })
            })
        } else {
            // promotion?
            let possibleMoves = window.chess.moves({square: event.squareFrom, verbose: true})
            for (const possibleMove of possibleMoves) {
                if (possibleMove.promotion && possibleMove.to === event.squareTo) {
                    event.chessboard.showPromotionDialog(event.squareTo, COLOR.white, (result) => {
                        console.log("promotion result", result)
                        if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                            window.chess.move({from: event.squareFrom, to: event.squareTo, promotion: result.piece.charAt(1)})
                            event.chessboard.setPosition(window.chess.fen(), true)
                            checkMove(move)
                        } else {
                            // promotion canceled
                            event.chessboard.enableMoveInput(inputHandler, COLOR.white)
                            event.chessboard.setPosition(window.chess.fen(), true)
                        }
                    })
                    return true
                }
            }
        }
        return result
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        if(event.legalMove) {
            event.chessboard.disableMoveInput()
        }
    }
}

function uciFromMove(move) {
    let uci = `${move.from}${move.to}`
    if (move.promotion) {
        uci += move.promotion
    }
    return uci
}

function moveFromUci(uci) {
    if (typeof uci !== 'string' || (uci.length !== 4 && uci.length !== 5)) {
      throw new Error("Invalid UCI format");
    }
  
    let event = {
      from: uci.substring(0, 2),
      to: uci.substring(2, 4),
      promotion: uci.length === 5 ? uci[4] : null
    };
  
    return event;
}  

function checkMove(move) {
    let result = uciFromMove(move) == MOVE
    console.log(result)
    if (result) {
        document.querySelector(".main-container").classList.add("solved")
    } else {
        document.querySelector(".main-container").classList.add("failed")
    }
    document.getElementById("hint-button").style.display = "none"
    document.getElementById("next-button").style.display = ""
    document.getElementById("restart-button").style.display = ""
}

function restart() {
    window.chess = new Chess(FEN)
    window.board.setPosition(window.chess.fen())
    document.getElementById("hint-button").style.display = ""
    document.getElementById("next-button").style.display = "none"
    document.getElementById("restart-button").style.display = "none"
    window.board.enableMoveInput(inputHandler, COL)
}

function next() {
    document.location.reload()
}

function hint() {
    window.chess.move(moveFromUci(MOVE))
    window.board.setPosition(window.chess.fen(), true)
    document.querySelector(".main-container").classList.add("failed")
    document.getElementById("hint-button").style.display = "none"
    document.getElementById("next-button").style.display = ""
    document.getElementById("restart-button").style.display = ""
}

window.board = new Chessboard(document.getElementById("board"), {
    position: Chess.FEN,
    assetsUrl: "https://cdn.jsdelivr.net/npm/cm-chessboard@8/assets/",
    style: {borderType: BORDER_TYPE.none, pieces: {file: "pieces/staunty.svg"}, animationDuration: 100},
    orientation: COLOR.white,
    extensions: [
        {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
        {class: PromotionDialog},
        {class: Accessibility, props: {visuallyHidden: true}}
    ]
})
restart()

document.getElementById("restart-button").addEventListener("click", restart)
document.getElementById("next-button").addEventListener("click", next)
document.getElementById("hint-button").addEventListener("click", hint)