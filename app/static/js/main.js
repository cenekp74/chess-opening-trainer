/** vyuziva se pri skryvani flash alertu po kliknuti na krizek */
function setParentDisplayNone(element) {
    element.parentNode.style.display = 'none';
}

function stopEventPropagation(event) {
    event.stopPropagation()
}