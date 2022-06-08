from machine import Pin, SoftI2C
import ssd1306
import json

i2c = SoftI2C(scl=Pin(15), sda=Pin(4))
rst = Pin(16, Pin.OUT)
# ESP32 Wifi kit 32 Pin assignment 
# led = Pin(25, Pin.OUT)

# ESP32  TTGO LoRa32 Pin assignment 
led = Pin(2, Pin.OUT)

oled_width = 128
oled_height = 64
rst.value(1)
oled = ssd1306.SSD1306_I2C(oled_width, oled_height, i2c)

def sub_cb(topic, new_message):
  global client, topic_sub
  print((topic, new_message))

  if topic == topic_sub:
    new_message = new_message.decode('utf-8')
    msg = json.loads(new_message)

    ctrl = msg["control"]
    frwd = msg["forward"]
    ip = msg["ip"]
    esp = msg["esp32"]

    if ctrl=="On":
      led.value(1)
    else:
      led.value(0)

    oled.fill(0)
    oled.show()
    
    oled.text('control:'+ctrl, 0, 0)
    oled.text('forward:'+str(frwd), 0, 10)
    oled.text('ip:'+ip.replace('\n', ''), 0, 20)
    oled.text('esp32:'+esp, 0, 30)
    oled.show()


def connect_and_subscribe():
  global client_id, mqtt_server, topic_sub, mqtt_port
  cli = MQTTClient(client_id, mqtt_server,port=mqtt_port,keepalive=10000)
  cli.set_callback(sub_cb)
  cli.connect()
  cli.subscribe(topic_sub)
  print('Connected to %s MQTT broker, subscribed to %s topic' % (mqtt_server, topic_sub))
  return cli

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
