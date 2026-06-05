import os
import sys
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv

# Thêm thư mục backend vào sys.path để import các module AI
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(BACKEND_DIR)

import urllib.parse
# pyrefly: ignore [missing-import]
from agent.agent import get_chat_response
from database import book_appointment_slot, get_doctors_by_dept, find_alternative_slots

# Load .env (dành cho GEMINI_API_KEY)
load_dotenv(os.path.join(BACKEND_DIR, '.env'))

class APIRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/api/doctors':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            department = query_params.get('department', [''])[0]
            try:
                doctors = get_doctors_by_dept(department)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(doctors, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        elif parsed_path.path == '/api/search':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            query = query_params.get('q', [''])[0].lower()
            try:
                from database import load_data
                data = load_data()
                results = [doc for doc in data if query in doc.get("name", "").lower() or query in doc.get("department", "").lower()]
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(results, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        elif parsed_path.path == '/api/alternative':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            doctor_name = query_params.get('doctor', [''])[0]
            try:
                slots = find_alternative_slots(doctor_name)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(slots, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        elif parsed_path.path == '/api/equivalent':
            query_params = urllib.parse.parse_qs(parsed_path.query)
            doctor_name = query_params.get('doctor', [''])[0]
            date = query_params.get('date', [''])[0]
            try:
                from database import find_equivalent_doctors
                doctors = find_equivalent_doctors(doctor_name, date)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(doctors, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        else:
            # Fallback to serve static files
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/chat':
            # existing chat handling code unchanged
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                history = data.get('history', [])
                user_message = data.get('user_message', '')
                result = get_chat_response(history, user_message)
                reply = result.get("reply", "Lỗi: Không nhận được câu trả lời từ AI.")
                booking_intent = result.get("booking_intent")
                if booking_intent:
                    doc_id = booking_intent.get("doctor_id")
                    date = booking_intent.get("date")
                    slot = booking_intent.get("slot")
                    booking_result = book_appointment_slot(doc_id, date, slot)
                    if booking_result["success"]:
                        reply = f"Hệ thống đã ghi nhận đổi lịch khám thành công cho bạn sang ngày {date} lúc {slot}."
                    else:
                        reply = f"Thành thật xin lỗi quý khách, khung giờ này vừa bị trùng lịch đột xuất. Lý do: {booking_result['message']}. Vui lòng thử khung giờ khác hoặc liên hệ hotline 1900 xxxx."
                response_data = {"reply": reply, "booking_intent": booking_intent}
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        elif self.path == '/api/book':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                doctor_id = data.get('doctor_id')
                date = data.get('date')
                slot = data.get('slot')
                result = book_appointment_slot(doctor_id, date, slot)
                self.send_response(200 if result.get('success') else 400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
            return
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Chạy server ở thư mục codebase để phục vụ file HTML/JS
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = 8080
    server_address = ('', port)
    httpd = HTTPServer(server_address, APIRequestHandler)
    print(f"API Server and Web Server running at: http://localhost:{port}/frontend/index.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐóng server.")
