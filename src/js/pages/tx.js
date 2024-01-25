(function (PAGE_TX) {
    PAGE_TX.init = () => {
        const transactionList = document.querySelector('#transaction-list');
        const txHash = document.querySelector('#tx-hash');
        const txSize = document.querySelector('#tx-size');
        const txDate = document.querySelector('#tx-date');
        const txHeight = document.querySelector('#tx-height');
        const txStatus = document.querySelector('#tx-status');
        const txConfirmations = document.querySelector('#tx-confirmations');
        const txValue = document.querySelector('#tx-value');
        const txFee = document.querySelector('#tx-fee');
        const announcementContainer = document.querySelector('#announcement-container');

        let tx;
        let nextBlock;

        txHash.innerHTML = `<span class="clipboard-copy-value">${TXHASH}</span> <span class="icon"></span>`;

        getTransaction();

        async function getTransaction() {
            tx = await API.getTransaction(TXHASH);
            if (typeof tx === 'undefined') window.location = '/search/';
            buildTransactionStats(tx);
            buildTransactionsList(tx);
            getTipBlock();
            await getNextBlock();
            checkStatus();
        }

        function buildTransactionStats(tx) {
            txSize.textContent = `${ UTILS.numberWithCommas(tx.size / 1024, 2)} KB`;
            txDate.textContent = new Date(tx.firstSeen).toLocaleString([], {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            if (typeof tx.blockHeight !== 'undefined') {
                txHeight.innerHTML = `<a href="/block/${tx.blockHash}">${tx.blockHeight}</a>`;
            } else {
                txHeight.textContent = '-';
            }

            txValue.innerHTML = UTILS.unitsToPkt(tx.value, 2);

        }

        async function getRewardStats() {
            const url = `stats/coins/${tx.blockHeight}/`;
            let res = await API.get(url);

            if (typeof res === 'undefined') {
                return;
            }

            return res;
        }

        async function buildTransactionsList(txn) {
            const coinStats = await getRewardStats();

            // Sort by transaction value
            txn.output.sort((a, b) => {
                a.value = parseInt(a.value);
                b.value = parseInt(b.value);
                return (a.value > b.value || b.address.startsWith('script')) ? -1 : ((b.value > a.value || a.address.startsWith('script')) ? 1 : 0);
            });

            transactionList.innerHTML = '';

            let fee = 0;

            const listItem = createListItemElement(txn);
            const inputsEl = listItem.querySelector('.inputs');
            const outputsEl = listItem.querySelector('.outputs');
            const isCoinbase = txn.coinbase !== '';

            if (isCoinbase) {
                inputsEl.insertAdjacentElement('beforeend', createCoinbaseInputElement());
            } else {
                txn.input.forEach(input => {
                    input.isInput = true;
                    inputsEl.insertAdjacentElement('beforeend', createInputOutputElement(input));
                    fee += parseInt(input.value);
                });
            }

            txn.output.forEach(output => {
                output.isCoinbase = isCoinbase;
                output.isOutput = true;
                output.isChange = !isCoinbase && txn.input.some(x => x.address === output.address);
                output.isFolding = !isCoinbase && txn.output.length === 1 && txn.input.some(x => x.address === output.address);
                outputsEl.insertAdjacentElement('beforeend', createInputOutputElement(output));
                fee -= parseInt(output.value);
            });

            transactionList.insertAdjacentElement('beforeend', listItem);

            fee = isCoinbase ? -parseInt(coinStats.reward) + (fee * -1) : fee;
            txFee.innerHTML = UTILS.unitsToPkt(fee, 2);
        }

        function createListItemElement(transaction) {
            const html = `
                <div class="list-item tile expanded">
                    <div class="io-list expandable">
                        <div>
                            <div class="title">${transaction.input.length} ${transaction.input.length === 1 ? 'Sender' : 'Senders'}</div>
                            <div class="inputs"></div>
                        </div>
                        <div>
                            <div class="title">${transaction.output.length} ${transaction.output.length === 1 ? 'Recipient' : 'Recipients'}</div>
                            <div class="outputs"></div>
                        </div>
                    </div>
                </div>
            `;
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }

        function createInputOutputElement(io) {
            function buildTxType() {
                if (io.isInput || io.isCoinbase) return '';

                return io.isFolding ?
                    '<div class="tx-type folding"><span class="material-icons">sync</span></div>' :
                    (io.isChange ?
                        '<div class="tx-type change">Change</div>' : ''
                    );
            }

            let html;
            if (io.address.startsWith('script:')) {
                html = `
                    <div class="list-item tile">
                        <div class="address">
                            <div>${io.address}</div>
                        </div>
                    </div>
                `;
            } else {
                html = `
                    <div class="list-item tile">
                        <div class="address">
                            <div>${UTILS.formatOwnedAddress({ address: io.address, useName: true })}</div><a href="/address/${io.address}" class="hash">${io.address}</a>
                        </div>
                        <div class="value">
                            <div class="value-pkt">${UTILS.unitsToPkt(io.value, 2)}</div> ${buildTxType()}
                        </div>
                    </div>
                `;
            }

            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }

        function createCoinbaseInputElement() {
            const html = `
                <div class="list-item list-item-coinbase tile">
                    <span class="icon material-icons">toll</span> Newly minted coins
                </div>
            `;
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }

        function createStatusElement(isConfirmed, isOrphan) {
            if (isConfirmed) {
                return `<div class="status-indicator confirmed"><span class="material-icons icon">verified</span>Confirmed</div>`;
            } else if (isOrphan) {
                return `<div class="status-indicator orphaned"><span class="material-icons icon">fork_right</span>Orphaned</div>`;
            }

            return `<div class="status-indicator unconfirmed"><span class="material-icons icon">update</span>Unconfirmed</div>`;
        }

        function createOrphanAnnouncement() {
            announcementContainer.insertAdjacentHTML('beforebegin', `
                <div class="announcement tile">
                    <span class="icon material-icons">fork_right</span>
                    <div class="body">
                        <div class="title">Orphaned Transaction</div>
                        <div class="message">This transaction is part of an orphan block.</div>
                    </div>
                    <div class="controls">
                        <a href="https://www.investopedia.com/terms/o/orphan-block-cryptocurrency.asp" target="_blank">
                            <span class="material-icons">question_mark</span>
                        </a>
                    </div>
                </div>
            `);
        }

        async function getNextBlock() {
            const url = `chain/up/1/${tx.blockHeight + 2}/`;
            let res = await API.get(url);

            if (typeof res === 'undefined') {
                return;
            }
            nextBlock = res.results[0];
        }

        async function getTipBlock() {
            const tipBlock = await API.getTipBlock();

            if (tx.blockHeight && tipBlock.height != tx.blockHeight) {
                txConfirmations.textContent = tipBlock.height - tx.blockHeight;
            } else {
                txConfirmations.textContent = '0';
            }
        }

        function checkStatus() {
            let isConfirmed = true;
            let isOrphan = false;

            if (!tx.blockHash || !tx.blockHeight) {
                isConfirmed = false;
            } else if (nextBlock) {
                if (tx.blockHash != nextBlock.previousBlockHash) {
                    isConfirmed = false;
                }
            }

            // Check Orphan Status
            if (tx.coinbase && !isConfirmed) {
                isOrphan = true;
            }

            txStatus.innerHTML = createStatusElement(isConfirmed, isOrphan);

            if (isOrphan) {
                createOrphanAnnouncement();
            }
        }
    }
}(window.PAGE_TX = window.PAGE_TX || {}));