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
using Grpc.Core;

namespace GreeterServer
{
    class Program
    {
        public static void Main(string[] args)
        {
            Channel channel = new Channel("127.0.0.1:50051", ChannelCredentials.Insecure);

            //--------------
            var client = new Register.RegisterClient(channel);

            var clientReq = new ClientInfo { IP = "104.34.45.89", Name = "Client" };

            var results = client.ClientRegistry(clientReq);
            Console.WriteLine($"La conexion fue {results}");

            clientReq = new ClientInfo { IP = "10.3.45.89", Name = "Client 2" };

            results = client.ClientRegistry(clientReq);
            Console.WriteLine($"La conexion fue {results}");
            //-----

            channel.ShutdownAsync().Wait();
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
    }
}
