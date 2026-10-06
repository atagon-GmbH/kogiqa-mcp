#!/usr/bin/env node

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
import path from "path";
import {spawn} from "child_process";
import {CallToolRequestSchema, CallToolResultSchema, ListToolsRequestSchema,} from "@modelcontextprotocol/sdk/types.js";
import {Server} from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {getAppBinPath, getFirstFreePort, waitForHttpServer} from "./helper.js";
import {extractedPath, npxDirname, preferredPort} from "./config.js";
import downloadeBinary from "./downloadeBinary.js";
import printAfterStart from "./consoleOutput.js";


const toolList = JSON.parse(fs.readFileSync(path.join(npxDirname, 'toolList.json'), 'utf-8'));

let appProcess = null;
let mcpClient = null;

const appBinPath = getAppBinPath(extractedPath);


const appPort = await getFirstFreePort(preferredPort);

const SseURL = `http://localhost:${appPort}/mcp`;

async function ensureAppInstalled() {
    if (!fs.existsSync(appBinPath)) {
        console.error("[Proxy] Election app does not exists. Download it.");
        await downloadeBinary()
    }
}

function startApp() {
    console.error("[Proxy] Starting election app...");

    const child = spawn(appBinPath, [`--`, `--mcp`, `--no-auto-update`, `--mcpPort=${appPort}`], {
        stdio: ["ignore", "ignore", "inherit"],
    });

    // const child = spawn("npm", ["run", "local:dev:mcp", `--`, `--mcp`, `--mcpPort=${appPort}`], {
    //     stdio: ["ignore", "ignore", "inherit"],
    //     shell: true,
    //     cwd: path.resolve("../../desktop-client"),
    // });

    child.on("error", (err) => {
        console.error("[Proxy] Failed to start election app:", err);
    });

    child.on("exit", () => {
        console.error("[Proxy] Election app exited.");
        appProcess = null;
    });

    return child;
}


async function ensureConnection() {
    let needsReconnection = false;

    if (!appProcess || appProcess.killed) {
        console.error("[Proxy] App is not running. Starting it now...");
        appProcess = startApp();
        await waitForHttpServer(SseURL);

        needsReconnection = true;
    }

    if (!mcpClient || needsReconnection) {
        console.error("[Proxy] Establishing MCP connection...");
        const httpTransport = new StreamableHTTPClientTransport(new URL(SseURL));
        mcpClient = new Client({name: "kogiqa-webbrowser-mcp-server-client", version: "1.0.0"});
        await mcpClient.connect(httpTransport);

        console.error("[Proxy] Connected to Election App HTTP endpoint.");
    }
}

async function startProxy() {

    const mcpServer = new Server(
        {name: 'kogiqa-webbrowser-mcp-server', version: "1.0.0"},
        {capabilities: {tools: {}}}
    );

    mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
        return toolList;
    });


    mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
        await ensureConnection();

        return mcpClient.request(request, CallToolResultSchema);
    });

    const stdioTransport = new StdioServerTransport();
    await mcpServer.connect(stdioTransport);
    console.error("[Proxy] Proxy server running on stdio.");
    await printAfterStart();
}


async function main() {
    try {
        await ensureAppInstalled();

        process.on("exit", () => {
            if (appProcess) appProcess.kill();
        });
        process.on("SIGINT", () => process.exit());
        process.on("SIGTERM", () => process.exit());

        await startProxy();
    } catch (error) {
        console.error("[Proxy] Fatal Error:", error);
        process.exit(1);
    }
}

main();


