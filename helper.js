/*
 * Copyright (c) 2026.  atagon GmbH.  All rights reserved.
 *
 * This file is part of the atagon codebase and may not be copied,
 *  distributed, or modified without explicit written permission from
 * atagon GmbH. https://www.atagon.com
 *
 *
 */
import fs from "fs";
import net from "net";
import path from "path";
import {execSync} from "child_process";

export function getFirstFreePort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err["code"] === 'EADDRINUSE') {
                // Port is taken, try the next one
                resolve(getFirstFreePort(port + 1));
            } else {
                // For other errors, let's just use port 0 to get a random one
                resolve(getRandomFreePort());
            }
        });

        server.once('listening', () => {
            server.close(() => resolve(port));
        });

        server.listen(port);
    });
}

export function getRandomFreePort() {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(0, () => {
            const res = server.address();
            server.close(() => resolve(res["port"]));
        });
    });
}


export async function waitForHttpServer(url, retries = 50) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetch(url, {signal: AbortSignal.timeout(2000)});
            return;
        } catch (e) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
    throw new Error("Election app HTTP server did not start in time.");
}


export function getDownloadUrl(url, version) {
    const platform = process.platform;
    const arch = process.arch;
    let osPart, archPart;

    if (platform === "darwin") {
        osPart = "mac";
        archPart = arch === "arm64" ? "arm64" : "x64";
    } else if (platform === "win32") {
        osPart = "win";
        archPart = "x64";
    } else if (platform === "linux") {
        osPart = "linux";
        archPart = arch === "arm64" ? "arm64" : "x64";
    } else {
        throw new Error(`Unsupported platform: ${platform}`);
    }

    return `${url}/kogiQA-${version}-${archPart}-${osPart}.zip`;
}

export function getAppBinPath(extractedPath) {
    if (process.platform === "darwin") {
        return path.join(extractedPath, "kogiQA.app", "Contents", "MacOS", "kogiQA");
    } else if (process.platform === "win32") {
        return path.join(extractedPath, "kogiQA.exe");
    } else {
        return path.join(extractedPath, "kogiQA");
    }
}


export function extractZip(zipPath, extractedPath) {
    console.error(`[Proxy] Extracting ZIP ${zipPath} to ${extractedPath}...`);
    if (process.platform === "win32") {
        execSync(`powershell -command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${extractedPath}'"`, {stdio: ['ignore', 'ignore', 'inherit']});
    } else {
        execSync(`unzip -o "${zipPath}" -d "${extractedPath}"`, {stdio: 'ignore'});
    }
}


// When launched with `sudo`, SUDO_UID/SUDO_GID identify the invoking user.
// Chown what we create to them so a later non-root run can remove and replace it.
export function restoreOwnership(targetPath) {
    if (typeof process.getuid !== "function" || process.getuid() !== 0) {
        return;
    }

    const uid = Number.parseInt(process.env.SUDO_UID ?? "", 10);
    const gid = Number.parseInt(process.env.SUDO_GID ?? "", 10);
    if (!Number.isInteger(uid) || !Number.isInteger(gid) || !fs.existsSync(targetPath)) {
        return;
    }

    fs.chownSync(targetPath, uid, gid);
    for (const entry of fs.readdirSync(targetPath, {withFileTypes: true})) {
        const entryPath = path.join(targetPath, entry.name);
        if (entry.isDirectory() && !entry.isSymbolicLink()) {
            restoreOwnership(entryPath);
        } else {
            fs.lchownSync(entryPath, uid, gid);
        }
    }
}
