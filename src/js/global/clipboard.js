const clipboardControls = document.querySelectorAll('.clipboard-copy');

clipboardControls.forEach((control) => {
    control.addEventListener('click', e => {
        const clipboardControl = e.currentTarget;
        copyToClipboard(clipboardControl.querySelector('.clipboard-copy-value').innerText.trim());
    
        clipboardControl.classList.add('copied');
    
        setTimeout(() => {
            clipboardControl.classList.remove('copied');
        }, 1500);
    });
});

function copyToClipboard(text) {
    if (!text || text === '') return;

    var copyElement = document.createElement("span");
    copyElement.appendChild(document.createTextNode(text));
    copyElement.id = 'tempCopyToClipboard';
    document.body.append(copyElement);

    // select the text
    var range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    // copy & cleanup
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyElement.remove();
}