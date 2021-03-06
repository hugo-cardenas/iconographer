// const convert = require("xml-js");
const { parseFragment } = require("parse5");
const { resolve: resolveURL } = require("url");
const { getDataFetcher, getTextFetcher } = require("./fetch.js");

/**
 * Processed icon information
 * @typedef {Object} ProcessedIcon
 * @property {Buffer} data - The icon's data
 * @property {String} url - URL of the icon
 * @property {Number} size - Size of the icon (width == height)
 */

function fetchIconData(iconURL) {
    const fetch = getDataFetcher();
    return fetch(iconURL);
}

function fetchLinkAttributes(linkHTML) {
    // const sanitisedHTML = linkHTML.trim().replace(/\/?>$/, "></link>");
    // console.log("LINKEROOS", sanitisedHTML);
    // const struct = convert.xml2js(sanitisedHTML, { compact: true, ignoreText: true });
    const struct = parseFragment(linkHTML).childNodes[0];
    const attributes =
        (struct &&
            struct.attrs &&
            struct.attrs.reduce((output, nextAttr) => {
                output[nextAttr.name] = nextAttr.value;
                return output;
            }, {})) ||
        {};
    return attributes;
}

/**
 * Get an icon from a page
 * @param {String} url The page URL
 * @returns {Promise.<ProcessedIcon|null>} A promise that resolves with icon information, or null
 */
function getIcon(url) {
    return getIcons(url).then(icons => {
        // select largest icon (first)
        const [icon] = icons;
        if (icon) {
            return fetchIconData(icon.url).then(data => Object.assign(icon, { data }));
        }
        return null;
    });
}

function getIcons(url) {
    return getRawLinks(url).then(links => {
        const icons = links.filter(link => /(apple-touch-icon|^icon$)/.test(link.rel || "")).map(link => ({
            url: processIconHref(url, link.href),
            size: processIconSize(link.sizes)
        }));
        return icons.sort((iconA, iconB) => {
            if (iconA.size > iconB.size) {
                return -1;
            } else if (iconB.size > iconA.size) {
                return 1;
            }
            return 0;
        });
    });
}

function getRawLinks(url) {
    const linkRexp = /<link("([^"]|\\")+"|[\sa-z0-9=/:-]+)+>/gi;
    return getPageSource(url).then(source => {
        const linkEls = [];
        let match;
        while ((match = linkRexp.exec(source))) {
            linkEls.push(match[0]);
        }
        return linkEls.map(linkEl => fetchLinkAttributes(linkEl));
    });
}

function getPageSource(url) {
    const fetch = getTextFetcher();
    return fetch(url);
}

function processIconHref(page, url) {
    if (/^https?:\/\//i.test(url) !== true) {
        return resolveURL(page, url);
    }
    return url;
}

function processIconSize(size) {
    const targetSize = size || "";
    const [width] = targetSize.split(/x/i);
    return (width && parseInt(width, 10)) || 0;
}

module.exports = {
    fetchIconData,
    fetchLinkAttributes,
    getIcon,
    getIcons
};
