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
    regex,
    unzip
} = require("./module-automation/commons");
const { downloadMpk } = require("./download-mpk");
const { execSync } = require("child_process");

const repoRootPath = join(__dirname, "../../");
const moduleFolderNameInRepo = "atlas-core";
const moduleFolder = join(repoRootPath, `packages/${moduleFolderNameInRepo}`);

async function cpToDir(file, dir) {
    const name = basename(file);
    await copyFile(file, join(dir, name));
}

module.exports = async function createAtlasCoreModule() {
    console.log("Creating the Atlas Core module.");
    execSync("npm run release", { stdio: "inherit", cwd: moduleFolder });
    const tmp = join(repoRootPath, "tmp");
    const testProject = join(tmp, moduleFolderNameInRepo);

    await mkdir(testProject, { recursive: true });

    const moduleInfo = {
        ...(await getPackageInfo(moduleFolder)),
        moduleNameInModeler: "Atlas_Core",
        moduleFolderNameInModeler: "atlas_core"
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

    await createGithubReleaseFrom({
        title: `${moduleInfo.nameWithSpace} - Marketplace Release v${moduleInfo.version}`,
        body: moduleChangelogs.replace(/"/g, "'"),
        tag: `${moduleFolderNameInRepo}-v${moduleInfo.version}`,
        mpkOutput,
        isDraft: true
    });

    await execShellCommand(`chmod -R a+rw ${tmp}`);
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
    await cloneRepo(moduleInfo.testProjectUrl, testProject);

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
    const gitOutput = await execShellCommand(`cd ${testProject} && git status`);
    if (/nothing to commit/i.test(gitOutput)) {
        console.warn(`Nothing to commit from repo ${testProject}`);
    } else {
        await execShellCommand("git add . && git commit -m 'Updated widgets and styling' && git push", testProject);
    }
}

async function updateWidgetMpks(tmp, testProject) {
    const NATIVE_MOBILE_RESOURCE_APP_NUMBER = 109513;
    const LANGUAGE_SELECTOR_APP_NUMBER = 202738;

    const widgets = join(testProject, "widgets");
    const downloads = join(tmp, "downloads");
    const nmrPath = join(downloads, "NativeMobileResources");
    await mkdir(downloads, { recursive: true });
    await mkdir(nmrPath, { recursive: true });
    const nmrMpk = await downloadMpk(NATIVE_MOBILE_RESOURCE_APP_NUMBER, downloads);
    await unzip(nmrMpk, nmrPath);
    const feedbackNativeMpk = join(nmrPath, "widgets/com.mendix.widget.native.Feedback.mpk");
    const languageSelectorMpk = await downloadMpk(LANGUAGE_SELECTOR_APP_NUMBER, downloads);
    await cpToDir(feedbackNativeMpk, widgets);
    await cpToDir(languageSelectorMpk, widgets);
}
