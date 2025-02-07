const mongoService = require('../services/mongoService');

async function testGetQTPlanDetail() {
    try {
        const result = await mongoService.getQTPlanDetail("rcuv", "01_1y", "02/01");
        console.log(`getQTPlanDetail ${result}`);
    } catch (error) {
        console.error('Error in testGetQTPlanDetail:', error);
    }
}

testGetQTPlanDetail()