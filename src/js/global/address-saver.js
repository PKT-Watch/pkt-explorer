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