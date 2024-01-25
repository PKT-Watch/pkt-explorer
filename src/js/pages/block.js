(function (PAGE_BLOCK) {
    PAGE_BLOCK.init = () => {
        const transactionList = document.querySelector('#transaction-list');
        const transactionListContainer = document.querySelector('#transaction-list-container');
        const coinbaseTransactionList = document.querySelector('#coinbase-transaction-list');
        const blockHash = document.querySelector('#block-hash');
        const blockSize = document.querySelector('#block-size');
        const blockDifficulty = document.querySelector('#block-difficulty');
        const blockTransactions = document.querySelector('#block-transactions');
        const blockDate = document.querySelector('#block-date');
        const blockHeight = document.querySelector('#block-height');
        const blockAnnouncements = document.querySelector('#block-announcements');
        const blockAnnouncementDifficulty = document.querySelector('#block-announcement-difficulty');
        const blockPool = document.querySelector('#block-pool');
        const blockConfirmations = document.querySelector('#block-confirmations');
        const blockCoinbase = document.querySelector('#block-coinbase');
        const blockReward = document.querySelector('#block-reward');
        const blockSendersCount = document.querySelector('#block-senders-count');
        const blockMerkleRoot = document.querySelector('#block-merkle-root');
        const blockNonce = document.querySelector('#block-nonce');
        const blockValue = document.querySelector('#block-value');
        const blockValueEstimate = document.querySelector('#block-value-estimate');
        const btnPreviousBlock = document.querySelector('#btnPreviousBlock');
        const btnNextBlock = document.querySelector('#btnNextBlock');
        const btnLoadMore = document.querySelector('#btnLoadMore');
        const chkExpandTransactions = document.querySelector('#chkExpandTransactions');
        const noFurtherTransactions = document.querySelector('#no-further-transactions');
        const announcementContainer = document.querySelector('#announcement-container');

        let block;
        let nextBlock;
        let currentPage = 0;
        let pageCount = 0;
        const maxInitialPageCount = 5;
        let totalValue = 0;

        getBlock();

        if (!UTILS.isNumeric(BLOCKHASH)) {
            blockHash.innerHTML = `<span class="clipboard-copy-value">${BLOCKHASH}</span> <span class="icon"></span>`;
        }

        async function getBlock() {
            block = await API.getBlock(BLOCKHASH);
            if (typeof block === 'undefined') window.location = '/search/';

            if (UTILS.isNumeric(BLOCKHASH)) {
                // Route is using block height. Redirect with block hash instead.
                window.location.href = `/block/${block.hash}`;
                return;
            }

            buildBlockStats(block);
            getLatestTransactions();
            getTipBlock();
            await getNextBlock();
            checkStatus();
        }

        async function getNextBlock() {
            const url = `chain/up/1/${block.height + 2}/`;
            let res = await API.get(url);

            if (typeof res === 'undefined') {
                // We are at the tip
                setTimeout(() => {
                    getNextBlock();
                }, 60000);

                return;
            }
            nextBlock = res.results[0];

            btnNextBlock.href = `/block/${nextBlock.hash}`;
            btnNextBlock.classList.remove('disabled-state');
            const icon = btnNextBlock.querySelector('.icon');
            icon.classList.remove('spin');
            icon.textContent = 'chevron_right';
        }

        function buildBlockStats(block) {
            document.title = `${document.title} - Block ${block.height}`;
            blockSize.textContent = `${UTILS.numberWithCommas(block.size / 1024, 2)} KB`;
            blockDifficulty.textContent = UTILS.numberWithCommas(block.difficulty, 0);
            blockTransactions.textContent = UTILS.numberWithCommas(block.transactionCount, 0);
            blockDate.textContent = new Date(block.time).toLocaleString();
            blockHeight.textContent = block.height;
            blockAnnouncements.textContent = UTILS.numberWithCommas(block.pcAnnCount, 0);
            blockAnnouncementDifficulty.textContent = UTILS.numberWithCommas(block.pcAnnDifficulty, 2);
            blockMerkleRoot.textContent = block.merkleRoot;
            blockNonce.textContent = block.nonce;
            btnPreviousBlock.href = `/block/${block.previousBlockHash}`;
            btnPreviousBlock.querySelector('.height').textContent = block.height - 1;
            btnNextBlock.querySelector('.height').textContent = block.height + 1;
        }

        async function getLatestTransactions(blockHash) {
            /**
             * If there are a large number of transactions, we only load maxInitialPageCount pages.
             * Further transactions can be loaded with getNextTransactions().
             */
            btnLoadMore.classList.add('loading');
            pageCount = Math.ceil(block.transactionCount / 50);

            if (pageCount > maxInitialPageCount) {
                blockValueEstimate.classList.remove('d-none');
            }

            await getNextTransactions(false);

            const txns = [];
            for (let i = 1; i < (pageCount > maxInitialPageCount ? maxInitialPageCount : pageCount); i++) {          
                currentPage++;
                const options = {
                    blockHash: block.hash,
                    page: currentPage
                };
                let t = await API.getBlockTransactions(options);
                if (typeof t !== 'undefined') {
                    txns.push(...t);
                    buildTransactionsList(txns, true);
                }
            }
            
            btnLoadMore.classList.remove('loading');
        }

        async function getNextTransactions(append) {
            btnLoadMore.classList.add('loading');
            currentPage++;
            const options = {
                blockHash: block.hash,
                page: currentPage
            };
            const txns = await API.getBlockTransactions(options);
            buildTransactionsList(txns, append);
            btnLoadMore.classList.remove('loading');
        }

        function buildTransactionsList(txns, append) {
            if (typeof txns === 'undefined') {
                // Returns 404 when no more transactions
                btnLoadMore.classList.add('d-none');
                noFurtherTransactions.classList.remove('d-none');
                return;
            }

            if (txns.length > 1) {
                // Sort by transaction value
                txns.sort((a, b) => {
                    a.value = parseInt(a.value);
                    b.value = parseInt(b.value);
                    return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0);
                });
            }

            if (!append) {
                coinbaseTransactionList.innerHTML = '';

                if (txns.length > 1) {
                    transactionList.innerHTML = '';
                    transactionListContainer.classList.remove('d-none');
                }
            }                

            if (currentPage < pageCount) {
                btnLoadMore.classList.remove('d-none');
            }       

            txns.forEach(txn => {
                const listItem = createListItemElement(txn);
                const valueOutputEl = listItem.querySelector('.value-output');
                const inputsEl = listItem.querySelector('.inputs');
                const outputsEl = listItem.querySelector('.outputs');
                const isCoinbase = txn.coinbase !== '';
                let value = parseInt(txn.value);

                totalValue += value;

                if (isCoinbase) {
                    blockPool.textContent = UTILS.minedBy(txn);
                    blockCoinbase.textContent = UTILS.decodeCoinbase(txn.coinbase);
                    blockReward.innerHTML = UTILS.unitsToPkt(txn.value);
                    inputsEl.insertAdjacentElement('beforeend', createCoinbaseInputElement());
                } else {
                    txn.input.forEach(input => {
                        input.isInput = true;
                        inputsEl.insertAdjacentElement('beforeend', createInputOutputElement(input));
                    });
                }

                txn.output.forEach(output => {
                    output.isCoinbase = isCoinbase;
                    output.isOutput = true;
                    output.isChange = !isCoinbase && txn.input.some(x => x.address === output.address);
                    output.isFolding = !isCoinbase && txn.output.length === 1 && txn.input.some(x => x.address === output.address);
                    if (output.isChange && !output.isFolding) {
                        value -= parseInt(output.value);
                    }
                    outputsEl.insertAdjacentElement('beforeend', createInputOutputElement(output));
                });

                valueOutputEl.innerHTML = UTILS.unitsToPkt(value, 2);

                if (isCoinbase) {
                    coinbaseTransactionList.insertAdjacentElement('beforeend', listItem);
                } else {
                    transactionList.insertAdjacentElement('beforeend', listItem);
                }           
            });

            blockValue.innerHTML = UTILS.unitsToPkt(totalValue, 0);
        }

        function createListItemElement(transaction) {
            const html = `
                <div class="list-item tile expandable-content ${chkExpandTransactions.checked ? 'expanded' : ''}">
                    <div class="header expander">
                        <div class="txid">
                            <a href="/tx/${transaction.txid}" class="hash">${transaction.txid}</a>
                        </div>
                        <div class="value">
                            <span class="value-output"></span>
                        </div>
                        <div>
                            <button type="button" class="btn btn-icon btn-xs btn-light expandable-content-control">
                                <span class="material-icons">expand_less</span>
                            </button>
                        </div>
                        <div class="io title send-receive-stat">
                            ${transaction.input.length} ${transaction.input.length === 1 ? 'Sender' : 'Senders'} <span class="material-icons">east</span> ${transaction.output.length} ${transaction.output.length === 1 ? 'Recipient' : 'Recipients'}
                        </div>
                    </div>
                    <div class="io-list expandable pt-3">
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

                if (io.isFolding) return io.isChange ? '<div class="tx-type folding"><span class="material-icons">sync</span></div>' : '';
                return io.isChange ? '<div class="tx-type change">Change</div>' : '';
            }

            let html;
            if (io.address.startsWith('script:')) {
                html = `
                    <div class="list-item tile">
                        <div class="address">
                            <div class="hash">${io.address}</div>
                        </div>
                    </div>`;
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

        async function getTipBlock() {
            const tipBlock = await API.getTipBlock();

            if (tipBlock.height != block.height) {
                blockConfirmations.textContent = tipBlock.height - block.height;
            } else {
                blockConfirmations.textContent = '0';
            }
        }

        function createOrphanAnnouncement() {
            announcementContainer.insertAdjacentHTML('beforebegin', `
                <div class="announcement tile">
                    <span class="icon material-icons">fork_right</span>
                    <div class="body">
                        <div class="title">Orphan Block</div>
                        <div class="message">This block is part of a fork that is not in the main chain.</div>
                    </div>
                    <div class="controls">
                        <a href="https://www.investopedia.com/terms/o/orphan-block-cryptocurrency.asp" target="_blank">
                            <span class="material-icons">question_mark</span>
                        </a>
                    </div>
                </div>
            `);
        }

        function checkStatus() {
            let isOrphan = false;

            // Check Orphan Status
            if (nextBlock && (block.hash != nextBlock.previousBlockHash)) {
                isOrphan = true;
            }

            if (isOrphan) {
                createOrphanAnnouncement();
            }
        }

        btnLoadMore.addEventListener('click', () => getNextTransactions(true));

        chkExpandTransactions.addEventListener('change', e => {
            const listItems = transactionList.querySelectorAll('.expandable-content');

            listItems.forEach(el => {
                chkExpandTransactions.checked ? el.classList.add('expanded') : el.classList.remove('expanded');
            });
        });
    }
}(window.PAGE_BLOCK = window.PAGE_BLOCK || {}));