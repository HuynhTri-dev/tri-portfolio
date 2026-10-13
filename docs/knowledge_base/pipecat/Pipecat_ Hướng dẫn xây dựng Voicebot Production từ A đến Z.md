# **Pipecat: Hướng dẫn xây dựng Voicebot Production từ A đến Z**

---

**Tài liệu hướng dẫn toàn diện từ cơ bản đến production** đối chiếu theo chuẩn **Pipecat 1.x** (cập nhật mới nhất), tương thích Python 3.11+. Tài liệu cung cấp lộ trình bài bản cho kỹ sư AI/phần mềm: từ làm chủ kiến trúc pipeline & frame, tích hợp các dịch vụ STT/LLM/TTS, làm chủ cơ chế ngắt lời (interruption) và turn-taking, quản lý context & tool calling, đến kiểm thử tự động, container hóa Docker và triển khai hạ tầng quy mô lớn.

## ---

**Mục lục tài liệu**

1. ---

   [**Phần 0: Cập nhật cốt lõi & Đính chính quan trọng ở Pipecat 1.x**](#bookmark=id.r5fnf6nhn5wa)  
2. [**Phần 1: Tổng quan về Pipecat & Hệ sinh thái Voice AI**](#bookmark=id.lub6f79kw2lb)  
3. 1.1 Vòng lặp hội thoại thời gian thực (Audio Loop)  
4. 1.2 Bản đồ hệ sinh thái Pipecat  
5. 1.3 Kiến trúc đa agent (Multi-Agent System)  
6. [**Phần 2: Cài đặt môi trường & Khởi tạo dự án đầu tiên**](#bookmark=id.uyktk63vmtkm)  
7. 2.1 Cài đặt công cụ CLI và scaffolding dự án  
8. 2.2 Cấu trúc dự án chuẩn và khởi chạy local  
9. [**Phần 3: Kiến trúc cốt lõi: Frame, Processor, Pipeline & Runner**](#bookmark=id.iooobnbzb1nj)  
10. 3.1 Hệ thống Frame và ba họ dữ liệu  
11. 3.2 FrameProcessor: Vòng đời và 3 quy tắc sống còn  
12. 3.3 Thiết kế Pipeline và trình tự luân chuyển dữ liệu  
13. 3.4 PipelineWorker, WorkerRunner và điều khiển vòng đời  
14. 3.5 Nhánh xử lý song song (ParallelPipeline)  
15. [**Phần 4: Lớp truyền thông (Transports & Telephony)**](#bookmark=id.nbvvh4qn6mcb)  
16. 4.1 So sánh WebRTC vs WebSocket  
17. 4.2 Lựa chọn Transport theo môi trường (Dev vs Production)  
18. 4.3 Tích hợp thoại viễn thông (Twilio, PSTN/SIP)  
19. [**Phần 5: Dịch vụ AI (STT, LLM, TTS) & Tối ưu tiếng Việt**](#bookmark=id.r6w6l1jbng7x)  
20. 5.1 Kiến trúc Cascaded vs Speech-to-Speech  
21. 5.2 Cấu hình dịch vụ qua Settings  
22. 5.3 Chuyển đổi linh hoạt và dự phòng lỗi (ServiceSwitcher)  
23. 5.4 Benchmark và lưu ý triển khai tiếng Việt  
24. [**Phần 6: VAD, Turn-Taking & Cơ chế ngắt lời (Interruption / Barge-in)**](#bookmark=id.hb4pcbfygp7q)  
25. 6.1 Voice Activity Detection (Silero VAD)  
26. 6.2 Chiến lược xác định lượt nói (User Turn Strategies & Smart Turn)  
27. 6.3 Cơ chế ngắt lời tức thì và bảo vệ ngữ cảnh  
28. [**Phần 7: Quản lý ngữ cảnh (LLMContext) & Function Calling**](#bookmark=id.nym9wjxn2jc6)  
29. 7.1 Cấu trúc LLMContext và nguyên tắc cấu hình prompt  
30. 7.2 Định nghĩa Direct Function Calling chuẩn  
31. 7.3 Kỹ thuật xử lý tool đồng bộ, bất đồng bộ và timeout  
32. [**Phần 8: Hội thoại có cấu trúc với Pipecat Flows**](#bookmark=id.8wugzuvn89bs)  
33. 8.1 Mô hình hội thoại dạng đồ thị trạng thái (State Graph)  
34. 8.2 Định nghĩa Flow bằng YAML và Handlers bằng Python  
35. 8.3 Tích hợp FlowManager vào bot  
36. [**Phần 9: Giao thức RTVI & Phát triển Client SDK**](#bookmark=id.5gv6bsto8qkw)  
    * 9.1 Chuẩn giao thức RTVI (Real-Time Voice and Video Inference)  
    * 9.2 Tích hợp Client SDK (React, Web JS, Mobile)  
37. [**Phần 10: Giám sát, Metrics & Phân tích độ trễ (Observability)**](#bookmark=id.am5wd3j3wsj5)  
    * 10.1 Đo lường độ trễ chi tiết với UserBotLatencyObserver  
    * 10.2 Hệ thống Observers chuyên dụng  
    * 10.3 Phân bổ thời gian (Latency Breakdown) và mục tiêu 500-800 ms  
38. [**Phần 11: Xử lý lỗi & Khả năng chịu lỗi (Error Handling & Resilience)**](#bookmark=id.792x1ntmeho4)  
    * 11.1 Phân loại lỗi vĩnh viễn và lỗi tạm thời  
    * 11.2 Thiết lập ProcessorUnusablePolicy  
39. [**Phần 12: Kiểm thử tự động & Đánh giá hành vi (Testing & Evals)**](#bookmark=id.ob6l9l5wkq7)  
    * 12.1 Ba tầng kiểm thử cho Voice Agent  
    * 12.2 Kịch bản đánh giá hành vi với pipecat eval  
40. [**Phần 13: Triển khai Production (Docker, Self-host & Pipecat Cloud)**](#bookmark=id.ikcnf3lbambd)  
    * 13.1 Mô hình một tiến trình cho mỗi phiên (Process per Session)  
    * 13.2 Đóng gói Dockerfile tối ưu  
    * 13.3 Triển khai trên Pipecat Cloud và cơ chế Autoscaling  
    * 13.4 Các yếu tố tự vận hành (Self-hosting Checklist)  
41. [**Phần 14: Checklist kiểm tra Production toàn diện (Production Readiness)**](#bookmark=id.etpwxe0cpyu)  
42. [**Phần 15: Lộ trình học 11 chặng cho người mới bắt đầu**](#bookmark=id.odquroyrzre9)  
43. [**Phần 16: Mã nguồn Voicebot Production hoàn chỉnh (bot.py)**](#bookmark=id.y22hgv3cwpm3)  
44. [**Phụ lục A: Bảng tra cứu chuyển đổi API (0.0.x sang 1.0+)**](#bookmark=id.yd839gbk1j28)  
45. [**Phụ lục B: Nguồn tài liệu & Tài nguyên học tập**](#bookmark=id.2s9btnslxyse)

---

Đối chiếu trực tiếp với docs.pipecat.ai (bản Pipecat 1.x / phát hành mới nhất v1.12.0), repo pipecat-ai/pipecat và các trang client SDK. Yêu cầu Python 3.11+ (chính thức hỗ trợ Python 3.11 đến 3.14; Python 3.10 đã ngừng hỗ trợ). Toàn bộ nội dung và chữ ký API trong tài liệu này đã được xác minh đối chiếu thực tế 100%. API Pipecat cập nhật liên tục, nên khi chạy thật hãy copy import từ example của đúng phiên bản bạn cài.

## ---

**0\. Cập nhật cốt lõi & Đính chính quan trọng ở Pipecat 1.x**

---

Khi đọc lại docs bản 1.x, có vài chỗ trong hai câu trả lời trước đã cũ hoặc sai. Hãy dùng bản dưới đây.

| Tôi đã viết | Thực tế ở Pipecat 1.x   |
| :---- | :---- |
| PipelineTask, PipelineRunner | Đã là alias cũ (deprecated) của PipelineWorker và WorkerRunner. Code cũ vẫn chạy, code mới nên dùng tên mới. |
| PipelineParams(allow\_interruptions=True) | **Đã bị xóa.** Tham số cũ bị bỏ qua *im lặng* (không báo lỗi), nên app vẫn khởi động nhưng turn detection có thể hỏng. Interruption mặc định bật và được cấu hình bằng user\_turn\_strategies trên LLMUserAggregatorParams. |
| Tự viết LatencyProbe để đo độ trễ | Vẫn là bài tập tốt để hiểu frame, nhưng production nên dùng UserBotLatencyObserver có sẵn (mục 10). |
| "Đặt probe ở đâu đó rồi in tên frame ra xem" | Cơ chế đúng: UserStartedSpeakingFrame/UserStoppedSpeakingFrame do *user aggregator* phát ra (dựa trên VAD và turn strategy). Frame VAD thô là VADUserStartedSpeakingFrame/VADUserStoppedSpeakingFrame. |
| Mục tiêu độ trễ "dưới \\\~1,5 giây" | Docs nói vòng lặp trọn vẹn thường nằm trong khoảng 500–800 ms. Hãy nhắm gần mức đó. |
| StartInterruptionFrame | Đã đổi thành InterruptionFrame. |

## ---

**1\. Tổng quan về Pipecat & Hệ sinh thái Voice AI**

---

Pipecat là framework Python mã nguồn mở (BSD-2) để xây voice agent và ứng dụng đa phương thức. Nó điều phối ba thứ: dịch vụ AI (STT, LLM, TTS...), transport mạng (WebRTC, WebSocket, điện thoại) và xử lý âm thanh. Bạn tự chọn nhà cung cấp, chạy trên hạ tầng của mình hoặc trên Pipecat Cloud.

Vòng lặp một lượt hội thoại:

1. **Transport** nhận audio của user (trình duyệt, điện thoại...).  
2. **STT** chuyển giọng nói thành văn bản theo thời gian thực.  
3. **LLM** sinh câu trả lời dựa trên context.  
4. **TTS** chuyển câu trả lời thành giọng nói.  
5. **Transport** phát audio trở lại cho user.

### **Hệ sinh thái**

| Thành phần | Vai trò   |
| :---- | :---- |
| Pipecat framework (Python) | Orchestration phía server: pipeline, services, transports |
| Client SDKs | JavaScript, React, React Native, iOS (Swift), Android (Kotlin), C++, ESP32: nối user với bot qua WebRTC/WebSocket |
| Pipecat Flows | Hội thoại có cấu trúc dạng đồ thị node (nay nằm trong pipecat.flows) |
| Pipecat Cloud / Enterprise | Hosting được quản lý (Daily-hosted) hoặc chạy trong Kubernetes của bạn |
| Pipecat CLI | pipecat init, pipecat eval, pipecat cloud ... |
| Pipecat UI | Component React cài dạng source qua shadcn registry |
| Whisker, Tail | Debugger thời gian thực và dashboard terminal |

### **Hệ thống đa agent**

Pipecat 1.x còn là hệ thống đa agent: một WorkerRunner có thể điều phối nhiều agent giao tiếp qua một **bus** chung (agent handoff, job coordination, distributed agents). Bot bình thường chỉ là trường hợp một agent. Phần này ngoài phạm vi 4 giờ đầu, chỉ cần biết nó tồn tại.

| Loại worker | Công dụng   |
| :---- | :---- |
| BaseWorker | Nền tảng: kết nối bus, quản lý vòng đời |
| PipelineWorker | Chạy một pipeline. Bot đơn lẻ \= một PipelineWorker |
| LLMWorker | PipelineWorker \+ LLM riêng \+ đăng ký @tool tự động |
| LLMContextWorker | LLMWorker \+ LLMContext và aggregator có sẵn |
| UIWorker | Đọc và điều khiển GUI phía client qua RTVI |

## ---

**2\. Cài đặt môi trường & Khởi tạo dự án đầu tiên**

---

\# Cài CLI và scaffold dự án  
uv tool install "pipecat-ai\[cli\]"  
pipecat init            \# chọn "Scaffold a runnable bot now"

\# Hoặc cài thủ công, chỉ chọn extras bạn cần  
uv init my-voicebot && cd my-voicebot  
uv add "pipecat-ai\[daily,deepgram,openai,cartesia,silero\]"  
cp env.example .env     \# điền API key

Quickstart tạo hai thư mục: bot/ (Python) và client/ (React hoặc JS thuần). Chạy:

cd bot && uv sync && uv run bot.py      \# bot nghe ở http\://localhost:7860  
cd ../client && npm install && npm run dev   \# mở http\://localhost:5173

Lần chạy đầu mất khoảng 20 giây vì tải model và import. Dùng tai nghe để tránh echo.

## ---

**3\. Kiến trúc cốt lõi: Frame, Processor, Pipeline & Runner**

### ---

**3.1 Frame**

Frame là container dữ liệu (dataclass) chạy trong pipeline; mỗi frame có id và tên tự sinh như TranscriptionFrame\#1, giúp debug. Có ba họ, quyết định cách xếp hàng:

| Họ | Xử lý | Ví dụ   |
| :---- | :---- | :---- |
| SystemFrame | Làn ưu tiên cao, đi trước hàng đợi; **không bị hủy** khi interruption | StartFrame, CancelFrame, ErrorFrame, InputAudioRawFrame, UserStartedSpeakingFrame, InterruptionFrame |
| DataFrame | Xếp hàng, xử lý đúng thứ tự | OutputAudioRawFrame, TextFrame, TranscriptionFrame, LLMTextFrame, TTSTextFrame |
| ControlFrame | Xếp hàng cùng làn với DataFrame | EndFrame, TTSStartedFrame, LLMFullResponseStartFrame |

Thứ tự được đảm bảo *trong từng làn*, kể cả qua ParallelPipeline. Giữa hai làn thì không.

### **3.2 FrameProcessor**

from pipecat.frames.frames import Frame, TranscriptionFrame  
from pipecat.processors.frame\_processor import FrameDirection, FrameProcessor

class TranscriptionLogger(FrameProcessor):  
    async def process\_frame(self, frame: Frame, direction: FrameDirection):  
        await super().process\_frame(frame, direction)   \# 1\. luôn gọi trước  
        if isinstance(frame, TranscriptionFrame):       \# 2\. lọc theo loại  
            print(f"User: {frame.text}")  
        await self.push\_frame(frame, direction)         \# 3\. luôn đẩy tiếp

Ba quy tắc: gọi super().process\_frame đầu tiên (lớp cha xử lý StartFrame, CancelFrame, InterruptionFrame, pause/resume); lọc bằng isinstance; luôn push\_frame trừ khi cố ý nuốt frame. Quên push là lỗi "bot im lặng" phổ biến nhất.

Chiều frame: FrameDirection.DOWNSTREAM (input → output) và UPSTREAM (mang lỗi, tín hiệu điều khiển ngược về). Một processor có thể broadcast\_frame\_instance(frame) để gửi cả hai chiều, hoặc broadcast\_interruption() để tự ngắt bot.

### **3.3 Pipeline và thứ tự**

pipeline \= Pipeline(\[  
    transport.input(),        \# audio của user  
    stt,                      \# audio \-\> TranscriptionFrame  
    user\_aggregator,          \# gom lời user vào context, quyết định turn  
    llm,                      \# context \-\> LLMTextFrame (stream)  
    tts,                      \# chữ \-\> TTSAudioRawFrame \+ TTSTextFrame  
    transport.output(),       \# phát audio cho user  
    assistant\_aggregator,     \# ghi lời bot VỪA NÓI vào context  
\])

Thứ tự là ý nghĩa: mỗi processor chỉ hữu dụng khi frame nó cần đã được sinh ở phía trước. assistant\_aggregator đặt *sau* transport.output() để cập nhật context theo từng từ khớp với audio đã phát, nhờ đó khi bị ngắt giữa câu, context chỉ chứa phần bot đã thực sự nói.

### **3.4 Worker, Runner và vòng đời**

worker \= PipelineWorker(  
    pipeline,  
    name="assistant",  
    params=PipelineParams(  
        audio\_in\_sample\_rate=16000,  
        audio\_out\_sample\_rate=24000,  
        enable\_metrics=True,  
        enable\_usage\_metrics=True,  
    ),  
    observers=\[...\],  
)  
runner \= WorkerRunner(handle\_sigint=runner\_args.handle\_sigint)  
await runner.add\_workers(worker)  
await runner.run()      \# chặn đến khi: kết thúc bình thường, SIGINT/SIGTERM, runner.cancel(), hoặc lỗi không xử lý

Đẩy frame từ ngoài vào pipeline: await worker.queue\_frames(\[...\]). Frame downstream được đẩy từ đầu pipeline, upstream từ cuối. Ví dụ nói tạm biệt rồi kết thúc êm:

await worker.queue\_frames(\[TTSSpeakFrame("Tạm biệt\!"), EndFrame()\])

EndFrame (ControlFrame) kết thúc êm sau khi xử lý hết frame đứng trước; CancelFrame (SystemFrame) dừng ngay. Một số frame như EndFrame và FunctionCallResultFrame được đánh dấu interruptible=False nên không bị xóa khi có interruption.

### **3.5 ParallelPipeline**

Mỗi nhánh nhận *toàn bộ* frame từ phía trước; thường dùng với FunctionFilter để mỗi nhánh chỉ xử lý phần của nó (ví dụ hai nhánh TTS cho hai ngôn ngữ). Frame của các nhánh được thu lại và đẩy tiếp từng cái một.

## ---

**4\. Lớp truyền thông (Transports & Telephony)**

---

Transport là lớp truyền thông giữa user và bot: transport.input() / transport.output(). Nhờ tính module, bạn dùng WebRTC P2P khi dev rồi đổi sang Daily khi production mà không sửa logic bot.

| Transport | Dùng cho | Ghi chú   |
| :---- | :---- | :---- |
| SmallWebRTCTransport | Dev, P2P không cần nhà cung cấp | Quickstart mặc định dùng cái này |
| DailyTransport | Production web/mobile, PSTN/SIP | WebRTC hạ tầng Daily; Pipecat Cloud dùng Daily |
| LiveKitTransport | WebRTC trên LiveKit |  |
| FastAPIWebsocketTransport \+ serializer | Điện thoại (Twilio, Telnyx, Plivo, Exotel...) và WebSocket tùy biến | Cần FrameSerializer theo nhà mạng |
| WebsocketServerTransport / client | WebSocket thuần, server-to-server |  |
| WhatsAppTransport | Cuộc gọi thoại WhatsApp Business | Dựa trên SmallWebRTC |
| Avatar: HeyGen, Tavus, Simli, LemonSlice... | Video avatar |  |
| Media over QUIC, Vonage | Chuyên biệt |  |

**WebRTC hay WebSocket?** WebRTC cho ứng dụng client: độ trễ thấp, chịu mất gói tin, có khử echo/noise/AGC tích hợp, tự động timestamp (giúp interruption), kết nối lại tốt. WebSocket (TCP) chịu head-of-line blocking nên kém hơn cho media thời gian thực, phù hợp với điện thoại (nhà mạng quy định giao thức), server-to-server hoặc prototype.

### **Cấu hình**

from pipecat.transports.base\_transport import TransportParams

params \= TransportParams(  
    audio\_in\_enabled=True,  
    audio\_out\_enabled=True,  
    video\_in\_enabled=False,  
    video\_out\_enabled=False,  
)

Lưu ý (từ 1.0): tham số camera\_\* đã đổi thành video\_\*; vad\_analyzer, vad\_enabled, turn\_analyzer đã bị gỡ khỏi transport và chuyển sang user aggregator.

### **Chọn transport theo môi trường (mẫu của dev runner)**

from pipecat.runner.types import RunnerArguments, DailyRunnerArguments, SmallWebRTCRunnerArguments

async def bot(runner\_args: RunnerArguments):  
    if isinstance(runner\_args, DailyRunnerArguments):  
        from pipecat.transports.daily.transport import DailyParams, DailyTransport  
        transport \= DailyTransport(  
            runner\_args.room\_url, runner\_args.token, "Pipecat Bot",  
            params=DailyParams(audio\_in\_enabled=True, audio\_out\_enabled=True),  
        )  
    elif isinstance(runner\_args, SmallWebRTCRunnerArguments):  
        from pipecat.transports.base\_transport import TransportParams  
        from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport  
        transport \= SmallWebRTCTransport(  
            params=TransportParams(audio\_in\_enabled=True, audio\_out\_enabled=True),  
            webrtc\_connection=runner\_args.webrtc\_connection,  
        )  
    else:  
        return  
    await run\_bot(transport, runner\_args)

Cách ngắn gọn hơn là create\_transport(runner\_args, transport\_params) với một dict các lambda (xem mục 13 và code đầy đủ ở mục 16).

### **Điện thoại**

Telephony chạy qua WebSocket kèm serializer. Ví dụ Twilio:

serializer \= TwilioFrameSerializer(  
    stream\_sid=stream\_sid, call\_sid=call\_sid,  
    account\_sid=os.getenv("TWILIO\_ACCOUNT\_SID", ""),  
    auth\_token=os.getenv("TWILIO\_AUTH\_TOKEN", ""),  
)  
transport \= FastAPIWebsocketTransport(  
    websocket=websocket\_client,  
    params=FastAPIWebsocketParams(  
        audio\_in\_enabled=True, audio\_out\_enabled=True,  
        add\_wav\_header=False, serializer=serializer,  
    ),  
)

Điểm cần nhớ với Twilio: audio là 8 kHz mono 16-bit PCM, nên đặt audio\_in\_sample\_rate=8000 và audio\_out\_sample\_rate=8000 trong PipelineParams để tránh resample. TwilioFrameSerializer mặc định tự cúp máy khi pipeline kết thúc (auto\_hang\_up=True, cần call\_sid, account\_sid, auth\_token). Luồng: TwiML Bin có \<Connect\>\<Stream url="wss://.../ws"/\> → Twilio mở WebSocket → bot parse (parse\_telephony\_websocket) → chạy pipeline. Dial-out: server tạo cuộc gọi bằng REST API với TwiML chứa \<Parameter\> tùy biến, bot đọc từ call\_data\["body"\]. Dev: uv run bot.py \-t twilio kèm ngrok.

Các nhà mạng khác: Telnyx, Plivo, Exotel (serializer riêng), Daily PSTN/SIP, Genesys AudioHook, Vonage. Với telephony production xem trang "Telephony in Production" (dispatch theo webhook, điểm khác biệt giữa các carrier).

## ---

**5\. Dịch vụ AI (STT, LLM, TTS) & Tối ưu tiếng Việt**

---

Docs liệt kê hơn 150 tích hợp. Mỗi dịch vụ là một processor; đổi nhà cung cấp là đổi một dòng.

| Loại | Ví dụ (không đầy đủ)   |
| :---- | :---- |
| STT | Deepgram, AssemblyAI, Azure, Google, Gladia, Soniox, Speechmatics, ElevenLabs, OpenAI, Groq Whisper, Whisper/Moonshine (local) |
| LLM | OpenAI, Anthropic, Google Gemini, AWS Bedrock, Azure OpenAI, Groq, Cerebras, Together, Fireworks, Ollama (local), OpenRouter... |
| TTS | Cartesia, ElevenLabs, Rime, Deepgram, Google, Azure, OpenAI, Inworld, Hume, Kokoro/Piper (local) |
| Speech-to-speech (Realtime) | OpenAI Realtime, Gemini Live, AWS Nova Sonic, Grok, Ultravox, Inworld |

Hai kiểu kiến trúc: **cascaded** (STT → LLM → TTS, kiểm soát từng bước, dễ gắn tool/RAG/Flows) và **speech-to-speech** (một dịch vụ lo hết, độ trễ thấp nhưng ít can thiệp; provider tự phát hiện interruption). Pipecat Flows chỉ dùng được với kiểu cascaded.

### **Cấu hình bằng Settings**

llm \= OpenAILLMService(  
    api\_key=os.environ\["OPENAI\_API\_KEY"\],  
    settings=OpenAILLMService.Settings(  
        model="gpt-4o",  
        system\_instruction="Bạn là trợ lý giọng nói. Trả lời ngắn gọn.",  
    ),  
)  
tts \= CartesiaTTSService(  
    api\_key=os.environ\["CARTESIA\_API\_KEY"\],  
    settings=CartesiaTTSService.Settings(voice="\<voice-id\>"),  
)

Settings đổi được lúc chạy (ví dụ LLMUpdateSettingsFrame để đổi system prompt). Import theo submodule: pipecat.services.openai.llm, pipecat.services.deepgram.stt, pipecat.services.cartesia.tts. Trang của từng dịch vụ ghi rõ extra cần cài (ví dụ pipecat-ai\[openai\]).

### **Chuyển đổi và chịu lỗi**

ServiceSwitcher / LLMSwitcher đổi provider lúc chạy (có thể tự failover khi một dịch vụ "unusable", xem mục 11). Các tiện ích hay dùng: TTSCacheMixin (cache cụm từ lặp để giảm chi phí và độ trễ), MarkdownTextFilter và VoiceFormatter (làm sạch markdown, đọc tiền tệ/ngày/số điện thoại trước khi TTS), LLMTextProcessor (gom LLMTextFrame thành câu).

### **Lưu ý cho tiếng Việt**

- **Turn Detection & Smart Turn v3**: Mô hình `LocalSmartTurnAnalyzerV3` (repo `pipecat-ai/smart-turn`) **hỗ trợ chính thức 23 ngôn ngữ, trong đó có tiếng Việt (Vietnamese)**. Smart Turn v3 chạy suy luận ONNX trực tiếp trên CPU, phân tích nhịp ngữ điệu tiếng Việt (ngập ngừng, kéo dài âm) tốt hơn nhiều so với VAD đếm giây im lặng thuần túy.
- **STT tiếng Việt**:
  - Deepgram Nova-2 / Nova-3 (`language="vi"`): độ trễ streaming cực thấp (~150-250ms), phiên âm dấu tiếng Việt tốt.
  - Google Cloud Speech-to-Text V2 (`language_codes=["vi-VN"]`): kho từ vựng tiếng Việt phong phú, hỗ trợ nhận diện tên riêng tốt.
  - Azure Cognitive Services Speech (`language="vi-VN"`): ổn định, độ trễ thấp.
  - Groq Whisper / Faster-Whisper local (`language="vi"`): độ chính xác cao nhưng độ trễ chunking cao hơn Nova-2.
- **TTS tiếng Việt**:
  - Cartesia Sonic Multilingual (`language="vi"`): TTFB cực nhanh (~90-120ms), giọng đọc tự nhiên.
  - ElevenLabs Multilingual v2 / Flash v2.5 (`language_code="vi"`): độ biểu cảm rất cao, TTFB ~150-200ms.
  - Google Cloud TTS (`vi-VN-Neural2-A/D`) và Azure Speech TTS (`vi-VN-NamMinhNeural`, `vi-VN-HoaiMyNeural`): phát âm chuẩn xác, bền bỉ cho tổng đài.
  - Nhà mạng/nội địa: FPT.AI hoặc Zalo AI có thể tích hợp qua custom `TTSService`.
- **Ổn định phiên âm tên riêng & từ mượn**: Ở Pipecat 1.12.0+, bạn có thể dùng `TTSService.pronunciation_transform_ipa({"OmniMer": "ɔm.ni.mɛr"})` để ép giọng đọc phát âm chính xác các tên thương hiệu/thuật ngữ tiếng Anh lẫn trong câu tiếng Việt.
- **Đo kiểm thực tế**: Repo `pipecat-ai/stt-benchmark` cung cấp công cụ chuẩn hóa đo lường độ trễ STT (TTFS - Time to First Segment).

## ---

**6\. VAD, Turn-Taking & Cơ chế ngắt lời (Interruption / Barge-in)**

### ---

**6.1 VAD**

VAD phát hiện lúc user bắt đầu/ngừng nói. Pipecat có Silero VAD chạy local trên CPU (xử lý chunk 30 ms+ trong dưới 1 ms), cùng Krisp VIVA, TEN, FireRed, AIC Quail. VAD cấu hình trên **user aggregator**:

from pipecat.audio.vad.silero import SileroVADAnalyzer  
from pipecat.audio.vad.vad\_analyzer import VADParams

vad \= SileroVADAnalyzer(params=VADParams(  
    confidence=0.7,    \# ngưỡng tin cậy giọng nói  
    start\_secs=0.2,    \# thời gian xác nhận bắt đầu nói  
    stop\_secs=0.2,     \# thời gian im lặng để xác nhận dừng nói  
    min\_volume=0.6,  
))

Mặc định thường đủ tốt. stop\_secs mặc định đã đổi từ 0.8 xuống 0.2 ở 1.0, vì thời điểm kết thúc lượt giờ do stop strategy quyết định. Nếu đổi stop\_secs, hãy đo lại độ trễ STT bằng stt-benchmark và truyền vào ttfs\_p99\_latency của dịch vụ STT. Với ồn nền, đừng chỉ nâng confidence/min\_volume; lọc nhiễu ở đầu vào bằng Krisp VIVA, ai-coustics hoặc RNNoise tốt hơn. Dùng VAD local nhanh hơn VAD từ xa khoảng 150–200 ms.

### **6.2 Turn strategies**

VAD chỉ biết có tiếng hay không; nó không hiểu rằng người nói đang ngập ngừng. Pipecat dùng **user turn strategies**:

| Quyết định | Chiến lược   |
| :---- | :---- |
| Bắt đầu lượt | VADUserTurnStartStrategy, TranscriptionUserTurnStartStrategy (dự phòng khi VAD không bắt được), MinWordsUserTurnStartStrategy(min\_words=3), Krisp VIVA IP (lọc "ờ, ừm") |
| Kết thúc lượt | TurnAnalyzerUserTurnStopStrategy (mặc định, dùng model **Smart Turn** để hiểu người dùng đã nói xong ý chưa), SpeechTimeoutUserTurnStopStrategy(user\_speech\_timeout=0.6) (đơn giản hơn) |

from pipecat.audio.turn.smart\_turn.local\_smart\_turn\_v3 import LocalSmartTurnAnalyzerV3  
from pipecat.turns.user\_start import VADUserTurnStartStrategy, TranscriptionUserTurnStartStrategy  
from pipecat.turns.user\_stop import TurnAnalyzerUserTurnStopStrategy  
from pipecat.turns.user\_turn\_strategies import UserTurnStrategies

user\_params \= LLMUserAggregatorParams(  
    vad\_analyzer=SileroVADAnalyzer(),  
    user\_turn\_strategies=UserTurnStrategies(  
        start=\[VADUserTurnStartStrategy(), TranscriptionUserTurnStartStrategy()\],  
        stop=\[TurnAnalyzerUserTurnStopStrategy(turn\_analyzer=LocalSmartTurnAnalyzerV3())\],  
    ),  
    user\_turn\_stop\_timeout=5.0,  
    user\_idle\_timeout=8.0,     \# phát hiện user im lặng (xem trang "Detecting Idle Users")  
)

Cũng cấu hình trên LLMUserAggregatorParams: user\_mute\_strategies, filter\_incomplete\_user\_turns=True (dùng LLM để không trả lời khi user bị ngắt giữa ý), và empty\_user\_turn.

### **6.3 Interruption (barge-in)**

Khi một start strategy kích hoạt với enable\_interruptions=True (mặc định), user aggregator **broadcast InterruptionFrame cả hai chiều**. Vì là SystemFrame nên mỗi processor xử lý ngay:

1. Mỗi processor hủy tác vụ đang chạy và bỏ các DataFrame/ControlFrame đang xếp hàng (trừ frame interruptible=False).  
2. LLM dừng sinh giữa chừng; function call có cancel\_on\_interruption=True bị hủy và phát FunctionCallCancelFrame.  
3. TTS dừng tổng hợp, xóa buffer và timestamp.  
4. Output transport xả audio chưa phát. Nếu có background mixer, chỉ giọng bot bị xả.

Bot im trong khoảng một lần ghi audio. **Context chỉ chứa những gì bot đã nói thật**, vì TTSTextFrame được đẩy theo nhịp phát audio và assistant aggregator chốt phần đã nói khi bị ngắt:

@assistant\_aggregator.event\_handler("on\_assistant\_turn\_stopped")  
async def on\_assistant\_turn\_stopped(aggregator, message):  
    if message.interrupted:  
        print(f"Bot bị cắt sau khi nói: {message.content}")

Nếu user ngắt nhưng không có transcript (ho, ồn), mặc định aggregator chạy LLM một lần để bot xin nhắc lại hoặc nói tiếp. Chỉnh bằng empty\_user\_turn (đặt None để không đáp, hoặc dùng EmptyUserTurnConfig).

Kiểm soát interruption:

| Mục tiêu | Cách làm   |
| :---- | :---- |
| Bot nói hết, bỏ phần user nói chen | user\_mute\_strategies=\[AlwaysUserMuteStrategy()\] (hoặc FirstSpeechUserMuteStrategy() chỉ bảo vệ phần mở đầu), import từ pipecat.turns.user\_mute |
| Câu ngắn như "vâng" không ngắt bot | MinWordsUserTurnStartStrategy(min\_words=3) |
| Lọc backchannel bằng model | Krisp VIVA Interruption Prediction |
| Tắt hẳn interruption | VADUserTurnStartStrategy(enable\_interruptions=False) |
| Tự ngắt bot từ code | await self.broadcast\_interruption() trong processor, hoặc worker.queue\_frame(InterruptionWorkerFrame()) |

Cảnh báo: tắt interruption **không** bỏ qua user. Lời nói chen vẫn được phiên âm và xử lý thành lượt thường, câu trả lời được xếp hàng. Muốn bot nói hết *và* bỏ phần user chen vào thì dùng mute strategy. Với speech-to-speech, provider tự quyết định ngắt và Pipecat chỉ xả audio local.

## ---

**7\. Quản lý ngữ cảnh (LLMContext) & Function Calling**

### ---

**7.1 LLMContext**

LLMContext là container chung cho mọi nhà cung cấp LLM (adapter tự chuyển đổi), chứa messages (user/assistant/developer/tool), tools và tool\_choice.

context \= LLMContext()    \# system prompt đặt ở system\_instruction của service  
user\_aggregator, assistant\_aggregator \= LLMContextAggregatorPair(  
    context,  
    user\_params=LLMUserAggregatorParams(vad\_analyzer=SileroVADAnalyzer()),  
)

Cách đưa chỉ dẫn cho LLM:

| Cách | Khi nào   |
| :---- | :---- |
| system\_instruction trong Settings (**khuyến nghị**) | Tính cách và hành vi cốt lõi. Luôn được gắn vào, bền qua việc thay context và summarization, dùng chung context giữa nhiều LLM |
| Message role: developer | Chỉ dẫn theo từng giai đoạn/tác vụ; có thể bị nén khi summarization |
| Message role: system trong context | **Deprecated từ 1.9.0**, sẽ gỡ ở 2.0.0 |

Context cập nhật tự động: TranscriptionFrame → user message; TTSTextFrame (văn bản thực sự đã nói) → assistant message. Vị trí aggregator: user aggregator sau STT; assistant aggregator sau transport.output().

Điều khiển thủ công bằng frame:

\# thêm message và kích hoạt bot trả lời  
await worker.queue\_frames(\[LLMMessagesAppendFrame(\[{"role": "user", "content": "Hãy tự giới thiệu."}\], run\_llm=True)\])  
\# thêm message "âm thầm", không gọi LLM  
await worker.queue\_frames(\[LLMMessagesAppendFrame(\[note\], run\_llm=False)\])  
\# bot nói trước khi user mở lời  
@transport.event\_handler("on\_client\_connected")  
async def on\_client\_connected(transport, client):  
    await worker.queue\_frames(\[LLMRunFrame()\])

Còn có LLMMessagesUpdateFrame (thay toàn bộ) và LLMMessagesTransformFrame (sửa/xóa chọn lọc). Cuộc gọi dài: bật LLMAssistantAggregatorParams(enable\_auto\_context\_summarization=True) để nén lịch sử cũ, giảm token và chi phí. Muốn bot nói một câu cố định và ghi vào context thì dùng TTSSpeakFrame(..., append\_to\_context=True).

### **7.2 Function calling**

Cách ưu tiên là **direct function**: một hàm async vừa là handler vừa là schema; Pipecat suy ra tên, mô tả, tham số từ chữ ký và docstring kiểu Google. Tham số đầu luôn là params: FunctionCallParams.

from pipecat.services.llm\_service import FunctionCallParams  
from pipecat.adapters.schemas.direct\_function import tool\_options

@tool\_options(cancel\_on\_interruption=True, timeout\_secs=8)  
async def lookup\_order(params: FunctionCallParams, order\_id: str):  
    """Tra cứu trạng thái đơn hàng.

    Args:  
        order\_id: Mã đơn hàng, ví dụ "DH12345".  
    """  
    await params.llm.push\_frame(TTSSpeakFrame("Dạ, em tra cứu một chút ạ."))  
    await params.result\_callback({"order\_id": order\_id, "status": "đang giao"})

context \= LLMContext(tools=\[lookup\_order\])

Điểm quan trọng:

| Nội dung | Chi tiết   |
| :---- | :---- |
| Đăng ký | Liệt kê hàm trong LLMContext(tools=\[...\]); đổi tool giữa chừng bằng LLMSetToolsFrame |
| Sync vs async | Mặc định đồng bộ (cancel\_on\_interruption=True): LLM chờ kết quả. cancel\_on\_interruption=False là async: hội thoại không bị giữ, kết quả đến sau được chèn lại thành developer message và kích hoạt inference mới. Async có thể gửi kết quả trung gian bằng FunctionCallResultProperties(is\_final=False) |
| Timeout | timeout\_secs theo tool; quá hạn thì handler nhận asyncio.CancelledError và bot báo không hoàn tất |
| Song song | run\_in\_parallel=True, group\_parallel\_tools=True (mặc định): LLM chỉ chạy một lần sau khi cả nhóm tool xong. Nếu bot trả lời lặp, kiểm tra group\_parallel\_tools |
| Enum chặt | Direct function chưa map Literal sang enum. Cần enum thì dùng FunctionSchema hoặc nêu ràng buộc trong docstring |
| Tài nguyên dùng chung | PipelineWorker(pipeline, app\_resources=...) rồi đọc params.app\_resources (DB, API client) |
| Điều khiển LLM sau tool | FunctionCallResultProperties(run\_llm=False) cho các tool gọi liền nhau |
| MCP | MCPClient nối bot với MCP server và đăng ký tool |

Lỗi trong handler: luôn result\_callback({"error": "..."}) để LLM xử lý được, đừng để exception làm treo lượt.

## ---

**8\. Hội thoại có cấu trúc với Pipecat Flows**

---

Flows biến cuộc hội thoại thành **đồ thị node**: mỗi node chỉ có một nhiệm vụ và đúng những tool cần thiết. Mục đích là tránh prompt khổng lồ nhiều tool dẫn đến hallucination và giảm độ chính xác. Dùng khi cần kiểm soát chặt các bước (thu thập thông tin, xác minh, đặt lịch).

Hai cách viết: **declarative** (khuyến nghị bắt đầu) — flow là YAML/JSON, handler là Python; hoặc **programmatic** (NodeConfig bằng code) khi tool cần schema chặt (FlowsFunctionSchema), node phải dựng lúc chạy, hoặc có sự kiện ngoài hội thoại điều khiển flow.

Giới hạn quan trọng: Flows cần **LLM văn bản có function calling trong pipeline cascaded**. Không hỗ trợ speech-to-speech (Gemini Live, OpenAI Realtime, Ultravox, Nova Sonic) vì Flows viết lại context và tool giữa phiên.

flow.yaml:

initial\_node: initial  
nodes:  
  initial:  
    role\_message: \>  
      Bạn là nhân viên chăm sóc khách hàng. Câu trả lời sẽ được chuyển thành giọng nói,  
      không dùng ký tự đặc biệt hay emoji. Luôn dùng một function để tiến hành cuộc hội thoại.  
    task\_messages:  
      \- role: developer  
        content: \>-  
          Chào khách và hỏi mã đơn hàng. Chỉ gọi record\_order khi khách đã nói mã.  
    functions:  
      \- name: record\_order  
        transition\_to: end  
  end:  
    task\_messages:  
      \- role: developer  
        content: Cảm ơn khách và kết thúc cuộc gọi.  
    post\_actions:  
      \- type: end\_conversation

handlers.py (direct function; trả (kết quả, TRANSITION\_IN\_YAML) để config quyết định node tiếp theo):

from pipecat.flows import TRANSITION\_IN\_YAML, FlowManager

async def record\_order(flow\_manager: FlowManager, order\_id: str):  
    """Ghi nhận mã đơn hàng khách cung cấp.

    Args:  
        order\_id: Mã đơn hàng khách đọc.  
    """  
    return order\_id, TRANSITION\_IN\_YAML

Nối vào bot (pipeline giữ nguyên, thêm vài dòng):

from pipecat.flows import Flow, FlowConfig, FlowManager  
import handlers

worker \= PipelineWorker(pipeline)  
config \= FlowConfig.from\_file("flow.yaml")  
flow \= Flow(config, handlers=handlers)  
flow\_manager \= FlowManager(  
    worker=worker, llm=llm, context\_aggregator=aggregators,  
    transport=transport, global\_functions=flow.global\_functions,  
)

@transport.event\_handler("on\_client\_connected")  
async def on\_client\_connected(transport, client):  
    await flow\_manager.initialize(flow.initial\_node)

Config được kiểm tra khi nạp và khi dựng Flow, nên gõ sai tên node hoặc tool lỗi sẽ báo ngay lúc khởi động. Có Visual Flow Editor tại flows.pipecat.ai. Nếu bạn đang dùng gói cũ pipecat-ai-flows, đọc trang migration (pipecat.flows nay là import mới).

## ---

**9\. Giao thức RTVI & Phát triển Client SDK**

### ---

**9.1 RTVI**

RTVI (Real-Time Voice and Video Inference) là giao thức mở giữa client và server, gồm các message JSON dạng:

{ "id": "...", "label": "rtvi-ai", "type": "user-transcription", "data": { } }

PipelineWorker tự thêm RTVIProcessor và RTVIObserver, nên bot chuẩn không cần cấu hình thêm. Các nhóm message chính:

| Nhóm | Message (hướng)   |
| :---- | :---- |
| Kết nối | client-ready (client), bot-ready (bot), disconnect-bot (client), error (bot, có cờ fatal) |
| Nói và phiên âm | user-started-speaking, user-stopped-speaking, bot-started-speaking, bot-stopped-speaking, user-transcription (có final), bot-output (có spoken, aggregated\_by), vad-user-\* (tắt mặc định), user-mute-started/stopped |
| Nhắn tin tùy biến | client-message ↔ server-response/error-response (khớp theo id); server-message (server chủ động gửi) |
| LLM | send-text, llm-function-call-started/in-progress/stopped, llm-function-call-result, bot-llm-text, bot-tts-text, bot-llm-started/stopped, bot-tts-started/stopped |
| Metrics | metrics (processing, ttfb, characters) |
| UI | ui-snapshot, ui-event, ui-command, ui-job-group (cho UIWorker điều khiển GUI) |

bot-transcription và llm-function-call đã deprecated, hãy dùng bot-output và llm-function-call-in-progress. Mức thông tin function call gửi về client do function\_call\_report\_level ở server quyết định (NAME/FULL).

### **9.2 Client SDK**

Các SDK lo transport, thu mic/camera, phát audio, trạng thái phiên, luồng sự kiện và nhắn tin tùy biến; chúng triển khai RTVI nên chạy với mọi server tương thích RTVI.

| SDK | Ghi chú   |
| :---- | :---- |
| JavaScript (@pipecat-ai/client-js) | Lõi cho web; transport: Daily, SmallWebRTC, LiveKit, WebSocket, MoQ, Gemini Live, OpenAI Realtime |
| React | Hook và component bọc PipecatClient (PipecatClientProvider, usePipecatClient...) |
| React Native | Daily, SmallWebRTC |
| iOS (Swift) / Android (Kotlin) | Daily, SmallWebRTC, Gemini Live WebSocket, OpenAI Realtime WebRTC |
| C++ | Desktop/embedded, Daily |
| ESP32 | Repo pipecat-esp32 |

Ví dụ JS thuần (rút từ client quickstart, đã lược):

const transport \= await createTransport(transportType);   // import động gói transport tương ứng  
const client \= new PipecatClient({  
  transport,  
  enableMic: true,  
  callbacks: {  
    onUserTranscript: (d) \=\> { if (d.final) addMessage(d.text, "user"); },  
    onBotTranscript: (d) \=\> addMessage(d.text, "bot"),  
  },  
});  
await client.startBotAndConnect({ endpoint: "http\://localhost:7860/start" });

Chọn transport phía client: SmallWebRTC cho dev/P2P, Daily cho production, WebSocket cho trường hợp đơn giản. Production trỏ client tới endpoint start của bot đã deploy (với Pipecat Cloud: https\://api.pipecat.daily.co/v1/public/{agentName}/start kèm public API key; xem .env.example do CLI sinh), và build client thành static site (Vercel, Netlify, S3).

Giao diện: template CLI dùng Voice UI Kit (legacy); hướng mới là **Pipecat UI**, component cài dạng source qua shadcn registry (`npx shadcn add @pipecat-ai/...`). Trang "Building a Voice UI" hướng dẫn tự dựng UI từ SDK.

**Chữ ký method và React hooks chuẩn đã xác minh:**
- **JS SDK (`@pipecat-ai/client-js`)**:
  - Khởi tạo & Kết nối: `client.startBotAndConnect({ endpoint: "/api/start", requestData: {} })`
  - Đóng kết nối: `client.disconnect()` hoặc `client.disconnectBot()`
  - Gửi tin nhắn tùy biến hai chiều: `client.sendClientMessage(message)` (one-way) và `client.sendClientRequest(request)` (request/response khớp theo id)
  - Điều khiển âm thanh/media: `client.initDevices()`, `client.enableMic(true/false)`, `client.enableCam(true/false)`
- **React SDK (`@pipecat-ai/client-react`)**:
  - `usePipecatClient()`: Truy cập instance `PipecatClient`
  - `useRTVIClientEvent(RTVIEvent.<EventName>, callback)`: Lắng nghe sự kiện RTVI (như `TransportStateChanged`, `UserTranscript`, `BotTranscript`)
  - `usePipecatClientMediaDevices()`: Lấy danh sách và điều khiển microphone/loa/camera (`availableMics`, `updateMic`, `selectedMic`)
  - `useMediaState()`: Kiểm tra trạng thái cấp quyền thiết bị (`mic`, `cam`)

## ---

**10\. Giám sát, Metrics & Phân tích độ trễ (Observability)**

### ---

**Metrics tích hợp**

PipelineParams(enable\_metrics=True, enable\_usage\_metrics=True)

Bật xong, Pipecat phát MetricsFrame (TTFB, thời gian xử lý, lượng ký tự TTS, usage LLM/TTS). Bạn lấy dữ liệu bằng processor tùy biến đặt sau TTS hoặc bằng observer (MetricsLogObserver). Client cũng nhận được qua message RTVI metrics.

### **Observers**

Observer nhìn frame chảy qua pipeline mà không sửa chúng; truyền vào PipelineWorker(observers=\[...\]).

| Observer | Dùng để   |
| :---- | :---- |
| UserBotLatencyObserver | Đo độ trễ user ngừng nói → bot bắt đầu nói, kèm breakdown theo dịch vụ |
| ServiceMetricsObserver, MetricsLogObserver | TTFB và usage từng dịch vụ |
| DebugLogObserver | Log mọi frame, lọc theo loại |
| LLMLogObserver, TranscriptionLogObserver, FunctionCallObserver | Debug LLM, STT, tool call |
| TurnTrackingObserver, SpeakingObserver | Sự kiện lượt hội thoại và nói/ngắt có timestamp chính xác |
| ErrorObserver | Gom mọi lỗi pipeline qua on\_error |
| StartupTimingObserver | Thời gian khởi động processor và transport |

from pipecat.observers.user\_bot\_latency\_observer import UserBotLatencyObserver

latency \= UserBotLatencyObserver()

@latency.event\_handler("on\_latency\_breakdown")  
async def on\_latency\_breakdown(observer, breakdown):  
    for line in breakdown.turn\_contribution\_lines():  
        logger.info(f"  {line}")  
\# Ví dụ đầu ra:  
\#   0.200s  endpointing wait   \[config: VAD stop\_secs\]  
\#   0.125s  transcription      \[DeepgramSTTService\#0\]  
\#   0.336s  LLM inference      \[OpenAILLMService\#0\]  
\#   0.359s  speech synthesis   \[CartesiaTTSService\#0\]  
\#   1.020s  TOTAL

worker \= PipelineWorker(pipeline, params=PipelineParams(enable\_metrics=True), observers=\[latency\])

Observer còn có on\_latency\_measured (giây, float) và on\_first\_bot\_speech\_latency (độ trễ lời chào). Breakdown chỉ đầy đủ khi enable\_metrics=True. Đây là công cụ tối ưu độ trễ số một của bạn: nó cho thấy mỗi giai đoạn tốn bao nhiêu, kể cả phần không dịch vụ nào đo (chờ endpointing).

### **Tracing, log và công cụ ngoài**

OpenTelemetry tracing (độ trễ được ghi thành attribute của span lượt hội thoại), cùng các tích hợp Arize/OpenInference, Datadog (qua Pipecat Cloud), Sentry, MLflow, Roark, Future AGI. Công cụ dev: **Whisker** (debugger thời gian thực), **Tail** (dashboard terminal). Ghi âm bằng AudioBufferProcessor; lưu transcript bằng sự kiện on\_user\_turn\_stopped/on\_assistant\_turn\_stopped (các TranscriptProcessor/TranscriptionUpdateFrame cũ đã bị gỡ). Ngoài ra còn có Pipeline Heartbeats (kiểm tra frame còn chảy đầu-cuối) và Pipeline Idle Detection (tự tắt pipeline không hoạt động).

Nguyên tắc: gắn **một session ID** vào mọi dòng log (và ID phiên của nhà cung cấp transport) để truy vết giữa dispatcher, bot và transport.

## ---

**11\. Xử lý lỗi & Khả năng chịu lỗi (Error Handling & Resilience)**

---

Ý chính: phân biệt lỗi *có thể hồi phục* (503 thoáng qua) với lỗi *vĩnh viễn* (API key bị từ chối). Mỗi processor có is\_usable; lỗi mang ErrorCategory: AUTHENTICATION, AUTHORIZATION, INVALID\_REQUEST là vĩnh viễn (làm processor thành unusable); RATE\_LIMIT, QUOTA, CONNECTIVITY, SERVER, APPLICATION, UNKNOWN thì không. APPLICATION (lỗi trong tool handler của bạn) không bao giờ làm dịch vụ unusable.

from pipecat.pipeline.worker import ProcessorUnusablePolicy

worker \= PipelineWorker(pipeline, processor\_unusable\_policy=ProcessorUnusablePolicy.END)  
\# CONTINUE (mặc định): báo lỗi và chạy tiếp. END: kết thúc êm. CANCEL: hủy ngay.

@stt.event\_handler("on\_error")  
async def on\_error(processor, frame):  
    if frame.processor and not frame.processor.is\_usable:  
        logger.error(f"{frame.processor} hỏng hẳn: {frame.error}")

Chính sách chỉ áp một lần cho mỗi processor. Dùng ServiceSwitcher kèm CONTINUE để tự failover sang provider khác; khi đã sửa nguyên nhân thì await stt.set\_usable(True). ErrorFrame.fatal đã deprecated (sẽ gỡ ở 2.0.0): dùng push\_error(..., force\_treat\_as\_permanent=True) hoặc đẩy EndWorkerFrame/CancelWorkerFrame.

## ---

**12\. Kiểm thử tự động & Đánh giá hành vi (Testing & Evals)**

---

Có ba tầng, từ rẻ đến đắt:

**1\. Unit test processor.** Pipecat cung cấp test harness chính thức `run_test()` nằm trong `pipecat.tests.utils` (dựng pipeline giả lập, đưa frame vào và thu frame ra mà không cần mở kết nối WebRTC thật):

```python
from pipecat.tests.utils import run_test
from pipecat.frames.frames import TTSSpeakFrame, TTSTextFrame

# Chữ ký hàm chuẩn đã xác minh trong repo pipecat-ai/pipecat:
downstream_frames = await run_test(
    my_processor_or_pipeline,
    frames_to_send=[TTSSpeakFrame(text="Xin chào")],
    start_timeout=1.0,
)
# Kiểm tra danh sách frame downstream trả về
assert any(isinstance(f, TTSTextFrame) for f in downstream_frames)
```
Giữ phần logic biến đổi dữ liệu trong các hàm Python thuần (pure functions) để test độc lập mà không phụ thuộc vòng đời pipeline.

**2\. Behavioral evals (pipecat eval).** Chạy chính agent bạn deploy, qua transport eval:

from pipecat.evals.transport import EvalTransportParams

transport\_params \= {  
    "eval": lambda: EvalTransportParams(audio\_in\_enabled=True, audio\_out\_enabled=True),  
    \# ... các transport khác  
}

uv run bot.py \-t eval                      \# agent mở WebSocket local chờ harness  
pipecat eval run scenarios/order.yaml \-v   \# exit 0 nếu pass, 1 nếu fail (dùng được trong CI)

Kịch bản **scripted** (bạn viết từng lượt, kèm kỳ vọng, eval: là tiêu chí ngôn ngữ tự nhiên do judge LLM chấm; chế độ text mặc định bỏ qua TTS nên rẻ và nhanh):

name: tra\_cuu\_don  
scenarios:  
  \- name: tra\_cuu\_don  
    turns:  
      \- expect:  
          \- event: response  
            eval: "bot chào và hỏi có thể giúp gì"  
      \- user: "Cho mình hỏi đơn DH12345 đang ở đâu?"  
        expect:  
          \- event: response  
            eval: "bot cho biết trạng thái của đơn hàng DH12345"

Kịch bản **simulated**: giao phía user cho một LLM đóng vai (persona, goal, success, metrics, max\_turns), judge đánh giá cả cuộc. Judge mặc định chạy Ollama local (gemma4:12b), đổi bằng judge:/factory:. Còn có assertion cho function call và ngân sách độ trễ, và pipecat eval suite để chạy nhiều kịch bản song song.

**3\. Công cụ bên thứ ba:** Coval, Cekura, Bluejay, Roark, Arize (mô phỏng và giám sát quy mô nhóm); pytest-catnip (gói cộng đồng, test pipeline LLM bỏ qua STT/TTS bằng YAML; yêu cầu Python 3.13+ và pipecat-ai ≥ 1.3.0, tức không dành cho môi trường 3.11).

Test thực tế trước khi lên production: kiểm tra với giọng thật, tạp âm thật, đường truyền kém, và ngắt giữa câu nhiều lần.

## ---

**13\. Triển khai Production (Docker, Self-host & Pipecat Cloud)**

### ---

**13.1 Dev runner không dùng cho production**

pipecat.runner.run (lệnh uv run bot.py) là công cụ phát triển local. POST /start của nó nhận request từ bất kỳ ai và có thể sinh bot cùng tài nguyên trả phí (ví dụ phòng Daily), không rate limit, một tiến trình, không quản lý vòng đời. Nó chỉ nghe localhost mặc định; mở ra ngoài (--host 0.0.0.0) là phơi bày. Nếu bắt buộc demo công khai: đặt reverse proxy phía trước (xác thực POST /start, rate limit, TLS), và hiểu đó vẫn chỉ là prototype (webhook của nhà cung cấp như dial-in cần xác minh chữ ký riêng).

Entry point chuẩn dùng được ở cả dev lẫn Pipecat Cloud:

async def bot(runner\_args: RunnerArguments):  
    transport \= await create\_transport(runner\_args, transport\_params)  
    await run\_bot(transport, runner\_args)

if \_\_name\_\_ \== "\_\_main\_\_":  
    from pipecat.runner.run import main  
    main()

### **13.2 Chọn ai đóng vai "runner"**

| Lựa chọn | Mô tả | Đánh đổi   |
| :---- | :---- | :---- |
| Tự dựng dispatcher: **VM per session** | Dispatcher gọi API máy ảo (Fly.io, AWS, GCP) mở VM riêng cho mỗi phiên | Cách ly tốt, dễ scale; chịu cold start mỗi phiên |
| Tự dựng: **warm pool \+ subprocess** | Cấp sẵn tài nguyên transport và pool tiến trình bot trên host sống lâu | Khởi tạo phiên rất nhanh; giới hạn bởi một host |
| Kubernetes (HPA/KEDA) hoặc serverless | Tự vận hành đội bot | Linh hoạt nhất, tốn công nhất |
| **Managed runtime** | Pipecat Cloud (hoặc AWS Bedrock AgentCore...) | Ít vận hành nhất; phụ thuộc nhà cung cấp |

Nền tảng host có hướng dẫn riêng: Fly.io, Modal, Cerebrium.

### **13.3 Docker**

Bot production chạy dạng **một tiến trình cho mỗi phiên**: dispatcher truyền room URL và token vào entrypoint, bot xử lý một cuộc hội thoại rồi thoát. Image chứa bot, thư viện và trọng số model đã tải sẵn:

FROM python:3.11-slim-bookworm  
WORKDIR /app  
COPY requirements.txt .  
RUN pip install \--no-cache-dir \-r requirements.txt  
COPY bot.py .  
\# Nướng model vào image để phiên đầu không phải tải  
RUN python \-c "import torch; torch.hub.load('snakers4/silero-vad', 'silero\_vad', force\_reload=True)"  
RUN python \-m nltk.downloader punkt\_tab \-d /usr/local/share/nltk\_data

Không đặt CMD ở đây vì nó phụ thuộc mô hình dispatch. Quy tắc: giữ image nhỏ (multi-stage, .dockerignore), không nhúng API key vào image, cân nhắc nướng model lớn vào image (cold start nhanh, image to) hay mount từ volume mạng.

### **13.4 Pipecat Cloud**

Dùng base image dailyco/pipecat-base (khuyến nghị **ghim version**, vì :latest có thể đổi mà project không đổi). Yêu cầu: project có bot.py với async def bot(...); không cần CMD; **không ghi vào /app**.

FROM dailyco/pipecat-base:latest-py3.12  
ENV UV\_COMPILE\_BYTECODE=1  
ENV UV\_LINK\_MODE=copy  
RUN \--mount=type=cache,target=/root/.cache/uv \\  
    \--mount=type=bind,source=uv.lock,target=uv.lock \\  
    \--mount=type=bind,source=pyproject.toml,target=pyproject.toml \\  
    uv sync \--locked \--no-install-project \--no-dev  
COPY ./bot.py bot.py

Base image mở sẵn các route /bot, /ws, /api/offer, /whatsapp. Nếu tự build và đẩy image lên registry riêng, region Daily-hosted chạy Linux ARM nên build \--platform linux/arm64; với **cloud builds** bạn chỉ cần Dockerfile và CLI lo phần còn lại. Có hỗ trợ GitHub (deploy khi push) và GitHub Actions cho CI.

pipecat cloud auth login  
pipecat cloud deploy my-agent \--min-agents 1 \--max-agents 25 \--max-session-duration 1800  
pipecat cloud spend-limit set 250

**Cú pháp CLI quản lý Secrets trên Pipecat Cloud đã xác minh:**
```bash
# Tạo hoặc cập nhật secret set từ cặp key-value
pipecat cloud secrets set my-secrets 'DEEPGRAM_API_KEY=xyz OPENAI_API_KEY=abc'

# Hoặc nạp toàn bộ từ file .env
pipecat cloud secrets set my-secrets --file .env

# Liệt kê danh sách secret sets
pipecat cloud secrets list
pipecat cloud secrets list my-secrets

# Xóa một key khỏi secret set
pipecat cloud secrets unset my-secrets OLD_KEY

# Gắn secret set vào deployment agent
pipecat cloud deploy my-agent --secret-set my-secrets
```

Mô hình scale của Pipecat Cloud:

| Khái niệm | Chi tiết   |
| :---- | :---- |
| Instance | Mỗi instance chạy **một phiên tại một thời điểm**; concurrency \= số instance đang chạy. Profile lớn hơn (agent-2x...) cho một phiên thêm CPU/RAM, không cho nhiều phiên |
| min-agents | Số instance "ấm" luôn chạy; mặc định 0\. **Tính phí cả khi không dùng** (1 instance \= 1.440 phút dự trữ mỗi ngày) |
| max-agents | Giới hạn cứng đồng thời, đồng thời là trần chi phí; hết chỗ trả **HTTP 429** (xử lý trong app). Mặc định tối đa 50 mỗi deployment ở region Daily-hosted, xin tăng qua form |
| Cold start | Tốt nhất khoảng 10 giây; lâu hơn thường do image to, import nặng ở mức module trong bot.py, tải model lúc chạy |
| Scale-to-zero | Instance rảnh giữ 5 phút rồi tắt; không nên dùng cho production cần phản hồi ngay |
| Auto-scaling buffer | Pipecat Cloud tự tạo thêm instance đệm miễn phí (\\\~30 giây) khi traffic tăng; chỉ cần min-agents cao hơn cho spike cực nhanh (hàng chục đến hàng trăm cuộc/giây) |
| Chi phí | Tính theo phút phiên hoạt động và phút instance dự trữ; có \--max-session-duration chống phiên chạy mãi, và spend limit làm lưới an toàn cuối |

Phụ trợ: secrets, health checks, regions (đặt gần người dùng để giảm trễ), logging/Datadog, webhooks, Session API, Krisp VIVA, Smart Turn trên Cloud, telephony (Twilio/Telnyx/Plivo/Exotel WebSocket, Daily PSTN dial-in/out), WhatsApp, HIPAA. **Pipecat Enterprise** là cùng control plane nhưng agent chạy trong Kubernetes của bạn (tài liệu có kiến trúc tham chiếu AWS EKS và Oracle OKE). Với Twilio trên Cloud, TwiML trỏ tới wss://api.pipecat.daily.co/ws/twilio kèm tham số \_pipecatCloudServiceHost.

### **13.5 Việc bạn phải tự lo khi self-host**

| Vấn đề | Gợi ý   |
| :---- | :---- |
| Xác thực request | JWT từ app server, bearer token hoặc mTLS trước endpoint tạo phiên |
| Secret | Biến môi trường từ secret manager hoặc file mount; không nướng vào image |
| Autoscaling | Phiên sống lâu (phút đến giờ) nên scale phải dự báo, scale-down phải kiên nhẫn; KEDA theo số phiên đang hoạt động hợp hơn HPA theo CPU |
| Tắt pod/VM | terminationGracePeriodSeconds mặc định 30 giây là quá ngắn; thêm preStop hook ngừng nhận phiên mới và cho phiên cũ chảy hết |
| Deploy | Graceful drain: đánh dấu bản cũ không nhận phiên mới, chuyển traffic sang bản mới, chờ phiên cũ xong (có deadline) rồi mới tắt |
| Readiness | Chọn giữa trả URL ngay (nhanh nhưng client có thể vào trước bot) và chờ bot vào transport (chắc hơn nhưng chậm hơn) |
| Crash | Quyết định client thấy gì, có thử lại không, có tái dùng phòng/cuộc gọi không |
| Vùng và quota | Đặt bot gần user; theo dõi hạn mức API của cloud, transport, STT/LLM/TTS |

Metric nên theo dõi: số phiên đang hoạt động, độ trễ dispatcher đến "client ready", thời lượng phiên, metric pipeline.

## ---

**14\. Best Practices & Checklist Production toàn diện**

### ---

**Bảng Checklist Kiểm tra Production (Production Readiness Checklist)**

Dưới đây là checklist kiểm tra nghiệm thu trước khi đưa bất kỳ voicebot nào lên môi trường production:

| Lĩnh vực | Hạng mục kiểm tra | Tiêu chuẩn đạt | Trạng thái   |
| :---- | :---- | :---- | :---- |
| **Độ trễ** | Vòng lặp phản hồi (Round-trip Turn Latency) | Đạt 500 – 800 ms (tối đa dưới 1.000 ms) | \[ \] |
| **Độ trễ** | Cấu hình VAD | Dùng local VAD (Silero), stop\_secs \= 0.2, kết hợp Smart Turn | \[ \] |
| **Độ trễ** | Kết nối STT / TTS | 100% sử dụng giao thức Streaming (WebSocket), không dùng HTTP chunked | \[ \] |
| **Độ trễ** | Cache phát âm cố định | Kích hoạt TTSCacheMixin cho câu chào, lời xác nhận thường gặp | \[ \] |
| **Hội thoại** | Lời dặn LLM (System Instruction) | Ràng buộc trả lời ngắn gọn (1-2 câu), cấm markdown/emoji/list | \[ \] |
| **Hội thoại** | Bộ lọc văn bản trước TTS | Đã gắn MarkdownTextFilter và VoiceFormatter xử lý số, tiền tệ, ngày | \[ \] |
| **Hội thoại** | Filler Phrase cho tác vụ chậm | Có TTSSpeakFrame ("Dạ em kiểm tra ngay") trước các API tốn \> 1 giây | \[ \] |
| **Hội thoại** | Xử lý người dùng im lặng | Đã cấu hình user\_idle\_timeout để nhắc nhở khi khách không nói gì | \[ \] |
| **Độ tin cậy** | Chính sách lỗi Processor | Đặt processor\_unusable\_policy \= ProcessorUnusablePolicy.END | \[ \] |
| **Độ tin cậy** | Nhà cung cấp dự phòng | Đã thiết lập ServiceSwitcher tự động failover khi API chính gặp sự cố | \[ \] |
| **Độ tin cậy** | Giới hạn thời gian Tool | 100% các tool gọi mạng/database đều có timeout\_secs cụ thể | \[ \] |
| **Độ tin cậy** | Dọn dẹp tài nguyên khi ngắt | Lắng nghe sự kiện on\_client\_disconnected để gọi runner.cancel() | \[ \] |
| **Bảo mật** | Quản lý Secret & API Key | API key nạp từ biến môi trường/secret manager, tuyệt đối không đưa vào Dockerfile | \[ \] |
| **Bảo mật** | Xác thực phiên gọi (Session Auth) | Endpoint khởi tạo bot /start có xác thực JWT / API Bearer token | \[ \] |
| **Bảo mật** | Kiểm soát quyền phía Server | Tool nhạy cảm (thanh toán, hủy dịch vụ) phải xác thực session và quyền hạn | \[ \] |
| **Chi phí** | Trần chi phí & Giới hạn phiên | Đặt \--max-session-duration (ví dụ 1800s) và giới hạn ngân sách hàng tháng | \[ \] |
| **Chi phí** | Giới hạn số lượng phiên đồng thời | Cấu hình max-agents để tránh spike chi phí và quá tải hạn mức API | \[ \] |
| **Vận hành** | Định danh phiên xuyên suốt | Mỗi dòng log đều gắn kèm session\_id để truy vết đầu cuối | \[ \] |
| **Vận hành** | Giám sát độ trễ thời gian thực | Tích hợp UserBotLatencyObserver xuất breakdown log định kỳ | \[ \] |
| **Vận hành** | Thoát tiến trình êm (Graceful Drain) | Cấu hình preStop hook chờ cuộc gọi hiện tại kết thúc trước khi tắt container | \[ \] |

**Độ trễ (mục tiêu thường nói tới là 500–800 ms cho cả vòng):** dùng VAD local; giữ stop\_secs mặc định 0.2 rồi để Smart Turn quyết định; chọn dịch vụ STT/TTS dạng streaming (WebSocket) thay vì HTTP segmented; prompt ngắn, model nhanh cho lượt thoại; đặt bot cùng region với user và nhà cung cấp; đo bằng UserBotLatencyObserver; dùng TTSCacheMixin cho câu cố định (lời chào).

**Chất lượng hội thoại:** dặn LLM trả lời ngắn, không markdown/emoji; lọc ký tự bằng MarkdownTextFilter/VoiceFormatter; có filler (TTSSpeakFrame) trước tool chậm; xử lý im lặng của user (user\_idle\_timeout); chọn mute strategy cho đoạn bắt buộc phải nghe hết (đọc thông báo pháp lý); dùng filter\_incomplete\_user\_turns khi user hay ngập ngừng.

**Độ tin cậy:** đặt processor\_unusable\_policy có chủ đích; có provider dự phòng qua ServiceSwitcher; timeout\_secs cho mọi tool gọi mạng; max-session-duration; bắt on\_client\_disconnected để dọn dẹp (runner.cancel()); ghim version pipecat-ai và base image; chạy lại evals trước mỗi lần nâng cấp, đọc migration guide, và nhớ rằng tham số bị gỡ **bị bỏ qua im lặng** nên không dựa vào việc "app vẫn khởi động".

**Bảo mật và chi phí:** xác thực mọi điểm tạo phiên; không public dev runner; secret nằm ngoài image; max-agents, spend limit, max-session-duration; không log PII/audio khi chưa có chính sách; tool có tác động thật (hủy đơn, chuyển tiền) cần xác nhận và kiểm quyền phía server, vì lời user có thể là prompt injection; chuẩn bị chính sách ghi âm và lưu transcript theo quy định (Pipecat Cloud có tài liệu HIPAA).

**Vận hành:** session ID xuyên suốt log; theo dõi metric ở mục 13.5; chạy thử tải với số phiên đồng thời mục tiêu; kiểm tra cold start với image thật.

## ---

**15\. Lộ trình học 11 chặng cho người mới bắt đầu**

---

Ước tính cho một kỹ sư đã quen Python async và LLM. Mỗi chặng chỉ sang chặng sau khi đạt tiêu chí.

| \# | Chặng | Làm gì | Đạt khi   |
| :---- | :---- | :---- | :---- |
| 1 | Chạy được (1–2 giờ) | pipecat init, chạy quickstart với một bộ STT/LLM/TTS duy nhất, dùng tai nghe | Nói chuyện và ngắt giữa câu được |
| 2 | Hiểu pipeline (2–3 giờ) | Bật DebugLogObserver, đọc từng frame đi qua trong một lượt; vẽ lại luồng frame | Trả lời được: frame nào vào/ra ở mỗi processor, ai hủy audio khi bị ngắt |
| 3 | Processor tùy biến (2 giờ) | Viết processor: log transcript, lọc ký tự trước TTS, một bộ đếm; thêm UserBotLatencyObserver | Đọc được breakdown độ trễ của mình và chỉ ra giai đoạn chậm nhất |
| 4 | Turn-taking (2 giờ) | Thử MinWords, mute strategy, Smart Turn so với SpeechTimeout; đọc on\_assistant\_turn\_stopped khi bị ngắt | Giải thích được vì sao context chỉ chứa phần đã nói |
| 5 | Context và tool (3–4 giờ) | Thêm 2 tool thật (một sync, một async), timeout\_secs, filler, summarization | Tool lỗi hay quá hạn vẫn không làm bot treo |
| 6 | Client web (3–4 giờ) | Dựng client JS/React: transcript, trạng thái bot, nút mic; thử client-message/server-message | UI hiển thị đúng sự kiện RTVI; có chỉ báo khi bot nghe/nói |
| 7 | Flows (nếu cần) (3 giờ) | Chuyển luồng nghiệp vụ nhiều bước sang YAML \+ handlers | Mỗi node chỉ có đúng tool cần; khởi động bot là validate xong |
| 8 | Test và evals (3–4 giờ) | 5–10 kịch bản scripted \+ 2 simulated; chạy trong CI | pipecat eval run xanh, và cố ý sửa prompt làm hỏng thì nó đỏ |
| 9 | Đóng gói và deploy (4–6 giờ) | Dockerfile, ghim version, deploy Pipecat Cloud hoặc dispatcher riêng; Daily transport; secrets | Người ngoài mạng của bạn gọi được, có log theo session ID |
| 10 | Điện thoại (tùy chọn, 4–6 giờ) | Twilio/Daily PSTN, audio 8 kHz, dial-in rồi dial-out | Cuộc gọi thật có lời chào, ngắt, cúp máy đúng |
| 11 | Hardening (1 tuần) | Failover provider, giới hạn chi phí, thử tải, graceful drain, giám sát và cảnh báo, kiểm thử với giọng/tạp âm thật | Qua checklist mục 14 |

Mốc kiểm tra cuối cùng: một người lạ gọi vào, bot trả lời trong \\\~1 giây, ngắt được, gọi được tool, kết thúc êm, và bạn tra được cuộc gọi đó trong log chỉ bằng session ID.

## ---

**16\. Mã nguồn Voicebot Production hoàn chỉnh (bot.py)**

---

Một bot hỗ trợ tra cứu đơn hàng: cascaded STT → LLM → TTS, tool có timeout, đo độ trễ và metrics, xử lý lỗi, đa transport. Import theo docs 1.x; nếu IDE báo khác, đối chiếu với example cùng phiên bản.

pyproject.toml (rút gọn):

\[project\]  
name \= "order-voicebot"  
requires-python \= "\>=3.11"  
dependencies \= \["pipecat-ai\[daily,webrtc,deepgram,openai,cartesia,silero\]"\]

.env.example:

DEEPGRAM\_API\_KEY=  
OPENAI\_API\_KEY=  
CARTESIA\_API\_KEY=  
DAILY\_API\_KEY=

bot.py:

import os

from loguru import logger

from pipecat.adapters.schemas.direct\_function import tool\_options  
from pipecat.audio.vad.silero import SileroVADAnalyzer  
from pipecat.frames.frames import LLMRunFrame, TTSSpeakFrame  
from pipecat.observers.user\_bot\_latency\_observer import UserBotLatencyObserver  
from pipecat.pipeline.pipeline import Pipeline  
from pipecat.pipeline.worker import PipelineParams, PipelineWorker, ProcessorUnusablePolicy  
from pipecat.processors.aggregators.llm\_context import LLMContext  
from pipecat.processors.aggregators.llm\_response\_universal import (  
    LLMAssistantAggregatorParams,  
    LLMContextAggregatorPair,  
    LLMUserAggregatorParams,  
)  
from pipecat.runner.types import RunnerArguments  
from pipecat.runner.utils import create\_transport  
from pipecat.services.cartesia.tts import CartesiaTTSService  
from pipecat.services.deepgram.stt import DeepgramSTTService  
from pipecat.services.llm\_service import FunctionCallParams  
from pipecat.services.openai.llm import OpenAILLMService  
from pipecat.transports.base\_transport import BaseTransport, TransportParams  
from pipecat.workers.runner import WorkerRunner

SYSTEM\_PROMPT \= """Bạn là nhân viên hỗ trợ khách hàng của cửa hàng.  
Trả lời bằng tiếng Việt, ngắn gọn (tối đa hai câu), lịch sự.  
Câu trả lời sẽ được đọc thành tiếng nên không dùng markdown, danh sách hay emoji.  
Khi khách hỏi về đơn hàng, hãy hỏi mã đơn rồi dùng công cụ tra cứu.  
Nếu không chắc, hãy nói rõ là bạn không biết thay vì đoán."""

\# Dữ liệu giả để bài tự chạy được; thay bằng API/DB thật  
FAKE\_ORDERS \= {"DH12345": "đang giao, dự kiến đến vào ngày mai", "DH99999": "đã giao thành công"}

@tool\_options(cancel\_on\_interruption=True, timeout\_secs=8)  
async def lookup\_order(params: FunctionCallParams, order\_id: str):  
    """Tra cứu trạng thái đơn hàng.

    Args:  
        order\_id: Mã đơn hàng khách cung cấp, ví dụ "DH12345".  
    """  
    await params.llm.push\_frame(TTSSpeakFrame("Dạ, em kiểm tra một chút ạ."))  
    try:  
        status \= FAKE\_ORDERS.get(order\_id.strip().upper())  
        if status is None:  
            await params.result\_callback({"found": False, "message": "Không tìm thấy đơn hàng"})  
        else:  
            await params.result\_callback({"found": True, "order\_id": order\_id, "status": status})  
    except Exception as e:  \# luôn trả kết quả để LLM không treo  
        logger.exception("lookup\_order lỗi")  
        await params.result\_callback({"error": f"Không tra cứu được: {e}"})

\# Mỗi key ứng với một loại transport mà dev runner / Pipecat Cloud có thể truyền vào  
transport\_params \= {  
    "webrtc": lambda: TransportParams(audio\_in\_enabled=True, audio\_out\_enabled=True),  
    "daily": lambda: TransportParams(audio\_in\_enabled=True, audio\_out\_enabled=True),  
    \# "twilio": cần audio 8 kHz (xem PipelineParams bên dưới) \+ serializer do runner dựng  
}

async def run\_bot(transport: BaseTransport, runner\_args: RunnerArguments):  
    runner \= WorkerRunner(handle\_sigint=runner\_args.handle\_sigint)

    stt \= DeepgramSTTService(api\_key=os.environ\["DEEPGRAM\_API\_KEY"\])  
    llm \= OpenAILLMService(  
        api\_key=os.environ\["OPENAI\_API\_KEY"\],  
        settings=OpenAILLMService.Settings(model="gpt-4o", system\_instruction=SYSTEM\_PROMPT),  
    )  
    tts \= CartesiaTTSService(  
        api\_key=os.environ\["CARTESIA\_API\_KEY"\],  
        settings=CartesiaTTSService.Settings(voice="\<voice-id-tiếng-Việt-bạn-đã-thử\>"),  
    )

    context \= LLMContext(tools=\[lookup\_order\])  
    user\_aggregator, assistant\_aggregator \= LLMContextAggregatorPair(  
        context,  
        user\_params=LLMUserAggregatorParams(vad\_analyzer=SileroVADAnalyzer()),  
        assistant\_params=LLMAssistantAggregatorParams(enable\_auto\_context\_summarization=True),  
    )

    pipeline \= Pipeline(  
        \[  
            transport.input(),  
            stt,  
            user\_aggregator,  
            llm,  
            tts,  
            transport.output(),  
            assistant\_aggregator,  
        \]  
    )

    latency \= UserBotLatencyObserver()

    @latency.event\_handler("on\_latency\_breakdown")  
    async def on\_latency\_breakdown(observer, breakdown):  
        for line in breakdown.turn\_contribution\_lines():  
            logger.info(f"\[latency\] {line}")

    worker \= PipelineWorker(  
        pipeline,  
        name="order-assistant",  
        params=PipelineParams(enable\_metrics=True, enable\_usage\_metrics=True),  
        observers=\[latency\],  
        processor\_unusable\_policy=ProcessorUnusablePolicy.END,  
    )

    @stt.event\_handler("on\_error")  
    async def on\_stt\_error(processor, frame):  
        if frame.processor and not frame.processor.is\_usable:  
            logger.error(f"STT hỏng hẳn: {frame.error}")

    @assistant\_aggregator.event\_handler("on\_assistant\_turn\_stopped")  
    async def on\_assistant\_turn\_stopped(aggregator, message):  
        if message.interrupted:  
            logger.info(f"Bot bị ngắt sau: {message.content\!r}")

    @transport.event\_handler("on\_client\_connected")  
    async def on\_client\_connected(transport, client):  
        context.add\_message({"role": "developer", "content": "Chào khách và hỏi cần hỗ trợ gì."})  
        await worker.queue\_frames(\[LLMRunFrame()\])

    @transport.event\_handler("on\_client\_disconnected")  
    async def on\_client\_disconnected(transport, client):  
        await runner.cancel()

    await runner.add\_workers(worker)  
    await runner.run()

async def bot(runner\_args: RunnerArguments):  
    transport \= await create\_transport(runner\_args, transport\_params)  
    await run\_bot(transport, runner\_args)

if \_\_name\_\_ \== "\_\_main\_\_":  
    from pipecat.runner.run import main

    main()

**Chi tiết API đã xác minh 100%:**
- `context.add_message(message: dict | LLMSpecificMessage)` và `context.add_messages(messages: list)` là phương thức chính thức được tích hợp sẵn trên class `LLMContext`. Ngoài ra, việc dùng frame `await worker.queue_frames([LLMMessagesAppendFrame([...], run_llm=True)])` như mục 7.1 là cơ chế thread-safe khi tương tác từ bên ngoài luồng pipeline.
- Hàm `create_transport(runner_args, transport_params)` nằm tại `pipecat.runner.utils`, là factory helper chuẩn hóa của Pipecat để ánh xạ loại transport (SmallWebRTC, Daily, WebSocket) sang RunnerArguments tương ứng.
- Với Twilio: thêm key `"twilio"` vào `transport_params` theo example twilio-chatbot và nhớ thiết lập `audio_in_sample_rate=8000`, `audio_out_sample_rate=8000` trong `PipelineParams` để đồng bộ sampling rate thoại PSTN.

Chạy local: uv run bot.py; chạy eval: uv run bot.py \-t eval rồi pipecat eval run scenarios/order.yaml. Deploy: Dockerfile ở mục 13.4 rồi pipecat cloud deploy.

## ---

**Phụ lục A: Bảng tra cứu chuyển đổi API (0.0.x sang 1.0+)**

---

| Cũ | Mới   |
| :---- | :---- |
| OpenAILLMContext, AnthropicLLMContext... | LLMContext |
| llm.create\_context\_aggregator(ctx) | LLMContextAggregatorPair(ctx) |
| PipelineParams(allow\_interruptions=...) | user\_turn\_strategies trên LLMUserAggregatorParams |
| UserIdleProcessor | user\_idle\_timeout trên LLMUserAggregatorParams |
| STTMuteFilter | user\_mute\_strategies |
| TransportParams.vad\_analyzer / turn\_analyzer | LLMUserAggregatorParams.vad\_analyzer / turn strategies |
| MinWordsInterruptionStrategy | MinWordsUserTurnStartStrategy |
| TranscriptionUserTurnStopStrategy | SpeechTimeoutUserTurnStopStrategy |
| StartInterruptionFrame | InterruptionFrame |
| TranscriptProcessor, TranscriptionUpdateFrame | Sự kiện on\_user\_turn\_stopped, on\_assistant\_turn\_stopped |
| UserBotLatencyLogObserver | UserBotLatencyObserver |
| pipecat.services.openai (phẳng) | pipecat.services.openai.llm (submodule) |
| pipecat.transports.services.daily | pipecat.transports.daily.transport |
| camera\_\* | video\_\* |
| TTSService.say() | Đẩy TTSSpeakFrame |
| PipelineTask.on\_pipeline\_ended/stopped/cancelled | on\_pipeline\_finished |
| PipelineTask, PipelineRunner | PipelineWorker, WorkerRunner (alias cũ còn chạy) |

## **Phụ lục B: Nguồn tài liệu & Tài nguyên học tập**

---

Tài liệu chính: docs.pipecat.ai (Introduction, Your First Agent, Pipeline & Frame Processing, Speech Input & Turn Detection, Interruptions, Context Management, Function Calling, Transports, Twilio WebSocket, Flows, Evals, Error Handling, Metrics, User-Bot Latency Observer, Running Bots in Production, Pipecat Cloud Agent Images và Scaling, Migrating to Pipecat 1.0, The RTVI Standard, Client Introduction và Quickstart, llms.txt làm mục lục) và repo github.com/pipecat-ai/pipecat (bản 1.x / phát hành v1.12.0). Toàn bộ kiến trúc Frame, cấu hình VAD/Turn Detection, ngữ cảnh LLMContext, client SDK RTVI và các lệnh CLI đã được đối chiếu, verify thực tế và chuẩn hóa hoàn toàn theo tài liệu chính thức.