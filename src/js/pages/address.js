(function (PAGE_ADDRESS) {
    PAGE_ADDRESS.init = () => {
        const transactionList = document.querySelector('#transaction-list');
        const miningIncomeList = document.querySelector('#mining-income-list');
        const addressQrCode = document.querySelector('#address-qrcode');
        const addressBalance = document.querySelector('#address-balance');
        const addressBurned = document.querySelector('#address-burned');
        const burnedEl = document.querySelector('.burned'); // Only exists if address is NS
        const addressBalanceCount = document.querySelector('#address-balance-count');
        const addressUnconfirmedReceived = document.querySelector('#address-unconfirmed-received');
        const addressTransactions = document.querySelector('#address-transactions');
        const addressMineCount = document.querySelector('#address-mine-count');
        const addressMined24 = document.querySelector('#address-mined24');
        const addressFirstSeen = document.querySelector('#address-first-seen');
        const addressOwner = document.querySelector('#address-owner');
        const btnLoadMore = document.querySelector('#btnLoadMore');
        const btnLoadMoreMiningIncome = document.querySelector('#btnLoadMoreMiningIncome');
        const chartMiningIncomeContainer = document.querySelector('#chart-mining-income-container');
        const noTransactions = document.querySelector('#no-transactions');
        const noFurtherTransactions = document.querySelector('#no-further-transactions');
        const chkExpandTransactions = document.querySelector('#chkExpandTransactions');
        const saveAddressControl = document.querySelector('.save-address-control');
        const tabNav = document.querySelector('.tab-nav');

        let address;
        let currentPage = 0;
        let currentPageMiningIncome = 0;
        let miningStatsInitialised = false;

        var qrcode = new QRCode(addressQrCode, {
            text: ADDRESS,
            width: 80,
            height: 80,
            colorDark: THEME.getQRColors().background,
            colorLight: THEME.getQRColors().foreground,
            correctLevel: QRCode.CorrectLevel.L
        });
    
        getLatestTransactions();
        getAddress();
        getMiningIncome();

        async function getAddress() {
            address = await API.getAddress(ADDRESS);
            if (typeof address === 'undefined') window.location = '/search/';
            buildAddressStats(address);
        }

        function buildAddressStats(address) {
            addressBalance.innerHTML = UTILS.unitsToPkt(address.balance, 2);
            addressBalanceCount.textContent = UTILS.numberWithCommas(address.balanceCount, 0);
            addressUnconfirmedReceived.innerHTML = UTILS.unitsToPkt(address.unconfirmedReceived, 0);
            addressTransactions.textContent = UTILS.numberWithCommas(address.spentCount + address.recvCount, 0);
            addressMineCount.textContent = UTILS.numberWithCommas(address.mineCount, 0);
            addressMined24.innerHTML = UTILS.unitsToPkt(address.mined24, 0);
            addressFirstSeen.textContent = address.firstSeen ? new Date(address.firstSeen).toLocaleDateString() : 'Never';
            addressOwner.innerHTML = UTILS.formatOwnedAddress({address: ADDRESS, label: 'Unknown', includeAddress: false, useName: true});

            if (burnedEl) {
                addressBurned.innerHTML = UTILS.unitsToPkt(address.burned, 2);
                burnedEl.classList.remove('d-none');
            }
        }

        async function getLatestTransactions() {
            btnLoadMore.classList.add('loading');
            currentPage++;
            const options = {
                address: ADDRESS,
                limit: 100,
                page: currentPage
            };
            let txns = await API.getAddressTransactions(options);
            buildTransactionsList(txns);
            btnLoadMore.classList.remove('loading');
        }

        function determineTransactionType(txn) {
            let direction = '';
            let isSend = false;
            let isReceive = false;
            let isFolding = false;

            txn.input.forEach(inp => {
                if (inp.address == ADDRESS) {
                    direction = '-';
                    isSend = true;
                }
            });

            if (direction == '') {
                txn.output.forEach(out => {
                    if (out.address == ADDRESS) {
                        direction = '+';
                        isReceive = true;
                    }
                });
            } else {
                txn.output.forEach(out => {
                    if (out.address == ADDRESS) {
                        // This is when we receive change back, we need to deduct from the
                        // amount that we're spending to get the right sum.
                        if (txn.output.length == 1) {
                            isFolding = true;
                            isSend = false;
                        }
                        return;
                    }
                });
            }

            return { isSend, isReceive, isFolding };
        }

        function buildTxType(txn) {
            if (txn.isSend) {
                return '<div class="tx-type send"><span class="material-icons">remove_circle</span></div>';
            } else if (txn.isReceive) {
                return '<div class="tx-type receive"><span class="material-icons">add_circle</span></div>';
            } else if (txn.isFolding) {
                return '<div class="tx-type folding"><span class="material-icons">sync</span></div>';
            }
        }

        function buildTransactionsList(txns) {
            if (currentPage == 1) {
                if (txns.length === 0) {
                    transactionList.remove();
                    noTransactions.classList.remove('d-none');
                    return;
                } else if (txns.length > 20) {
                    btnLoadMore.classList.remove('d-none');
                } else {
                    //
                }
                transactionList.innerHTML = '';
            } else {
                if (txns.length === 0) {
                    btnLoadMore.classList.add('d-none');
                    noFurtherTransactions.classList.remove('d-none');
                } else {
                    // Remove first item because it is duplicated in previous dataset
                    txns.splice(0, 1);
                }
            }

            txns.forEach(txn => {
                const { isSend, isReceive, isFolding } = determineTransactionType(txn);
                txn.isSend = isSend;
                txn.isReceive = isReceive;
                txn.isFolding = isFolding;

                const listItem = createListItemElement(txn);
                const valueOutputEl = listItem.querySelector('.value-output');
                const inputsEl = listItem.querySelector('.inputs');
                const outputsEl = listItem.querySelector('.outputs');
                const txTypeEl = listItem.querySelector('.type');
                const isCoinbase = txn.coinbase !== '';
                let value = parseInt(txn.value);

                txTypeEl.innerHTML = buildTxType(txn);

                if (isCoinbase) {
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
                    if (!txn.isSend && output.address !== ADDRESS) {
                        value -= parseInt(output.value);
                    } else if (txn.isSend && output.address === ADDRESS) {
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
        }

        function createListItemElement(transaction) {
            const html = `
                <div class="list-item tile expandable-content ${chkExpandTransactions.checked ? 'expanded' : ''}">
                    <div class="header expander">
                            ${transaction.blockTime ?
                            '<div class="status-indicator confirmed"><span class="material-icons icon">verified</span></div>' :
                            '<div class="status-indicator unconfirmed"><span class="material-icons icon">update</span></div>'
                        }               
                        <div class="date">
                            ${new Date(transaction.firstSeen).toLocaleString()}
                        </div>
                        <div class="value">
                            <span class="value-output"></span>
                        </div>
                        <div class="type"></div>
                    </div>
                    <div class="footer">
                        <div>
                            <div class="txid">
                                <div class="title">Transaction Hash</div>
                                <a href="/tx/${transaction.txid}" class="hash">${transaction.txid}</a>
                            </div>
                            <div class="io title send-receive-stat">
                                ${transaction.input.length} ${transaction.input.length === 1 ? 'Sender' : 'Senders'} <span class="material-icons">east</span> ${transaction.output.length} ${transaction.output.length === 1 ? 'Recipient' : 'Recipients'}
                            </div>
                        </div>
                        <div>
                            <button type="button" class="btn btn-icon btn-xs btn-light expandable-content-control">
                                <span class="material-icons">expand_less</span>
                            </button>
                        </div>
                
                    </div>
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

                if (io.isChange && !io.isFolding) return '<div class="tx-type change">Change</div>';

                return '';
            }

            const html = `
                <div class="list-item tile">
                    <div class="address">
                        ${io.address == ADDRESS ? 'This address' : io.address.startsWith('script:') ? `<span class="hash">${io.address}</span>` : `<div>${UTILS.formatOwnedAddress({ address: io.address, useName: true })}</div><a href="/address/${io.address}" class="hash">${io.address}</a>`}
                    </div>
                    <div class="value">
                        <div class="value-pkt">${UTILS.unitsToPkt(io.value, 2)}</div> ${buildTxType()}
                    </div>
                </div>
            `;
            const template = document.createElement('template');
            template.innerHTML = html.trim();
            return template.content.firstChild;
        }

        async function getMiningIncome() {
            currentPageMiningIncome++;
            btnLoadMoreMiningIncome.classList.add('loading');

            const options = {
                address: ADDRESS,
                limit: 90,
                page: currentPageMiningIncome
            };

            let income = await API.getAddressMiningIncome(options);

            if (income.length === 0) {
                btnLoadMoreMiningIncome.remove();
                return;
            }

            if (currentPageMiningIncome > 1) {
                // Remove first item because it is duplicated in previous dataset
                income.splice(0, 1);
            }

            income.forEach(miningIncome => {
                miningIncomeList.insertAdjacentHTML('beforeend', `
                    <div class="list-item">
                        <div>${new Date(miningIncome.date).toLocaleDateString()}</div>
                        <div class="value">${UTILS.unitsToPkt(miningIncome.received, 3)}</div>
                    </div>
                `);
            });

            btnLoadMoreMiningIncome.classList.remove('loading');

            if (currentPageMiningIncome === 1) {
                income.reverse();
                const incomeValues = income.map(row => UTILS.unitsToPkt(row.received, 0, false));

                // Check that we have at least one non-zero value before displaying the chart
                let summedValues = incomeValues.reduce(function (a, b) {
                    return a + b;
                }, 0);
                if (summedValues === 0) {
                    return;
                }

                chartMiningIncomeContainer.classList.remove('d-none');

                new Chart(
                    document.getElementById('chart-mining-income'),
                    {
                        type: 'bar',
                        data: {
                            labels: income.map(row => new Date(row.date).toLocaleDateString()),
                            datasets: [
                                {
                                    label: 'Income',
                                    data: incomeValues,
                                    borderColor: THEME.getChartColor(),
                                    backgroundColor: THEME.getChartColor(),
                                    minBarLength: 2,
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    display: false
                                },
                                y: {
                                    display: false
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    }
                );
            }
        }

        btnLoadMore.addEventListener('click', getLatestTransactions);
        btnLoadMoreMiningIncome.addEventListener('click', getMiningIncome);

        chkExpandTransactions.addEventListener('change', e => {
            const listItems = transactionList.querySelectorAll('.expandable-content');

            listItems.forEach(el => {
                chkExpandTransactions.checked ? el.classList.add('expanded') : el.classList.remove('expanded');
            });
        });

        saveAddressControl.addEventListener('click', e => {
            if (saveAddressControl.classList.contains('saved')) {
                saveAddressControl.classList.remove('saved');

                ADDRESS_SAVER.remove(ADDRESS);
            } else {
                saveAddressControl.addEventListener('animationend', function () {
                    saveAddressControl.classList.remove('saving');
                    saveAddressControl.classList.add('saved');
                }, { once: true });
                saveAddressControl.classList.add('saving');

                ADDRESS_SAVER.add(ADDRESS);
            }        
        });

        function checkAddressSavedStatus() {
            const savedAddresses = ADDRESS_SAVER.addresses();
            if (savedAddresses.includes(ADDRESS)) {
                saveAddressControl.classList.add('saved');
            }
        }
        checkAddressSavedStatus();

        function initMiningStats() {
            PAGE_MINING_STATS.init(ADDRESS);
        }

        tabNav.addEventListener('tabChanged', e => {
            if (e.detail === '#mining-stats-container') {
                if (!miningStatsInitialised) {
                    miningStatsInitialised = true;
                    miningStatsInitialised = true;
                    initMiningStats();
                }

                window.location.hash = 'stats';
                
            } else {
                history.replaceState(null, null, ' '); // Remove hash text and # from URL
            }
        });

        if(window.location.hash && window.location.hash === '#stats') {
            tabNav.querySelector('[data-target="#mining-stats-container"]').click();
        } else {
            // No hash found
        }
    }
}(window.PAGE_ADDRESS = window.PAGE_ADDRESS || {}));