const { execSync, exec } = require("child_process");
const { readFile } = require("fs").promises;
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { join } = require("path");
const { cp, ls, mkdir, rm } = require("shelljs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const { createWriteStream } = require("fs");
const { tmpdir } = require("os");

main().catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main() {
    const mendixVersion = await getMendixVersion();

    try {
        execSync("docker info");
    } catch (e) {
        throw new Error("To run e2e test locally, make sure docker is running. Exiting now...");
    }

    const packageConf = JSON.parse(await readFile("package.json"));
    const widgetVersion = packageConf?.version;

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
            `docker build --platform=linux/amd64 -f ${join(__dirname, "mxbuild.Dockerfile")} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxbuild:${mendixVersion} ${__dirname}`,
            { stdio: "inherit" }
        );
    }

    const existingRuntimeImages = execSync(`docker image ls -q mxruntime:${mendixVersion}`).toString().trim();
    if (!existingRuntimeImages) {
        console.log(`Creating new runtime docker image...`);
        execSync(
            `docker build --platform=linux/amd64 -f ${join(__dirname, "runtime.Dockerfile")} ` +
                `--build-arg MENDIX_VERSION=${mendixVersion} ` +
                `-t mxruntime:${mendixVersion} ${__dirname}`,
            { stdio: "inherit" }
        );
    }

    // Build testProject via mxbuild
    const projectFile = ls("tests/testProject/*.mpr").toString();
    if (!process.argv.includes("--no-exec-mxbuild")) {
        execSync(
            `docker run --name mxbuild -t -v ${process.cwd()}:/source ` +
                `--rm mxbuild:${mendixVersion} bash -c "mx update-widgets --loose-version-check /source/${projectFile} && mxbuild ` +
                `-o /tmp/automation.mda /source/${projectFile}"`,
            { stdio: "inherit" }
        );
        console.log("Bundle created and all the widgets are updated");
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
        await promisify(exec)(`unzip -o ${testArchivePath} -d tests/testProject`);
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
