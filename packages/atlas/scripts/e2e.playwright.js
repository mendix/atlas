const { execSync, exec } = require("child_process");
const { readFile } = require("fs").promises;
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { join } = require("path");
const { cp, ls, mkdir, rm } = require("shelljs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const { createWriteStream, existsSync, readFileSync, writeFileSync } = require("fs");
const { tmpdir } = require("os");

// Modes of the e2e run. Both compare against the same screenshot baselines.
// - full: the test project as it is (Atlas Core with its legacy styling).
// - legacy: Atlas Core with $exclude-bootstrap and $exclude-mxui set to true, plus the Atlas Legacy module.
//   Any pixel difference is a bug in the Atlas Legacy copy, never a reason to add baselines.
const MODE_FULL = "full";
const MODE_LEGACY = "legacy";
const MODE_MARKER = "tests/testProject/.atlas-e2e-mode";
const LEGACY_MODULE_MPK = join(__dirname, "legacy/Atlas_Legacy.mpk");
const LEGACY_STYLES = join(__dirname, "../src/themesource/atlas_legacy/web");
const LEGACY_EXCLUSIONS = ["$exclude-bootstrap", "$exclude-mxui"];

main().catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main() {
    try {
        execSync("docker info");
    } catch (e) {
        throw new Error("To run e2e test locally, make sure docker is running. Exiting now...");
    }

    const packageConf = JSON.parse(await readFile("package.json"));
    const widgetVersion = packageConf?.version;
    const mendixVersion = process.env.MENDIX_VERSION || packageConf?.testProject?.mxVersion;
    const mode = getMode();
    console.log(`Running e2e in "${mode}" mode`);

    // Legacy mode changes the test project, so a project prepared for the other mode is downloaded again.
    const preparedMode = getPreparedMode();
    if (preparedMode !== mode && ls(`tests/testProject/*.mpr`).length > 0) {
        console.log(`Test project was prepared for "${preparedMode}" mode, downloading it again...`);
        rm("-rf", "tests/testProject");
    }

    // Downloading test project
    if (process.argv.includes("--update-test-project") || ls(`tests/testProject/*.mpr`).length === 0) {
        if (!packageConf?.testProject?.githubUrl || !packageConf?.testProject?.branchName) {
            throw new Error(
                'No GitHub test project details provided in the "package.json". Please add a GitHub URL and branch name in the "package.json" to refer to a test project on GitHub.'
            );
        }

        await copyGitHubTestProject();
    }

    if (!process.argv.includes("--no-widget-update")) {
        const widgetMpk = ls(`dist/${widgetVersion}/*.mpk`).length;
        if (!widgetMpk) {
            throw new Error(
                "No widgets founds in dist folder. Please execute `npm run release` before start e2e tests."
            );
        }

        // Copy the built widget to test project
        mkdir("-p", "tests/testProject/widgets");
        cp("-rf", `dist/${widgetVersion}/*.mpk`, "tests/testProject/widgets/");
    }

    // Create reusable mxbuild image

    const existingImages = execSync(`docker image ls -q mxbuild:${mendixVersion}`).toString().trim();
    if (!existingImages) {
        console.log(`Creating new mxbuild docker image...`);
        execSync(
            `docker build -f ${join(__dirname, "mxbuild.Dockerfile")} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxbuild:${mendixVersion} ${__dirname}`,
            { stdio: "inherit" }
        );
    }

    const existingRuntimeImages = execSync(`docker image ls -q mxruntime:${mendixVersion}`).toString().trim();
    if (!existingRuntimeImages) {
        console.log(`Creating new runtime docker image...`);
        execSync(
            `docker build -f ${join(__dirname, "runtime.Dockerfile")} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxruntime:${mendixVersion} ${__dirname}`,
            { stdio: "inherit" }
        );
    }

    const projectFile = ls("tests/testProject/*.mpr").toString();

    if (mode === MODE_LEGACY && getPreparedMode() !== MODE_LEGACY) {
        prepareLegacyTestProject(projectFile, mendixVersion);
    }

    // Build testProject via mxbuild
    if (!process.argv.includes("--no-exec-mxbuild")) {
        execSync(
            `docker run --name mxbuild -t -v ${process.cwd()}:/source ` +
                `--rm mxbuild:${mendixVersion} bash -c "mx update-widgets --loose-version-check /source/${projectFile} && mxbuild ` +
                `--modern-web-client --ignore-unsupported-widgets -o /tmp/automation.mda /source/${projectFile}"`,
            { stdio: "inherit" }
        );
        console.log("Bundle created and all the widgets are updated");

        if (mode === MODE_LEGACY) {
            verifyLegacyModuleOrder();
        }
    }
    // Spin up the runtime and run testProject
    execSync(
        `docker run --name mxruntime -td -v ${process.cwd()}:/source -v ${__dirname}:/shared:ro -w /source -p 8080:8080 ` +
            `-e MENDIX_VERSION=${mendixVersion} --entrypoint /bin/bash ` +
            `--rm mxruntime:${mendixVersion} /shared/runtime.sh`
    )
        .toString()
        .trim();

    let attempts = 60;
    for (; attempts > 0; --attempts) {
        try {
            const response = await fetch(`http://127.0.0.1:8080`);
            if (response.ok) {
                attempts = 0;
            }
        } catch (e) {
            console.log(`Could not reach http://127.0.0.1, trying again...`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.log("Runtime started with success.");
}

function getMode() {
    const mode = process.argv.includes("--legacy") ? MODE_LEGACY : process.env.ATLAS_E2E_MODE || MODE_FULL;
    if (mode !== MODE_FULL && mode !== MODE_LEGACY) {
        throw new Error(`Unknown e2e mode "${mode}". Use "${MODE_FULL}" or "${MODE_LEGACY}".`);
    }
    return mode;
}

// A test project without a marker is the unchanged download.
function getPreparedMode() {
    return existsSync(MODE_MARKER) ? readFileSync(MODE_MARKER, "utf8").trim() : MODE_FULL;
}

// Turns the downloaded test project into an app that uses Atlas Legacy: Atlas Core's legacy styling is excluded,
// the Atlas_Legacy module is imported from a model-only module package and gets the styles from this repository.
function prepareLegacyTestProject(projectFile, mendixVersion) {
    console.log("Preparing the test project for legacy mode...");
    // Until it is done the project matches neither mode, so a failed run makes the next run download it again.
    writeFileSync(MODE_MARKER, `${MODE_LEGACY}-incomplete`);

    const exclusionFile = "tests/testProject/theme/web/exclusion-variables.scss";
    let exclusions = readFileSync(exclusionFile, "utf8");
    for (const variable of LEGACY_EXCLUSIONS) {
        const pattern = new RegExp(`^(\\${variable}:\\s*)false;`, "m");
        if (!pattern.test(exclusions)) {
            throw new Error(`Could not set ${variable} to true in ${exclusionFile}.`);
        }
        exclusions = exclusions.replace(pattern, "$1true;");
    }
    writeFileSync(exclusionFile, exclusions);

    // The package holds an empty Atlas_Legacy module marked as a Marketplace module, so Studio Pro compiles it
    // before the UI resources modules (Atlas Core), like an app that installs Atlas Legacy from the Marketplace.
    cp(LEGACY_MODULE_MPK, "tests/testProject/Atlas_Legacy.mpk");
    execSync(
        `docker run --name mxbuild-legacy -t -v ${process.cwd()}:/source --rm mxbuild:${mendixVersion} ` +
            `bash -c "mx module-import /source/tests/testProject/Atlas_Legacy.mpk /source/${projectFile}"`,
        { stdio: "inherit" }
    );
    rm("-f", "tests/testProject/Atlas_Legacy.mpk");

    mkdir("-p", "tests/testProject/themesource/atlas_legacy/web");
    cp("-rf", `${LEGACY_STYLES}/*`, "tests/testProject/themesource/atlas_legacy/web/");

    writeFileSync(MODE_MARKER, MODE_LEGACY);
    console.log("Test project uses Atlas Legacy");
}

// Atlas Legacy is a base layer: if it compiled after Atlas Core, Bootstrap would override Atlas.
function verifyLegacyModuleOrder() {
    const sassEntry = "tests/testProject/deployment/sass/main.scss";
    const imports = readFileSync(sassEntry, "utf8");
    const legacyIndex = imports.indexOf("themesource/atlas_legacy/web/main.scss");
    const coreIndex = imports.indexOf("themesource/atlas_core/web/main.scss");
    if (legacyIndex < 0 || coreIndex < 0 || legacyIndex > coreIndex) {
        throw new Error(`Atlas Legacy must compile before Atlas Core. Check the module order in ${sassEntry}.`);
    }
}

async function getMendixVersion() {
    const mendixOptionIndex = process.argv.indexOf("--mx-version");
    const targetMendixVersion = mendixOptionIndex >= 0 ? process.argv[mendixOptionIndex + 1] : undefined;
    let mendixVersion;

    if (process.env.MENDIX_VERSION) {
        return process.env.MENDIX_VERSION;
    }
    try {
        const mendixVersions = await fetch(
            "https://raw.githubusercontent.com/mendix/web-widgets/main/automation/run-e2e/mendix-versions.json"
        );

        const mendixVersionsJson = await mendixVersions.json();

        if (targetMendixVersion && targetMendixVersion in mendixVersionsJson) {
            mendixVersion = mendixVersionsJson[targetMendixVersion];
        } else {
            mendixVersion = mendixVersionsJson.latest;
        }
    } catch (e) {
        throw new Error("Couldn't reach github.com. Make sure you are connected to internet.");
    }
    if (!mendixVersion) {
        throw new Error("Couldn't retrieve Mendix version from github.com. Try again later.");
    }

    return mendixVersion;
}

async function copyGitHubTestProject() {
    const packageConf = JSON.parse(await readFile("package.json"));

    console.log("Copying test project from GitHub repository...");

    try {
        await promisify(exec)("unzip --help", { stdio: "ignore" });
    } catch (e) {
        throw new Error("This script requires unzip command to be available on the PATH!");
    }
    const testArchivePath = await getTestProject(packageConf.testProject.githubUrl, packageConf.testProject.branchName);

    try {
        const folderPrefix = packageConf.testProject.githubUrl.split("/").pop();
        if (!folderPrefix) {
            throw new Error(
                "Could not determine prefix for repository folder. Please make sure you have defined a githubUrl with a valid Github repository."
            );
        }
        mkdir("-p", "tests/testProject");
        execSync(`unzip -o ${testArchivePath} -d tests/testProject`, { stdio: "inherit" });
        if (process.argv.includes("--remove-atlas-files")) {
            rm(
                "-rf",
                `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}/theme`,
                `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}/themesource/atlas_core`,
                `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}/themesource/atlas_nativemobile_content`,
                `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}/themesource/atlas_web_content`
            );
        }
        cp("-rf", `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}/*`, "tests/testProject");
        writeFileSync(MODE_MARKER, MODE_FULL);
        rm("-rf", `tests/testProject/${folderPrefix}-${packageConf.testProject.branchName}`);
        rm("-f", testArchivePath);
    } catch (e) {
        throw new Error("Failed to unzip the test project into tests/testProject", e.message);
    }

    // verify test project validity
    if (ls(`tests/testProject/*.mpr`).length === 0) {
        throw new Error('Invalid test project retrieved from GitHub: "mpr" file is missing.');
    }
}

async function getTestProject(repository, branch) {
    const downloadedArchivePath = join(tmpdir(), `testProject.zip`);

    if (!repository.includes("github.com")) {
        throw new Error("githubUrl is not a valid github repository!");
    }

    try {
        await promisify(pipeline)(
            (
                await fetch(`${repository}/archive/refs/heads/${branch}.zip`)
            ).body,
            createWriteStream(downloadedArchivePath)
        );
        return downloadedArchivePath;
    } catch (e) {
        console.log(`Url is not available :(`);
        rm("-f", downloadedArchivePath);
    }
    throw new Error("Cannot find test project in GitHub repository. Try again later.");
}
