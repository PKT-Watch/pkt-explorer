(function (PAGE_BLOCKS) {
    PAGE_BLOCKS.init = () => {
        const blocksList = document.querySelector('#blocks-list');
        const coinsHeight = document.querySelector('#coins-height');
        const coinsHeightTime = document.querySelector('#coins-height-time');
        const coinsReward = document.querySelector('#coins-reward');
        const coinsDifficulty = document.querySelector('#coins-difficulty');
        const coinsDifficultyNext = document.querySelector('#coins-difficulty-next');
        const coinsDifficultyRetarget = document.querySelector('#coins-difficulty-retarget');
        const coins24hrTransactions = document.querySelector('#coins-24hr-transactions');
        const coins24hrTps = document.querySelector('#coins-24hr-tps');
        const coins24hrBlocks = document.querySelector('#coins-24hr-blocks');
        const btnLoadMore = document.querySelector('#btnLoadMore');

        let pollingTimer;
        let lastPollTime;
        let currentPage = 0;
        let latestBlockHeight = 0;
        let oldestBlockHeight = 0;

        getCoinStats();
        getBlocks();
        getDailyTransactionStats();

        async function getBlocks() {
            btnLoadMore.classList.add('loading');
            currentPage++;
            const options = {
                limit: 50,
                page: currentPage
            };
            let blocks = await API.getBlocks(options);
            buildBlockList(blocks);
            btnLoadMore.classList.remove('d-none');
            btnLoadMore.classList.remove('loading');
        }

        function buildBlockList(blocks) {
            if (currentPage === 1) {
                blocksList.innerHTML = '';
                latestBlockHeight = blocks[0].height;
            }

            blocks.forEach(block => {
                // Because we are pollng for new blocks, we may have duplicates
                // in the returned data set. Ignore those that are already in the UI.
                if (currentPage > 1 && block.height >= oldestBlockHeight) return;

                blocksList.insertAdjacentHTML('beforeend', buildListItem(block));
            });

            oldestBlockHeight = blocks[blocks.length - 1].height;
            updateBlockTimes();
        }

        function buildListItem(block) {
            return `
                    <div class="list-item tile" data-time="${block.time}">
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
                            <span class="time-since">${UTILS.timeSince(block.time, true)}</span>
                        </div>
                        <div class="transactions">
                            <div class="title">Transactions</div>
                            ${block.transactionCount}
                        </div>
                        <!--
                        <div class="difficulty">
                            <div class="title">Difficulty</div>
                            ${parseInt(block.difficulty)}
                        </div>
                        <div class="size">
                            <div class="title">Size</div>
                            ${block.size}
                        </div>
                        -->
                    </div>
                `;
        }

        function updateBlockTimes() {
            blocksList.querySelectorAll('.list-item').forEach(listItem => {
                const blockTime = listItem.dataset.time;
                listItem.querySelector('.time-since').textContent = UTILS.timeSince(blockTime, true);
            });
        }

        async function getNewBlocks() {
            console.log(`getNewBlocks() latestBlockHeight: ${latestBlockHeight}`);
            const options = {
                limit: 10,
                page: 1
            };
            let blocks = await API.getBlocks(options);

            if (blocks[0].height > latestBlockHeight) {
                blocks.reverse();

                blocks.forEach(block => {
                    if (block.height <= latestBlockHeight) return;

                    console.log(`adding block ${block.height}`);

                    blocksList.insertAdjacentHTML('afterbegin', buildListItem(block));
                });
            }

            latestBlockHeight = blocks[blocks.length - 1].height;
            updateBlockTimes();
        }

        async function getCoinStats() {
            let [coinStats, latestBlock, blockCount24Hr] = await Promise.all([API.getCoinStats(), API.getTipBlock(), API.getBlockCount24hr()]);

            coinsReward.innerHTML = UTILS.unitsToPkt(coinStats.reward);
            coinsHeight.textContent = UTILS.numberWithCommas(latestBlock.height, 0);
            coinsHeightTime.textContent = `Mined ${UTILS.timeSince(latestBlock.time)}`;
            coinsDifficulty.textContent = UTILS.numberWithCommas(latestBlock.difficulty, 0);

            if (blockCount24Hr > 1440) {
                coins24hrBlocks.innerHTML = `${blockCount24Hr} <span class="text-danger small"> +${blockCount24Hr - 1440} above target</span>`;
            } else if (blockCount24Hr < 1440) {
                coins24hrBlocks.innerHTML = `${blockCount24Hr} <span class="text-danger small"> ${blockCount24Hr - 1440} below target</span>`;
            } else {
                coins24hrBlocks.innerHTML = `${blockCount24Hr}`;
            }

            const difficultyPercentageChange = +parseFloat((100 - (latestBlock.retargetEstimate * 100)) * -1).toFixed(2); // 2 decimals if necessary (https://stackoverflow.com/a/32229831/746736)
            if (difficultyPercentageChange > 0) {
                coinsDifficultyNext.innerHTML = `${UTILS.numberWithCommas(latestBlock.difficulty * latestBlock.retargetEstimate, 0)} <span class="text-success small">+${difficultyPercentageChange}%</span>`;
            } else {
                coinsDifficultyNext.innerHTML = `${UTILS.numberWithCommas(latestBlock.difficulty * latestBlock.retargetEstimate, 0)} <span class="text-danger small">${difficultyPercentageChange}%</span>`;
            }

            coinsDifficultyRetarget.textContent = `${latestBlock.blocksUntilRetarget} blocks`;

            poll();
        }

        async function getDailyTransactionStats() {
            let stats = await API.getDailyTransactionStats();

            // Remove today (partial data)
            stats.splice(0, 1);

            coins24hrTransactions.textContent = UTILS.numberWithCommas(stats[0].transactionCount)
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
            getNewBlocks();
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

        btnLoadMore.addEventListener('click', getBlocks);
    }
}(window.PAGE_BLOCKS = window.PAGE_BLOCKS || {}));