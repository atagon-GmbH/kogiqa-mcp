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
import {ensureBinary} from "./downloadeBinary.js";
import printAfterStart from "./consoleOutput.js";


const toolList = JSON.parse(fs.readFileSync(path.join(npxDirname, 'toolList.json'), 'utf-8'));

let appProcess = null;
let mcpClient = null;
let appPort = null;
let connectPromise = null;

const appBinPath = getAppBinPath(extractedPath);


function getMcpUrl() {
    return `http://localhost:${appPort}/mcp`;
}

async function ensureAppInstalled() {
    if (!fs.existsSync(appBinPath)) {
        console.error("[Proxy] Election app does not exists. Download it.");
    }
    await ensureBinary();
}

function startApp(port) {
    console.error(`[Proxy] Starting election app on port ${port}...`);

    const child = spawn(appBinPath, [`--`, `--mcp`, `--no-auto-update`, `--mcpPort=${port}`], {
        stdio: ["ignore", "ignore", "inherit"],
    });

    // const child = spawn("npm", ["run", "local:dev:mcp", `--`, `--mcp`, `--mcpPort=${port}`], {
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
        // Drop the client so the next request reconnects to a fresh app instance.
        mcpClient = null;
    });

    return child;
}


async function connectToApp() {
    if (!appProcess || appProcess.exitCode !== null) {
        // Resolve the port only right before spawning, so a slow download in
        // ensureAppInstalled() cannot leave us with a port that got taken.
        appPort = await getFirstFreePort(preferredPort);
        appProcess = startApp(appPort);

        try {
            await waitForHttpServer(getMcpUrl());
        } catch (error) {
            if (appProcess) appProcess.kill();
            appProcess = null;
            throw error;
        }

        mcpClient = null;
    }

    if (!mcpClient) {
        console.error("[Proxy] Establishing MCP connection...");
        const client = new Client({name: "kogiqa-webbrowser-mcp-server-client", version: "1.0.0"});
        client.onclose = () => {
            console.error("[Proxy] MCP connection closed.");
            mcpClient = null;
        };
        client.onerror = (error) => {
            console.error("[Proxy] MCP connection error:", error);
            mcpClient = null;
        };

        await client.connect(new StreamableHTTPClientTransport(new URL(getMcpUrl())));
        mcpClient = client;

        console.error("[Proxy] Connected to Election App HTTP endpoint.");
    }

    return mcpClient;
}


async function ensureConnection() {
    // Serialize concurrent tool calls so they cannot spawn the app twice or
    // race on the shared client.
    if (!connectPromise) {
        connectPromise = connectToApp().finally(() => {
            connectPromise = null;
        });
    }
    return connectPromise;
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
        const client = await ensureConnection();

        return client.request(request, CallToolResultSchema);
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


