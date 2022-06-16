import 'package:file_slave/src/getfile_server.dart';
import 'package:file_slave/src/register_client.dart';

Future<void> main(List<String> arguments) async {
    await Client().main();
    await Server().main();
}
