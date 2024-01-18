const { basename, join } = require("path");
const { mkdir, copyFile, rm } = require("fs/promises");
const {
    execShellCommand,
    getFiles,
    getPackageInfo,
    commitAndCreatePullRequest,
    githubAuthentication,
    cloneRepo,
    createMPK,
    createGithubReleaseFrom,
    updateModuleChangelogs,
    regex
} = require("./module-automation/commons");
const { downloadMpk } = require("./download-mpk");
const { execSync } = require("child_process");

const widgetsToUpdate = {
    Charts: 105695,
    Badge: 50325,
    Maps: 108261,
    ProgressBar: 48910,
    ProgressCircle: 47783,
    Timeline: 115852,
    HTMLElement: 204843
};

const repoRootPath = join(__dirname, "../../");
const moduleFolderNameInRepo = "atlas-web-content";
const moduleFolder = join(repoRootPath, `packages/${moduleFolderNameInRepo}`);

async function cpToDir(file, dir) {
    const name = basename(file);
    await copyFile(file, join(dir, name));
}

module.exports = async function createAtlasWebContentModule() {
    console.log("Creating the Atlas Web content module.");
    execSync("npm run release", { stdio: "inherit", cwd: moduleFolder });
    const tmp = join(repoRootPath, "tmp");
    const testProject = join(tmp, moduleFolderNameInRepo);

    await mkdir(testProject, { recursive: true });

    const moduleInfo = {
        ...(await getPackageInfo(moduleFolder)),
        moduleNameInModeler: "Atlas_Web_Content",
        moduleFolderNameInModeler: "atlas_web_content"
    };

    await githubAuthentication(moduleInfo);

    const moduleChangelogs = await updateModuleChangelogs(moduleInfo);
    if (!moduleChangelogs) {
        throw new Error(
            `No unreleased changes found in the CHANGELOG.md for ${moduleInfo.nameWithSpace} ${moduleInfo.version}.`
        );
    }
    await commitAndCreatePullRequest(moduleInfo);
    await updateTestProject(moduleInfo, testProject, tmp);
    const mpkOutput = await createMPK(testProject, moduleInfo, regex.excludeFiles);
    console.log(`Change owner and group after module export...`);
    execSync(`sudo chown -R runner:docker ${tmp}`, { stdio: "inherit" });

    await createGithubReleaseFrom({
        title: `${moduleInfo.nameWithSpace} - Marketplace Release v${moduleInfo.version}`,
        body: moduleChangelogs.replace(/"/g, "'"),
        tag: `${moduleFolderNameInRepo}-v${moduleInfo.version}`,
        mpkOutput,
        isDraft: true
    });

    await execShellCommand(`rm -rf ${tmp}`);

    console.log("Done.");
};

async function updateTestProject(moduleInfo, testProject, tmp) {
    const projectPath = join(
        repoRootPath,
        `packages/${moduleFolderNameInRepo}/dist/themesource/${moduleInfo.moduleFolderNameInModeler}`
    );
    const projectFiles = await getFiles(projectPath);
    const tmpFolderStyles = join(testProject, `themesource/${moduleInfo.moduleFolderNameInModeler}`);

    console.log(`Updating project from ${moduleInfo.testProjectUrl}..`);
    await cloneRepo(moduleInfo.testProjectUrl, testProject, moduleInfo.testProjectBranchName);

    console.log("Copying styling files and assets..");

    await Promise.all([
        ...projectFiles.map(async file => {
            const dest = join(tmpFolderStyles, file.replace(projectPath, ""));
            await rm(dest, { force: true });
            await mkdir(dest.replace(basename(dest), ""), { recursive: true });
            await copyFile(file, dest);
        })
    ]);

    await updateWidgetMpks(tmp, testProject);

    await execShellCommand(
        `echo ${moduleInfo.version} > themesource/${moduleInfo.moduleFolderNameInModeler}/.version`,
        testProject
    );
}

async function updateWidgetMpks(tmp, testProject) {
    const widgets = join(testProject, "widgets");
    const downloads = join(tmp, "downloads");
    await mkdir(widgets, { recursive: true });
    await mkdir(downloads, { recursive: true });

    for ([, appNumber] of Object.entries(widgetsToUpdate)) {
        const file = await downloadMpk(appNumber, downloads);
        await cpToDir(file, widgets);
    }
}
