const releaseNativeContent = require("./gh-release-atlas-native");

async function main() {
    const module = process.argv[2];

    switch (module) {
        case "atlas-core":
            console.log("core");
            break;
        case "atlas-web-content":
            console.log("web");
            break;
        case "atlas-content-native":
            await releaseNativeContent();
            break;
        default:
            throw new Error(`Unknown module: ${module}`)
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
