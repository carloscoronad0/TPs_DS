import 'package:grpc/grpc.dart' as grpc;
import 'getfile_service/getfile.pbgrpc.dart';
import 'dart:io';

class GetFileService extends GetFileServiceBase {
    String path_to_dir = "/";
    String ip_address = "";

    GetFileService(String dir, String ip) {
        this.path_to_dir = dir;
        this.ip_address = ip;
    }

    @override
    Stream<FileInfo> clientGetFile(grpc.ServiceCall call, Void request) async* {
        final dir = Directory(path_to_dir);
        final List<FileSystemEntity> entities = await dir.list().toList();

        for (FileSystemEntity ent in entities) {
            var path_array = ent.path.split('/'); // Should be \ for Windows

            String filename = path_array.last;
            String filesize = ent.statSync().size.toString();
            //String type = ent.runtimeType.toString();

            yield FileInfo()
                ..name = filename
                ..size = filesize
                ..iDSlave = this.ip_address;
        }
    }
}

class Server {
    Future<void> main(String dir, String ip) async {
        final server = grpc.Server([GetFileService(dir, ip)]);
        await server.serve(port: 50052);
        print('Server listening on port ${server.port}');
    }
}
