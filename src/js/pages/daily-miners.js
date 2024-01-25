(function (PAGE_DAILY_MINERS) {
    PAGE_DAILY_MINERS.init = () => {
        const minersList = document.querySelector('#miners-list');
        const btnLoadMore = document.querySelector('#btnLoadMore');
        const noFurtherTransactions = document.querySelector('#no-further-transactions');
        const themeSwitcherEl = document.querySelector('#theme-switcher');

        let currentPage = 0;
        let index = 0;
        let chart;

        getDailyMiners();
        getMinersList();

        async function getDailyMiners() {
            let miners = await API.getDailyMinerStats();
            buildChart(miners);
        }

        async function getDailyMiners() {
            let miners = await API.getDailyMinerStats();
            buildChart(miners);
        }

        function average(ctx) {
            if (ctx.chart.data.datasets.length < 2) return 0;
            const values = ctx.chart.data.datasets[1].data;
            return values.reduce((a, b) => a + b, 0) / values.length;
        }

        function buildChart(miners) {
            const annotation = {
                type: 'line',
                borderColor: 'black',
                borderDash: [6, 6],
                borderDashOffset: 0,
                borderWidth: 1,
                label: {
                    display: true,
                    enabled: true,
                    content: (ctx) => 'Average: ' + average(ctx).toFixed(2),
                    position: 'center'
                },
                scaleID: 'incomeAxis',
                value: (ctx) => average(ctx),
                display: (ctx) => average(ctx) > 0,
            };

            chart = new Chart(
                document.querySelector('#chart-daily-miners'),
                {
                    type: 'bar',
                    data: {
                        labels: miners.map(row => new Date(row.date).toLocaleDateString()),
                        datasets: [
                            {
                                yAxisID: 'minersAxis',
                                label: 'Miners',
                                data: miners.map(row => row.totalMiners),
                                borderColor: THEME.getChartColor(),
                                backgroundColor: THEME.getChartColor(),
                                minBarLength: 2,
                                order: 1,
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
                            minersAxis: {
                                beginAtZero: true,
                                grid: {
                                    display: false
                                },
                                ticks: {
                                    color: THEME.getChartLabelColor(),
                                },
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            annotation: {
                                annotations: {
                                    annotation
                                }
                            }
                        }
                    }
                }
            );
        }

        async function getMinersList() {
            btnLoadMore.classList.add('loading');
            currentPage++;
            const options = {
                limit: 100,
                page: currentPage
            };
            let addresses = await API.getMiners(options);         
            btnLoadMore.classList.remove('d-none');
            btnLoadMore.classList.remove('loading');
            buildList(addresses);
        }

        function buildList(addresses) {
            if (typeof addresses === 'undefined') {
                // Returns 404 when no more transactions
                btnLoadMore.classList.add('d-none');
                noFurtherTransactions.classList.remove('d-none');
                return;
            }

            if (currentPage === 1) {
                minersList.innerHTML = '';
            }

            addresses.forEach(address => {
                index++;
                minersList.insertAdjacentHTML('beforeend',
                    `
                        <div class="list-item tile">
                            <div class="rank"><span class="indicator">${index}</span>${UTILS.formatOwnedAddress({ address: address.address, label: '', useName: true })}</div>
                            <div class="address">
                                <a href="/address/${address.address}" class="hash">${address.address}</a>
                            </div>
                            <div class="value">
                                <span class="value-output">${UTILS.unitsToPkt(address.received, 3)}</span>
                            </div>
                        </div>
                    `
                );
            });
        }

        btnLoadMore.addEventListener('click', getMinersList);

        themeSwitcherEl.addEventListener('themeChanged', () => {
            const labelColor = THEME.getChartLabelColor();
            chart.options.scales.minersAxis.ticks.color = labelColor;
            chart.update();
        });

    }
}(window.PAGE_DAILY_MINERS = window.PAGE_DAILY_MINERS || {}));