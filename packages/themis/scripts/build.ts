import concurrently from "concurrently";
import { join } from "path";
import { rm, mkdir } from "shelljs";
import { existsSync, readdirSync } from "fs";

const repoRoot = join(__dirname, "../../../");
const moduleDir = "themesource/themis";

main().catch(e => {
    console.error(e);
    process.exit(1);
});

async function main(): Promise<void> {
    const watchMode = process.argv.includes("start");
    const MX_PROJECT_PATH = process.env.MX_PROJECT_PATH; // should be an absolute path.
    if (!MX_PROJECT_PATH) {
        throw new Error("Set MX_PROJECT_PATH to the absolute path of a Mendix project that has the Themis module.");
    }

    if (!existsSync(MX_PROJECT_PATH) || !readdirSync(MX_PROJECT_PATH).some(f => f.endsWith(".mpr"))) {
        throw new Error(`MX_PROJECT_PATH (${MX_PROJECT_PATH}) is not a Mendix project folder: no .mpr file found.`);
    }

    const outputDir = join(MX_PROJECT_PATH, moduleDir, "web");
    rm("-rf", outputDir);
    mkdir("-p", outputDir);
    console.info(`Copying Themis styles to ${outputDir}`);

    await concurrently(
        [
            {
                name: "web-themesource-themis",
                command: `copy-and-watch ${watchMode ? "--watch" : ""} "${join(
                    repoRoot,
                    "packages/atlas/src",
                    moduleDir,
                    "web/**/*"
                )}" "${outputDir}"`
            }
        ],
        { killOthers: ["failure"] }
    );
}
