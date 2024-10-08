// import {
// 	OPCUAServer,
// 	Variant,
// 	DataType,
// 	StatusCodes,
// 	makeNodeId,
// } from "node-opcua";

const {
  	OPCUAServer,
  	Variant,
  	DataType,
  	StatusCodes,
  	makeNodeId,
  } = require(`node-opcua`)
class MockOPCUA {
  port;
  structure;
	mockParams;
	constructor(config) {
    this.mockParams = config.params
    this.structure = config.structure
    this.port = Number(config.port)
    this.initServer()
  }
  /**
   * 创建服务器
   */
	async initServer() {
    // 初始化服务
		const server = new OPCUAServer({
			port: this.port,
			resourcePath: "/mockPLC",
			certificateFile: "./certificate.pem",
			privateKeyFile: "./privateKey.pem",
		});
		await server.initialize();
    
    // 开辟地址空间
		const addressSpace = server.engine.addressSpace;
    // 在地址空间中开辟namespace
		const namespace = addressSpace.getOwnNamespace();

    // 添加对象（用于储存变量，如：stCCD）,挂在地址空间里的Objects目录下
		const device = namespace.addObject({
			organizedBy: addressSpace.rootFolder.objects,
			browseName: this.structure,
		});

    // 初始化变量
    for(const key in this.mockParams){
      this.initParams(namespace, device, key)
    }
    
    // 启动服务
		server.start(function () {
			console.log("Server is now listening ... (press CTRL+C to stop)");
			console.log("port ", server.endpoints[0].port);
		});

    setInterval(() => {
      console.log(this.mockParams)
    }, 2000);
	}
  
  /**
   * 
   * @param {any} namespace 储存节点的namespace
   * @param {any} device device对象
   * @param {object} param 创建的参数
   */
  initParams(namespace, device, param) {
    namespace.addVariable({
			componentOf: device,
			browseName: param,
			dataType: this.mockParams[param].type,
			value: {
				get: () => new Variant({ dataType: DataType[this.mockParams[param].type], value: this.mockParams[param].value }),
				set: (variant) => {
					this.mockParams[param].value = this.getType(this.mockParams[param].type, variant.value);
					return StatusCodes.Good;
				},
			},
		});
  }

  /**
   * 转化变量类型
   * @param {string} type 变量类型
   * @param {any} data 更改变量参数
   * @returns 
   */
  getType( type, data) {
    switch (type) {
      case 'Int16':return parseInt(data)
      case 'Int32':return parseInt(data)
      case 'Int64':return parseInt(data)
      case 'Double':return parseFloat(data)
      case 'Float':return parseFloat(data)
    }
  }
}

module.exports = MockOPCUA