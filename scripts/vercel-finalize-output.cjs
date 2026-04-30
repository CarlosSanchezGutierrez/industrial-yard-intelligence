const fs = require("node:fs");
const path = require("node:path");

function findRepoRoot(startDirectory) {
    let currentDirectory = startDirectory;

    for (let index = 0; index < 8; index += 1) {
        if (fs.existsSync(path.join(currentDirectory, "pnpm-workspace.yaml"))) {
            return currentDirectory;
        }

        const parentDirectory = path.dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            break;
        }

        currentDirectory = parentDirectory;
    }

    return startDirectory;
}

function copyDirectory(source, target) {
    if (!fs.existsSync(source)) {
        throw new Error(`Source output directory was not found: ${source}`);
    }

    fs.rmSync(target, {
        recursive: true,
        force: true,
    });

    fs.mkdirSync(target, {
        recursive: true,
    });

    fs.cpSync(source, target, {
        recursive: true,
    });
}

const repoRoot = findRepoRoot(process.cwd());
const webDist = path.join(repoRoot, "apps", "web", "dist");
const rootDist = path.join(repoRoot, "dist");

copyDirectory(webDist, rootDist);

console.log(`Vercel output copied: ${webDist} -> ${rootDist}`);