var mqtt = require('mqtt');
const dayjs = require('dayjs')
const { exec } = require("child_process");

var broker = process.env.NOMBREBROK;
var port = process.env.PORT;
var topic = process.env.TOPIC;
var ip

var control_values = ['Off', 'On']
var forward_values = [false, true]

exec("hostname -I",(error, stdout, stderr) => {
  if (error) {
      console.log(`error: ${error.message}`);
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
  }
  console.log(`stdout: ${stdout}`);
  ip = stdout
});

const protocol = 'mqtt'
const complete_host_URI = protocol.concat('://', broker, ':', port)

var client = mqtt.connect(complete_host_URI);

client.on('connect', function () {
  setInterval(function (){
    msg = {
        "control":control_values[randomDecision()], 
        "forward":forward_values[randomDecision()], 
        "ip":ip
    }
    client.publish(topic, JSON.stringify(msg));
  }, 5000);
})

function randomDecision(){
    return Math.round(
        Math.random()
    )
}
