const { createWriteStream } = require("node:fs");
const { promisify } = require("node:util");
const { pipeline } = require("node:stream");
const { join } = require("node:path");
const nodefetch = require("node-fetch");

const streamPipeline = promisify(pipeline);

async function downloadMpk(appNumber, downloadPath) {
    const appUrl = `https://appstore.home.mendix.com/rest/packagesapi/v2/packages/${appNumber}`;
    const headers = {
        method: "GET",
        redirect: "follow",
        headers: {
            accept: "application/json",
            "Mendix-Username": process.env.MX_USERNAME,
            "Mendix-ApiKey": process.env.MX_APIKEY
        }
    };
    let info;
    try {
        const response = await nodefetch(appUrl, headers);
        if (response.ok) {
            info = await response.json();
        } else {
            throw Error("Can't get app info");
        }
    } catch (error) {
        console.error(error);
    }

    const file = join(downloadPath, info.Version.LatestVersion.FileName);

    try {
        const response = await nodefetch(info.Version.LatestVersion.AppDownloadUrl, headers);
        if (response.ok) {
            await streamPipeline(response.body, createWriteStream(file));
        } else {
            throw Error("Can't download mpk");
        }
    } catch (error) {
        console.error(error);
    }
    return file;
}

module.exports = {
    downloadMpk
};
