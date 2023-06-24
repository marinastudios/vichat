import { homedir as getHomedir } from 'node:os';
import { join } from 'node:path';
import { open, writeFile, watch } from 'node:fs/promises';
const homedir = getHomedir();
const configpath = join(homedir, '.vichat.json');

interface ConfigBase { [x: string]: number | string | null }

interface ConfigJSON extends ConfigBase {
    token: string | null;
    expires: number;
    refresherPass: string | null;
}

function emptyConfig(): ConfigJSON {
    return {
        token: null,
        expires: 0,
        refresherPass: null
    }
}

class Config {
    #config: ConfigJSON;
    #onceload: Promise<void>
    constructor() {
        this.#config = emptyConfig()
        this.#onceload = (async () => {
            await this.#doRead();
            await this.#doWrite();
        })()
    }
    async #doWrite() {
        try {
            const config = await open(configpath, 'w');
            await config.writeFile(JSON.stringify(this.#config))
        } catch (e) {
            console.log(e)
        }
    }
    async #doRead() {
        try {
            const config = await open(configpath, 'r');
            const configJSON = (await config.read()).buffer.toString('utf8');
            this.#config = JSON.parse(configJSON);
        } catch (e) {
            // @ts-ignore
            if(e.errno === -2) {
                console.log('creating config')
                await writeFile(configpath, JSON.stringify({}))
                this.#config = emptyConfig();
                console.log('config created')
            }
        }
    }
    getConfig() {
        return this.#config;
    }
    setValue(key: string, value: string | number | null) {
        this.#config[key] = value;
        this.#doWrite()
    }
    onLoad(callback: (...args: any[]) => any) {
        this.#onceload.then(callback)
    }
}

class CommandHandler {
    #commands: { [x: string]: { handler: (args: any[]) => any } }
    constructor() {
        this.#commands = {}
    }
    register(name: string, handler: (args: any[]) => any) {
        this.#commands[name] = { handler }
    }
    run(cmd: string) {
        const [name, ...args] = cmd.split(' ');
        console.log(name)
        if(this.#commands[name]) {
            this.#commands[name].handler(args)
        }
    }
}

export { Config, CommandHandler };