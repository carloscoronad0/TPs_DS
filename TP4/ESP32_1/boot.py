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

client = None

ssid = 'INFO'
password = 'teleinfo2019'
mqtt_server = 'research.upb.edu'
mqtt_port = '21142'
client_id = ubinascii.hexlify(machine.unique_id())
topic_sub = b'control'
topic_pub = b'forward'

last_message = 0
message_interval = 5
counter = 0

station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

while station.isconnected() == False:
  pass

print('Connection successful')
print(station.ifconfig())
