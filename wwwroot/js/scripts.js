let page_visible = true;
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        page_visible = true;
    } else {
        page_visible = false;
    }
});
const VALUES = {
    NS_ADDRESS: 'pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2'
}

// Add addresses here to have the name displayed on the address page 
const KNOWN_ADDRESS = [
    {
        address: 'pkt1q6hqsqhqdgqfd8t3xwgceulu7k9d9w5t2amath0qxyfjlvl3s3u4sjza2g2',
        label: 'NS',
        name: 'Network Steward'
    }
]
 class APIParameters {
    _Parameters = [];

    add(key, value) {
        this._Parameters.push({ key, value });
    }

    buildQuery() {
        let query = '';
        for (let i = 0; i < this._Parameters.length; i++) {
            if (i === 0) {
                query += `?${this._Parameters[i].key}=${this._Parameters[i].value}`;
            } else {
                query += `&${this._Parameters[i].key}=${this._Parameters[i].value}`;
            }
        }
        return query;
    }
}
(function (UTILS) {
    const UNITS = [
        ['PKT', 1, 'PKT'],
        ['mPKT', 1000, 'milli-PKT (thousandths)'],
        ['μPKT', 1000000, 'micro-PKT (millionths)'],
        ['nPKT', 1000000000, 'nano-PKT (billionths)']
      ]

     UTILS.unitsToPkt = (units, formatted, decimals) => {
         const value = units/1024/1024/1024;
         if (formatted) return UTILS.numberWithCommas(value, decimals);
         return value;
     }

    UTILS.unitsToPkt = (units, decimals, formatted) => {   
        const pkt = units / 1024 / 1024 / 1024;

        if (formatted === false) {
            return (typeof decimals !== 'undefined' && decimals > 0 ? pkt.toFixed(decimals) : pkt);
        }

        return UTILS.pktToDenomination(pkt, decimals);
    }

    UTILS.pktToDenomination = (pkt, decimals) => {
        if (typeof decimals === 'undefined' && Number(pkt) < 1) {
            return '0.00 PKT';
        }
        decimals = isNaN(decimals) ? 0 : decimals;
        pkt = Number(pkt);
        let fa;
        let u = UNITS[0];
        let i = 0;
        do {
            fa = pkt * UNITS[i][1];
            u = UNITS[i];
            i++;
        } while (fa < 1 && u[0] !== 'nPKT')
        const str = UTILS.numberWithCommas(fa, decimals);
        const intDec = str.split('.');
        if (parseInt(intDec[0]) === 0 && parseInt(intDec[1]) === 0) {
            return `0.00 <span class="units">PKT</span>`;
        }

        return intDec.length > 1 ?
            `${intDec[0]}.${intDec[1]} <span class="units">${u[0]}</span>` :
            `${intDec[0]} <span class="units">${u[0]}</span>`;
    }

    UTILS.numberWithCommas = (value, decimals) => {
        decimals = typeof decimals === 'undefined' ? 2 : decimals; 
        if (typeof value !== 'number') { value = parseFloat(value) }; 
        return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    UTILS.timeSince = (date, removeSuffix) => {
        if (typeof date == 'string') date = new Date(date);
        var seconds = Math.floor((new Date() - date) / 1000);       
        var interval = seconds / 31536000;  
        if (interval > 2) {
            return `${Math.floor(interval)} years${!removeSuffix ? ' ago': ''}`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return `${Math.floor(interval)} months${!removeSuffix ? ' ago': ''}`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return `${Math.floor(interval)} days${!removeSuffix ? ' ago': ''}`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return `${Math.floor(interval)} hours${!removeSuffix ? ' ago': ''}`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            interval = Math.floor(interval);
            return `${Math.floor(interval)} ${interval > 1 ? 'minutes' : 'minute'}${!removeSuffix ? ' ago': ''}`;
        }
        return `< 1 Minute${!removeSuffix ? ' ago' : ''}`
    }

    UTILS.truncateString = function (value, options) {
        let startChars = (options && options.startChars && options.startChars > 0 ? options.startChars : 16);
        let endChars = (options && options.endChars && options.endChars > 0 ? options.endChars : 16);
        let seperator = (options && options.seperator ? options.seperator : '...');

        return `${value.substring(0, startChars)}${seperator}${value.substring(value.length - endChars)}`;
    }

    UTILS.truncateAddress = (address) => {
        const startSegment = address.substring(0, 8);
        const middleSegment = address.substring(8, address.length-8);
        const endSegment = address.substring(address.length-8);

        return `<span class="truncated-address">${startSegment}<span>${middleSegment}</span>${endSegment}</span>`;
    }

    UTILS.decodeCoinbase = (coinbase) => {
        return coinbase.replace(/[a-f0-9]{2}/g, (x) => {
          const cc = Number('0x' + x);
          if (cc >= 32 && cc < 127) {
              return String.fromCharCode(cc);
          }
            return '\\x' + x;
        });
    }

    UTILS.minedBy = (txn) => {
        const decoded = UTILS.decodeCoinbase(txn.coinbase);
        if (decoded.includes('Zetahash')) {
            return 'zetahash.com';
        } else if (decoded.includes('pkt.world')) {
            return 'pkt.world';
        } else if (decoded.includes('pkteer')) {
            return 'pkteer.com';
        } else if (decoded.includes('superphenix.net')) {
            return 'superphenix.net';
        } else {
            // Try to determine by payout address
            if (txn.output[0].address === 'pkt1qyrgfajtch4qfjz68fvh9qjfy6l882xawuh7g38' || 
                txn.output[0].address === 'pkt1q282hnt3zw7uz4uydsxkuundnqy2s9th95yggps'  || 
                txn.output[0].address === 'pkt1qsmd3lqt8fasvddjncjfvkhejwrqdj300nmkshd') {
                // This is a pkt.world payout
                return 'pkt.world';
            } else if (txn.output[0].address === 'pkt1qddktnzzsqzxajpyv3z9zxqplff5l3lw5ztln2r' || 
                       txn.output[0].address === 'pkt1qwuns2e3fu798s0p95tqnps87kvfuegq4lephtu') {
                // This is a pktpool payout
                return 'pktpool.io';
            } else if (txn.output[0].address === 'pkt1q9pha6uycnnwysmj70uvnrq7ggpx50zz3z2h242' || 
                       txn.output[0].address === 'pkt1qfhu8l2w7gsk40kekrm5y7w3f2w340s24xulrpg') {
                // This is a zetahash payout
                return 'zetahash.com';
            } else if (txn.output[0].address === 'pkt1qt7k5qh8l85g84nzn998nxdqkvczv034mg073zx') {
                // This is a pkteer payout
                return 'pkteer.com';
            } else {
                return 'Unknown';
            }
        }
    } 

    UTILS.isNumeric = (str) => {
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    UTILS.determineRoute = async (search) => {
        if (UTILS.isNumeric(search)) {
            // Block height
            if (parseInt(search) < 0) {
                return '';
            }

            return `/block/${search}`;
        }

        if (/[a-f0-9]{64}/.test(search)) {
            // Possible block hash or txn hash. Only way to check is try requesting from API
            let [block, txn] = await Promise.all([API.getBlock(search), API.getTransaction(search)]);

            if (block) {
                return `/block/${search}`;
            } else if (txn) {
                return `/tx/${search}`;
            }

            return '';
        }   

        // Must be address or invalid search
        let address = await API.getAddress(search);

        if (address) {
            return `/address/${search}`;
        }

        // Invalid search
        return '';
    }

    UTILS.formatOwnedAddress = (options) => {
        /** OPTIONS
         * address: string
         * includeAddress: boolean (optional) Append the address
         * useName: boolean (optional) Display the 'name' rather than 'label'
         * label: string (optional) String to display if address is not owned
         */
        if (typeof options === 'undefined') return false;
        if (typeof options.address != "string") return false;
        if (typeof options.includeAddress == 'undefined') {
            options.includeAddress = false;
        }
        const ownedAddress = KNOWN_ADDRESS.find(x => x.address === options.address);

        if (ownedAddress) {
            return `<span class="owned" data-owner="${options.useName ? ownedAddress.name : ownedAddress.label}"></span>${options.includeAddress ? options.address : ''}`;
        }

        return typeof options.label == 'string' ? options.label : options.includeAddress ? options.address : '';
    }

    UTILS.setCookie = (name, value, days) => {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
    UTILS.getCookie = (name) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    UTILS.eraseCookie = (name) => {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

}(window.UTILS = window.UTILS || {}));
(function (THEME) {
    const themeSwitcherEl = document.querySelector('#theme-switcher');
    const themeSwitcherInputs = themeSwitcherEl.querySelectorAll('input');
    const THEMES = ['light', 'dark', 'system'];
    let selected_theme = UTILS.getCookie('theme') || THEMES[0];
    let prefers_dark_mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    THEME.switchTheme = (theme) => {
        if (!THEMES.includes(theme)) return;

        document.querySelector('html').dataset.theme = theme;

        UTILS.setCookie('theme', theme, 365);
        selected_theme = theme;

        const event = new CustomEvent("themeChanged", { detail: selected_theme });
        themeSwitcherEl.dispatchEvent(event);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        prefers_dark_mode = event.matches;
    });

    THEME.getChartColor = () => {
        const lightColor = 'rgb(60, 173, 239)';
        const darkColor = 'rgb(60, 173, 239)';
        if (selected_theme === THEMES[1]) {
            // Dark theme
            return darkColor;
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            return darkColor;
        }

        return lightColor;
    }

    THEME.getChartLabelColor = () => {
        const lightColor = '#666';
        const darkColor = '#d7d9dd';
        if (selected_theme === THEMES[1]) {
            // Dark theme
            return darkColor;
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            return darkColor;
        }

        return lightColor;
    }

    THEME.getSelectedTheme = () => {
        return selected_theme;
    }

    THEME.getQRColors = () => {
        const colors = {
            foreground: '#fff',
            background: '#000000'
        }
        if (selected_theme === THEMES[1]) {
            // Dark theme
            colors.foreground = '#1f2b38';
            colors.background = 'rgb(60, 173, 239)';
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            colors.foreground = '#1f2b38';
            colors.background = 'rgb(60, 173, 239)';
        }

        return colors;
    }

    themeSwitcherInputs.forEach(input => {
        input.addEventListener('change', e => {
            if (e.target.checked) {
                THEME.switchTheme(e.target.value);
            }
        });
    });

    init = () => {
        const theme = THEME.getSelectedTheme();
        themeSwitcherInputs.forEach(input => {
            input.checked = input.value === theme;
            input.addEventListener('change', e => {
                if (e.target.checked) {
                    THEME.switchTheme(e.target.value);
                }
            });
        });
    }

    // Handle swipe back navigation on iOS
    // This will run on page load and back navigation.
    window.onpageshow = () => {
        setTimeout(() => {
            init();
        }, 0);

    }

}(window.THEME = window.THEME || {}));
(function (API) {
    const baseUrl = API_BASE_URL;

    function buildUrl(urlSegement, parameters) {
        //## 'parameters' is instance of APIParameters
        parameters = parameters || new APIParameters();

        // Eliminate leading slash if present
        if (urlSegement.startsWith('/')) {
            urlSegement = urlSegement.substring(1);
        }
        return `${baseUrl}${urlSegement}${parameters.buildQuery()}`;
    }

    async function makeRequest(url) {
        let response;
        let json;

        try {
            response = await fetch(url);
            json = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                //console.log('There was a SyntaxError', error);
            } else {
                //console.log('There was an error', error);
            }
        }

        if (response?.ok) {
            if (json) {
                return typeof json.results === 'undefined' ? json : json.results;
            }
        } else {
            //console.log(`HTTP Response Code: ${response?.status}`)
        }
    }

    API.get = async (urlSegement, parameters) => {
        const url = buildUrl(urlSegement, parameters);
        
        let response;
        let json;

        try {
            response = await fetch(url);
            json = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                //console.log('There was a SyntaxError', error);
            } else {
                //console.log('There was an error', error);
            }
        }

        if (response?.ok) {
            if (json) {
                return json;
            }
        } else {
            //console.log(`HTTP Response Code: ${response?.status}`)
        }
    }

    API.getTipBlock = async () => {
        const url = buildUrl(`chain/down/1/1/`);
            
        let response;
        let json;

        try {
            response = await fetch(url);
            json = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Unexpected token < in JSON
                //console.log('There was a SyntaxError', error);
            } else {
                //console.log('There was an error', error);
            }
        }

        if (response?.ok) {
            if (json) {
                return json.results[0];
            }
        } else {
            //console.log(`HTTP Response Code: ${response?.status}`)
            return [];
        }
    }

    API.getExternalTipBlock = async () => {
        const url = `https://explorer.pkt.cash/api/v1/PKT/pkt/chain/down/1/1/`;

        let response;
        let json;

        try {
            response = await fetch(url);
            json = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                // Unexpected token < in JSON
                //console.log('There was a SyntaxError', error);
            } else {
                //console.log('There was an error', error);
            }
        }

        if (response?.ok) {
            if (json) {
                return json.results[0];
            }
        } else {
            //console.log(`HTTP Response Code: ${response?.status}`)
            return [];
        }
    }

    API.getBlock = async (blockHash) => {
        if (!blockHash) throw new Error("Block Hash required");
        const url = buildUrl(`block/${blockHash}`);
        return await makeRequest(url);
    }

    API.getBlockTransactions = async (options) => {
        /** OPTIONS
         * blockHash: string
         * limit: int (optional)[max 100] Number of items to return 
         * page: int (optional) Page number
         */
        if (!options || !options.blockHash) throw new Error("Block Hash required");
        options.limit = options.limit || 50;
        options.page = options.page || 1;

        const url = buildUrl(`block/${options.blockHash}/coins/${options.limit}/${options.page}`);
        return await makeRequest(url);
    }

    API.getBlocks = async (options) => {
        /** OPTIONS
         * limit: int (optional)[max 100] Number of items to return 
         * page: int (optional) Page number
         */
        options = options || {};
        options.limit = options.limit || 50;
        options.page = options.page || 1;

        const url = buildUrl(`chain/down/${options.limit}/${options.page}`);
        return await makeRequest(url);
    }

    API.getTransaction = async (txid) => {
        if (!txid) throw new Error("TXID required");
        const url = buildUrl(`tx/${txid}`);
        return await makeRequest(url);
    }

    API.getCirculatingSupply = async () => {
        const url = 'https://api.pkt.watch/v1/network/circulating-supply';
        return await makeRequest(url);
    }

    API.getPrice = async () => {
        const url = 'https://api.pkt.watch/v1/network/price';
        return await makeRequest(url);
    }

    API.getCoinStats = async () => {
        const url = buildUrl(`stats/coins`);
        return await makeRequest(url);
    }

    API.getBlockCount24hr = async () => {
        const url = buildUrl(`stats/block-count-24hr`);
        return await makeRequest(url);
    }

    API.getDailyTransactionStats = async () => {
        const url = buildUrl(`stats/daily-transactions/`);
        return await makeRequest(url);
    }

    API.getRichList = async (options) => {
        options = options || {};
        options.limit = options.limit || 100;
        options.page = options.page || 1;
        const url = buildUrl(`stats/richlist/${options.limit}/${options.page}`);
        return await makeRequest(url);
    }

    API.getDailyMinerStats = async () => {
        const url = buildUrl(`stats/daily-miners`);
        return await makeRequest(url);
    }

    API.getMiners = async (options) => {
        options = options || {};
        options.limit = options.limit || 100;
        options.page = options.page || 1;
        const url = buildUrl(`stats/minerlist/${options.limit}/${options.page}`);
        return await makeRequest(url);
    }

    API.getAddress = async (address) => {
        if (!address) throw new Error("Address required");

        const url = buildUrl(`address/${address}`);
        return await makeRequest(url);
    }

    API.getAddressTransactions = async (options) => {
        /** OPTIONS
         * address: string
         * limit: int (optional)[max 100] Number of items to return || 'yyyy-mm-dd' Start date
         * page: int (optional) Page number || 'yyyy-mm-dd' End date
         * mining: (optional) only || included || excluded
         */
        if (!options || !options.address) throw new Error("Address required");
        options.limit = options.limit || 50;
        options.page = options.page || 1;
        options.mining = options.mining || 'excluded';

        const url = buildUrl(`address/${options.address}/coins/${options.limit}/${options.page}?mining=${options.mining}`);
        return await makeRequest(url);
    }

    API.getAddressMiningIncome = async (options) => {
        /** OPTIONS
         * address: string
         * limit: int (optional)[max 100] Number of items to return 
         * page: int (optional) Page number
         * mining: (optional) only || included || excluded
         */
        if (!options || !options.address) throw new Error("Address required");
        options.limit = options.limit || 90;
        options.page = options.page || 1;

        const url = buildUrl(`address/${options.address}/income/${options.limit}/${options.page}?mining=only`);
        return await makeRequest(url);
    }

}(window.API = window.API || {}));
const clipboardControls = document.querySelectorAll('.clipboard-copy');

