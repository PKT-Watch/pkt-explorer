import {} from './models/__import.js';
import {} from './global/__import.js';

(async () => {
    const externalTipBlock = await API.getExternalTipBlock();
    const internalTipBlock = await API.getTipBlock();

    if (externalTipBlock.height > internalTipBlock.height) {
        const syncError = document.querySelector('.sync-error');
        const internalHeight = syncError.querySelector('.internal-height');
        const externalHeight = syncError.querySelector('.external-height');
        const syncDifference = syncError.querySelector('.sync-difference');
        syncError.classList.remove('d-none');

        internalHeight.textContent = internalTipBlock.height;
        externalHeight.textContent = externalTipBlock.height;
        syncDifference.textContent = externalTipBlock.height - internalTipBlock.height;
    }
})();