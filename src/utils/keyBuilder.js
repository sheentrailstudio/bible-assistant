const KeyBuilder =  {
    buildCacheKey(plan, date, needContent) {
        return `${plan}_${date}_${needContent}`;
    }

}

module.exports = KeyBuilder; 