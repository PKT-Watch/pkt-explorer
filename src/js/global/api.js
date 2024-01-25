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