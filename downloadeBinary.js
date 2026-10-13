#!/usr/bin/env node

/*
 * Copyright (c) 2026.  atagon GmbH.  All rights reserved.
 *
 * This file is part of the atagon codebase and may not be copied,
 *  distributed, or modified without explicit written permission from
 * atagon GmbH. https://www.atagon.com
 *
 */

import fs from "fs";
import path from "path";
import {pipeline} from "stream/promises";
import axios from "axios";
import {extractZip, getAppBinPath, getDownloadUrl, restoreOwnership} from "./helper.js";
import {baseDirname, baseURL, extractedPath, installedVersionFile, version} from "./config.js";


const zipPath = path.join(baseDirname, "kogiqa.zip");
const tmpExtractPath = `${extractedPath}.tmp`;


function getInstalledVersion() {
    try {
        return fs.readFileSync(installedVersionFile, "utf-8").trim();
    } catch {
        return null;
    }
}


export function isBinaryUpToDate() {
    return fs.existsSync(getAppBinPath(extractedPath)) && getInstalledVersion() === version;
}


async function downloadeBinary() {
    const appDownloadURL = getDownloadUrl(baseURL, version);

    fs.rmSync(tmpExtractPath, {recursive: true, force: true});

    try {
        console.error(`[Proxy] Downloading election app from ${appDownloadURL}...`);

        const response = await axios.get(appDownloadURL, {responseType: 'stream'});
        const total = Number.parseFloat(response.headers['content-length'] ?? "");
        let downloaded = 0;

        response.data.on('data', (chunk) => {
            downloaded += chunk.length;
            const progress = total ? `${((downloaded / total) * 100).toFixed(1)}%` : `${(downloaded / 1e6).toFixed(2)} MB`;
            // Progress must go to stderr; stdout carries the MCP JSON-RPC stream.
            process.stderr.write(`\r[Proxy] Downloading... ${progress}`);
        });

        await pipeline(response.data, fs.createWriteStream(zipPath));
        console.error('\n[Proxy] Download complete.');

        // Extract to a temporary directory and swap it into place only once a
        // valid binary is confirmed, so a failed download can never destroy an
        // existing working installation.
        extractZip(zipPath, tmpExtractPath);

        const tmpBinPath = getAppBinPath(tmpExtractPath);
        if (!fs.existsSync(tmpBinPath)) {
            throw new Error(
                `Expected binary not found at ${tmpBinPath}. Check the zip's internal folder structure.`
            );
        }

        if (process.platform !== "win32") {
            fs.chmodSync(tmpBinPath, 0o755);
        }

        fs.rmSync(extractedPath, {recursive: true, force: true});
        fs.renameSync(tmpExtractPath, extractedPath);
        fs.writeFileSync(installedVersionFile, version);

        restoreOwnership(baseDirname);

        console.error("[Proxy] Download and installation complete.");
    } catch (error) {
        fs.rmSync(tmpExtractPath, {recursive: true, force: true});
        throw error;
    } finally {
        fs.rmSync(zipPath, {force: true});
    }
}


export async function ensureBinary() {
    if (isBinaryUpToDate()) {
        console.error(`[Proxy] Election app ${version} is already installed.`);
        return;
    }

    const installedVersion = getInstalledVersion();
    if (installedVersion && installedVersion !== version) {
        console.error(`[Proxy] Election app version changed (${installedVersion} -> ${version}). Reinstalling...`);
    }

    await downloadeBinary();
}

export default downloadeBinary;
