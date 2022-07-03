import time
from umqttsimple import MQTTClient
import ubinascii
import machine
import micropython
import network
import esp
esp.osdebug(None)
import gc
gc.collect()

from machine import Pin, SoftI2C
import ssd1306
import json

client = None
owner = "Prueba"
tim = machine.Timer(1)

# Network configuration
ssid = 'INFO'
password = 'teleinfo2019'

# MQTT server configuration
mqtt_server = 'research.upb.edu'
mqtt_port = '21142'
client_id = ubinascii.hexlify(machine.unique_id())
topic_register = b'register'
topic_result = b'result'
topic_verify = b'verify'

last_message = 0
message_interval = 5
counter = 0

# Network connection
station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

while station.isconnected() == False:
  pass

print('Connection successful')
print(station.ifconfig())

# OLED configuration

i2c = SoftI2C(scl=Pin(15), sda=Pin(4))
rst = Pin(16, Pin.OUT)
led = Pin(25, Pin.OUT)

oled_width = 128
oled_height = 64
rst.value(1)
oled = ssd1306.SSD1306_I2C(oled_width, oled_height, i2c)
