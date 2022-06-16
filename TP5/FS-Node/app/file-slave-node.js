var PROTO_PATH = __dirname + '../../protos/getfile.proto';
var PROTO_PATH2 = __dirname + '../../protos/registry.proto';
var grpc = require("grpc");
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

var getfile = grpc.loadPackageDefinition(packageDefinition).getfile;

var packageDefinition2 = protoLoader.loadSync(
    PROTO_PATH2,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

var registry = grpc.loadPackageDefinition(packageDefinition2).registry;


var fs = require('fs');
var testFolder = process.argv[2];

function ClientGetFile(call){
    var files = fs.readdirSync(testFolder)
    for (let file of files) {
        var fileSize = fs.statSync(testFolder + "/" + file).size;
        call.write({"name": file , "size": fileSize , "IDSlave": ipslave});
    }
    call.end(); 
}

var ip = require("ip");
var ipslave = ip.address();
function main() {

    var client = new registry.Register(process.env.IPSERVER':50051', grpc.credentials.createInsecure());
    client.ClientRegistry({
        "IP": ipslave,
        "name": "slave-nodejs"
    }, function(err, response) {
    console.log("Se mandaron datos para el registro");
    console.log(ipslave);
    console.log(response);

    });

    var server = new grpc.Server();
    server.addService(getfile.GetFile.service, {ClientGetFile: ClientGetFile});
    server.bindAsync(ipslave + ':50052', grpc.ServerCredentials.createInsecure(), () => {
      server.start();
    });
    console.log("Corriendo el Servidor");
    
}
  
main();

