import concurrently from "concurrently";
import { join, resolve } from "path";
import { cp, rm, mkdir, echo } from "shelljs";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { readdir } from "fs/promises";

const repoRoot = join(__dirname, "../../../");
const packageFile = require(resolve("package.json"));

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

    let outputDir;

    if (mode === "build" || mode === "start") {
        const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH; // should be an absolute path.
        outputDir = MX_PROJECT_PATH ? MX_PROJECT_PATH : join(__dirname, "../tests/testProject");

        const toRemoveDirs = [join(outputDir, "themesource/atlas_core")];
        rm("-rf", toRemoveDirs);
        console.info(`Ensured the directories ${toRemoveDirs.join(", ")} are removed from your Mendix project`);
    } else if (mode === "release") {
        outputDir = join(__dirname, "../dist");

        rm("-rf", outputDir);
        console.info(`Ensured the directory ${outputDir} is removed`);
    }

    if (outputDir) {
        // when targeting a networked windows drive, the cmds executed by concurrently run into a race condition when
        // creating directories. create them here to avoid the error.
        mkdir("-p", join(outputDir, "themesource/atlas_core"));

        await copyStylesAndAssets(mode === "start", outputDir);
    }

    // await buildAndCopyWidgets(mode, ["feedback-native", "language-selector-web"], outputDir);
}

export async function buildAndCopyWidgets(command = "build", widgets: string[] = [], destination?: string) {
    let cwd = process.cwd();
    if (cwd.endsWith("atlas-core")) {
        cwd = join(cwd, "../../../");
    }
    const scope = `'${widgets.length > 1 ? `{${widgets.join(",")}}` : widgets.join("")}'`;
    const cmd = `npm run ${command} -- --scope=${scope} --include-dependencies`;
    const execSyncCmd =
        command !== "release" && destination ? `npx cross-env MX_PROJECT_PATH=${destination} ${cmd}` : cmd;

    execSync(execSyncCmd, {
        stdio: "inherit",
        cwd
    });

    if (command === "release") {
        const pluggableWidgetsFolderPath = join(cwd, "packages/pluggableWidgets");
        const mpkPathsToCopy = [];
        for await (const widget of widgets) {
            const version = require(join(pluggableWidgetsFolderPath, widget, "package.json")).version;
            const widgetDistPath = join(pluggableWidgetsFolderPath, widget, "dist", version);
            const distExists = existsSync(widgetDistPath);

            if (distExists) {
                mpkPathsToCopy.push(...(await readdir(widgetDistPath)).map(name => join(widgetDistPath, name)));
            }
        }
        if (mpkPathsToCopy.length > 0) {
            mkdir("-p", join(__dirname, "../dist/widgets"));
            cp(mpkPathsToCopy, join(__dirname, "../dist/widgets"));
        }
    }
}

async function copyStylesAndAssets(watchMode: boolean, destination: string): Promise<void> {
    console.info(`Copying styles and assets...`);
    const watchArg = watchMode ? "--watch" : "";

    try {
        const versionFile = join(destination, "themesource", "atlas_core", ".version");
        echo("version:");
        echo(packageFile.version).to(versionFile);
        await concurrently(
            [
                {
                    name: "web-themesource-core",
                    command: `copy-and-watch ${watchArg} "${join(
                        repoRoot,
                        "packages/atlas",
                        "src/themesource/atlas_core/web/**/*"
                    )}" "${join(destination, "themesource/atlas_core/web")}"`
                },
                {
                    name: "public-themesource-core",
                    command: `copy-and-watch ${watchArg} "${join(
                        repoRoot,
                        "packages/atlas",
                        "src/themesource/atlas_core/public/**/*"
                    )}" "${join(destination, "themesource/atlas_core/public")}"`
                },
                {
                    name: "native-typescript",
                    command: `tsc ${watchArg} --project tsconfig-native.json --outDir "${destination}"`
                },
                {
                    name: "native-design-properties-and-manifest",
                    command: `copy-and-watch ${watchArg} "${join(
                        repoRoot,
                        "packages/atlas",
                        "src/themesource/atlas_core/native/**/*.json"
                    )}" "${join(destination, "themesource/atlas_core/native")}"`
                },
                {
                    name: "i18n-locales",
                    command: `copy-and-watch ${watchArg} "${join(
                        repoRoot,
                        "packages/atlas",
                        "src/themesource/atlas_core/locales/**/*.json"
                    )}" "${join(destination, "themesource/atlas_core/locales")}"`
                }
            ],
            {
                killOthers: ["failure"]
            }
        );

        console.log("Copying styles and assets has completed successfully");
    } catch (commands) {
        const commandInfo = commands.map(
            (command: concurrently.ExitInfos) => `{ name: ${command.command.name}, exit code: ${command.exitCode}}`
        );
        throw new Error(`One or more commands failed:\n${commandInfo.join("\n")}`);
    }
}
