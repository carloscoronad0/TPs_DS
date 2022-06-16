import 'register_service/registry.pbgrpc.dart';
import 'dart:io';
import 'package:grpc/grpc.dart';

class Client {
    Future<String> main() async {
        Map<String, String> envVars = Platform.environment;
        String server_address = envVars['SERVER_IP'] ?? 'localhost';

        //final udsAddress = InternetAddress(server_address, type: InternetAddressType.IPv4);
        final channel = ClientChannel(
            server_address,
            port: 50051,
            options: const ChannelOptions(credentials: ChannelCredentials.insecure())
        );

        final stub = RegisterClient(
            channel,
            options: CallOptions(timeout: Duration(seconds: 30))
        );
        final ip_address = await getIpAddress();

        try {
            await attemptRegister(stub, ip_address);
        } catch (e) {
            print('Caught error: $e');
        }
        await channel.shutdown();
        
        return ip_address;
    }

    Future<void> attemptRegister(RegisterClient stub, String ip_address) async {
        final cl_info = ClientInfo()
                        ..iP = ip_address
                        ..name = 'Dart file-slave';
        while (true) {
            RegisterInfo response = await stub.clientRegistry(cl_info);

            if (response.success) {
                break;
            }
        }

        print('File-slave successfully registered in File-master');
    }

    Future<String> getIpAddress() async {
        // Get the network interfaces omitting the local ones (Ex: localhost)
        final interfaces = await NetworkInterface.list(
            type: InternetAddressType.IPv4
        );
        
        // Getting the address of the first interface
        // - This only works due to the fact that the container will have 
        // only one interface
        // - For actual machines, the interfaces would had to be filtered
        // or manually chosen
        final ip_address = interfaces[0].addresses[0].address;
        print('Chosen address: $ip_address');
        return ip_address;
    }
}
