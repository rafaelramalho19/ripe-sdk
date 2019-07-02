const TEST_TIMEOUT = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT) : 30000;
const TEST_USERNAME = process.env.TEST_USERNAME || null;
const TEST_PASSWORD = process.env.TEST_PASSWORD || null;

module.exports = {
    TEST_TIMEOUT: TEST_TIMEOUT,
    TEST_USERNAME: TEST_USERNAME,
    TEST_PASSWORD: TEST_PASSWORD
};
