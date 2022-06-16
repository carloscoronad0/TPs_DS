import 'package:file_slave/src/getfile_server.dart';
import 'package:file_slave/src/register_client.dart';

Future<void> main(List<String> args) async {
    final ip_address = await Client().main();
    await Server().main(args[0], ip_address);
}

