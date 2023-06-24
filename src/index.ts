#!/usr/bin/env node --no-warnings  --experimental-specifier-resolution=node
import { CommandHandler, Config } from "./data"; 
import { $, writable } from "./store";
const config = new Config();
const commands = new CommandHandler();
const running = writable(true)
commands.register('q', () => {
    running.set(false);
    console.clear();
    console.log('Quiting');
    process.exitCode = 0;
    process.exit();
});

config.onLoad(() => {
    process.stdin.on('data', (data) => {
        onCommand(data);
    })
    const keepalive = setInterval(() => {   
        if(!$(running)) {
            clearInterval(keepalive)
            process.exit()
        }
    }, 1)
    // process.stdin.off('data', onCommand)
});


function onCommand(data: Buffer) {
    const input = data.toString('utf8');
    if(input.startsWith('.')) {
        commands.run(input.slice(1).trim())
    }
}