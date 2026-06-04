import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Thêm thư mục backend vào sys.path để import database
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import load_data

# Load biến môi trường từ .env
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROMPT_FILE = os.path.join(AGENT_DIR, "prompts", "system_instruction.txt")


def get_chat_response(history: list, user_message: str) -> dict:
    """
    Tên hàm: get_chat_response
    Mô tả: Gọi API Gemini 2.5 Flash để tiếp nhận tin nhắn từ người dùng, đối chiếu với lịch sử trò chuyện
           và dữ liệu bác sĩ trong database để đưa ra câu trả lời tư vấn dời/đổi lịch.
    Biến đầu vào:
        - history (list): Danh sách lịch sử cuộc chat trước đó, mỗi phần tử dạng {"role": "user/model", "parts": [...]}.
        - user_message (str): Tin nhắn hiện tại của người dùng.
    Cấu trúc đầu ra: dict - Trả về kết quả xử lý gồm:
                     - "reply": (str) Câu trả lời text tự nhiên từ chatbot.
                     - "booking_intent": (dict/None) Chứa thông tin đặt lịch nếu phát hiện hành động xác nhận của user, dạng:
                       {"doctor_id": "...", "date": "...", "slot": "..."}.
    Yêu cầu sử dụng: Server hoặc CLI Chat gọi hàm này để duy trì luồng hội thoại. Phải cấu hình biến môi trường GEMINI_API_KEY.
    """
    # 1. Đọc nội dung System Instruction
    if os.path.exists(PROMPT_FILE):
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            system_instruction_text = f.read()
    else:
        system_instruction_text = "Bạn là trợ lý y tế ảo hỗ trợ dời lịch khám."

    # 2. Đọc dữ liệu lịch khám thời gian thực từ Database
    doctors_data = load_data()
    db_context = "\n\n### CONTEXT DỮ LIỆU BÁC SĨ (REAL-TIME):\n" + json.dumps(doctors_data, ensure_ascii=False, indent=2)
    
    # 2.1 Thêm thông tin lịch hẹn bị sự cố của phiên bệnh nhân hiện tại để tránh AI đoán mò
    appointment_context = (
        "\n\n### THÔNG TIN LỊCH HẸN BỊ HỦY CỦA BỆNH NHÂN HIỆN TẠI:\n"
        "- Bác sĩ đặt lịch ban đầu: BSCKII. Lê Sỹ Hùng (ID: doc_nhi_003)\n"
        "- Chuyên khoa: Trung tâm Nhi khoa\n"
        "- Ngày hẹn cũ: 2026-06-05\n"
        "- Trạng thái: Bị hủy do bác sĩ bận Hội chẩn ca bệnh Nhi khoa nguy kịch"
    )
    
    # Kết hợp system instruction, dữ liệu DB thời gian thực và thông tin lịch hẹn hiện tại
    full_instruction = system_instruction_text + db_context + appointment_context

    # 3. Khởi tạo model với cấu hình JSON output
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=full_instruction,
        generation_config={
            "response_mime_type": "application/json"
        }
    )

    # 4. Chuẩn bị danh sách contents từ history và user_message
    contents = []
    for turn in history:
        parts_data = turn.get("parts", "")
        if isinstance(parts_data, list):
            parts = parts_data
        else:
            parts = [parts_data]
            
        contents.append({
            "role": turn.get("role"),
            "parts": parts
        })
        
    contents.append({
        "role": "user",
        "parts": [user_message]
    })

    # 5. Gọi API Gemini
    try:
        response = model.generate_content(contents)
        response_text = response.text
        
        # Sửa lỗi thoát ký tự (invalid escape sequences) trong JSON chuỗi của Gemini
        # Regex tìm backslash không phải là ký tự escape hợp lệ của JSON (\", \\, \/, \b, \f, \n, \r, \t, \uXXXX)
        # và thay thế bằng \\ để json.loads có thể đọc được như ký tự thường.
        import re
        fixed_text = re.sub(r'\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'\\\\', response_text)
        
        # Parse JSON kết quả trả về từ Gemini
        result = json.loads(fixed_text)
        return {
            "reply": result.get("reply", "Dạ, hệ thống đang gặp lỗi xử lý thông tin. Xin vui lòng thử lại."),
            "booking_intent": result.get("booking_intent")
        }
    except json.JSONDecodeError as je:
        print(f"Lỗi phân tách kết quả JSON từ AI: {je}")
        print(f"Nội dung phản hồi lỗi: {response_text}")
        return {
            "reply": "Dạ, hệ thống gặp sự cố định dạng dữ liệu từ AI. Xin vui lòng thử lại.",
            "booking_intent": None
        }
    except Exception as e:
        print(f"Lỗi kết nối API Gemini: {e}")
        return {
            "reply": "Dạ, hiện tại dịch vụ kết nối với trợ lý AI đang bị gián đoạn. Xin vui lòng thử lại sau.",
            "booking_intent": None
        }
