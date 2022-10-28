const releaseNativeContent = require("./gh-release-atlas-native");
const releaseCore = require("./gh-release-atlas-core");
const releaseWebContent = require("./gh-release-atlas-web-content");

async function main() {
    const module = process.argv[2];

    switch (module) {
        case "atlas-core":
            await releaseCore();
            break;
        case "atlas-web-content":
            await releaseWebContent();
            break;
        case "atlas-content-native":
            await releaseNativeContent();
            break;
        default:
            throw new Error(`Unknown module: ${module}`);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
