document.body.addEventListener('click', e => {
    if (e.target && e.target.closest('.expandable-content-control')) {
        const expandableContentEl = e.target.closest('.expandable-content');
        expandableContentEl.classList.toggle('expanded');

        if (!expandableContentEl.classList.contains('expanded')) {
            if (expandableContentEl.closest('#coinbase-transaction-list')) {
                expandableContentEl.scrollIntoView({behavior: 'instant', block: 'start', inline: 'nearest'});
            }
        }
        
    }
});