function buildContentKey(plan , date , needContent) {
    return `${plan}_${date}_${needContent}`
}

module.exports = {buildContentKey}