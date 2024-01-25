(function (PAGE_HOME) {
    PAGE_HOME.init = () => {
        const blocksList = document.querySelector('#blocks-list');
        const coinsMax = document.querySelector('#coins-max');
        const coinsMined = document.querySelector('#coins-mined');
        const coinsRemaining = document.querySelector('#coins-remaining');
        const coinsCirculating = document.querySelector('#coins-circulating');
        const coinsHeight = document.querySelector('#coins-height');
        const coinsHeightTime = document.querySelector('#coins-height-time');
        const coinsReward = document.querySelector('#coins-reward');
        const coinsPrice = document.querySelector('#coins-price');
        const coinsMarketCap = document.querySelector('#coins-market-cap');
        const coinsDifficulty = document.querySelector('#coins-difficulty');
        const coinsDifficultyNext = document.querySelector('#coins-difficulty-next');
        const coinsDifficultyRetarget = document.querySelector('#coins-difficulty-retarget');
        const coinsBurned = document.querySelector('#coins-burned');
        const coins24hrTransactions = document.querySelector('#coins-24hr-transactions');
        const coins24hrTps = document.querySelector('#coins-24hr-tps');
        const coins24hrBlocks = document.querySelector('#coins-24hr-blocks');

        let pollingTimer;
        let lastPollTime;

        getCoinStats();
        getLatestBlocks();
        getNetworkStewardAddress();
        getDailyTransactionStats();

        async function getLatestBlocks() {
            const options = {
                limit: 5
            };
            let blocks = await API.getBlocks(options);
            buildBlockList(blocks);
        }

        function buildBlockList(blocks) {
            blocksList.innerHTML = '';
            blocks.forEach(block => {
                blocksList.insertAdjacentHTML('beforeend',
                    `
                        <div class="list-item tile">
                            <div class="height">
                                <div class="title">Hash</div>
                                <a href="/block/${block.hash}" class="hash">${UTILS.truncateString(block.hash, { startChars: 8, endChars: 8 })}</a>
                            </div>
                            <div class="height">
                                <div class="title">Height</div>
                                <a href="/block/${block.hash}">${block.height}</a>
                            </div>
                            <div class="age">
                                <div class="title">Age</div>
                                ${UTILS.timeSince(block.time, true)}
                            </div>
                            <div class="transactions">
                                <div class="title">Transactions</div>
                                ${block.transactionCount}
                            </div>
                        </div>
                    `
                );
            });
        }

        async function getCoinStats() {
            await Promise.all([
                Promise.all([
                    API.getCirculatingSupply(), 
                    coinsPrice ? API.getPrice() : null // Only fetch the coin price if the price element is present. It could be disabled in the config.
                ]).then((values) => {
                    console.log('values', values);
                    const circulatingSupply = values[0];
                    coinsCirculating.textContent = `${UTILS.numberWithCommas(circulatingSupply, 0)} PKT`;
                    if (values[1] !== null) {
                        const price = values[1].pkt;
                        coinsMarketCap.textContent = `$${UTILS.numberWithCommas(price * parseInt(circulatingSupply), 0)} market cap.`;
                        coinsPrice.textContent = `$${price.toFixed(6)}`;
                    }
                }),
                API.getCoinStats()
                .then(coinStats => {
                    coinsMax.innerHTML = UTILS.unitsToPkt(parseInt(coinStats.alreadyMined) + parseInt(coinStats.remaining), 0);
                    coinsMined.innerHTML = UTILS.unitsToPkt(coinStats.alreadyMined, 0);
                    coinsRemaining.innerHTML = UTILS.unitsToPkt(coinStats.remaining, 0);
                    coinsReward.innerHTML = UTILS.unitsToPkt(coinStats.reward);
                }),
                API.getTipBlock()
                .then(latestBlock => {
                    coinsHeight.textContent = UTILS.numberWithCommas(latestBlock.height, 0);
                    coinsHeightTime.textContent = `Mined ${UTILS.timeSince(latestBlock.time)}`;
                    coinsDifficulty.textContent = UTILS.numberWithCommas(latestBlock.difficulty, 0);
                    coinsDifficultyRetarget.textContent = `${latestBlock.blocksUntilRetarget} blocks`;
                    const difficultyPercentageChange = +parseFloat((100 - (latestBlock.retargetEstimate * 100)) * -1).toFixed(2); // 2 decimals if necessary (https://stackoverflow.com/a/32229831/746736)
                    if (difficultyPercentageChange > 0) {
                        coinsDifficultyNext.innerHTML = `${UTILS.numberWithCommas(latestBlock.difficulty * latestBlock.retargetEstimate, 0)} <span class="text-success small">+${difficultyPercentageChange}%</span>`;
                    } else {
                        coinsDifficultyNext.innerHTML = `${UTILS.numberWithCommas(latestBlock.difficulty * latestBlock.retargetEstimate, 0)} <span class="text-danger small">${difficultyPercentageChange}%</span>`;
                    }
                }),
                API.getBlockCount24hr()
                .then(blockCount24Hr => {
                    if (blockCount24Hr > 1440) {
                        coins24hrBlocks.innerHTML = `${blockCount24Hr} <span class="text-danger small"> +${blockCount24Hr - 1440} above target</span>`;
                    } else if (blockCount24Hr < 1440) {
                        coins24hrBlocks.innerHTML = `${blockCount24Hr} <span class="text-danger small"> ${blockCount24Hr - 1440} below target</span>`;
                    } else {
                        coins24hrBlocks.innerHTML = `${blockCount24Hr}`;
                    }
                })
            ]);

            poll();
            
        }

        async function getNetworkStewardAddress() {
            const address = await API.getAddress('pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2');
            coinsBurned.innerHTML = UTILS.unitsToPkt(address.burned);
        }

        async function getDailyTransactionStats() {
            let stats = await API.getDailyTransactionStats();

            // Remove today (partial data)
            stats.splice(0, 1);

            coins24hrTransactions.textContent = UTILS.numberWithCommas(stats[0].transactionCount, 0);
            coins24hrTps.textContent = UTILS.numberWithCommas(stats[0].transactionCount / 86400);

            stats.reverse();

            new Chart(
                document.getElementById('chart-transactions'),
                {
                    type: 'bar',
                    data: {
                        labels: stats.map(row => new Date(row.date).toLocaleDateString()),
                        datasets: [
                            {
                                label: 'Daily Transactions',
                                data: stats.map(row => row.transactionCount),
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

        /**
         * Avoid polling if the window is not visible.
         * If the window is visible we poll for new data ~ every 60 seconds.
         * If the window is not visible we stop timers.
         * When the window becomes visible we check that the last fetch was 
         * at least 60 seconds ago, before either fetching fresh data
         * or starting a new timer.
         * */

        function poll() {
            lastPollTime = Date.now();
            // Cancel exsiting timer to avoid more than one timer runing at once.
            if (pollingTimer) clearTimeout(pollingTimer);
            pollingTimer = setTimeout(() => {
                getPollDataAndStart();
            }, 60000);
        }

        function getPollDataAndStart() {
            getCoinStats();
            getLatestBlocks();
        }

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                // Run immediately if last fetch was over 60 seconds ago
                // else set up a timer.
                if (typeof lastPollTime != 'undefined') {
                    if ((Date.now() - lastPollTime) / 1000 >= 60) {
                        getPollDataAndStart();
                    } else {
                        poll();
                    }
                }
                
            } else {
                if (pollingTimer) {
                    clearTimeout(pollingTimer);
                }
            }
        });
    }

}(window.PAGE_HOME = window.PAGE_HOME || {}));

