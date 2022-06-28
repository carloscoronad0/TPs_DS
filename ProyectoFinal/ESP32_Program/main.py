def make_component_info():
  global client_id, owner
  info = {
          "Id": client_id,
          "Owner": owner
          }

  return json.dumps(info)

def sub_cb(topic, new_message):
  global client, client_id, owner, topic_result
  print((topic, new_message))

  if topic == topic_result:
    new_message = new_message.decode('utf-8')
    msg = json.loads(new_message)

    esp_id = msg["Id"]

    if esp_id == client_id:
      esp_owner = msg["Owner"]

      # Clean display
      oled.fill(0)
      oled.show()

      # Show information
      oled.text('Id:'+msg["Id"], 0, 0)
      oled.text('Owner:'+esp_owner, 0, 10)

      if esp_owner != owner:
        oled.text('Old owner:'+owner, 0, 20)
        owner = esp_owner

      oled.show()

def connect_and_subscribe():
  global client_id, owner, mqtt_server, mqtt_port, topic_register, topic_result, topic_verify

  # Connection to the MQTT server
  cli = MQTTClient(client_id, mqtt_server, port=mqtt_port)
  cli.set_callback(sub_cb)
  cli.connect()

  # Registration to the blockchain
  register_msg = make_component_info()
  cli.publish(topic_register, register_msg)

  # Subscription to the result topic
  cli.subscribe(topic_result)
  print('Connected to %s MQTT broker, subscribed to %s topic' % (mqtt_server, topic_sub))
  return cli

def restart_and_reconnect():
  print('Failed to connect to MQTT broker. Reconnecting...')
  time.sleep(10)
  machine.reset()

def verify_ownership(t):
  global client, client_id, topic_verify
  client.publish(topic_verify, client_id)

try:
  client = connect_and_subscribe()
  tim.init(period=5000, callback=verify_ownership)
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    new_message = client.check_msg()
  except OSError as e:
    restart_and_reconnect()
