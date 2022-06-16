// Copyright 2015 gRPC authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Grpc.Core;
using MasterServer;
using MQTTnet;
using MQTTnet.Client;

namespace GreeterServer
{
    class RegisterService : Register.RegisterBase
    {
        public override Task<RegisterInfo> ClientRegistry(ClientInfo request, ServerCallContext context)
        {
            RegisterInfo output = new RegisterInfo();
            try
            {
                Globals.slaves.Add(new CliInfo
                {
                    IP = request.IP,
                    name = request.Name
                });
                output.Success = true;
                foreach (var s in Globals.slaves)
                {
                    Console.WriteLine($"IP: {s.IP} - name: {s.name}");
                }
            }
            catch
            {
                output.Success = false;
            }
            return Task.FromResult(output);
        }
    }
    
    class Program
    {
        const int Port = 50051;

        public static async Task Main(string[] args)
        {
            //gRPC
            Server server = new Server
            {
                Services = { Register.BindService(new RegisterService()) },
                Ports = { new ServerPort("localhost", Port, ServerCredentials.Insecure) }
            };
            server.Start();

            //MQTT
            var mqttFactory = new MqttFactory();

            using (var mqttClient = mqttFactory.CreateMqttClient())
            {
                var mqttClientOptions = new MqttClientOptionsBuilder()
                    .WithTcpServer("research.upb.edu", 21242)
                    .WithClientId("Server")
                    .Build();

                mqttClient.ApplicationMessageReceivedAsync += async e =>
                {
                    Console.WriteLine($"+ Topic = {e.ApplicationMessage.Topic}");
                    Console.WriteLine($"+ Payload = {Encoding.UTF8.GetString(e.ApplicationMessage.Payload)}");
                    Console.WriteLine($"+ QoS = {e.ApplicationMessage.QualityOfServiceLevel}");

                    var message = Encoding.UTF8.GetString(e.ApplicationMessage.Payload);
                    Channel channel;
                    GetFile.GetFileClient client;


                    if (message == "dir")
                    {
                        foreach(var slave in Globals.slaves)
                        {
                            channel = new Channel($"{slave.IP}:30052", ChannelCredentials.Insecure);
                            client = new GetFile.GetFileClient(channel);
                            using (var call = client.ClientGetFile(new Void()))
                            {
                                var responseStream = call.ResponseStream;
                                string fileInfo = "";
                                while (await responseStream.MoveNext())
                                {
                                    var file = responseStream.Current;
                                    fileInfo = $"Name: {file.Name}    Size: {file.Size}    IPSource: {file.IDSlave}";

                                    var applicationMessage = new MqttApplicationMessageBuilder()
                                    .WithTopic("upb/file/result")
                                    .WithPayload(fileInfo)
                                    .Build();
                                    await mqttClient.PublishAsync(applicationMessage, CancellationToken.None);
                                }
                            }
                        }
                    }
                    else
                    {
                        var command = message.Split(' ');
                        if (command[0] != "file")
                        {
                            return;
                        }
                        foreach (var slave in Globals.slaves)
                        {
                            channel = new Channel($"{slave.IP}:30052", ChannelCredentials.Insecure);
                            client = new GetFile.GetFileClient(channel);
                            using (var call = client.ClientGetFile(new Void()))
                            {
                                var responseStream = call.ResponseStream;
                                string fileInfo = "";
                                while (await responseStream.MoveNext())
                                {
                                    var file = responseStream.Current;
                                    if (file.Name == command[1])
                                    {
                                        fileInfo = $"Name: {file.Name}    Size: {file.Size}    IPSource: {file.IDSlave}";
                                        var applicationMessage = new MqttApplicationMessageBuilder()
                                        .WithTopic("upb/file/result")
                                        .WithPayload(fileInfo)
                                        .Build();
                                        await mqttClient.PublishAsync(applicationMessage, CancellationToken.None);
                                    }
                                }
                            }
                        }
                    }
                };

                await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

                var mqttSubscribeOptions = mqttFactory.CreateSubscribeOptionsBuilder()
                    .WithTopicFilter(f => { f.WithTopic("upb/file/search"); })
                    .Build();

                await mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);

                Console.WriteLine("MQTT client subscribed to topic.");

                //Console
                Console.WriteLine("IP");
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        Console.WriteLine(ip.ToString());
                    }
                }
                Console.WriteLine("Greeter server listening on port " + Port);
                Console.WriteLine("Press any key to stop the server...");
                Thread.Sleep(Timeout.Infinite);
            }
            server.ShutdownAsync().Wait();
        }
        //public static async Task Dir(GetFile.GetFileClient client, IMqttClient mqttClient)
        //{
        //    using (var call = client.ClientGetFile(new Void()))
        //    {
        //        var responseStream = call.ResponseStream;
        //        string fileInfo = "";
        //        while (await responseStream.MoveNext())
        //        {
        //            var file = responseStream.Current;
        //            fileInfo = $"Name: {file.Name}    Size: {file.Size}    IPSource: {file.IDSlave}";

        //            var applicationMessage = new MqttApplicationMessageBuilder()
        //            .WithTopic("upb/file/result")
        //            .WithPayload(fileInfo)
        //            .Build();
        //            await mqttClient.PublishAsync(applicationMessage, CancellationToken.None);
        //        }
        //    }
        //}
    }
}
