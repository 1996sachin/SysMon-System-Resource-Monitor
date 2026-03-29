import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .collector import collect_all


class SystemMonitorConsumer(AsyncWebsocketConsumer):
    """Stream live system metrics over WebSocket every second."""

    async def connect(self):
        await self.accept()
        self.streaming = True
        asyncio.ensure_future(self.stream_metrics())

    async def disconnect(self, close_code):
        self.streaming = False

    async def stream_metrics(self):
        while self.streaming:
            try:
                data = collect_all()
                await self.send(text_data=json.dumps(data))
                await asyncio.sleep(1)
            except Exception:
                break

    async def receive(self, text_data=None, bytes_data=None):
        """Accept interval change: {"interval": 2}"""
        if text_data:
            msg = json.loads(text_data)
            if 'interval' in msg:
                self.interval = float(msg['interval'])
