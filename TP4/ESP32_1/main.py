import json

def sub_cb(mq,topic, new_message):
  global topic_sub, topic_pub
  print((topic, new_message))
  if topic == topic_sub:
    new_message = new_message.decode('utf-8')
    msg = json.loads(new_message)
    if msg["forward"] == 'TRUE':
      msg["esp32"]=client_id
      mq.publish(topic_pub, json.dumps(msg))

def connect_and_subscribe():
  global client_id, mqtt_server, topic_sub, mqtt_port
  client = MQTTClient(client_id, mqtt_server,port=mqtt_port,keepalive=10000)
  client.set_callback(sub_cb)
  client.connect()
  client.subscribe(topic_sub)
  print('Connected to %s MQTT broker, subscribed to %s topic' % (mqtt_server, topic_sub))
  return client

def restart_and_reconnect():
  print('Failed to connect to MQTT broker. Reconnecting...')
  time.sleep(10)
  machine.reset()

try:
  client = connect_and_subscribe()
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    new_message = client.check_msg()
    
  except OSError as e:
    restart_and_reconnect()