
document.querySelectorAll('.search-control:not(.address-search-control) input').forEach(input => {
    input.addEventListener('keydown', e => {
        e = e || window.event;

        switch (e.which || e.keyCode) {
            case 13:
                e.preventDefault();
                search(input.value);
                break;
        }
    });
});

async function search(value) {
    if (value === '') return;

    const route = await UTILS.determineRoute(value);

    if (route) {
        window.location.href = route;
    } else {
        // Handle invalid search
        window.location.href = '/search/';
    }
};