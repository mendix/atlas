import concurrently from "concurrently";
import { join } from "path";
import { rm, mkdir } from "shelljs";

const repoRoot = join(__dirname, "../../../");
const moduleFolder = "themesource/atlas_legacy";

main().catch(e => {
    console.error(e);
    process.exit(1);
});

async function main(): Promise<void> {
    let mode = "build";
    if (process.argv.includes("start")) {
        mode = "start";
    } else if (process.argv.includes("release")) {
        mode = "release";
    }

    let outputDir: string;

    if (mode === "release") {
        outputDir = join(__dirname, "../dist");

        rm("-rf", outputDir);
        console.info(`Ensured the directory ${outputDir} is removed`);
    } else {
        const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH; // should be an absolute path.
        outputDir = MX_PROJECT_PATH ? MX_PROJECT_PATH : join(__dirname, "../tests/testProject");

        const toRemoveDir = join(outputDir, moduleFolder);
        rm("-rf", toRemoveDir);
        console.info(`Ensured the directory ${toRemoveDir} is removed from your Mendix project`);
    }

    // when targeting a networked windows drive, the cmds executed by concurrently run into a race condition when
    // creating directories. create them here to avoid the error.
    mkdir("-p", join(outputDir, moduleFolder, "web"));

    await copyStyles(mode === "start", outputDir);
}

async function copyStyles(watchMode: boolean, destination: string): Promise<void> {
    console.info(`Copying styles...`);
    const watchArg = watchMode ? "--watch" : "";

    try {
        await concurrently(
            [
                {
                    name: "web-themesource-legacy",
                    command: `copy-and-watch ${watchArg} "${join(
                        repoRoot,
                        "packages/atlas",
                        "src/themesource/atlas_legacy/web/**/*"
                    )}" "${join(destination, moduleFolder, "web")}"`
                }
            ],
            {
                killOthers: ["failure"]
            }
        );

        console.log("Copying styles has completed successfully");
    } catch (commands) {
        const commandInfo = (commands as concurrently.ExitInfos[]).map(
            command => `{ name: ${command.command.name}, exit code: ${command.exitCode}}`
        );
        throw new Error(`One or more commands failed:\n${commandInfo.join("\n")}`);
    }
}
