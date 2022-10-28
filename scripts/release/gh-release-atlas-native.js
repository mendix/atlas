const { join } = require("path");
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
    createGithubRelease,
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
    await commitAndCreatePullRequest(moduleInfo);
    await updateNativeComponentsTestProjectWithAtlas(moduleInfo, tmpFolder);
    const mpkOutput = await createMPK(tmpFolder, moduleInfo, regex.excludeFiles);
    await createGithubRelease(moduleInfo, moduleChangelogs, mpkOutput);
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
    await cloneRepo(moduleInfo.testProjectUrl, tmpFolder);

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
    const gitOutput = await execShellCommand(`cd ${tmpFolder} && git status`);
    if (!/nothing to commit/i.test(gitOutput)) {
        await execShellCommand("git add . && git commit -m 'Updated Atlas native styling' && git push", tmpFolder);
    } else {
        console.warn(`Nothing to commit from repo ${tmpFolder}`);
    }
}
