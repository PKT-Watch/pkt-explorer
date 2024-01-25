(function (PAGE_RICH_LIST) {
    PAGE_RICH_LIST.init = () => {
        const richList = document.querySelector('#rich-list');
        const btnLoadMore = document.querySelector('#btnLoadMore');

        let currentPage = 0;
        let index = 0;

        getRichList();

        async function getRichList() {
            btnLoadMore.classList.add('loading');
            currentPage++;
            const options = {
                limit: 100,
                page: currentPage
            };
            let addresses = await API.getRichList(options);
            buildList(addresses);
            btnLoadMore.classList.remove('d-none');
            btnLoadMore.classList.remove('loading');
        }

        function buildList(addresses) {
            if (currentPage === 1) {
                richList.innerHTML = '';
            }
            
            addresses.forEach(address => {
                index++;
                richList.insertAdjacentHTML('beforeend',
                    `
                        <div class="list-item tile">
                            <div class="rank"><span class="indicator">${index}</span>${UTILS.formatOwnedAddress({ address: address.address, label: '', useName: true })}</div>
                            <div class="address">
                                <a href="/address/${address.address}" class="hash">${address.address}</a>
                            </div>
                            <div class="value">
                                <span class="value-output">${UTILS.unitsToPkt(address.balance, 3)}</span>
                            </div>
                        </div>
                    `
                );
            });
        }

        btnLoadMore.addEventListener('click', getRichList);
    }
}(window.PAGE_RICH_LIST = window.PAGE_RICH_LIST || {}));