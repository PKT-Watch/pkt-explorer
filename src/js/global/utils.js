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