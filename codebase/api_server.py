import os
import sys
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv

# Thêm thư mục backend vào sys.path để import các module AI
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(BACKEND_DIR)

from agent.agent import get_chat_response
from database import book_appointment_slot

# Load .env (dành cho GEMINI_API_KEY)
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

class APIRequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                history = data.get('history', [])
                user_message = data.get('user_message', '')
                
                # Gọi AI Agent
                result = get_chat_response(history, user_message)
                reply = result.get("reply", "Lỗi: Không nhận được câu trả lời từ AI.")
                booking_intent = result.get("booking_intent")
                
                # Nếu AI trả về ý định chốt đổi lịch
                if booking_intent:
                    doc_id = booking_intent.get("doctor_id")
                    date = booking_intent.get("date")
                    slot = booking_intent.get("slot")
                    
                    # Gọi hàm xử lý DB
                    booking_result = book_appointment_slot(doc_id, date, slot)
                    if booking_result["success"]:
                        reply = f"Hệ thống đã ghi nhận đổi lịch khám thành công cho bạn sang ngày {date} lúc {slot}."
                    else:
                        reply = f"Thành thật xin lỗi quý khách, khung giờ này vừa bị trùng lịch đột xuất. Lý do: {booking_result['message']}. Vui lòng thử khung giờ khác hoặc liên hệ hotline 1900 xxxx."
                
                response_data = {
                    "reply": reply,
                    "booking_intent": booking_intent
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Chạy server ở thư mục codebase để phục vụ file HTML/JS
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIRequestHandler)
    print(f"🚀 API Server & Web Server đang chạy tại: http://localhost:{port}/frontend/index.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐóng server.")
