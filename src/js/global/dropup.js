document.querySelector('body').addEventListener('click', e => {
    if (e.target && e.target.closest('.dropup button')) {
        e.target.closest('.dropup').classList.toggle('active');
    }
});