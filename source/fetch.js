const nodeFetch = require("node-fetch");

let __dataFetcher, __textFetcher;

/**
 * Fetch data from a URL and return a buffer
 * @param {String} url The URL to fetch
 * @returns {Promise.<Buffer>} A promise that resolves with the data in a buffer
 */
function fetchData(url) {
    return nodeFetch(url).then(res => res.buffer());
}

/**
 * Fetch text from a URL
 * @param {String} url The URL to fetch
 * @returns {Promise.<String>} A promise that resolves with the fetched text
 */
function fetchText(url) {
    return nodeFetch(url).then(res => res.text());
}

function getDataFetcher() {
    return __dataFetcher || fetchData;
}

function getTextFetcher() {
    return __textFetcher || fetchText;
}

/**
 * Set the data fetching function
 * @see fetchData
 * @param {Function|undefined} fn The function to use or undefined to reset
 */
function setDataFetcher(fn) {
    __dataFetcher = fn;
}

/**
 * Set the text fetching function
 * @see fetchText
 * @param {Function|undefined} fn The function to use or undefined to reset
 */
function setTextFetcher(fn) {
    __textFetcher = fn;
}

module.exports = {
    getDataFetcher,
    getTextFetcher,
    setDataFetcher,
    setTextFetcher
};
