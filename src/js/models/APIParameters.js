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