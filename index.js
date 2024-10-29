const fs = require(`fs-extra`)
const {parse} = require(`json5`)
const MockOPCUA = require(`./src/opcua.js`)
const MockModbusTCP = require("./src/modbus.js");
const path = require(`path`);

// 获取config地址
const isPkg = typeof process.pkg !== "undefined";
let rootDir, configPath, logPath, PLCtype = `modbus`;
if (isPkg) {
	rootDir = path.dirname(process.execPath);
	configPath = rootDir + `\\${PLCtype}.json`;
	logPath = rootDir + "\\log\\";
} else {
	configPath = __dirname+`\\${PLCtype}.json`;
	logPath = __dirname+"\\log\\";
}
console.log("configPath:", configPath);
console.log("logPath:", logPath);
fs.existsSync(logPath) ? null : fs.mkdirSync(logPath);
console.log(`\n`)

// 读取config文件
const config = parse(fs.readFileSync(configPath, "utf-8"));
console.log(`${PLCtype}.json:\n`, config);

if(config.protocol == `opcua`) {
	const server = new MockOPCUA(config)
	console.log(111111111)
} else if(config.protocol == `modbus`) {
	const server = new MockModbusTCP(config)
}
