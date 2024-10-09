const fs = require(`fs-extra`)
const {parse} = require(`json5`)
const MockOPCUA = require(`./src/opcua.js`)
const path = require(`path`)

// 获取config地址
const isPkg = typeof process.pkg !== "undefined";
let rootDir, configPath, logPath;
if (isPkg) {
	rootDir = path.dirname(process.execPath);
	configPath = rootDir + "\\mockPLC.json";
	logPath = rootDir + "\\log\\";
} else {
	configPath = __dirname+"\\mockPLC.json";
	logPath = __dirname+"\\log\\";
}
console.log("configPath:", configPath);
console.log("logPath:", logPath);
fs.existsSync(logPath) ? null : fs.mkdirSync(logPath);
console.log(`\n`)

// 读取config文件
const config = parse(fs.readFileSync(configPath, "utf-8"));
console.log(`mockPLC.json:\n`, config);

const server = new MockOPCUA(config)