clipboardControls.forEach((control) => {
    control.addEventListener('click', e => {
        const clipboardControl = e.currentTarget;
        copyToClipboard(clipboardControl.querySelector('.clipboard-copy-value').innerText.trim());
    
        clipboardControl.classList.add('copied');
    
        setTimeout(() => {
            clipboardControl.classList.remove('copied');
        }, 1500);
    });
});

function copyToClipboard(text) {
    if (!text || text === '') return;

    var copyElement = document.createElement("span");
    copyElement.appendChild(document.createTextNode(text));
    copyElement.id = 'tempCopyToClipboard';
    document.body.append(copyElement);

    // select the text
    var range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    // copy & cleanup
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    copyElement.remove();
}
document.body.addEventListener('click', e => {
    if (e.target && e.target.closest('.expandable-content-control')) {
        const expandableContentEl = e.target.closest('.expandable-content');
        expandableContentEl.classList.toggle('expanded');

        if (!expandableContentEl.classList.contains('expanded')) {
            if (expandableContentEl.closest('#coinbase-transaction-list')) {
                expandableContentEl.scrollIntoView({behavior: 'instant', block: 'start', inline: 'nearest'});
            }
        }
        
    }
});

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
document.querySelector('body').addEventListener('click', e => {
    if (e.target && e.target.closest('.dropup button')) {
        e.target.closest('.dropup').classList.toggle('active');
    }
});
(function (ADDRESS_SAVER) {
    const STORAGE_KEY = 'savedAddresses';

    ADDRESS_SAVER.addresses = () => {
        return getFromStorage();
    };

    ADDRESS_SAVER.add = (address) => {
        return addToStorage(address);
    }

    ADDRESS_SAVER.remove = (address) => {
        return removeFromStorage(address);
    }

    getFromStorage = () => {
        let addresses = [];
        if (localStorage.getItem(STORAGE_KEY)) {
            addresses = JSON.parse(localStorage.getItem(STORAGE_KEY));
        }
        return addresses;
    }

    addToStorage = (address) => {
        const addresses = getFromStorage();

        if (!addresses.includes(address)) {
            addresses.push(address);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
        }
        
        return addresses;
    }

    removeFromStorage = (address) => {
        const addresses = getFromStorage();
        const filtered = addresses.filter(e => e !== address);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
    }
}(window.ADDRESS_SAVER = window.ADDRESS_SAVER || {}));
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
if (typeof initPage === 'function') {
    initPage();
}