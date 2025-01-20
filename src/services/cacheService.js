class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (item.expiry && item.expiry < Date.now()) {
            this.delete(key);
            return null;
        }

        return item.value;
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.cache.has(key) && 
               (!this.cache.get(key).expiry || 
                this.cache.get(key).expiry > Date.now());
    }
}

module.exports = new CacheService(); 