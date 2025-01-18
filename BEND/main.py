import asyncio
import websockets
import json
import requests
from gtts import gTTS
import base64
import io
import os
import speech_recognition as sr
import tkinter as tk
from tkinter import scrolledtext
import threading
from io import BytesIO
import pyglet


chatgpt_api_key = "KeyAPI-Here"

# ChatGPT API endpoint
chatgpt_endpoint = "https://api.openai.com/v1/chat/completions"

# Global variables to hold text to display
user_text_list = []
chatgpt_text_list = []
lock = threading.Lock()
connected_clients = set()
text = "Hello from Python"
# audio = "audio_data_placeholder"
async def handler(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            print(f"Received from client: {message}")
            # Bạn có thể xử lý text nhận được từ trang HTML tại đây
            # await send_data_to_clients(text, audio)
            chatgpt_response = call_chatgpt(message)
            if chatgpt_response:
                chatgpt_answer = chatgpt_response["choices"][0]["message"]["content"]
                
                # Tạo audio từ text
                tts = gTTS(text=chatgpt_answer, lang='vi')
                audio_io = io.BytesIO()
                tts.write_to_fp(audio_io)
                audio_data = base64.b64encode(audio_io.getvalue()).decode('utf-8')
                
                with lock:
                    chatgpt_text_list.append(chatgpt_answer)
                    await send_data_to_clients(chatgpt_answer, audio_data)
            
    finally:
        connected_clients.remove(websocket)

# async def send_data_to_clients(text, audio):
async def send_data_to_clients(text, audio=None):
    if connected_clients:  # Kiểm tra nếu có client nào kết nối
        data = {
            'text': text,
            'audio': audio
        }
        message = json.dumps(data)
        
        # Tạo một danh sách các tasks
        send_tasks = [asyncio.create_task(client.send(message)) for client in connected_clients]
        
        # Chờ tất cả các tasks hoàn thành
        await asyncio.gather(*send_tasks)
        print(f"Response sent: {text}")
    else:
        print("No clients connected. Skipping sending data.")

async def main():
    async with websockets.serve(handler, "localhost", 2607):
       
        # Ví dụ về việc gửi dữ liệu từ Python đến trang HTML
        # Giả sử bạn đã mã hóa dữ liệu âm thanh thành base64 hoặc tương tự
        await asyncio.Future()


def call_chatgpt(question):
    headers = {
        "Authorization": f"Bearer {chatgpt_api_key}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "gpt-3.5-turbo",
        # "model": "gpt-4o",
        "messages": [{"role": "user", "content": question}],
    }
    try:
        response = requests.post(chatgpt_endpoint, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error calling ChatGPT API: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(main())
