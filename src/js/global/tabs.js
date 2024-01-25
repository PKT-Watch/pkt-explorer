document.querySelectorAll('.tab-nav').forEach(tabNav => {
    tabNav.addEventListener('click', e => {
        if (e.target && e.target.closest('[data-target]')) {
            const clickedEl = e.target.closest('[data-target]');
            const target = document.querySelector(clickedEl.dataset.target);
            const group = document.querySelector(clickedEl.dataset.group);

            tabNav.querySelectorAll('[data-target]').forEach(el => {
                if (el === clickedEl) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });

            group.querySelectorAll('.tab').forEach(tab => {
                if (tab === target) {
                    tab.classList.remove('d-none');
                } else {
                    tab.classList.add('d-none');
                }
            });

            const event = new CustomEvent("tabChanged", { detail: clickedEl.dataset.target });
            tabNav.dispatchEvent(event);
        }
    });
});