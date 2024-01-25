(function (PAGE_SAVED_ADDRESSES) {
    PAGE_SAVED_ADDRESSES.init = () => {
        const addressList = document.querySelector('#address-list');
        const savedAddressesContainer = document.querySelector('#saved-addresses-container');
        const emptyStateContainer = document.querySelector('#empty-state-container');
        const addressesTotalBalance = document.querySelector('#addresses-total-balance');
        const addressesTotalValue = document.querySelector('#addresses-total-value');
        const addressesMined24hr = document.querySelector('#addresses-mined-24hr');
        const chartMiningIncome = document.getElementById('chart-mining-income')
        const saveAddressControl = document.querySelector('.save-address-control');

        let addressesHashes = ADDRESS_SAVER.addresses();
        let addresses = [];
        let addressMiningIncome = [];
        let miningIncome = [];
        let chart;

        if (addressesHashes.length) {
            getAddresses();
            getMiningIncome();
            disableEmptyState();
        } else {
            buildEmptyState();
        }

        async function getAddresses() {
            buildPlaceholders();

            const promiseArray = addressesHashes.map(async hash => {
                const address = await API.getAddress(hash);
                addresses.push(address);
            });

            await Promise.all(promiseArray);
            buildAddressList();        

            let totalBalance = 0;
            let totalMined24hr = 0;
            addresses.forEach(address => {
                totalBalance += UTILS.unitsToPkt(address.balance, 0, false);
                totalMined24hr += UTILS.unitsToPkt(address.mined24, 0, false);
            });
            addressesTotalBalance.innerHTML = UTILS.pktToDenomination(totalBalance, 2);
            addressesMined24hr.innerHTML = UTILS.pktToDenomination(totalMined24hr, 2);

            getPrice(totalBalance);
        }

        function buildPlaceholders() {
            addressList.innerHTML = '';

            addressesHashes.forEach(address => {
                addressList.insertAdjacentHTML('beforeend',
                    `
                        <div class="list-item tile">
                            <div class="address">
                                <div class="placeholder">-------------------</div>
                            </div>
                            
                            <div class="footer">
                                <div class="value">
                                    <div class="title">Balance</div>
                                    <span class="value-output placeholder">------------</span>
                                </div>
                                <div class="">
                                    <div class="title">Mined Last 24hr</div>
                                    <div class="placeholder">------------</div>
                                </div>
                            </div>
                        </div>
                    `
                );
            });
        }

        function buildAddressList() {
            addressList.innerHTML = '';

            addresses.sort((a, b) => b.balance - a.balance)

            addresses.forEach(address => {
                addressList.insertAdjacentHTML('beforeend',
                    `
                        <div class="list-item tile" data-address="${address.address}">
                            <div class="address">
                                <a href="/address/${address.address}" class="hash">${UTILS.truncateString(address.address, { startChars: 8, endChars: 8 })}</a>
                                <div class="controls">
                                    <div class="dropup">
                                        <button type="button" class="">
                                            <span class="icon material-icons">more_horiz</span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item remove-address" href="#">Un-save</a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="footer">
                                <div class="value">
                                    <div class="title">Balance</div>
                                    <span class="value-output">${UTILS.unitsToPkt(address.balance, 3)}</span>
                                </div>
                                <div class="">
                                    <div class="title">Mined Last 24hr</div>
                                    ${UTILS.unitsToPkt(address.mined24, 3)}
                                </div>
                            </div>
                        </div>
                    `
                );
            });
        }

        async function getMiningIncome() {
            if (!addressesHashes.length) return;

            const promiseArray = addressesHashes.map(async hash => {
                const options = {
                    address: hash,
                    limit: 90,
                    page: 1
                };

                let income = await API.getAddressMiningIncome(options);
                income.reverse();
                addressMiningIncome.push(income);
            });

            await Promise.all(promiseArray);

            for (let i = 0; i < addressMiningIncome[0].length; i++) {
                let sum = 0;
                addressMiningIncome.forEach(array => {
                    sum += parseInt(array[i].received)
                });
                miningIncome.push({
                    date: addressMiningIncome[0][i].date,
                    received: sum
                });
            }

            const incomeValues = miningIncome.map(row => UTILS.unitsToPkt(row.received, 2, false));

            if (chart) {
                chart.data.datasets[0].data = incomeValues;
                chart.update();
                return;
            }

            chart = new Chart(
                chartMiningIncome,
                {
                    type: 'bar',
                    data: {
                        labels: miningIncome.map(row => new Date(row.date).toLocaleDateString()),
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

        async function getPrice(balance) {
            const price = await API.getPrice();
            addressesTotalValue.innerHTML = `$${UTILS.numberWithCommas(balance * price.pkt, 2)}`;
        }

        addressList.addEventListener('click', e => {
            if (e.target && e.target.closest('.remove-address')) {
                e.preventDefault();
                const address = e.target.closest('.list-item').dataset.address;
                removeAddress(address);
            }
        });

        function removeAddress(address) {
            addressesHashes = ADDRESS_SAVER.remove(address);
            addresses = [];
            addressMiningIncome = [];
            miningIncome = [];

            if (addressesHashes.length) {
                getAddresses();
                getMiningIncome();
            } else {
                buildEmptyState();
            }
            
        }

        function buildEmptyState() {
            savedAddressesContainer.classList.add('d-none', 'd-lg-none');
            emptyStateContainer.classList.remove('d-none', 'd-lg-none');
            saveAddressControl.classList.remove('saved');
        }

        function disableEmptyState() {
            savedAddressesContainer.classList.remove('d-none', 'd-lg-none');
            emptyStateContainer.classList.add('d-none', 'd-lg-none');
        }

        saveAddressControl.addEventListener('click', e => {
            if (saveAddressControl.classList.contains('saved')) {
                saveAddressControl.classList.remove('saved');

                ADDRESS_SAVER.remove('pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2');
            } else {
                saveAddressControl.addEventListener('animationend', function () {
                    saveAddressControl.classList.remove('saving');
                    saveAddressControl.classList.add('saved');

                    addressesHashes = ADDRESS_SAVER.addresses();

                    getAddresses();
                    getMiningIncome();

                    disableEmptyState();

                }, { once: true });
                saveAddressControl.classList.add('saving');

                ADDRESS_SAVER.add('pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2');
            }
        });
    }
}(window.PAGE_SAVED_ADDRESSES = window.PAGE_SAVED_ADDRESSES || {}));