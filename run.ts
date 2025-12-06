import { spawn } from 'bun'


const spawnOptions: any = {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
}


const run = async () => {
    spawn(["bun", "--bun", "vite"], spawnOptions)
    spawn(["bun", "run", "--hot", "src/server/index.ts"], spawnOptions)

    process.on("SIGINT", async () => {
        console.log("Cleaning up...")
        // Bun.spawn(["bun", "run", "db:down"])
        // await $`bun run db:down` will also work
    })
}

run()