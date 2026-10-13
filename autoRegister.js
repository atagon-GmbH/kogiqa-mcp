import { detectGlobalAgents, upsertServer } from "add-mcp";

 async function autoRegisterMCP() {
    console.log('Detecting coding agents...');

    try {
        const globalAgents = await detectGlobalAgents();

        if (!globalAgents || globalAgents.length === 0) {
            console.log('No supported coding agents found on this system.');
            return;
        }

        console.log(`Found ${globalAgents.length} agents. \n`);

        for (const agent of globalAgents) {
            try {
                await upsertServer(agent, "kogiqa-browser", {
                    command: "npx",
                    args: ["-y", "kogiqa-mcp@latest"],
                });
                console.log(`✅ Successfully configured: ${agent}`);
            } catch (err) {
                console.error(`❌ Failed to configure ${agent}:`, err.message);
            }
        }

        console.log('\n kogiQA MCP server registration complete!');
    } catch (error) {
        console.error('Critical error during setup:', error);
    }
}

export default autoRegisterMCP;

