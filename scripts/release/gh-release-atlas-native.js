const { join } = require("path");
const { execSync } = require("node:child_process");
const { copyFile, rm } = require("fs/promises");
const {
    execShellCommand,
    getFiles,
    getPackageInfo,
    commitAndCreatePullRequest,
    updateModuleChangelogs,
    githubAuthentication,
    cloneRepo,
    createMPK,
    createGithubReleaseFrom,
    regex
} = require("./module-automation/commons");

const repoRootPath = join(__dirname, "../../");
const moduleFolderNameInRepo = "atlas-content-native";

module.exports = async function createAtlasNativeContentModule() {
    console.log("Creating the Atlas Native Content module.");
    const moduleFolder = join(repoRootPath, `packages/${moduleFolderNameInRepo}`);
    await execShellCommand(`cd ${moduleFolder} && npm run release`);
    const tmpFolder = join(repoRootPath, "tmp", moduleFolderNameInRepo);
    let moduleInfo = {
        ...(await getPackageInfo(moduleFolder)),
        moduleNameInModeler: "Atlas_NativeMobile_Content",
        moduleFolderNameInModeler: "atlas_nativemobile_content"
    };
    await githubAuthentication(moduleInfo);
    const moduleChangelogs = await updateModuleChangelogs(moduleInfo);
    const targetBranchName = await commitAndCreatePullRequest(moduleInfo);
    await updateNativeComponentsTestProjectWithAtlas(moduleInfo, tmpFolder);
    const mpkOutput = await createMPK(tmpFolder, moduleInfo, regex.excludeFiles);
    console.log(`Change owner and group after module export...`);
    execSync(`sudo chown -R runner:docker ${tmpFolder}`, { stdio: "inherit" });
    console.log(`Creating Github release for module ${moduleInfo.nameWithSpace}`);
    await createGithubReleaseFrom({
        title: `${moduleInfo.nameWithSpace} ${moduleInfo.version} - Mendix ${moduleInfo.minimumMXVersion}`,
        body: moduleChangelogs,
        target: targetBranchName,
        tag: process.env.TAG,
        filesToRelease: mpkOutput
    });
    await execShellCommand(`rm -rf ${tmpFolder}`);
    console.log("Done.");
};

// Update test project with latest changes and update version in themesource
async function updateNativeComponentsTestProjectWithAtlas(moduleInfo, tmpFolder) {
    const atlasNativeContentPath = join(
        repoRootPath,
        `packages/${moduleFolderNameInRepo}/dist/themesource/${moduleInfo.moduleFolderNameInModeler}`
    );
    const atlasNativeContent = await getFiles(atlasNativeContentPath);
    const tmpFolderNativeStyles = join(tmpFolder, `themesource/${moduleInfo.moduleFolderNameInModeler}`);

    console.log("Updating NativeComponentsTestProject..");
    await cloneRepo(moduleInfo.testProjectUrl, tmpFolder, moduleInfo.testProjectBranchName);

    console.log("Copying Native styling files..");
    await Promise.all([
        ...atlasNativeContent.map(async file => {
            const dest = join(tmpFolderNativeStyles, file.replace(atlasNativeContentPath, ""));
            await rm(dest);
            await copyFile(file, dest);
        })
    ]);
    const version = moduleInfo.version;

    await execShellCommand(`echo ${version} > themesource/${moduleInfo.moduleFolderNameInModeler}/.version`, tmpFolder);
}
