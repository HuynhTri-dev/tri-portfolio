-- Clean reset and populate for Cloudflare D1

DROP TRIGGER IF EXISTS articles_ai;
DROP TRIGGER IF EXISTS articles_ad;
DROP TRIGGER IF EXISTS articles_au;
DROP TRIGGER IF EXISTS kb_problems_ai;
DROP TRIGGER IF EXISTS kb_problems_ad;
DROP TRIGGER IF EXISTS kb_problems_au;
DROP TRIGGER IF EXISTS sections_ai;
DROP TRIGGER IF EXISTS sections_ad;
DROP TRIGGER IF EXISTS sections_au;
DROP TABLE IF EXISTS articles_fts;
DROP TABLE IF EXISTS kb_problems_fts;
DROP TABLE IF EXISTS sections_fts;

DELETE FROM articles;
DELETE FROM article_sections;
DELETE FROM kb_problems;
INSERT INTO articles (id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt, hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents, summary_for_agents, raw_markdown, raw_content, file_path, created_at, updated_at, source, search_text) VALUES ('building-omnimer-health', 'building-omnimer-health', 'Building Omnimer Health: từ dữ liệu wearable đến một AI agent an toàn', 'Cách tôi thiết kế pipeline thời gian thực, baseline cá nhân hóa và HybridRAG agent cho một nền tảng quản lý sức khỏe cá nhân.', '2026-07-29T00:00:00.000Z', '2026-10-10T15:18:14.317Z', '/projects/omnimerhealth_web.jpg', 'OmniMer Health Architecture and Interface', '["AgenticAI","FastAPI","HybridRAG","HealthTech"]', '[]', 0, 1, 'general', '["claude","cursor","codex","anti"]', 'Cách tôi thiết kế pipeline thời gian thực, baseline cá nhân hóa và HybridRAG agent cho một nền tảng quản lý sức khỏe cá nhân.', '
## Bài toán tôi muốn giải quyết

Dữ liệu sức khỏe từ wearable không chỉ là một chuỗi con số. Nhịp tim 95 BPM có thể bình thường với một người đang vận động, nhưng lại là tín hiệu đáng chú ý nếu baseline nghỉ ngơi của họ thường ở mức thấp hơn nhiều.

Vì vậy, mục tiêu của Omnimer không phải là đưa ra một ngưỡng chung cho tất cả mọi người. Tôi muốn xây dựng một hệ thống có thể:

- tiếp nhận luồng dữ liệu biometric theo thời gian thực;
- học baseline riêng của từng người;
- phát hiện các thay đổi có ý nghĩa;
- và giúp người dùng hiểu dữ liệu bằng một AI agent có lớp bảo vệ an toàn.

> Một hệ thống sức khỏe hữu ích phải hiểu bối cảnh cá nhân trước khi cố gắng đưa ra câu trả lời.

## Kiến trúc tổng thể

Pipeline backend được chia thành những trách nhiệm rõ ràng. **Kafka** tiếp nhận event từ wearable, các service **FastAPI** xử lý nghiệp vụ, **Redis** giữ trạng thái có độ trễ thấp, còn dữ liệu truy xuất được phân bổ giữa **Qdrant** và **Neo4j**.

![Sơ đồ và giao diện dự án Omnimer Health](/og.png)

Luồng xử lý chính:

1. Wearable gửi biometric event vào Kafka.
2. Service xử lý cập nhật baseline và đánh giá anomaly.
3. Dữ liệu liên quan được lưu vào operational store, vector store và knowledge graph.
4. LangGraph agent lập kế hoạch truy xuất và gọi công cụ.
5. Safety layer kiểm tra các tình huống có rủi ro cao trước khi tạo phản hồi cuối.

## Baseline cá nhân hóa

Thay vì lưu toàn bộ lịch sử chỉ để tính lại trung bình và độ lệch chuẩn, tôi sử dụng **Welford’s online algorithm**. Thuật toán này cập nhật thống kê theo từng event với bộ nhớ cố định:

```python
count += 1
delta = value - mean
mean += delta / count
delta_2 = value - mean
m2 += delta * delta_2
```

Từ baseline đó, Z-score giúp biểu diễn mức độ khác thường của tín hiệu đối với chính người dùng đang được theo dõi.

## Vì sao cần HybridRAG

Một vector index rất mạnh khi tìm nội dung gần nhau về ngữ nghĩa, nhưng có thể bỏ qua thuật ngữ chính xác hoặc mối quan hệ giữa các thực thể. Omnimer kết hợp ba nguồn:

- dense retrieval cho semantic similarity;
- sparse retrieval cho keyword và thuật ngữ chính xác;
- graph traversal cho các quan hệ sức khỏe được kết nối.

Kết quả được hợp nhất trước khi agent tạo câu trả lời. Cách tiếp cận này giúp evidence đa dạng hơn và giảm việc phụ thuộc vào một kiểu truy xuất duy nhất.

## Evaluation là một phần của sản phẩm

Tôi xây dựng bộ benchmark gồm 100 câu hỏi và 20 tình huống có rủi ro cao. Hệ thống đạt:

- **0.85** answer relevancy;
- **0.78** faithfulness;
- **90%** safety recall.

Các con số không có nghĩa hệ thống đã hoàn hảo. Chúng tạo ra một baseline đo lường để mọi thay đổi sau này đều có thể được so sánh thay vì đánh giá bằng cảm giác.

## Bài học quan trọng

Điều khó nhất không phải là ghép nhiều công nghệ vào cùng một repository. Thách thức thật sự là xác định ranh giới trách nhiệm: dữ liệu nào cần xử lý ngay, dữ liệu nào phục vụ truy xuất, agent được phép làm gì và khi nào hệ thống phải dừng lại để ưu tiên an toàn.

Đây cũng là hướng tôi muốn tiếp tục ghi lại trong Blog: không chỉ sản phẩm cuối cùng trông như thế nào, mà cả những quyết định kỹ thuật đã tạo nên nó.
', '---
title: ''Building Omnimer Health: từ dữ liệu wearable đến một AI agent an toàn''
description: >-
  Cách tôi thiết kế pipeline thời gian thực, baseline cá nhân hóa và HybridRAG
  agent cho một nền tảng quản lý sức khỏe cá nhân.
pubDate: ''2026-07-29T00:00:00.000Z''
updatedDate: ''2026-10-10T15:18:14.317Z''
thumbnail: /projects/omnimerhealth_web.jpg
thumbnailAlt: OmniMer Health Architecture and Interface
hashtags:
  - AgenticAI
  - FastAPI
  - HybridRAG
  - HealthTech
draft: false
isKnowledgeBase: true
kbCategory: general
targetAgents:
  - claude
  - cursor
  - codex
  - anti
summaryForAgents: >-
  Cách tôi thiết kế pipeline thời gian thực, baseline cá nhân hóa và HybridRAG
  agent cho một nền tảng quản lý sức khỏe cá nhân.
---

## Bài toán tôi muốn giải quyết

Dữ liệu sức khỏe từ wearable không chỉ là một chuỗi con số. Nhịp tim 95 BPM có thể bình thường với một người đang vận động, nhưng lại là tín hiệu đáng chú ý nếu baseline nghỉ ngơi của họ thường ở mức thấp hơn nhiều.

Vì vậy, mục tiêu của Omnimer không phải là đưa ra một ngưỡng chung cho tất cả mọi người. Tôi muốn xây dựng một hệ thống có thể:

- tiếp nhận luồng dữ liệu biometric theo thời gian thực;
- học baseline riêng của từng người;
- phát hiện các thay đổi có ý nghĩa;
- và giúp người dùng hiểu dữ liệu bằng một AI agent có lớp bảo vệ an toàn.

> Một hệ thống sức khỏe hữu ích phải hiểu bối cảnh cá nhân trước khi cố gắng đưa ra câu trả lời.

## Kiến trúc tổng thể

Pipeline backend được chia thành những trách nhiệm rõ ràng. **Kafka** tiếp nhận event từ wearable, các service **FastAPI** xử lý nghiệp vụ, **Redis** giữ trạng thái có độ trễ thấp, còn dữ liệu truy xuất được phân bổ giữa **Qdrant** và **Neo4j**.

![Sơ đồ và giao diện dự án Omnimer Health](/og.png)

Luồng xử lý chính:

1. Wearable gửi biometric event vào Kafka.
2. Service xử lý cập nhật baseline và đánh giá anomaly.
3. Dữ liệu liên quan được lưu vào operational store, vector store và knowledge graph.
4. LangGraph agent lập kế hoạch truy xuất và gọi công cụ.
5. Safety layer kiểm tra các tình huống có rủi ro cao trước khi tạo phản hồi cuối.

## Baseline cá nhân hóa

Thay vì lưu toàn bộ lịch sử chỉ để tính lại trung bình và độ lệch chuẩn, tôi sử dụng **Welford’s online algorithm**. Thuật toán này cập nhật thống kê theo từng event với bộ nhớ cố định:

```python
count += 1
delta = value - mean
mean += delta / count
delta_2 = value - mean
m2 += delta * delta_2
```

Từ baseline đó, Z-score giúp biểu diễn mức độ khác thường của tín hiệu đối với chính người dùng đang được theo dõi.

## Vì sao cần HybridRAG

Một vector index rất mạnh khi tìm nội dung gần nhau về ngữ nghĩa, nhưng có thể bỏ qua thuật ngữ chính xác hoặc mối quan hệ giữa các thực thể. Omnimer kết hợp ba nguồn:

- dense retrieval cho semantic similarity;
- sparse retrieval cho keyword và thuật ngữ chính xác;
- graph traversal cho các quan hệ sức khỏe được kết nối.

Kết quả được hợp nhất trước khi agent tạo câu trả lời. Cách tiếp cận này giúp evidence đa dạng hơn và giảm việc phụ thuộc vào một kiểu truy xuất duy nhất.

## Evaluation là một phần của sản phẩm

Tôi xây dựng bộ benchmark gồm 100 câu hỏi và 20 tình huống có rủi ro cao. Hệ thống đạt:

- **0.85** answer relevancy;
- **0.78** faithfulness;
- **90%** safety recall.

Các con số không có nghĩa hệ thống đã hoàn hảo. Chúng tạo ra một baseline đo lường để mọi thay đổi sau này đều có thể được so sánh thay vì đánh giá bằng cảm giác.

## Bài học quan trọng

Điều khó nhất không phải là ghép nhiều công nghệ vào cùng một repository. Thách thức thật sự là xác định ranh giới trách nhiệm: dữ liệu nào cần xử lý ngay, dữ liệu nào phục vụ truy xuất, agent được phép làm gì và khi nào hệ thống phải dừng lại để ưu tiên an toàn.

Đây cũng là hướng tôi muốn tiếp tục ghi lại trong Blog: không chỉ sản phẩm cuối cùng trông như thế nào, mà cả những quyết định kỹ thuật đã tạo nên nó.
', 'src/content/blog/building-omnimer-health.mdx', '2026-10-10 03:54:58', '2026-10-10 15:18:14', 'git', 'building omnimer health: tu du lieu wearable den mot ai agent an toan cach toi thiet ke pipeline thoi gian thuc, baseline ca nhan hoa va hybridrag agent cho mot nen tang quan ly suc khoe ca nhan. agenticai fastapi hybridrag healthtech cach toi thiet ke pipeline thoi gian thuc, baseline ca nhan hoa va hybridrag agent cho mot nen tang quan ly suc khoe ca nhan. 
## bai toan toi muon giai quyet

du lieu suc khoe tu wearable khong chi la mot chuoi con so. nhip tim 95 bpm co the binh thuong voi mot nguoi dang van dong, nhung lai la tin hieu dang chu y neu baseline nghi ngoi cua ho thuong o muc thap hon nhieu.

vi vay, muc tieu cua omnimer khong phai la dua ra mot nguong chung cho tat ca moi nguoi. toi muon xay dung mot he thong co the:

- tiep nhan luong du lieu biometric theo thoi gian thuc;
- hoc baseline rieng cua tung nguoi;
- phat hien cac thay doi co y nghia;
- va giup nguoi dung hieu du lieu bang mot ai agent co lop bao ve an toan.

> mot he thong suc khoe huu ich phai hieu boi canh ca nhan truoc khi co gang dua ra cau tra loi.

## kien truc tong the

pipeline backend duoc chia thanh nhung trach nhiem ro rang. **kafka** tiep nhan event tu wearable, cac service **fastapi** xu ly nghiep vu, **redis** giu trang thai co do tre thap, con du lieu truy xuat duoc phan bo giua **qdrant** va **neo4j**.

![so do va giao dien du an omnimer health](/og.png)

luong xu ly chinh:

1. wearable gui biometric event vao kafka.
2. service xu ly cap nhat baseline va danh gia anomaly.
3. du lieu lien quan duoc luu vao operational store, vector store va knowledge graph.
4. langgraph agent lap ke hoach truy xuat va goi cong cu.
5. safety layer kiem tra cac tinh huong co rui ro cao truoc khi tao phan hoi cuoi.

## baseline ca nhan hoa

thay vi luu toan bo lich su chi de tinh lai trung binh va do lech chuan, toi su dung **welford’s online algorithm**. thuat toan nay cap nhat thong ke theo tung event voi bo nho co dinh:

```python
count += 1
delta = value - mean
mean += delta / count
delta_2 = value - mean
m2 += delta * delta_2
```

tu baseline do, z-score giup bieu dien muc do khac thuong cua tin hieu doi voi chinh nguoi dung dang duoc theo doi.

## vi sao can hybridrag

mot vector index rat manh khi tim noi dung gan nhau ve ngu nghia, nhung co the bo qua thuat ngu chinh xac hoac moi quan he giua cac thuc the. omnimer ket hop ba nguon:

- dense retrieval cho semantic similarity;
- sparse retrieval cho keyword va thuat ngu chinh xac;
- graph traversal cho cac quan he suc khoe duoc ket noi.

ket qua duoc hop nhat truoc khi agent tao cau tra loi. cach tiep can nay giup evidence da dang hon va giam viec phu thuoc vao mot kieu truy xuat duy nhat.

## evaluation la mot phan cua san pham

toi xay dung bo benchmark gom 100 cau hoi va 20 tinh huong co rui ro cao. he thong dat:

- **0.85** answer relevancy;
- **0.78** faithfulness;
- **90%** safety recall.

cac con so khong co nghia he thong da hoan hao. chung tao ra mot baseline do luong de moi thay doi sau nay deu co the duoc so sanh thay vi danh gia bang cam giac.

## bai hoc quan trong

dieu kho nhat khong phai la ghep nhieu cong nghe vao cung mot repository. thach thuc that su la xac dinh ranh gioi trach nhiem: du lieu nao can xu ly ngay, du lieu nao phuc vu truy xuat, agent duoc phep lam gi va khi nao he thong phai dung lai de uu tien an toan.

day cung la huong toi muon tiep tuc ghi lai trong blog: khong chi san pham cuoi cung trong nhu the nao, ma ca nhung quyet dinh ky thuat da tao nen no.
');
INSERT INTO articles (id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt, hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents, summary_for_agents, raw_markdown, raw_content, file_path, created_at, updated_at, source, search_text) VALUES ('finance-analysis', 'finance-analysis', 'AI Finance Pro: The Future of Smart Financial & Stock Analysis', 'Discover how AI Finance Pro reduces stock research time from 45 minutes to just 2 minutes using privacy-first local AI and quantitative risk assessment.', '2026-09-04T00:00:00.000Z', '2026-10-10T15:18:14.354Z', '/finance_analysis/1.png', 'AI Finance Pro Dashboard', '["Fintech","AI","Product","Engineering"]', '["AI-powered financial analysis tool","AI stock screener","Private LLM for financial data","Automated financial statement analysis","Local AI for financial analysis","Phân tích tài chính AI","Phần mềm chứng khoán AI","Đọc báo cáo tài chính bằng AI","Công cụ lọc cổ phiếu AI","Local LLM tài chính","Stock","Tài chính thông minh","Tìm kiếm cổ phiếu ngon","Data Finance"]', 0, 1, 'general', '["claude","cursor","codex","anti"]', 'Discover how AI Finance Pro reduces stock research time from 45 minutes to just 2 minutes using privacy-first local AI and quantitative risk assessment.', '
## The Wall Street Dilemma: Data Overload & Emotional Trading

The stock market is a battlefield where cold, hard numbers constantly clash with human emotion. For retail investors and financial analysts alike, evaluating a single investment opportunity often turns into an exhausting marathon:
* Endlessly scrolling through fragmented news feeds and macro updates.
* Painstakingly reading and manually extracting data from 100-page PDF financial statements (10-K, 10-Q).
* Context-switching between multiple complex charting platforms.
* Ultimately, falling prey to emotional trading—buying into FOMO at the peak or panic-selling at the bottom.

Recognizing this massive inefficiency, I set out to build **AI Finance Pro**—an enterprise-grade, automated financial analysis workspace designed to unify every essential tool into one seamless, distraction-free Single Page Application (SPA).

## Enter AI Finance Pro: Your Unfair Market Advantage

**AI Finance Pro** is not just another stock tracker. It is a comprehensive platform that marries the precision of quantitative technical data, the depth of automated PDF financial statement extraction, and the reasoning capabilities of local Artificial Intelligence.

> The result? The average research time required per stock plummets from **~45 minutes to under 2 minutes**. More importantly, it provides a 100% objective, emotion-free risk scoring system.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/1.png" alt="AI Finance Pro Dashboard" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 1: The Frictionless 3-Panel Workspace: Watchlist, Center Stage, and AI Copilot</p>
</div>

### Breakthrough Features That Change How You Invest

1. **Advanced PDF Parsing & AI Copilot:** Drop in any company earnings release (`.pdf`). Our advanced parsing engine (powered by Docling) perfectly preserves complex structures like Balance Sheets and Income Statements. You can then interrogate the document using the AI Copilot. Ask, *"Why did short-term debt spike in Q3?"* and get an instant answer with exact citations.
2. **Quantitative Risk Engine (`BUY_RISK` / `SELL_RISK`):** Stop guessing. Our automated risk engine measures the probability of FOMO traps by analyzing bearish RSI divergences (`MOM_BEAR_DIV`) and abnormal volume surges. It also warns you when selling pressure is exhausted, preventing panic selling at the market bottom.
3. **Piotroski F-Score (9-Criteria Health Matrix):** Perform a lightning-fast fundamental health audit of any business across three pillars: Profitability, Leverage & Liquidity, and Operating Efficiency.
4. **Professional Interactive Charting:** Fully equipped with technical overlays (MA20, MA50, Bollinger Bands) and real-time market momentum indicators—all without leaving the app.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/2.png" alt="Conversational AI Copilot" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 2: The Conversational AI Copilot extracting precise insights from uploaded financial PDFs.</p>
</div>

## The Architecture: Privacy-First & Bank-Grade Security

In the world of finance, data privacy is paramount. Sending sensitive financial documents to public cloud APIs (like OpenAI or Anthropic) is often a dealbreaker for institutions and cautious investors.

That is why AI Finance Pro is built with a **Privacy-First Architecture**:
* **100% Local Inference:** All AI reasoning and PDF extraction are processed entirely on your local machine using **Ollama** (Llama 3.1 / Qwen 2.5). Your financial data never leaves your device.
* **Deterministic Financial Extractions:** Metrics are extracted directly from tables with structural integrity—meaning zero "hallucinated" financial figures.
* **Strict No-Advice Mandate:** The AI is tightly constrained by system guardrails. It delivers risk probabilities and factual analysis only, ensuring it never provides speculative or emotional buy/sell commands.

The tech stack is built for speed and reliability, featuring **Next.js** for a highly responsive frontend, **FastAPI** for a robust backend core, and **PostgreSQL (Neon Serverless)** coupled with `vnstock` for real-time market data ingestion.

## Experience It Yourself

Are you ready to optimize your financial research and leave emotional trading behind? AI Finance Pro is completely open-source, serving as a powerful reference architecture for the community to explore the intersection of Generative AI and Fintech.

👉 **Explore and clone the source code on GitHub:**
[HuynhTri-dev/finance-analysis](https://github.com/HuynhTri-dev/finance-analysis.git)

If you find this project valuable for your work or as inspiration for your own AI applications, I''d deeply appreciate a Star ⭐️ on the repository!

## Related Links & References
- [Read the full AI Finance Pro Project Showcase](/projects/finance-analysis)
- [View all my projects](/projects)
', '---
title: ''AI Finance Pro: The Future of Smart Financial & Stock Analysis''
description: >-
  Discover how AI Finance Pro reduces stock research time from 45 minutes to
  just 2 minutes using privacy-first local AI and quantitative risk assessment.
pubDate: ''2026-09-04T00:00:00.000Z''
updatedDate: ''2026-10-10T15:18:14.354Z''
thumbnail: /finance_analysis/1.png
thumbnailAlt: AI Finance Pro Dashboard
hashtags:
  - Fintech
  - AI
  - Product
  - Engineering
draft: false
isKnowledgeBase: true
kbCategory: general
targetAgents:
  - claude
  - cursor
  - codex
  - anti
seoKeywords:
  - AI-powered financial analysis tool
  - AI stock screener
  - Private LLM for financial data
  - Automated financial statement analysis
  - Local AI for financial analysis
  - Phân tích tài chính AI
  - Phần mềm chứng khoán AI
  - Đọc báo cáo tài chính bằng AI
  - Công cụ lọc cổ phiếu AI
  - Local LLM tài chính
  - Stock
  - Tài chính thông minh
  - Tìm kiếm cổ phiếu ngon
  - Data Finance
summaryForAgents: >-
  Discover how AI Finance Pro reduces stock research time from 45 minutes to
  just 2 minutes using privacy-first local AI and quantitative risk assessment.
---

## The Wall Street Dilemma: Data Overload & Emotional Trading

The stock market is a battlefield where cold, hard numbers constantly clash with human emotion. For retail investors and financial analysts alike, evaluating a single investment opportunity often turns into an exhausting marathon:
* Endlessly scrolling through fragmented news feeds and macro updates.
* Painstakingly reading and manually extracting data from 100-page PDF financial statements (10-K, 10-Q).
* Context-switching between multiple complex charting platforms.
* Ultimately, falling prey to emotional trading—buying into FOMO at the peak or panic-selling at the bottom.

Recognizing this massive inefficiency, I set out to build **AI Finance Pro**—an enterprise-grade, automated financial analysis workspace designed to unify every essential tool into one seamless, distraction-free Single Page Application (SPA).

## Enter AI Finance Pro: Your Unfair Market Advantage

**AI Finance Pro** is not just another stock tracker. It is a comprehensive platform that marries the precision of quantitative technical data, the depth of automated PDF financial statement extraction, and the reasoning capabilities of local Artificial Intelligence.

> The result? The average research time required per stock plummets from **~45 minutes to under 2 minutes**. More importantly, it provides a 100% objective, emotion-free risk scoring system.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/1.png" alt="AI Finance Pro Dashboard" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 1: The Frictionless 3-Panel Workspace: Watchlist, Center Stage, and AI Copilot</p>
</div>

### Breakthrough Features That Change How You Invest

1. **Advanced PDF Parsing & AI Copilot:** Drop in any company earnings release (`.pdf`). Our advanced parsing engine (powered by Docling) perfectly preserves complex structures like Balance Sheets and Income Statements. You can then interrogate the document using the AI Copilot. Ask, *"Why did short-term debt spike in Q3?"* and get an instant answer with exact citations.
2. **Quantitative Risk Engine (`BUY_RISK` / `SELL_RISK`):** Stop guessing. Our automated risk engine measures the probability of FOMO traps by analyzing bearish RSI divergences (`MOM_BEAR_DIV`) and abnormal volume surges. It also warns you when selling pressure is exhausted, preventing panic selling at the market bottom.
3. **Piotroski F-Score (9-Criteria Health Matrix):** Perform a lightning-fast fundamental health audit of any business across three pillars: Profitability, Leverage & Liquidity, and Operating Efficiency.
4. **Professional Interactive Charting:** Fully equipped with technical overlays (MA20, MA50, Bollinger Bands) and real-time market momentum indicators—all without leaving the app.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/2.png" alt="Conversational AI Copilot" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 2: The Conversational AI Copilot extracting precise insights from uploaded financial PDFs.</p>
</div>

## The Architecture: Privacy-First & Bank-Grade Security

In the world of finance, data privacy is paramount. Sending sensitive financial documents to public cloud APIs (like OpenAI or Anthropic) is often a dealbreaker for institutions and cautious investors.

That is why AI Finance Pro is built with a **Privacy-First Architecture**:
* **100% Local Inference:** All AI reasoning and PDF extraction are processed entirely on your local machine using **Ollama** (Llama 3.1 / Qwen 2.5). Your financial data never leaves your device.
* **Deterministic Financial Extractions:** Metrics are extracted directly from tables with structural integrity—meaning zero "hallucinated" financial figures.
* **Strict No-Advice Mandate:** The AI is tightly constrained by system guardrails. It delivers risk probabilities and factual analysis only, ensuring it never provides speculative or emotional buy/sell commands.

The tech stack is built for speed and reliability, featuring **Next.js** for a highly responsive frontend, **FastAPI** for a robust backend core, and **PostgreSQL (Neon Serverless)** coupled with `vnstock` for real-time market data ingestion.

## Experience It Yourself

Are you ready to optimize your financial research and leave emotional trading behind? AI Finance Pro is completely open-source, serving as a powerful reference architecture for the community to explore the intersection of Generative AI and Fintech.

👉 **Explore and clone the source code on GitHub:**
[HuynhTri-dev/finance-analysis](https://github.com/HuynhTri-dev/finance-analysis.git)

If you find this project valuable for your work or as inspiration for your own AI applications, I''d deeply appreciate a Star ⭐️ on the repository!

## Related Links & References
- [Read the full AI Finance Pro Project Showcase](/projects/finance-analysis)
- [View all my projects](/projects)
', 'src/content/blog/finance-analysis.mdx', '2026-10-10 03:54:58', '2026-10-10 15:18:14', 'git', 'ai finance pro: the future of smart financial & stock analysis discover how ai finance pro reduces stock research time from 45 minutes to just 2 minutes using privacy-first local ai and quantitative risk assessment. fintech ai product engineering discover how ai finance pro reduces stock research time from 45 minutes to just 2 minutes using privacy-first local ai and quantitative risk assessment. 
## the wall street dilemma: data overload & emotional trading

the stock market is a battlefield where cold, hard numbers constantly clash with human emotion. for retail investors and financial analysts alike, evaluating a single investment opportunity often turns into an exhausting marathon:
* endlessly scrolling through fragmented news feeds and macro updates.
* painstakingly reading and manually extracting data from 100-page pdf financial statements (10-k, 10-q).
* context-switching between multiple complex charting platforms.
* ultimately, falling prey to emotional trading—buying into fomo at the peak or panic-selling at the bottom.

recognizing this massive inefficiency, i set out to build **ai finance pro**—an enterprise-grade, automated financial analysis workspace designed to unify every essential tool into one seamless, distraction-free single page application (spa).

## enter ai finance pro: your unfair market advantage

**ai finance pro** is not just another stock tracker. it is a comprehensive platform that marries the precision of quantitative technical data, the depth of automated pdf financial statement extraction, and the reasoning capabilities of local artificial intelligence.

> the result? the average research time required per stock plummets from **~45 minutes to under 2 minutes**. more importantly, it provides a 100% objective, emotion-free risk scoring system.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/1.png" alt="ai finance pro dashboard" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">figure 1: the frictionless 3-panel workspace: watchlist, center stage, and ai copilot</p>
</div>

### breakthrough features that change how you invest

1. **advanced pdf parsing & ai copilot:** drop in any company earnings release (`.pdf`). our advanced parsing engine (powered by docling) perfectly preserves complex structures like balance sheets and income statements. you can then interrogate the document using the ai copilot. ask, *"why did short-term debt spike in q3?"* and get an instant answer with exact citations.
2. **quantitative risk engine (`buy_risk` / `sell_risk`):** stop guessing. our automated risk engine measures the probability of fomo traps by analyzing bearish rsi divergences (`mom_bear_div`) and abnormal volume surges. it also warns you when selling pressure is exhausted, preventing panic selling at the market bottom.
3. **piotroski f-score (9-criteria health matrix):** perform a lightning-fast fundamental health audit of any business across three pillars: profitability, leverage & liquidity, and operating efficiency.
4. **professional interactive charting:** fully equipped with technical overlays (ma20, ma50, bollinger bands) and real-time market momentum indicators—all without leaving the app.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/2.png" alt="conversational ai copilot" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">figure 2: the conversational ai copilot extracting precise insights from uploaded financial pdfs.</p>
</div>

## the architecture: privacy-first & bank-grade security

in the world of finance, data privacy is paramount. sending sensitive financial documents to public cloud apis (like openai or anthropic) is often a dealbreaker for institutions and cautious investors.

that is why ai finance pro is built with a **privacy-first architecture**:
* **100% local inference:** all ai reasoning and pdf extraction are processed entirely on your local machine using **ollama** (llama 3.1 / qwen 2.5). your financial data never leaves your device.
* **deterministic financial extractions:** metrics are extracted directly from tables with structural integrity—meaning zero "hallucinated" financial figures.
* **strict no-advice mandate:** the ai is tightly constrained by system guardrails. it delivers risk probabilities and factual analysis only, ensuring it never provides speculative or emotional buy/sell commands.

the tech stack is built for speed and reliability, featuring **next.js** for a highly responsive frontend, **fastapi** for a robust backend core, and **postgresql (neon serverless)** coupled with `vnstock` for real-time market data ingestion.

## experience it yourself

are you ready to optimize your financial research and leave emotional trading behind? ai finance pro is completely open-source, serving as a powerful reference architecture for the community to explore the intersection of generative ai and fintech.

👉 **explore and clone the source code on github:**
[huynhtri-dev/finance-analysis](https://github.com/huynhtri-dev/finance-analysis.git)

if you find this project valuable for your work or as inspiration for your own ai applications, i''d deeply appreciate a star ⭐️ on the repository!

## related links & references
- [read the full ai finance pro project showcase](/projects/finance-analysis)
- [view all my projects](/projects)
');
INSERT INTO articles (id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt, hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents, summary_for_agents, raw_markdown, raw_content, file_path, created_at, updated_at, source, search_text) VALUES ('post-template', 'post-template', 'Tiêu đề bài viết', 'Mô tả ngắn xuất hiện ở trang danh sách Blog và trong metadata.', '2026-07-29T00:00:00.000Z', '2026-10-10T15:18:14.375Z', '/images/blog/your-thumbnail.png', 'Mô tả nội dung ảnh thumbnail', '["Project","Engineering"]', '["SEO Keyword 1","SEO Keyword 2"]', 1, 1, 'general', '["claude","cursor","codex","anti"]', 'Mô tả ngắn xuất hiện ở trang danh sách Blog và trong metadata.', '
## Bối cảnh

Giới thiệu vấn đề, dự án hoặc ý tưởng bạn muốn chia sẻ. Việc sử dụng các thẻ Heading `##` (H2) sẽ tự động tạo Table of Contents (Mục lục) ở thanh điều hướng bên trái.

### Chi tiết vấn đề (H3)

Bạn có thể sử dụng `###` để tạo các mục con.

## Quyết định và cách triển khai

Nội dung chi tiết có thể sử dụng đầy đủ cú pháp Markdown/MDX:

- danh sách;
- **chữ in đậm**;
- [liên kết bài viết khác](/blog/ten-bai-viet);
- blockquote;
- và hình ảnh hoặc code.

### 1. MDX Image Box (Giao diện giống dự án OmniMer Health)

Bạn có thể sử dụng trực tiếp HTML và Tailwind CSS để tạo các box giao diện đẹp mắt ngay trong file `.mdx`:

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/images/blog/your-image.png" alt="Mô tả hình ảnh thiết kế" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Hình 1: Mô tả chi tiết cho hình ảnh</p>
</div>

### 2. Code Box

Khối code mặc định sẽ tự động được highlight cú pháp và có giao diện terminal dark theme:

```ts
// src/services/example.ts
export async function calculateMetrics(data: number[]) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}
```

> Đổi `draft: false` khi bài viết đã sẵn sàng xuất hiện trên website.

## Liên kết và Tham khảo

Bạn có thể dễ dàng viết liên kết trỏ về các bài viết khác hoặc các trang dự án:
- [Đọc thêm về hệ thống Agentic AI](/projects/omnimer-health)
- [Xem tất cả dự án](/projects)

## Bài học

Tóm tắt điều bạn rút ra và hướng phát triển tiếp theo.
', '---
title: Tiêu đề bài viết
description: Mô tả ngắn xuất hiện ở trang danh sách Blog và trong metadata.
pubDate: ''2026-07-29T00:00:00.000Z''
updatedDate: ''2026-10-10T15:18:14.375Z''
thumbnail: /images/blog/your-thumbnail.png
thumbnailAlt: Mô tả nội dung ảnh thumbnail
hashtags:
  - Project
  - Engineering
draft: true
isKnowledgeBase: true
kbCategory: general
targetAgents:
  - claude
  - cursor
  - codex
  - anti
seoKeywords:
  - SEO Keyword 1
  - SEO Keyword 2
summaryForAgents: Mô tả ngắn xuất hiện ở trang danh sách Blog và trong metadata.
---

## Bối cảnh

Giới thiệu vấn đề, dự án hoặc ý tưởng bạn muốn chia sẻ. Việc sử dụng các thẻ Heading `##` (H2) sẽ tự động tạo Table of Contents (Mục lục) ở thanh điều hướng bên trái.

### Chi tiết vấn đề (H3)

Bạn có thể sử dụng `###` để tạo các mục con.

## Quyết định và cách triển khai

Nội dung chi tiết có thể sử dụng đầy đủ cú pháp Markdown/MDX:

- danh sách;
- **chữ in đậm**;
- [liên kết bài viết khác](/blog/ten-bai-viet);
- blockquote;
- và hình ảnh hoặc code.

### 1. MDX Image Box (Giao diện giống dự án OmniMer Health)

Bạn có thể sử dụng trực tiếp HTML và Tailwind CSS để tạo các box giao diện đẹp mắt ngay trong file `.mdx`:

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/images/blog/your-image.png" alt="Mô tả hình ảnh thiết kế" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Hình 1: Mô tả chi tiết cho hình ảnh</p>
</div>

### 2. Code Box

Khối code mặc định sẽ tự động được highlight cú pháp và có giao diện terminal dark theme:

```ts
// src/services/example.ts
export async function calculateMetrics(data: number[]) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}
```

> Đổi `draft: false` khi bài viết đã sẵn sàng xuất hiện trên website.

## Liên kết và Tham khảo

Bạn có thể dễ dàng viết liên kết trỏ về các bài viết khác hoặc các trang dự án:
- [Đọc thêm về hệ thống Agentic AI](/projects/omnimer-health)
- [Xem tất cả dự án](/projects)

## Bài học

Tóm tắt điều bạn rút ra và hướng phát triển tiếp theo.
', 'src/content/blog/post-template.mdx', '2026-10-10 03:54:58', '2026-10-10 15:18:14', 'git', 'tieu de bai viet mo ta ngan xuat hien o trang danh sach blog va trong metadata. project engineering mo ta ngan xuat hien o trang danh sach blog va trong metadata. 
## boi canh

gioi thieu van de, du an hoac y tuong ban muon chia se. viec su dung cac the heading `##` (h2) se tu dong tao table of contents (muc luc) o thanh dieu huong ben trai.

### chi tiet van de (h3)

ban co the su dung `###` de tao cac muc con.

## quyet dinh va cach trien khai

noi dung chi tiet co the su dung day du cu phap markdown/mdx:

- danh sach;
- **chu in dam**;
- [lien ket bai viet khac](/blog/ten-bai-viet);
- blockquote;
- va hinh anh hoac code.

### 1. mdx image box (giao dien giong du an omnimer health)

ban co the su dung truc tiep html va tailwind css de tao cac box giao dien dep mat ngay trong file `.mdx`:

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/images/blog/your-image.png" alt="mo ta hinh anh thiet ke" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">hinh 1: mo ta chi tiet cho hinh anh</p>
</div>

### 2. code box

khoi code mac dinh se tu dong duoc highlight cu phap va co giao dien terminal dark theme:

```ts
// src/services/example.ts
export async function calculatemetrics(data: number[]) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}
```

> doi `draft: false` khi bai viet da san sang xuat hien tren website.

## lien ket va tham khao

ban co the de dang viet lien ket tro ve cac bai viet khac hoac cac trang du an:
- [doc them ve he thong agentic ai](/projects/omnimer-health)
- [xem tat ca du an](/projects)

## bai hoc

tom tat dieu ban rut ra va huong phat trien tiep theo.
');
INSERT INTO articles (id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt, hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents, summary_for_agents, raw_markdown, raw_content, file_path, created_at, updated_at, source, search_text) VALUES ('kafka-core-concepts-and-architecture', 'kafka-core-concepts-and-architecture', 'Toàn Tập Lý Thuyết Cốt Lõi Apache Kafka: Từ Nền Tảng Event Streaming Đến Kiến Trúc Phân Tán Thực Chiến', 'Cẩm nang chuyên sâu toàn diện về Apache Kafka (4.x/KRaft) và Redpanda: Bản chất Event Streaming, Topics, Partitions, Commit Log, Zero-Copy, Replication, Consumer Groups, Schema Evolution và 5 bài toán thực chiến thay thế Webhook.', '2026-10-10T00:00:00.000Z', '2026-10-10T15:18:14.358Z', '/images/blog/default.png', 'Kiến trúc cốt lõi Apache Kafka và Redpanda', '["ApacheKafka","EventStreaming","DistributedSystems","Redpanda","SystemArchitecture"]', '[]', 0, 1, 'architecture', '["claude","cursor","codex","anti"]', 'Comprehensive foundation and architecture guide for Apache Kafka and Redpanda. Covers event streaming fundamentals, append-only commit logs, sequential I/O, PageCache Zero-Copy, partition key hashing, replication factor with ISR and KRaft consensus, consumer group scaling limits, delivery semantics (at-most-once, at-least-once, exactly-once), schema evolution rules, and 5 real-world battle-tested scenarios comparing Webhooks vs Kafka.', '
## 1. Bản chất của Event Streaming: "Hệ thần kinh trung ương kỹ thuật số"

Theo tài liệu chính thức của Apache Kafka (*Kafka 4.x Documentation*), trong thế giới doanh nghiệp hiện đại định hướng bằng phần mềm và tự động hóa, **Event Streaming** đóng vai trò tương đương với **hệ thần kinh trung ương (Central Nervous System)** của cơ thể con người.

```mermaid
graph TD
    subgraph Sources["Nguồn Sinh Sự Kiện (Event Sources)"]
        DB[(Cơ sở dữ liệu CDC)]
        IoT[Thiết bị IoT / Sensors]
        PBX[Tổng đài PBX / Viễn thông]
        App[Ứng dụng Mobile / Web]
    end

    subgraph KafkaCore["Apache Kafka / Redpanda Cluster"]
        Broker1[Broker 01]
        Broker2[Broker 02]
        Broker3[Broker 03]
        Log[(Append-Only Commit Log<br/>Durable Storage)]
    end

    subgraph Destinations["Hệ Thống Tiêu Thụ (Consumers / Sinks)"]
        Analytics[(BI / Data Lakehouse)]
        CRM[Hệ thống CRM / ERP]
        AI[Voice AI / LLM Inference]
        Alert[Real-time Monitoring / Alert]
    end

    Sources -->|Publish Streams of Events| KafkaCore
    KafkaCore -->|Subscribe & Stream Real-time| Destinations
```

### 1.1. Định nghĩa kỹ thuật
**Event Streaming** là phương thức:
1. **Thu thập thời gian thực (Capture in real-time)** các dòng sự kiện từ nguồn phát sinh (database transactions, telemetry sensors, thiết bị di động, cloud services, ứng dụng nghiệp vụ).
2. **Lưu trữ bền vững (Durable storage)** các luồng sự kiện này theo cơ chế phân tán, đảm bảo tính sẵn sàng cao và không bị mất mát dữ liệu.
3. **Xử lý và phản hồi (Manipulate & react)** theo thời gian thực (real-time stream processing) cũng như truy hồi lịch sử (retrospective processing).
4. **Định tuyến linh hoạt (Route event streams)** đến các hạ tầng đích khi có nhu cầu mà không làm thay đổi tầng nguồn.

### 1.2. Ba trụ cột năng lực cốt lõi của Apache Kafka
Apache Kafka kết hợp 3 khả năng then chốt trong một nền tảng duy nhất:
* **Publish & Subscribe**: Ghi (publish) và đọc (subscribe) các dòng sự kiện với thông lượng hàng triệu message mỗi giây mà không gây nghẽn cổ chai.
* **Durable Storage**: Lưu trữ an toàn, tin cậy trên đĩa cứng trong thời gian tùy chọn (từ vài giờ, vài tuần cho đến vĩnh viễn), không xóa message ngay sau khi đọc.
* **Process in Real-time**: Khả năng phân tích, tổng hợp, biến đổi luồng dữ liệu liên tục ngay khi chúng phát sinh thông qua Kafka Streams API.

---

## 2. Mô hình Mental Model: Sổ cái kế toán vs Hàng đợi truyền thống

Để hiểu cặn kẽ Kafka ngay từ ngày đầu tiên, hãy xóa bỏ tư duy về các Message Queue truyền thống (như RabbitMQ, ActiveMQ) và chuyển sang tư duy **Sổ cái kế toán ghi nối tiếp (Append-Only Ledger)**:

```mermaid
graph LR
    subgraph TraditionalMQ["Message Queue Truyền Thống (RabbitMQ)"]
        Q[Hàng đợi Queue] -->|Lấy ra & XÓA BỎ| W1[Worker A]
        Q -.->|Đã bị xóa| W2[Worker B không đọc được nữa]
    end

    subgraph KafkaLog["Apache Kafka (Distributed Commit Log)"]
        L0[Offset 0] --> L1[Offset 1] --> L2[Offset 2] --> L3[Offset 3] --> L4[Offset 4]
        C1[Bookmark Group CRM: Offset 4]
        C2[Bookmark Group BI: Offset 2]
    end
```

| Đặc Điểm | Message Queue Truyền Thống (RabbitMQ / ActiveMQ) | Apache Kafka / Redpanda |
| :--- | :--- | :--- |
| **Bản chất lưu trữ** | Bộ nhớ tạm (Transient buffer) — Message bị **xóa ngay** sau khi Consumer xác nhận (ACK). | Cuốn sổ cái chỉ ghi thêm (**Append-only Commit Log**) — Message được lưu bền vững trên đĩa theo thời gian (`retention.ms`). |
| **Cơ chế đọc** | Broker chủ động đẩy message xuống Consumer (**Push model**). | Consumer chủ động kéo message theo tốc độ xử lý của mình (**Pull model**). |
| **Vị trí đọc (Offset)** | Do Broker theo dõi trong RAM; khó scale khi có hàng triệu queue. | Do Consumer tự quản lý (**Bookmarks**), lưu tại topic nội bộ `__consumer_offsets`. |
| **Đa người đọc** | Muốn nhiều service đọc cùng dữ liệu phải tạo Fanout Exchange và duplicate dữ liệu ra nhiều queue. | Nhiều Consumer Group độc lập cùng đọc chung 1 log duy nhất với tốc độ và vị trí riêng. |
| **Khả năng Replay** | **Không thể** — Đã lấy ra là mất vĩnh viễn. | **Cực kỳ dễ dàng** — Chỉ cần tua lại Offset (seek) để đọc lại dữ liệu 7 ngày trước. |

---

## 3. Cấu trúc một Sự Kiện (Event Anatomy)

Trong Kafka, một sự kiện (Event / Record) ghi lại một dữ kiện thực tế đã xảy ra trong thế giới thực hoặc hệ thống kinh doanh ("Something happened"):

```
+-----------------------------------------------------------------+
|                       KAFKA RECORD / EVENT                      |
+-----------------------------------------------------------------+
| Headers   | trace_id=xyz-123, env=production, app=mblife-pbx   |
+-----------+-----------------------------------------------------+
| Timestamp | 1759734000120 (Epoch milliseconds - CreateTime)    |
+-----------+-----------------------------------------------------+
| Key       | "1759734000.1" (Định danh logic: linkedid cuộc gọi) |
+-----------+-----------------------------------------------------+
| Value     | { "caller": "0912345678", "callee": "19001234", ... }|
+-----------------------------------------------------------------+
```

1. **Key (Khóa)**: Chuỗi byte tùy chọn dùng để xác định **Partition đích** thông qua thuật toán băm (Hashing). Tất cả message có cùng Key luôn rơi vào đúng một Partition duy nhất.
2. **Value (Giá trị)**: Payload nội dung nghiệp vụ (JSON, Avro, Protobuf, nhị phân).
3. **Timestamp (Dấu thời gian)**: Thời điểm sự kiện được tạo (`CreateTime`) hoặc thời điểm Broker tiếp nhận (`LogAppendTime`).
4. **Headers (Siêu dữ liệu)**: Cặp key-value tùy chọn chứa thông tin metadata như `trace_id` (OpenTelemetry), nguồn gốc tenant, chữ ký xác thực.

---

## 4. Topics và 3 Nguyên Lý Vàng Về Partition

### 4.1. Topic là gì?
Topic là đơn vị tổ chức logic của các dòng sự kiện (tương đương với một bảng trong Database hoặc một thư mục trên File System).
* **Quy ước đặt tên Topic chuẩn doanh nghiệp**:
  $$\text{<domain>}.\text{<subdomain>}.\text{<entity>}.\text{<version>}$$
  * Ví dụ viễn thông PBX: `mblife.pbx.cdr.v1` (bản ghi cước cuộc gọi), `mblife.pbx.call-insight.v1` (kết quả phân tích giọng nói).
* **Vì sao phải tách Topic thay vì gộp chung?**
  * **Khác biệt về SLA & Tần suất**: CDR sinh ra ngay tức thì (vài trăm bytes), trong khi Voice Insight cần xử lý AI mất 2-3 phút (hàng trăm KB).
  * **Chính sách Retention khác nhau**: CDR cần lưu trữ 90 ngày phục vụ đối soát cước phí, Insight chỉ cần lưu 7 ngày để đẩy vào Data Lake.

### 4.2. Partition: Đơn vị co giãn vật lý (Unit of Scalability)
Một Topic được chia thành nhiều lát cắt vật lý gọi là **Partition** nằm rải rác trên các Broker khác nhau:

```mermaid
graph TD
    subgraph Topic["Topic: mblife.pbx.cdr.v1 (3 Partitions)"]
        subgraph P0["Partition 0 (Broker 1)"]
            P0_0[Offset 0] --> P0_1[Offset 1] --> P0_2[Offset 2]
        end
        subgraph P1["Partition 1 (Broker 2)"]
            P1_0[Offset 0] --> P1_1[Offset 1] --> P1_2[Offset 2]
        end
        subgraph P2["Partition 2 (Broker 3)"]
            P2_0[Offset 0] --> P2_1[Offset 1] --> P2_2[Offset 2]
        end
    end

    Producer[Producer] -->|hash(key) % 3| Topic
```

### 3 NGUYÊN LÝ VÀNG BẮT BUỘC PHẢI THUỘC LÒNG:

#### 1. Thứ tự chỉ được đảm bảo TUYỆT ĐỐI trong CÙNG MỘT PARTITION
* Kafka **không bao giờ đảm bảo thứ tự toàn cục (Global Ordering)** trên toàn bộ Topic.
* Nếu cuộc gọi có 3 sự kiện: `DIALING` $\rightarrow$ `ANSWERED` $\rightarrow$ `HANGUP`, bạn **bắt buộc** phải đảm bảo cả 3 sự kiện này rơi vào cùng một partition. Nếu rơi vào 2 partition khác nhau, Consumer đọc song song có thể nhận `HANGUP` trước khi nhận `ANSWERED`.

#### 2. Key quyết định Partition
* Thuật toán mặc định: $\text{partition} = \text{murmur2}(\text{key}) \pmod{\text{total\_partitions}}$.
* Cùng một Key $\rightarrow$ Luôn vào cùng một Partition $\rightarrow$ Luôn giữ đúng thứ tự thời gian.
* **Không có Key (`key = null`)**: Kafka gửi ngẫu nhiên theo cơ chế Round-robin (hoặc Sticky Partitioning để tối ưu batching). Dữ liệu sẽ bị rải đều nhưng mất hoàn toàn thứ tự nghiệp vụ giữa các bản tin liên quan.

#### 3. Giới hạn song song của Consumer: $N_{consumer} \le N_{partitions}$
* Tại một thời điểm, **một partition chỉ được giao cho duy nhất một Consumer trong cùng một Consumer Group**.
* Nếu Topic có 3 Partitions:
  * 1 Consumer: Đọc cả 3 partitions (chậm).
  * 3 Consumers: Mỗi con đọc 1 partition (tối ưu tối đa thông lượng).
  * 4 Consumers: **Consumer thứ 4 sẽ ngồi chơi xơi nước (idle)**, chỉ hoạt động khi 1 trong 3 con kia bị chết (Failover).

```mermaid
graph LR
    subgraph TopicPartitions["Topic: 3 Partitions"]
        Part0[Partition 0]
        Part1[Partition 1]
        Part2[Partition 2]
    end

    subgraph ConsumerGroup["Consumer Group: 4 Consumers"]
        C1[Consumer 1]
        C2[Consumer 2]
        C3[Consumer 3]
        C4[Consumer 4: IDLE / STANDBY]
    end

    Part0 --> C1
    Part1 --> C2
    Part2 --> C3
    style C4 fill:#fbb,stroke:#d33,stroke-dasharray: 5 5
```

---

## 5. Offset và Cơ chế Consumer Group Độc Lập

### 5.1. Offset là gì?
Offset là số nguyên tăng dần liên tục $(0, 1, 2, 3...)$ gán cho mỗi message khi được ghi vào partition. Offset không bao giờ bị tái sử dụng. Nó đóng vai trò như **số trang sách (Bookmark)** để Consumer ghi nhớ mình đã đọc tới đâu.

### 5.2. Sự độc lập giữa các Consumer Group
Nhiều phòng ban hoặc dịch vụ khác nhau có thể đọc cùng một Topic mà không ảnh hưởng tới nhau:

```mermaid
graph TD
    Topic[Topic: mblife.pbx.cdr.v1]

    subgraph GroupCRM["Consumer Group: group.crm (Đọc Real-time)"]
        CRM1[CRM Worker 1: Offset 1050]
    end

    subgraph GroupBI["Consumer Group: group.bi-warehouse (Chạy Batch)"]
        BI1[BI Worker 1: Offset 420]
    end

    subgraph GroupAI["Consumer Group: group.voice-ai (Đang Replay)"]
        AI1[AI Worker 1: Offset 0]
    end

    Topic --> GroupCRM
    Topic --> GroupBI
    Topic --> GroupAI
```

* Nhóm `group.crm`: Đọc realtime ở vị trí mới nhất (Offset 1050) để hiển thị lên màn hình điện thoại viên.
* Nhóm `group.bi-warehouse`: Đọc chậm rãi (Offset 420) gom batch 15 phút một lần lưu vào BigQuery.
* Nhóm `group.voice-ai`: Vừa fix xong model, reset offset về 0 để đọc lại toàn bộ dữ liệu 3 ngày qua mà **không hề làm chậm hay gián đoạn nhóm CRM**.

### 5.3. Các cơ chế đảm bảo truyền phát (Delivery Semantics)

```mermaid
flowchart TD
    Start[Consumer Nhận Message] --> Choice{Chọn Thời Điểm Commit Offset}
    Choice -->|Commit TRƯỚC khi xử lý| AtMostOnce["At-Most-Once (Tối đa 1 lần)<br/>Crash = Mất tin, Không bao giờ trùng"]
    Choice -->|Commit SAU khi lưu DB thành công| AtLeastOnce["At-Least-Once (Ít nhất 1 lần)<br/>Crash = Đọc lại, Có thể trùng lặp, Cần Idempotent"]
    Choice -->|Dùng Kafka Transaction API / 2PC| ExactlyOnce["Exactly-Once Processing (Chính xác 1 lần)<br/>Đảm bảo toàn vẹn tuyệt đối"]
```

1. **At-Most-Once (Tối đa một lần)**:
   * Commit offset ngay khi vừa nhận bản tin từ Broker, sau đó mới xử lý.
   * Nếu tiến trình crash trong lúc xử lý: Bản tin bị mất vĩnh viễn, không bao giờ đọc lại. Phù hợp cho metrics giám sát hoặc log không quan trọng.
2. **At-Least-Once (Ít nhất một lần - Khuyến nghị cho Production)**:
   * Xử lý và lưu dữ liệu vào cơ sở dữ liệu thành công rồi mới commit offset.
   * Nếu tiến trình crash trước khi commit: Khi khởi động lại, consumer sẽ đọc lại bản tin đó $\rightarrow$ Có thể bị trùng dữ liệu.
   * **Giải pháp bắt buộc**: Thiết kế Consumer Idempotent (kiểm tra `uniqueid` hoặc `linkedid` trong Database trước khi INSERT).
3. **Exactly-Once (Chính xác một lần - EOS)**:
   * Kết hợp Idempotent Producer (`enable.idempotence=true`) và Transactional API (`sendOffsetsToTransaction`). Đảm bảo dữ liệu chỉ được ghi nhận đúng một lần duy nhất xuyên suốt chuỗi pipeline.

---

## 6. Cơ Chế Lưu Trữ Vật Lý: Tại Sao Kafka Cực Kỳ Nhanh?

Nhiều kỹ sư lầm tưởng rằng đọc/ghi từ đĩa cứng (HDD/SSD) sẽ luôn chậm hơn RAM. Kafka đạt được thông lượng hàng triệu message/giây nhờ 3 kỹ thuật cốt lõi:

```mermaid
graph LR
    subgraph DiskIO["1. Sequential Disk I/O"]
        D1[Append-only Log] -->|Ghi nối tiếp liên tục| D2[Tốc độ đạt ~600MB/s trên HDD]
    end

    subgraph OSMemory["2. OS PageCache"]
        Kernel[OS Kernel Memory] -->|Cache nóng các segment gần nhất| NoJVM[Không tốn RAM JVM Heap, Không bị GC Pause]
    end

    subgraph NetZeroCopy["3. Zero-Copy Transfer (sendfile)"]
        Cache[PageCache] -->|Chuyển trực tiếp qua DMA| NIC[Network Socket / NIC Buffer]
        style NIC fill:#bfb,stroke:#2b2
    end
```

### 6.1. Sequential Disk I/O (Ghi đĩa tuần tự)
* Ghi ngẫu nhiên (Random I/O) trên đĩa tốn chi phí di chuyển đầu đọc vật lý (~vài trăm IOPS).
* Kafka chỉ sử dụng thao tác **Append-Only (ghi nối tiếp vào cuối file)**. Tốc độ ghi tuần tự trên đĩa cứng có thể đạt hàng trăm MB/giây, nhanh ngang ngửa với thao tác trên bộ nhớ RAM.

### 6.2. Log Segments & Index
Mỗi partition được chia nhỏ thành các file phân đoạn (**Segments**, mặc định 1GB):
* `00000000000000000000.log`: Chứa nội dung byte thực tế của các message.
* `00000000000000000000.index`: Bảng chỉ mục thưa (Sparse index) ánh xạ giữa `Offset` $\rightarrow$ `Vị trí byte vật lý trong file .log`.
* `00000000000000000000.timeindex`: Ánh xạ giữa `Timestamp` $\rightarrow$ `Offset` phục vụ tìm kiếm theo thời gian.

### 6.3. Zero-Copy qua Linux System Call `sendfile()`
Trong các hệ thống thông thường, dữ liệu truyền từ đĩa ra mạng phải qua 4 lần copy và 4 lần chuyển đổi ngữ cảnh (Context switches):
$$\text{Disk} \xrightarrow{\text{copy 1}} \text{OS PageCache} \xrightarrow{\text{copy 2}} \text{JVM User Memory} \xrightarrow{\text{copy 3}} \text{Socket Buffer} \xrightarrow{\text{copy 4}} \text{NIC}$$

Kafka sử dụng lời gọi hệ thống `sendfile()` của Linux:
$$\text{OS PageCache} \xrightarrow{\text{DMA Direct Copy}} \text{NIC (Network Interface Card)}$$
Dữ liệu đi thẳng từ bộ đệm của Kernel ra card mạng mà không bao giờ bị copy vào bộ nhớ của ứng dụng Java, tiết kiệm 100% tài nguyên CPU và loại bỏ hoàn toàn hiện tượng Garbage Collection dừng hệ thống.

---

## 7. Phân Tán, Chịu Lỗi & Cơ Chế Đồng Thuận (KRaft vs ZooKeeper)

### 7.1. Replication Factor (Hệ số nhân bản)
Để chống mất dữ liệu khi máy chủ bị cháy hoặc sập nguồn, mỗi Partition được sao chép sang nhiều Broker:
* **Partition Leader**: Đảm nhận tất cả tác vụ ghi (write) và đọc (read) của client.
* **Follower Replicas**: Đóng vai trò là bản sao thụ động, liên tục gửi yêu cầu fetch để đồng bộ dữ liệu từ Leader.
* **In-Sync Replicas (ISR)**: Tập hợp các bản sao đang bắt kịp tiến độ với Leader. Nếu một Follower bị mất kết nối quá thời gian `replica.lag.time.max.ms`, nó sẽ bị loại khỏi danh sách ISR.

```mermaid
graph TD
    subgraph Broker1["Broker 1"]
        L0["Partition 0 (LEADER)"]
        F1["Partition 1 (Follower)"]
    end

    subgraph Broker2["Broker 2"]
        F0["Partition 0 (Follower)"]
        L1["Partition 1 (LEADER)"]
    end

    subgraph Broker3["Broker 3"]
        F0_3["Partition 0 (Follower)"]
        F1_3["Partition 1 (Follower)"]
    end

    ClientWrite[Client Write] -->|Chỉ ghi vào Leader| L0
    F0 -.->|Fetch đồng bộ| L0
    F0_3 -.->|Fetch đồng bộ| L0
```

### 7.2. Cấu hình độ an toàn `acks` của Producer:
* `acks=0`: Producer gửi xong không cần chờ Broker phản hồi (Cực nhanh, rủi ro mất dữ liệu cao).
* `acks=1`: Producer chờ đúng một mình Partition Leader ghi vào đĩa thành công (Mặc định).
* `acks=all` (hoặc `-1`): Producer chờ toàn bộ các Broker trong danh sách **ISR** xác nhận ghi đĩa thành công kết hợp `min.insync.replicas=2`. Đây là tiêu chuẩn vàng cho các hệ thống thanh toán, ngân hàng và cước viễn thông để cam kết **Zero Data Loss**.

### 7.3. Bước chuyển mình sang KRaft (Kafka Raft Consensus)
Trước phiên bản 3.x, Kafka phụ thuộc vào cụm Apache ZooKeeper bên ngoài để bầu cử Controller và lưu metadata, dẫn đến độ trễ đồng bộ cao và giới hạn số lượng partition ở mức hàng chục ngàn.
Từ phiên bản **Kafka 4.x**, ZooKeeper bị loại bỏ hoàn toàn:
* Cụm Kafka tự vận hành thuật toán đồng thuận **KRaft (Event-driven Raft)**.
* Metadata của toàn bộ cụm được lưu trữ trực tiếp dưới dạng một internal topic (`@metadata`).
* Tốc độ bầu cử lại Leader nhanh hơn gấp 10 lần, khôi phục cụm tức thì và hỗ trợ mở rộng lên đến **hàng triệu Partitions**.

---

## 8. Năm API Chính Thức Của Apache Kafka (5 Core APIs)

Hệ sinh thái Apache Kafka cung cấp 5 bộ API lập trình tiêu chuẩn:

```mermaid
graph TD
    Admin[1. Admin API<br/>Quản trị Topics, Brokers, Quotas, ACLs]
    Producer[2. Producer API<br/>Ghi luồng sự kiện vào Topics]
    Consumer[3. Consumer API<br/>Đọc và xử lý luồng sự kiện từ Topics]
    Streams[4. Kafka Streams API<br/>Xử lý luồng thời gian thực, Stateful Joins, Windows]
    Connect[5. Kafka Connect API<br/>Tích hợp Out-of-the-box với DB, S3, Elasticsearch]
```

1. **Admin API**: Dùng trong tooling quản trị (tạo/xóa topic, thay đổi cấu hình runtime, kiểm tra ACLs, reassign partition).
2. **Producer API**: Thư viện client phía ứng dụng để đẩy dữ liệu vào topic kèm cơ chế batching, nén (lz4, zstd, snappy) và retry.
3. **Consumer API**: Thư viện client phía ứng dụng để lắng nghe topic, tự động quản lý kết nối và rebalance khi scale out/in.
4. **Kafka Streams API**: Thư viện Java gọn nhẹ nhúng trực tiếp vào microservices, hỗ trợ biến đổi stream-to-stream, xử lý windowing theo thời gian sự kiện (Event-time), state store cục bộ RocksDB và stream-table duality (KStream/KTable).
5. **Kafka Connect API**: Framework chuẩn hóa giúp kết nối Kafka với hệ thống bên ngoài mà không cần viết code:
   * **Source Connectors**: Tự động bắt sự kiện từ PostgreSQL (Debezium CDC), MySQL, Oracle đẩy vào Kafka.
   * **Sink Connectors**: Tự động tiêu thụ dữ liệu từ Kafka đổ vào Elasticsearch, ClickHouse, Amazon S3, Snowflake.

---

## 9. Năm Tình Huống Thực Chiến: Vì Sao Kafka Thay Thế Webhook HTTP?

*(Phân tích thực tế từ tài liệu `docs/kafka-101.html` áp dụng trong hệ thống tổng đài PBX)*

### Tình huống 1: Backend sập 2 tiếng lúc 2 giờ sáng
* **HTTP Webhook**: PBX gửi HTTP POST nhận lỗi `Connection Refused` hoặc `504 Timeout`. Muốn không mất dữ liệu, đội PBX phải tự code thêm cơ chế hàng đợi đệm và retry phức tạp trong tổng đài.
* **Apache Kafka**: PBX đẩy vào Kafka chỉ mất ~3ms rồi giải phóng tài nguyên. Message nằm nguyên vẹn an toàn trên partition. 4 giờ sáng backend khởi động lại, Consumer tự động đọc nối tiếp từ offset cũ và xử lý 100% dữ liệu mà không thất thoát một bản ghi nào.

### Tình huống 2: Triển khai phiên bản mới (Deployment Rolling Update 10 phút)
* **HTTP Webhook**: Các kết nối đang dang dở bị đứt gãy giữa chừng (Connection reset by peer). Hoặc phải dựng hạ tầng Blue-Green tốn kém, hoặc phải chấp nhận gián đoạn.
* **Apache Kafka**: Tắt toàn bộ Consumer backend để deploy. Dữ liệu cuộc gọi vẫn đều đặn đổ vào Kafka. Sau 10 phút backend bật lên, consumer tăng tốc tiêu thụ (catch up lag) về 0 chỉ trong vài chục giây.

### Tình huống 3: Giờ cao điểm 200 cuộc/phút nhưng Database chỉ ghi kịp 50 cuộc/phút
* **HTTP Webhook**: Webhook dồn ứ, backend cạn kiệt Connection Pool của Database, gây sập đổ dây chuyền (Cascading Failure).
* **Apache Kafka**: Kafka hoạt động như một **bể chứa đệm khổng lồ (Backpressure Absorber)**. Producer vẫn gửi 200 cuộc/phút, Consumer vẫn thong thả đọc 50 cuộc/phút theo đúng năng lực của Database. Không hệ thống nào bị quá tải.

### Tình huống 4: Phát hiện lỗi parse sai dữ liệu suốt 3 ngày qua
* **HTTP Webhook**: Dữ liệu đã gửi đi là hết. Muốn sửa phải nhờ đội vận hành PBX xuất file Excel thô rồi viết script vá dữ liệu thủ công.
* **Apache Kafka**: Sửa lỗi bug trong code, sau đó dùng lệnh quản trị tua lại bookmark:
  ```bash
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group group.crm --topic mblife.pbx.cdr.v1 \
    --reset-offsets --to-offset 0 --execute
  ```
  Hệ thống tự động chạy lại toàn bộ dữ liệu 3 ngày với logic chuẩn xác trong vài phút.

### Tình huống 5: Khách hàng muốn tích hợp thêm hệ thống BI / Data Warehouse
* **HTTP Webhook**: Kỹ sư PBX phải sửa code tổng đài để bắn thêm một Webhook endpoint thứ hai. Latency cuộc gọi bị nhân đôi; nếu hệ thống BI bị chậm sẽ kéo sập cả luồng CRM chính.
* **Apache Kafka**: Đội PBX **không cần chạm vào một dòng code nào**. Đội BI chỉ việc tạo một Consumer Group mới (`group.bi`) và bắt đầu subscribe vào topic có sẵn. Hoàn toàn cách ly và độc lập.

---

## 10. Ba Quy Tắc Vàng Khi Tiến Hóa Schema (Schema Evolution)

Kafka xem nội dung payload của message là một chuỗi bytes thô. Do đó, Producer và Consumer phải thống nhất một cấu trúc dữ liệu chung (Schema). Để tránh làm sập các Consumer đang chạy khi cập nhật hệ thống, bắt buộc phải tuân thủ 3 quy tắc:

| Loại Thay Đổi | Được Làm Trên `.v1` Không? | Nguyên Tắc Kỹ Thuật |
| :--- | :---: | :--- |
| **Thêm trường mới** | **ĐƯỢC** | Trường mới phải là trường tùy chọn (optional) hoặc có giá trị mặc định (`default`). Consumer phiên bản cũ đọc bản tin mới sẽ tự động bỏ qua trường này mà không bị lỗi JSON parse. |
| **Đổi ý nghĩa trường cũ** | **CẤM TUYỆT ĐỐI** | Ví dụ: trường `billsec` đang tính bằng giây, không được tự ý đổi sang mili-giây. Consumer cũ lấy số mili-giây nhân với đơn giá sẽ tính sai cước phí hàng ngàn lần. Trường hợp này phải tạo topic mới `.v2`. |
| **Xóa trường cũ** | **CẤM TUYỆT ĐỐI** | Nếu không dùng trường cũ nữa, hãy tiếp tục gửi kèm giá trị rỗng (`null` hoặc `""`) và đánh dấu `deprecated`. Cấm xóa hẳn khỏi schema vì các Consumer cũ vẫn đang phụ thuộc vào trường đó. |

---

## 11. Redpanda vs Apache Kafka: Điểm Khác Biệt Then Chốt

[Redpanda](https://redpanda.com) là hệ thống streaming thế hệ mới tương thích **100% Kafka Wire Protocol** (mọi thư viện `confluent-kafka`, Kafka CLI, Kafka Connect đều hoạt động nguyên vẹn mà không cần sửa code):

```mermaid
graph TD
    subgraph KafkaArch["Apache Kafka (JVM Engine)"]
        K_JVM[Java Virtual Machine] --> K_GC[Garbage Collection Pauses]
        K_OS[OS PageCache Management]
    end

    subgraph RedpandaArch["Redpanda (Native C++ Engine)"]
        R_CPP[C++ 20 Native Code] --> R_SEA[Seastar Framework: Thread-Per-Core]
        R_DIR[Direct I/O: Bỏ qua PageCache, Ghi thẳng NVMe SSD]
        R_RAFT[Tích hợp sẵn Built-in Raft Consensus]
    end
```

* **Không có JVM & Không có GC Pauses**: Viết bằng C++20 tối ưu, loại bỏ hoàn toàn hiện tượng jitter độ trễ do Garbage Collection của Java.
* **Kiến trúc Thread-per-core (Seastar Framework)**: Mỗi CPU Core xử lý một thread độc lập, không lock tranh chấp bộ nhớ, tối ưu tối đa năng lực phần cứng hiện đại.
* **Độ trễ P99 cực thấp**: Thấp hơn Kafka từ 3 đến 6 lần trong các bài kiểm thử tải cao.
* **Bộ công cụ dòng lệnh cực nhanh (`rpk`)**: Thay thế hàng loạt file script `.sh` phức tạp của Kafka bằng một file binary duy nhất.

---

## 12. Code Mẫu Thực Chiến (Python confluent-kafka)

### 12.1. Producer — Gửi sự kiện an toàn kèm Partition Key
```python
# name: pbx_producer.py
# description: Kafka producer gửi dữ liệu CDR kèm linkedid làm partition key

import json
from confluent_kafka import Producer

def delivery_report(err, msg):
    """Callback thông báo trạng thái ghi bản tin lên Broker."""
    if err is not None:
        print(f"❌ Ghi thất bại: {err}")
    else:
        print(f"✅ Ghi thành công vào [{msg.topic()}] Partition: {msg.partition()} Offset: {msg.offset()}")

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''client.id'': ''mblife-pbx-producer'',
    ''acks'': ''all'',  # Đảm bảo toàn bộ ISR đã nhận tin
    ''enable.idempotence'': True,  # Chống trùng lặp dữ liệu phía Producer
    ''retries'': 5
}

producer = Producer(conf)

cdr_payload = {
    "linkedid": "1759734000.1",
    "uniqueid": "1759734000.1",
    "direction": "outbound",
    "caller": "0912345678",
    "callee": "19001234",
    "disposition": "ANSWERED",
    "duration": 45,
    "billsec": 38,
    "start_time": "2026-10-10 10:00:00"
}

# QUAN TRỌNG: Gán key là linkedid để mọi sự kiện của cuộc gọi này luôn rơi vào cùng 1 partition
producer.produce(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_payload[''linkedid''].encode(''utf-8''),
    value=json.dumps(cdr_payload).encode(''utf-8''),
    callback=delivery_report
)

# Chờ hoàn tất gửi toàn bộ batch trong hàng đợi
producer.flush()
```

### 12.2. Consumer — Đọc dữ liệu, Xử lý Idempotent và Graceful Shutdown
```python
# name: pbx_consumer.py
# description: Consumer đọc CDR với cam kết At-Least-Once và Graceful Shutdown

import json
import signal
import sys
from confluent_kafka import Consumer, KafkaError

running = True

def handle_shutdown(sig, frame):
    global running
    print("\nĐang nhận tín hiệu dừng, đóng Consumer an toàn...")
    running = False

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''group.id'': ''mblife.crm.cdr-sync'',
    ''auto.offset.reset'': ''earliest'',
    ''enable.auto.commit'': False,  # Tắt auto-commit để kiểm soát thủ công
    ''max.poll.interval.ms'': 300000
}

consumer = Consumer(conf)
consumer.subscribe([''mblife.pbx.cdr.v1''])

print("🚀 Consumer đang chạy. Bấm Ctrl+C để thoát.")

try:
    while running:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f"Lỗi Consumer: {msg.error()}")
                break

        # 1. Giải mã dữ liệu
        data = json.loads(msg.value().decode(''utf-8''))
        call_id = msg.key().decode(''utf-8'')

        # 2. Xử lý nghiệp vụ (Idempotent Insert vào CRM DB)
        print(f"Xử lý cuộc gọi: {call_id} | Thời lượng: {data.get(''duration'')}s")

        # 3. Commit offset SAU KHI ghi cơ sở dữ liệu thành công (At-Least-Once)
        consumer.commit(message=msg, asynchronous=False)

finally:
    # Đóng kết nối và bàn giao lại partition cho group
    consumer.close()
    print("Consumer đã đóng an toàn.")
```

---

## 13. Cheat Sheet Các Lệnh CLI Quản Trị Cần Thiết

| Mục Đích | Lệnh Chuẩn Apache Kafka CLI | Lệnh Nhanh Redpanda CLI (`rpk`) |
| :--- | :--- | :--- |
| **Tạo Topic mới** | `kafka-topics.sh --create --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --partitions 3 --replication-factor 3` | `rpk topic create mblife.pbx.cdr.v1 -p 3 -r 3` |
| **Xem danh sách Topics** | `kafka-topics.sh --list --bootstrap-server localhost:9092` | `rpk topic list` |
| **Xem chi tiết Topic & Partitions** | `kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1` | `rpk topic describe mblife.pbx.cdr.v1` |
| **Kiểm tra Consumer Lag** | `kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync` | `rpk group describe mblife.crm.cdr-sync` |
| **Đọc thử tin nhắn từ đầu** | `kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --from-beginning --property print.key=true` | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n'' --offset start` |
| **Tua lại Offset (Replay)** | `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync --topic mblife.pbx.cdr.v1 --reset-offsets --to-earliest --execute` | `rpk group seek mblife.crm.cdr-sync --to start --topics mblife.pbx.cdr.v1` |

---

## 14. Tổng Kết

Hiểu rõ lý thuyết cốt lõi của Apache Kafka và Redpanda giúp chúng ta nhận ra rằng:
1. **Kafka không phải là Message Queue thông thường**: Nó là một **Distributed Append-Only Commit Log** kiêm hệ thống lưu trữ bền vững.
2. **Thứ tự nghiệp vụ nằm ở Partition Key**: Luôn chọn khóa phân vùng cẩn thận (`linkedid`, `order_id`) để không làm xáo trộn chuỗi sự kiện.
3. **Consumer độc lập hoàn toàn**: Một nguồn sự kiện duy nhất có thể nuôi sống đồng thời toàn bộ các hệ sinh thái từ CRM, Data Lake cho tới Realtime AI mà không gây nghẽn hệ thống nguồn.
', '---
title: >-
  Toàn Tập Lý Thuyết Cốt Lõi Apache Kafka: Từ Nền Tảng Event Streaming Đến Kiến
  Trúc Phân Tán Thực Chiến
description: >-
  Cẩm nang chuyên sâu toàn diện về Apache Kafka (4.x/KRaft) và Redpanda: Bản
  chất Event Streaming, Topics, Partitions, Commit Log, Zero-Copy, Replication,
  Consumer Groups, Schema Evolution và 5 bài toán thực chiến thay thế Webhook.
pubDate: ''2026-10-10T00:00:00.000Z''
updatedDate: ''2026-10-10T15:18:14.358Z''
thumbnail: /images/blog/default.png
thumbnailAlt: Kiến trúc cốt lõi Apache Kafka và Redpanda
hashtags:
  - ApacheKafka
  - EventStreaming
  - DistributedSystems
  - Redpanda
  - SystemArchitecture
draft: false
isKnowledgeBase: true
kbCategory: architecture
targetAgents:
  - claude
  - cursor
  - codex
  - anti
summaryForAgents: >-
  Comprehensive foundation and architecture guide for Apache Kafka and Redpanda.
  Covers event streaming fundamentals, append-only commit logs, sequential I/O,
  PageCache Zero-Copy, partition key hashing, replication factor with ISR and
  KRaft consensus, consumer group scaling limits, delivery semantics
  (at-most-once, at-least-once, exactly-once), schema evolution rules, and 5
  real-world battle-tested scenarios comparing Webhooks vs Kafka.
---

## 1. Bản chất của Event Streaming: "Hệ thần kinh trung ương kỹ thuật số"

Theo tài liệu chính thức của Apache Kafka (*Kafka 4.x Documentation*), trong thế giới doanh nghiệp hiện đại định hướng bằng phần mềm và tự động hóa, **Event Streaming** đóng vai trò tương đương với **hệ thần kinh trung ương (Central Nervous System)** của cơ thể con người.

```mermaid
graph TD
    subgraph Sources["Nguồn Sinh Sự Kiện (Event Sources)"]
        DB[(Cơ sở dữ liệu CDC)]
        IoT[Thiết bị IoT / Sensors]
        PBX[Tổng đài PBX / Viễn thông]
        App[Ứng dụng Mobile / Web]
    end

    subgraph KafkaCore["Apache Kafka / Redpanda Cluster"]
        Broker1[Broker 01]
        Broker2[Broker 02]
        Broker3[Broker 03]
        Log[(Append-Only Commit Log<br/>Durable Storage)]
    end

    subgraph Destinations["Hệ Thống Tiêu Thụ (Consumers / Sinks)"]
        Analytics[(BI / Data Lakehouse)]
        CRM[Hệ thống CRM / ERP]
        AI[Voice AI / LLM Inference]
        Alert[Real-time Monitoring / Alert]
    end

    Sources -->|Publish Streams of Events| KafkaCore
    KafkaCore -->|Subscribe & Stream Real-time| Destinations
```

### 1.1. Định nghĩa kỹ thuật
**Event Streaming** là phương thức:
1. **Thu thập thời gian thực (Capture in real-time)** các dòng sự kiện từ nguồn phát sinh (database transactions, telemetry sensors, thiết bị di động, cloud services, ứng dụng nghiệp vụ).
2. **Lưu trữ bền vững (Durable storage)** các luồng sự kiện này theo cơ chế phân tán, đảm bảo tính sẵn sàng cao và không bị mất mát dữ liệu.
3. **Xử lý và phản hồi (Manipulate & react)** theo thời gian thực (real-time stream processing) cũng như truy hồi lịch sử (retrospective processing).
4. **Định tuyến linh hoạt (Route event streams)** đến các hạ tầng đích khi có nhu cầu mà không làm thay đổi tầng nguồn.

### 1.2. Ba trụ cột năng lực cốt lõi của Apache Kafka
Apache Kafka kết hợp 3 khả năng then chốt trong một nền tảng duy nhất:
* **Publish & Subscribe**: Ghi (publish) và đọc (subscribe) các dòng sự kiện với thông lượng hàng triệu message mỗi giây mà không gây nghẽn cổ chai.
* **Durable Storage**: Lưu trữ an toàn, tin cậy trên đĩa cứng trong thời gian tùy chọn (từ vài giờ, vài tuần cho đến vĩnh viễn), không xóa message ngay sau khi đọc.
* **Process in Real-time**: Khả năng phân tích, tổng hợp, biến đổi luồng dữ liệu liên tục ngay khi chúng phát sinh thông qua Kafka Streams API.

---

## 2. Mô hình Mental Model: Sổ cái kế toán vs Hàng đợi truyền thống

Để hiểu cặn kẽ Kafka ngay từ ngày đầu tiên, hãy xóa bỏ tư duy về các Message Queue truyền thống (như RabbitMQ, ActiveMQ) và chuyển sang tư duy **Sổ cái kế toán ghi nối tiếp (Append-Only Ledger)**:

```mermaid
graph LR
    subgraph TraditionalMQ["Message Queue Truyền Thống (RabbitMQ)"]
        Q[Hàng đợi Queue] -->|Lấy ra & XÓA BỎ| W1[Worker A]
        Q -.->|Đã bị xóa| W2[Worker B không đọc được nữa]
    end

    subgraph KafkaLog["Apache Kafka (Distributed Commit Log)"]
        L0[Offset 0] --> L1[Offset 1] --> L2[Offset 2] --> L3[Offset 3] --> L4[Offset 4]
        C1[Bookmark Group CRM: Offset 4]
        C2[Bookmark Group BI: Offset 2]
    end
```

| Đặc Điểm | Message Queue Truyền Thống (RabbitMQ / ActiveMQ) | Apache Kafka / Redpanda |
| :--- | :--- | :--- |
| **Bản chất lưu trữ** | Bộ nhớ tạm (Transient buffer) — Message bị **xóa ngay** sau khi Consumer xác nhận (ACK). | Cuốn sổ cái chỉ ghi thêm (**Append-only Commit Log**) — Message được lưu bền vững trên đĩa theo thời gian (`retention.ms`). |
| **Cơ chế đọc** | Broker chủ động đẩy message xuống Consumer (**Push model**). | Consumer chủ động kéo message theo tốc độ xử lý của mình (**Pull model**). |
| **Vị trí đọc (Offset)** | Do Broker theo dõi trong RAM; khó scale khi có hàng triệu queue. | Do Consumer tự quản lý (**Bookmarks**), lưu tại topic nội bộ `__consumer_offsets`. |
| **Đa người đọc** | Muốn nhiều service đọc cùng dữ liệu phải tạo Fanout Exchange và duplicate dữ liệu ra nhiều queue. | Nhiều Consumer Group độc lập cùng đọc chung 1 log duy nhất với tốc độ và vị trí riêng. |
| **Khả năng Replay** | **Không thể** — Đã lấy ra là mất vĩnh viễn. | **Cực kỳ dễ dàng** — Chỉ cần tua lại Offset (seek) để đọc lại dữ liệu 7 ngày trước. |

---

## 3. Cấu trúc một Sự Kiện (Event Anatomy)

Trong Kafka, một sự kiện (Event / Record) ghi lại một dữ kiện thực tế đã xảy ra trong thế giới thực hoặc hệ thống kinh doanh ("Something happened"):

```
+-----------------------------------------------------------------+
|                       KAFKA RECORD / EVENT                      |
+-----------------------------------------------------------------+
| Headers   | trace_id=xyz-123, env=production, app=mblife-pbx   |
+-----------+-----------------------------------------------------+
| Timestamp | 1759734000120 (Epoch milliseconds - CreateTime)    |
+-----------+-----------------------------------------------------+
| Key       | "1759734000.1" (Định danh logic: linkedid cuộc gọi) |
+-----------+-----------------------------------------------------+
| Value     | { "caller": "0912345678", "callee": "19001234", ... }|
+-----------------------------------------------------------------+
```

1. **Key (Khóa)**: Chuỗi byte tùy chọn dùng để xác định **Partition đích** thông qua thuật toán băm (Hashing). Tất cả message có cùng Key luôn rơi vào đúng một Partition duy nhất.
2. **Value (Giá trị)**: Payload nội dung nghiệp vụ (JSON, Avro, Protobuf, nhị phân).
3. **Timestamp (Dấu thời gian)**: Thời điểm sự kiện được tạo (`CreateTime`) hoặc thời điểm Broker tiếp nhận (`LogAppendTime`).
4. **Headers (Siêu dữ liệu)**: Cặp key-value tùy chọn chứa thông tin metadata như `trace_id` (OpenTelemetry), nguồn gốc tenant, chữ ký xác thực.

---

## 4. Topics và 3 Nguyên Lý Vàng Về Partition

### 4.1. Topic là gì?
Topic là đơn vị tổ chức logic của các dòng sự kiện (tương đương với một bảng trong Database hoặc một thư mục trên File System).
* **Quy ước đặt tên Topic chuẩn doanh nghiệp**:
  $$\text{<domain>}.\text{<subdomain>}.\text{<entity>}.\text{<version>}$$
  * Ví dụ viễn thông PBX: `mblife.pbx.cdr.v1` (bản ghi cước cuộc gọi), `mblife.pbx.call-insight.v1` (kết quả phân tích giọng nói).
* **Vì sao phải tách Topic thay vì gộp chung?**
  * **Khác biệt về SLA & Tần suất**: CDR sinh ra ngay tức thì (vài trăm bytes), trong khi Voice Insight cần xử lý AI mất 2-3 phút (hàng trăm KB).
  * **Chính sách Retention khác nhau**: CDR cần lưu trữ 90 ngày phục vụ đối soát cước phí, Insight chỉ cần lưu 7 ngày để đẩy vào Data Lake.

### 4.2. Partition: Đơn vị co giãn vật lý (Unit of Scalability)
Một Topic được chia thành nhiều lát cắt vật lý gọi là **Partition** nằm rải rác trên các Broker khác nhau:

```mermaid
graph TD
    subgraph Topic["Topic: mblife.pbx.cdr.v1 (3 Partitions)"]
        subgraph P0["Partition 0 (Broker 1)"]
            P0_0[Offset 0] --> P0_1[Offset 1] --> P0_2[Offset 2]
        end
        subgraph P1["Partition 1 (Broker 2)"]
            P1_0[Offset 0] --> P1_1[Offset 1] --> P1_2[Offset 2]
        end
        subgraph P2["Partition 2 (Broker 3)"]
            P2_0[Offset 0] --> P2_1[Offset 1] --> P2_2[Offset 2]
        end
    end

    Producer[Producer] -->|hash(key) % 3| Topic
```

### 3 NGUYÊN LÝ VÀNG BẮT BUỘC PHẢI THUỘC LÒNG:

#### 1. Thứ tự chỉ được đảm bảo TUYỆT ĐỐI trong CÙNG MỘT PARTITION
* Kafka **không bao giờ đảm bảo thứ tự toàn cục (Global Ordering)** trên toàn bộ Topic.
* Nếu cuộc gọi có 3 sự kiện: `DIALING` $\rightarrow$ `ANSWERED` $\rightarrow$ `HANGUP`, bạn **bắt buộc** phải đảm bảo cả 3 sự kiện này rơi vào cùng một partition. Nếu rơi vào 2 partition khác nhau, Consumer đọc song song có thể nhận `HANGUP` trước khi nhận `ANSWERED`.

#### 2. Key quyết định Partition
* Thuật toán mặc định: $\text{partition} = \text{murmur2}(\text{key}) \pmod{\text{total\_partitions}}$.
* Cùng một Key $\rightarrow$ Luôn vào cùng một Partition $\rightarrow$ Luôn giữ đúng thứ tự thời gian.
* **Không có Key (`key = null`)**: Kafka gửi ngẫu nhiên theo cơ chế Round-robin (hoặc Sticky Partitioning để tối ưu batching). Dữ liệu sẽ bị rải đều nhưng mất hoàn toàn thứ tự nghiệp vụ giữa các bản tin liên quan.

#### 3. Giới hạn song song của Consumer: $N_{consumer} \le N_{partitions}$
* Tại một thời điểm, **một partition chỉ được giao cho duy nhất một Consumer trong cùng một Consumer Group**.
* Nếu Topic có 3 Partitions:
  * 1 Consumer: Đọc cả 3 partitions (chậm).
  * 3 Consumers: Mỗi con đọc 1 partition (tối ưu tối đa thông lượng).
  * 4 Consumers: **Consumer thứ 4 sẽ ngồi chơi xơi nước (idle)**, chỉ hoạt động khi 1 trong 3 con kia bị chết (Failover).

```mermaid
graph LR
    subgraph TopicPartitions["Topic: 3 Partitions"]
        Part0[Partition 0]
        Part1[Partition 1]
        Part2[Partition 2]
    end

    subgraph ConsumerGroup["Consumer Group: 4 Consumers"]
        C1[Consumer 1]
        C2[Consumer 2]
        C3[Consumer 3]
        C4[Consumer 4: IDLE / STANDBY]
    end

    Part0 --> C1
    Part1 --> C2
    Part2 --> C3
    style C4 fill:#fbb,stroke:#d33,stroke-dasharray: 5 5
```

---

## 5. Offset và Cơ chế Consumer Group Độc Lập

### 5.1. Offset là gì?
Offset là số nguyên tăng dần liên tục $(0, 1, 2, 3...)$ gán cho mỗi message khi được ghi vào partition. Offset không bao giờ bị tái sử dụng. Nó đóng vai trò như **số trang sách (Bookmark)** để Consumer ghi nhớ mình đã đọc tới đâu.

### 5.2. Sự độc lập giữa các Consumer Group
Nhiều phòng ban hoặc dịch vụ khác nhau có thể đọc cùng một Topic mà không ảnh hưởng tới nhau:

```mermaid
graph TD
    Topic[Topic: mblife.pbx.cdr.v1]

    subgraph GroupCRM["Consumer Group: group.crm (Đọc Real-time)"]
        CRM1[CRM Worker 1: Offset 1050]
    end

    subgraph GroupBI["Consumer Group: group.bi-warehouse (Chạy Batch)"]
        BI1[BI Worker 1: Offset 420]
    end

    subgraph GroupAI["Consumer Group: group.voice-ai (Đang Replay)"]
        AI1[AI Worker 1: Offset 0]
    end

    Topic --> GroupCRM
    Topic --> GroupBI
    Topic --> GroupAI
```

* Nhóm `group.crm`: Đọc realtime ở vị trí mới nhất (Offset 1050) để hiển thị lên màn hình điện thoại viên.
* Nhóm `group.bi-warehouse`: Đọc chậm rãi (Offset 420) gom batch 15 phút một lần lưu vào BigQuery.
* Nhóm `group.voice-ai`: Vừa fix xong model, reset offset về 0 để đọc lại toàn bộ dữ liệu 3 ngày qua mà **không hề làm chậm hay gián đoạn nhóm CRM**.

### 5.3. Các cơ chế đảm bảo truyền phát (Delivery Semantics)

```mermaid
flowchart TD
    Start[Consumer Nhận Message] --> Choice{Chọn Thời Điểm Commit Offset}
    Choice -->|Commit TRƯỚC khi xử lý| AtMostOnce["At-Most-Once (Tối đa 1 lần)<br/>Crash = Mất tin, Không bao giờ trùng"]
    Choice -->|Commit SAU khi lưu DB thành công| AtLeastOnce["At-Least-Once (Ít nhất 1 lần)<br/>Crash = Đọc lại, Có thể trùng lặp, Cần Idempotent"]
    Choice -->|Dùng Kafka Transaction API / 2PC| ExactlyOnce["Exactly-Once Processing (Chính xác 1 lần)<br/>Đảm bảo toàn vẹn tuyệt đối"]
```

1. **At-Most-Once (Tối đa một lần)**:
   * Commit offset ngay khi vừa nhận bản tin từ Broker, sau đó mới xử lý.
   * Nếu tiến trình crash trong lúc xử lý: Bản tin bị mất vĩnh viễn, không bao giờ đọc lại. Phù hợp cho metrics giám sát hoặc log không quan trọng.
2. **At-Least-Once (Ít nhất một lần - Khuyến nghị cho Production)**:
   * Xử lý và lưu dữ liệu vào cơ sở dữ liệu thành công rồi mới commit offset.
   * Nếu tiến trình crash trước khi commit: Khi khởi động lại, consumer sẽ đọc lại bản tin đó $\rightarrow$ Có thể bị trùng dữ liệu.
   * **Giải pháp bắt buộc**: Thiết kế Consumer Idempotent (kiểm tra `uniqueid` hoặc `linkedid` trong Database trước khi INSERT).
3. **Exactly-Once (Chính xác một lần - EOS)**:
   * Kết hợp Idempotent Producer (`enable.idempotence=true`) và Transactional API (`sendOffsetsToTransaction`). Đảm bảo dữ liệu chỉ được ghi nhận đúng một lần duy nhất xuyên suốt chuỗi pipeline.

---

## 6. Cơ Chế Lưu Trữ Vật Lý: Tại Sao Kafka Cực Kỳ Nhanh?

Nhiều kỹ sư lầm tưởng rằng đọc/ghi từ đĩa cứng (HDD/SSD) sẽ luôn chậm hơn RAM. Kafka đạt được thông lượng hàng triệu message/giây nhờ 3 kỹ thuật cốt lõi:

```mermaid
graph LR
    subgraph DiskIO["1. Sequential Disk I/O"]
        D1[Append-only Log] -->|Ghi nối tiếp liên tục| D2[Tốc độ đạt ~600MB/s trên HDD]
    end

    subgraph OSMemory["2. OS PageCache"]
        Kernel[OS Kernel Memory] -->|Cache nóng các segment gần nhất| NoJVM[Không tốn RAM JVM Heap, Không bị GC Pause]
    end

    subgraph NetZeroCopy["3. Zero-Copy Transfer (sendfile)"]
        Cache[PageCache] -->|Chuyển trực tiếp qua DMA| NIC[Network Socket / NIC Buffer]
        style NIC fill:#bfb,stroke:#2b2
    end
```

### 6.1. Sequential Disk I/O (Ghi đĩa tuần tự)
* Ghi ngẫu nhiên (Random I/O) trên đĩa tốn chi phí di chuyển đầu đọc vật lý (~vài trăm IOPS).
* Kafka chỉ sử dụng thao tác **Append-Only (ghi nối tiếp vào cuối file)**. Tốc độ ghi tuần tự trên đĩa cứng có thể đạt hàng trăm MB/giây, nhanh ngang ngửa với thao tác trên bộ nhớ RAM.

### 6.2. Log Segments & Index
Mỗi partition được chia nhỏ thành các file phân đoạn (**Segments**, mặc định 1GB):
* `00000000000000000000.log`: Chứa nội dung byte thực tế của các message.
* `00000000000000000000.index`: Bảng chỉ mục thưa (Sparse index) ánh xạ giữa `Offset` $\rightarrow$ `Vị trí byte vật lý trong file .log`.
* `00000000000000000000.timeindex`: Ánh xạ giữa `Timestamp` $\rightarrow$ `Offset` phục vụ tìm kiếm theo thời gian.

### 6.3. Zero-Copy qua Linux System Call `sendfile()`
Trong các hệ thống thông thường, dữ liệu truyền từ đĩa ra mạng phải qua 4 lần copy và 4 lần chuyển đổi ngữ cảnh (Context switches):
$$\text{Disk} \xrightarrow{\text{copy 1}} \text{OS PageCache} \xrightarrow{\text{copy 2}} \text{JVM User Memory} \xrightarrow{\text{copy 3}} \text{Socket Buffer} \xrightarrow{\text{copy 4}} \text{NIC}$$

Kafka sử dụng lời gọi hệ thống `sendfile()` của Linux:
$$\text{OS PageCache} \xrightarrow{\text{DMA Direct Copy}} \text{NIC (Network Interface Card)}$$
Dữ liệu đi thẳng từ bộ đệm của Kernel ra card mạng mà không bao giờ bị copy vào bộ nhớ của ứng dụng Java, tiết kiệm 100% tài nguyên CPU và loại bỏ hoàn toàn hiện tượng Garbage Collection dừng hệ thống.

---

## 7. Phân Tán, Chịu Lỗi & Cơ Chế Đồng Thuận (KRaft vs ZooKeeper)

### 7.1. Replication Factor (Hệ số nhân bản)
Để chống mất dữ liệu khi máy chủ bị cháy hoặc sập nguồn, mỗi Partition được sao chép sang nhiều Broker:
* **Partition Leader**: Đảm nhận tất cả tác vụ ghi (write) và đọc (read) của client.
* **Follower Replicas**: Đóng vai trò là bản sao thụ động, liên tục gửi yêu cầu fetch để đồng bộ dữ liệu từ Leader.
* **In-Sync Replicas (ISR)**: Tập hợp các bản sao đang bắt kịp tiến độ với Leader. Nếu một Follower bị mất kết nối quá thời gian `replica.lag.time.max.ms`, nó sẽ bị loại khỏi danh sách ISR.

```mermaid
graph TD
    subgraph Broker1["Broker 1"]
        L0["Partition 0 (LEADER)"]
        F1["Partition 1 (Follower)"]
    end

    subgraph Broker2["Broker 2"]
        F0["Partition 0 (Follower)"]
        L1["Partition 1 (LEADER)"]
    end

    subgraph Broker3["Broker 3"]
        F0_3["Partition 0 (Follower)"]
        F1_3["Partition 1 (Follower)"]
    end

    ClientWrite[Client Write] -->|Chỉ ghi vào Leader| L0
    F0 -.->|Fetch đồng bộ| L0
    F0_3 -.->|Fetch đồng bộ| L0
```

### 7.2. Cấu hình độ an toàn `acks` của Producer:
* `acks=0`: Producer gửi xong không cần chờ Broker phản hồi (Cực nhanh, rủi ro mất dữ liệu cao).
* `acks=1`: Producer chờ đúng một mình Partition Leader ghi vào đĩa thành công (Mặc định).
* `acks=all` (hoặc `-1`): Producer chờ toàn bộ các Broker trong danh sách **ISR** xác nhận ghi đĩa thành công kết hợp `min.insync.replicas=2`. Đây là tiêu chuẩn vàng cho các hệ thống thanh toán, ngân hàng và cước viễn thông để cam kết **Zero Data Loss**.

### 7.3. Bước chuyển mình sang KRaft (Kafka Raft Consensus)
Trước phiên bản 3.x, Kafka phụ thuộc vào cụm Apache ZooKeeper bên ngoài để bầu cử Controller và lưu metadata, dẫn đến độ trễ đồng bộ cao và giới hạn số lượng partition ở mức hàng chục ngàn.
Từ phiên bản **Kafka 4.x**, ZooKeeper bị loại bỏ hoàn toàn:
* Cụm Kafka tự vận hành thuật toán đồng thuận **KRaft (Event-driven Raft)**.
* Metadata của toàn bộ cụm được lưu trữ trực tiếp dưới dạng một internal topic (`@metadata`).
* Tốc độ bầu cử lại Leader nhanh hơn gấp 10 lần, khôi phục cụm tức thì và hỗ trợ mở rộng lên đến **hàng triệu Partitions**.

---

## 8. Năm API Chính Thức Của Apache Kafka (5 Core APIs)

Hệ sinh thái Apache Kafka cung cấp 5 bộ API lập trình tiêu chuẩn:

```mermaid
graph TD
    Admin[1. Admin API<br/>Quản trị Topics, Brokers, Quotas, ACLs]
    Producer[2. Producer API<br/>Ghi luồng sự kiện vào Topics]
    Consumer[3. Consumer API<br/>Đọc và xử lý luồng sự kiện từ Topics]
    Streams[4. Kafka Streams API<br/>Xử lý luồng thời gian thực, Stateful Joins, Windows]
    Connect[5. Kafka Connect API<br/>Tích hợp Out-of-the-box với DB, S3, Elasticsearch]
```

1. **Admin API**: Dùng trong tooling quản trị (tạo/xóa topic, thay đổi cấu hình runtime, kiểm tra ACLs, reassign partition).
2. **Producer API**: Thư viện client phía ứng dụng để đẩy dữ liệu vào topic kèm cơ chế batching, nén (lz4, zstd, snappy) và retry.
3. **Consumer API**: Thư viện client phía ứng dụng để lắng nghe topic, tự động quản lý kết nối và rebalance khi scale out/in.
4. **Kafka Streams API**: Thư viện Java gọn nhẹ nhúng trực tiếp vào microservices, hỗ trợ biến đổi stream-to-stream, xử lý windowing theo thời gian sự kiện (Event-time), state store cục bộ RocksDB và stream-table duality (KStream/KTable).
5. **Kafka Connect API**: Framework chuẩn hóa giúp kết nối Kafka với hệ thống bên ngoài mà không cần viết code:
   * **Source Connectors**: Tự động bắt sự kiện từ PostgreSQL (Debezium CDC), MySQL, Oracle đẩy vào Kafka.
   * **Sink Connectors**: Tự động tiêu thụ dữ liệu từ Kafka đổ vào Elasticsearch, ClickHouse, Amazon S3, Snowflake.

---

## 9. Năm Tình Huống Thực Chiến: Vì Sao Kafka Thay Thế Webhook HTTP?

*(Phân tích thực tế từ tài liệu `docs/kafka-101.html` áp dụng trong hệ thống tổng đài PBX)*

### Tình huống 1: Backend sập 2 tiếng lúc 2 giờ sáng
* **HTTP Webhook**: PBX gửi HTTP POST nhận lỗi `Connection Refused` hoặc `504 Timeout`. Muốn không mất dữ liệu, đội PBX phải tự code thêm cơ chế hàng đợi đệm và retry phức tạp trong tổng đài.
* **Apache Kafka**: PBX đẩy vào Kafka chỉ mất ~3ms rồi giải phóng tài nguyên. Message nằm nguyên vẹn an toàn trên partition. 4 giờ sáng backend khởi động lại, Consumer tự động đọc nối tiếp từ offset cũ và xử lý 100% dữ liệu mà không thất thoát một bản ghi nào.

### Tình huống 2: Triển khai phiên bản mới (Deployment Rolling Update 10 phút)
* **HTTP Webhook**: Các kết nối đang dang dở bị đứt gãy giữa chừng (Connection reset by peer). Hoặc phải dựng hạ tầng Blue-Green tốn kém, hoặc phải chấp nhận gián đoạn.
* **Apache Kafka**: Tắt toàn bộ Consumer backend để deploy. Dữ liệu cuộc gọi vẫn đều đặn đổ vào Kafka. Sau 10 phút backend bật lên, consumer tăng tốc tiêu thụ (catch up lag) về 0 chỉ trong vài chục giây.

### Tình huống 3: Giờ cao điểm 200 cuộc/phút nhưng Database chỉ ghi kịp 50 cuộc/phút
* **HTTP Webhook**: Webhook dồn ứ, backend cạn kiệt Connection Pool của Database, gây sập đổ dây chuyền (Cascading Failure).
* **Apache Kafka**: Kafka hoạt động như một **bể chứa đệm khổng lồ (Backpressure Absorber)**. Producer vẫn gửi 200 cuộc/phút, Consumer vẫn thong thả đọc 50 cuộc/phút theo đúng năng lực của Database. Không hệ thống nào bị quá tải.

### Tình huống 4: Phát hiện lỗi parse sai dữ liệu suốt 3 ngày qua
* **HTTP Webhook**: Dữ liệu đã gửi đi là hết. Muốn sửa phải nhờ đội vận hành PBX xuất file Excel thô rồi viết script vá dữ liệu thủ công.
* **Apache Kafka**: Sửa lỗi bug trong code, sau đó dùng lệnh quản trị tua lại bookmark:
  ```bash
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group group.crm --topic mblife.pbx.cdr.v1 \
    --reset-offsets --to-offset 0 --execute
  ```
  Hệ thống tự động chạy lại toàn bộ dữ liệu 3 ngày với logic chuẩn xác trong vài phút.

### Tình huống 5: Khách hàng muốn tích hợp thêm hệ thống BI / Data Warehouse
* **HTTP Webhook**: Kỹ sư PBX phải sửa code tổng đài để bắn thêm một Webhook endpoint thứ hai. Latency cuộc gọi bị nhân đôi; nếu hệ thống BI bị chậm sẽ kéo sập cả luồng CRM chính.
* **Apache Kafka**: Đội PBX **không cần chạm vào một dòng code nào**. Đội BI chỉ việc tạo một Consumer Group mới (`group.bi`) và bắt đầu subscribe vào topic có sẵn. Hoàn toàn cách ly và độc lập.

---

## 10. Ba Quy Tắc Vàng Khi Tiến Hóa Schema (Schema Evolution)

Kafka xem nội dung payload của message là một chuỗi bytes thô. Do đó, Producer và Consumer phải thống nhất một cấu trúc dữ liệu chung (Schema). Để tránh làm sập các Consumer đang chạy khi cập nhật hệ thống, bắt buộc phải tuân thủ 3 quy tắc:

| Loại Thay Đổi | Được Làm Trên `.v1` Không? | Nguyên Tắc Kỹ Thuật |
| :--- | :---: | :--- |
| **Thêm trường mới** | **ĐƯỢC** | Trường mới phải là trường tùy chọn (optional) hoặc có giá trị mặc định (`default`). Consumer phiên bản cũ đọc bản tin mới sẽ tự động bỏ qua trường này mà không bị lỗi JSON parse. |
| **Đổi ý nghĩa trường cũ** | **CẤM TUYỆT ĐỐI** | Ví dụ: trường `billsec` đang tính bằng giây, không được tự ý đổi sang mili-giây. Consumer cũ lấy số mili-giây nhân với đơn giá sẽ tính sai cước phí hàng ngàn lần. Trường hợp này phải tạo topic mới `.v2`. |
| **Xóa trường cũ** | **CẤM TUYỆT ĐỐI** | Nếu không dùng trường cũ nữa, hãy tiếp tục gửi kèm giá trị rỗng (`null` hoặc `""`) và đánh dấu `deprecated`. Cấm xóa hẳn khỏi schema vì các Consumer cũ vẫn đang phụ thuộc vào trường đó. |

---

## 11. Redpanda vs Apache Kafka: Điểm Khác Biệt Then Chốt

[Redpanda](https://redpanda.com) là hệ thống streaming thế hệ mới tương thích **100% Kafka Wire Protocol** (mọi thư viện `confluent-kafka`, Kafka CLI, Kafka Connect đều hoạt động nguyên vẹn mà không cần sửa code):

```mermaid
graph TD
    subgraph KafkaArch["Apache Kafka (JVM Engine)"]
        K_JVM[Java Virtual Machine] --> K_GC[Garbage Collection Pauses]
        K_OS[OS PageCache Management]
    end

    subgraph RedpandaArch["Redpanda (Native C++ Engine)"]
        R_CPP[C++ 20 Native Code] --> R_SEA[Seastar Framework: Thread-Per-Core]
        R_DIR[Direct I/O: Bỏ qua PageCache, Ghi thẳng NVMe SSD]
        R_RAFT[Tích hợp sẵn Built-in Raft Consensus]
    end
```

* **Không có JVM & Không có GC Pauses**: Viết bằng C++20 tối ưu, loại bỏ hoàn toàn hiện tượng jitter độ trễ do Garbage Collection của Java.
* **Kiến trúc Thread-per-core (Seastar Framework)**: Mỗi CPU Core xử lý một thread độc lập, không lock tranh chấp bộ nhớ, tối ưu tối đa năng lực phần cứng hiện đại.
* **Độ trễ P99 cực thấp**: Thấp hơn Kafka từ 3 đến 6 lần trong các bài kiểm thử tải cao.
* **Bộ công cụ dòng lệnh cực nhanh (`rpk`)**: Thay thế hàng loạt file script `.sh` phức tạp của Kafka bằng một file binary duy nhất.

---

## 12. Code Mẫu Thực Chiến (Python confluent-kafka)

### 12.1. Producer — Gửi sự kiện an toàn kèm Partition Key
```python
# name: pbx_producer.py
# description: Kafka producer gửi dữ liệu CDR kèm linkedid làm partition key

import json
from confluent_kafka import Producer

def delivery_report(err, msg):
    """Callback thông báo trạng thái ghi bản tin lên Broker."""
    if err is not None:
        print(f"❌ Ghi thất bại: {err}")
    else:
        print(f"✅ Ghi thành công vào [{msg.topic()}] Partition: {msg.partition()} Offset: {msg.offset()}")

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''client.id'': ''mblife-pbx-producer'',
    ''acks'': ''all'',  # Đảm bảo toàn bộ ISR đã nhận tin
    ''enable.idempotence'': True,  # Chống trùng lặp dữ liệu phía Producer
    ''retries'': 5
}

producer = Producer(conf)

cdr_payload = {
    "linkedid": "1759734000.1",
    "uniqueid": "1759734000.1",
    "direction": "outbound",
    "caller": "0912345678",
    "callee": "19001234",
    "disposition": "ANSWERED",
    "duration": 45,
    "billsec": 38,
    "start_time": "2026-10-10 10:00:00"
}

# QUAN TRỌNG: Gán key là linkedid để mọi sự kiện của cuộc gọi này luôn rơi vào cùng 1 partition
producer.produce(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_payload[''linkedid''].encode(''utf-8''),
    value=json.dumps(cdr_payload).encode(''utf-8''),
    callback=delivery_report
)

# Chờ hoàn tất gửi toàn bộ batch trong hàng đợi
producer.flush()
```

### 12.2. Consumer — Đọc dữ liệu, Xử lý Idempotent và Graceful Shutdown
```python
# name: pbx_consumer.py
# description: Consumer đọc CDR với cam kết At-Least-Once và Graceful Shutdown

import json
import signal
import sys
from confluent_kafka import Consumer, KafkaError

running = True

def handle_shutdown(sig, frame):
    global running
    print("\nĐang nhận tín hiệu dừng, đóng Consumer an toàn...")
    running = False

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''group.id'': ''mblife.crm.cdr-sync'',
    ''auto.offset.reset'': ''earliest'',
    ''enable.auto.commit'': False,  # Tắt auto-commit để kiểm soát thủ công
    ''max.poll.interval.ms'': 300000
}

consumer = Consumer(conf)
consumer.subscribe([''mblife.pbx.cdr.v1''])

print("🚀 Consumer đang chạy. Bấm Ctrl+C để thoát.")

try:
    while running:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f"Lỗi Consumer: {msg.error()}")
                break

        # 1. Giải mã dữ liệu
        data = json.loads(msg.value().decode(''utf-8''))
        call_id = msg.key().decode(''utf-8'')

        # 2. Xử lý nghiệp vụ (Idempotent Insert vào CRM DB)
        print(f"Xử lý cuộc gọi: {call_id} | Thời lượng: {data.get(''duration'')}s")

        # 3. Commit offset SAU KHI ghi cơ sở dữ liệu thành công (At-Least-Once)
        consumer.commit(message=msg, asynchronous=False)

finally:
    # Đóng kết nối và bàn giao lại partition cho group
    consumer.close()
    print("Consumer đã đóng an toàn.")
```

---

## 13. Cheat Sheet Các Lệnh CLI Quản Trị Cần Thiết

| Mục Đích | Lệnh Chuẩn Apache Kafka CLI | Lệnh Nhanh Redpanda CLI (`rpk`) |
| :--- | :--- | :--- |
| **Tạo Topic mới** | `kafka-topics.sh --create --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --partitions 3 --replication-factor 3` | `rpk topic create mblife.pbx.cdr.v1 -p 3 -r 3` |
| **Xem danh sách Topics** | `kafka-topics.sh --list --bootstrap-server localhost:9092` | `rpk topic list` |
| **Xem chi tiết Topic & Partitions** | `kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1` | `rpk topic describe mblife.pbx.cdr.v1` |
| **Kiểm tra Consumer Lag** | `kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync` | `rpk group describe mblife.crm.cdr-sync` |
| **Đọc thử tin nhắn từ đầu** | `kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --from-beginning --property print.key=true` | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n'' --offset start` |
| **Tua lại Offset (Replay)** | `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync --topic mblife.pbx.cdr.v1 --reset-offsets --to-earliest --execute` | `rpk group seek mblife.crm.cdr-sync --to start --topics mblife.pbx.cdr.v1` |

---

## 14. Tổng Kết

Hiểu rõ lý thuyết cốt lõi của Apache Kafka và Redpanda giúp chúng ta nhận ra rằng:
1. **Kafka không phải là Message Queue thông thường**: Nó là một **Distributed Append-Only Commit Log** kiêm hệ thống lưu trữ bền vững.
2. **Thứ tự nghiệp vụ nằm ở Partition Key**: Luôn chọn khóa phân vùng cẩn thận (`linkedid`, `order_id`) để không làm xáo trộn chuỗi sự kiện.
3. **Consumer độc lập hoàn toàn**: Một nguồn sự kiện duy nhất có thể nuôi sống đồng thời toàn bộ các hệ sinh thái từ CRM, Data Lake cho tới Realtime AI mà không gây nghẽn hệ thống nguồn.
', 'src/content/blog/kafka-core-concepts-and-architecture.mdx', '2026-10-10 15:09:42', '2026-10-10 15:18:14', 'git', 'toan tap ly thuyet cot loi apache kafka: tu nen tang event streaming den kien truc phan tan thuc chien cam nang chuyen sau toan dien ve apache kafka (4.x/kraft) va redpanda: ban chat event streaming, topics, partitions, commit log, zero-copy, replication, consumer groups, schema evolution va 5 bai toan thuc chien thay the webhook. apachekafka eventstreaming distributedsystems redpanda systemarchitecture comprehensive foundation and architecture guide for apache kafka and redpanda. covers event streaming fundamentals, append-only commit logs, sequential i/o, pagecache zero-copy, partition key hashing, replication factor with isr and kraft consensus, consumer group scaling limits, delivery semantics (at-most-once, at-least-once, exactly-once), schema evolution rules, and 5 real-world battle-tested scenarios comparing webhooks vs kafka. 
## 1. ban chat cua event streaming: "he than kinh trung uong ky thuat so"

theo tai lieu chinh thuc cua apache kafka (*kafka 4.x documentation*), trong the gioi doanh nghiep hien dai dinh huong bang phan mem va tu dong hoa, **event streaming** dong vai tro tuong duong voi **he than kinh trung uong (central nervous system)** cua co the con nguoi.

```mermaid
graph td
    subgraph sources["nguon sinh su kien (event sources)"]
        db[(co so du lieu cdc)]
        iot[thiet bi iot / sensors]
        pbx[tong dai pbx / vien thong]
        app[ung dung mobile / web]
    end

    subgraph kafkacore["apache kafka / redpanda cluster"]
        broker1[broker 01]
        broker2[broker 02]
        broker3[broker 03]
        log[(append-only commit log<br/>durable storage)]
    end

    subgraph destinations["he thong tieu thu (consumers / sinks)"]
        analytics[(bi / data lakehouse)]
        crm[he thong crm / erp]
        ai[voice ai / llm inference]
        alert[real-time monitoring / alert]
    end

    sources -->|publish streams of events| kafkacore
    kafkacore -->|subscribe & stream real-time| destinations
```

### 1.1. dinh nghia ky thuat
**event streaming** la phuong thuc:
1. **thu thap thoi gian thuc (capture in real-time)** cac dong su kien tu nguon phat sinh (database transactions, telemetry sensors, thiet bi di dong, cloud services, ung dung nghiep vu).
2. **luu tru ben vung (durable storage)** cac luong su kien nay theo co che phan tan, dam bao tinh san sang cao va khong bi mat mat du lieu.
3. **xu ly va phan hoi (manipulate & react)** theo thoi gian thuc (real-time stream processing) cung nhu truy hoi lich su (retrospective processing).
4. **dinh tuyen linh hoat (route event streams)** den cac ha tang dich khi co nhu cau ma khong lam thay doi tang nguon.

### 1.2. ba tru cot nang luc cot loi cua apache kafka
apache kafka ket hop 3 kha nang then chot trong mot nen tang duy nhat:
* **publish & subscribe**: ghi (publish) va doc (subscribe) cac dong su kien voi thong luong hang trieu message moi giay ma khong gay nghen co chai.
* **durable storage**: luu tru an toan, tin cay tren dia cung trong thoi gian tuy chon (tu vai gio, vai tuan cho den vinh vien), khong xoa message ngay sau khi doc.
* **process in real-time**: kha nang phan tich, tong hop, bien doi luong du lieu lien tuc ngay khi chung phat sinh thong qua kafka streams api.

---

## 2. mo hinh mental model: so cai ke toan vs hang doi truyen thong

de hieu can ke kafka ngay tu ngay dau tien, hay xoa bo tu duy ve cac message queue truyen thong (nhu rabbitmq, activemq) va chuyen sang tu duy **so cai ke toan ghi noi tiep (append-only ledger)**:

```mermaid
graph lr
    subgraph traditionalmq["message queue truyen thong (rabbitmq)"]
        q[hang doi queue] -->|lay ra & xoa bo| w1[worker a]
        q -.->|da bi xoa| w2[worker b khong doc duoc nua]
    end

    subgraph kafkalog["apache kafka (distributed commit log)"]
        l0[offset 0] --> l1[offset 1] --> l2[offset 2] --> l3[offset 3] --> l4[offset 4]
        c1[bookmark group crm: offset 4]
        c2[bookmark group bi: offset 2]
    end
```

| dac diem | message queue truyen thong (rabbitmq / activemq) | apache kafka / redpanda |
| :--- | :--- | :--- |
| **ban chat luu tru** | bo nho tam (transient buffer) — message bi **xoa ngay** sau khi consumer xac nhan (ack). | cuon so cai chi ghi them (**append-only commit log**) — message duoc luu ben vung tren dia theo thoi gian (`retention.ms`). |
| **co che doc** | broker chu dong day message xuong consumer (**push model**). | consumer chu dong keo message theo toc do xu ly cua minh (**pull model**). |
| **vi tri doc (offset)** | do broker theo doi trong ram; kho scale khi co hang trieu queue. | do consumer tu quan ly (**bookmarks**), luu tai topic noi bo `__consumer_offsets`. |
| **da nguoi doc** | muon nhieu service doc cung du lieu phai tao fanout exchange va duplicate du lieu ra nhieu queue. | nhieu consumer group doc lap cung doc chung 1 log duy nhat voi toc do va vi tri rieng. |
| **kha nang replay** | **khong the** — da lay ra la mat vinh vien. | **cuc ky de dang** — chi can tua lai offset (seek) de doc lai du lieu 7 ngay truoc. |

---

## 3. cau truc mot su kien (event anatomy)

trong kafka, mot su kien (event / record) ghi lai mot du kien thuc te da xay ra trong the gioi thuc hoac he thong kinh doanh ("something happened"):

```
+-----------------------------------------------------------------+
|                       kafka record / event                      |
+-----------------------------------------------------------------+
| headers   | trace_id=xyz-123, env=production, app=mblife-pbx   |
+-----------+-----------------------------------------------------+
| timestamp | 1759734000120 (epoch milliseconds - createtime)    |
+-----------+-----------------------------------------------------+
| key       | "1759734000.1" (dinh danh logic: linkedid cuoc goi) |
+-----------+-----------------------------------------------------+
| value     | { "caller": "0912345678", "callee": "19001234", ... }|
+-----------------------------------------------------------------+
```

1. **key (khoa)**: chuoi byte tuy chon dung de xac dinh **partition dich** thong qua thuat toan bam (hashing). tat ca message co cung key luon roi vao dung mot partition duy nhat.
2. **value (gia tri)**: payload noi dung nghiep vu (json, avro, protobuf, nhi phan).
3. **timestamp (dau thoi gian)**: thoi diem su kien duoc tao (`createtime`) hoac thoi diem broker tiep nhan (`logappendtime`).
4. **headers (sieu du lieu)**: cap key-value tuy chon chua thong tin metadata nhu `trace_id` (opentelemetry), nguon goc tenant, chu ky xac thuc.

---

## 4. topics va 3 nguyen ly vang ve partition

### 4.1. topic la gi?
topic la don vi to chuc logic cua cac dong su kien (tuong duong voi mot bang trong database hoac mot thu muc tren file system).
* **quy uoc dat ten topic chuan doanh nghiep**:
  $$\text{<domain>}.\text{<subdomain>}.\text{<entity>}.\text{<version>}$$
  * vi du vien thong pbx: `mblife.pbx.cdr.v1` (ban ghi cuoc cuoc goi), `mblife.pbx.call-insight.v1` (ket qua phan tich giong noi).
* **vi sao phai tach topic thay vi gop chung?**
  * **khac biet ve sla & tan suat**: cdr sinh ra ngay tuc thi (vai tram bytes), trong khi voice insight can xu ly ai mat 2-3 phut (hang tram kb).
  * **chinh sach retention khac nhau**: cdr can luu tru 90 ngay phuc vu doi soat cuoc phi, insight chi can luu 7 ngay de day vao data lake.

### 4.2. partition: don vi co gian vat ly (unit of scalability)
mot topic duoc chia thanh nhieu lat cat vat ly goi la **partition** nam rai rac tren cac broker khac nhau:

```mermaid
graph td
    subgraph topic["topic: mblife.pbx.cdr.v1 (3 partitions)"]
        subgraph p0["partition 0 (broker 1)"]
            p0_0[offset 0] --> p0_1[offset 1] --> p0_2[offset 2]
        end
        subgraph p1["partition 1 (broker 2)"]
            p1_0[offset 0] --> p1_1[offset 1] --> p1_2[offset 2]
        end
        subgraph p2["partition 2 (broker 3)"]
            p2_0[offset 0] --> p2_1[offset 1] --> p2_2[offset 2]
        end
    end

    producer[producer] -->|hash(key) % 3| topic
```

### 3 nguyen ly vang bat buoc phai thuoc long:

#### 1. thu tu chi duoc dam bao tuyet doi trong cung mot partition
* kafka **khong bao gio dam bao thu tu toan cuc (global ordering)** tren toan bo topic.
* neu cuoc goi co 3 su kien: `dialing` $\rightarrow$ `answered` $\rightarrow$ `hangup`, ban **bat buoc** phai dam bao ca 3 su kien nay roi vao cung mot partition. neu roi vao 2 partition khac nhau, consumer doc song song co the nhan `hangup` truoc khi nhan `answered`.

#### 2. key quyet dinh partition
* thuat toan mac dinh: $\text{partition} = \text{murmur2}(\text{key}) \pmod{\text{total\_partitions}}$.
* cung mot key $\rightarrow$ luon vao cung mot partition $\rightarrow$ luon giu dung thu tu thoi gian.
* **khong co key (`key = null`)**: kafka gui ngau nhien theo co che round-robin (hoac sticky partitioning de toi uu batching). du lieu se bi rai deu nhung mat hoan toan thu tu nghiep vu giua cac ban tin lien quan.

#### 3. gioi han song song cua consumer: $n_{consumer} \le n_{partitions}$
* tai mot thoi diem, **mot partition chi duoc giao cho duy nhat mot consumer trong cung mot consumer group**.
* neu topic co 3 partitions:
  * 1 consumer: doc ca 3 partitions (cham).
  * 3 consumers: moi con doc 1 partition (toi uu toi da thong luong).
  * 4 consumers: **consumer thu 4 se ngoi choi xoi nuoc (idle)**, chi hoat dong khi 1 trong 3 con kia bi chet (failover).

```mermaid
graph lr
    subgraph topicpartitions["topic: 3 partitions"]
        part0[partition 0]
        part1[partition 1]
        part2[partition 2]
    end

    subgraph consumergroup["consumer group: 4 consumers"]
        c1[consumer 1]
        c2[consumer 2]
        c3[consumer 3]
        c4[consumer 4: idle / standby]
    end

    part0 --> c1
    part1 --> c2
    part2 --> c3
    style c4 fill:#fbb,stroke:#d33,stroke-dasharray: 5 5
```

---

## 5. offset va co che consumer group doc lap

### 5.1. offset la gi?
offset la so nguyen tang dan lien tuc $(0, 1, 2, 3...)$ gan cho moi message khi duoc ghi vao partition. offset khong bao gio bi tai su dung. no dong vai tro nhu **so trang sach (bookmark)** de consumer ghi nho minh da doc toi dau.

### 5.2. su doc lap giua cac consumer group
nhieu phong ban hoac dich vu khac nhau co the doc cung mot topic ma khong anh huong toi nhau:

```mermaid
graph td
    topic[topic: mblife.pbx.cdr.v1]

    subgraph groupcrm["consumer group: group.crm (doc real-time)"]
        crm1[crm worker 1: offset 1050]
    end

    subgraph groupbi["consumer group: group.bi-warehouse (chay batch)"]
        bi1[bi worker 1: offset 420]
    end

    subgraph groupai["consumer group: group.voice-ai (dang replay)"]
        ai1[ai worker 1: offset 0]
    end

    topic --> groupcrm
    topic --> groupbi
    topic --> groupai
```

* nhom `group.crm`: doc realtime o vi tri moi nhat (offset 1050) de hien thi len man hinh dien thoai vien.
* nhom `group.bi-warehouse`: doc cham rai (offset 420) gom batch 15 phut mot lan luu vao bigquery.
* nhom `group.voice-ai`: vua fix xong model, reset offset ve 0 de doc lai toan bo du lieu 3 ngay qua ma **khong he lam cham hay gian doan nhom crm**.

### 5.3. cac co che dam bao truyen phat (delivery semantics)

```mermaid
flowchart td
    start[consumer nhan message] --> choice{chon thoi diem commit offset}
    choice -->|commit truoc khi xu ly| atmostonce["at-most-once (toi da 1 lan)<br/>crash = mat tin, khong bao gio trung"]
    choice -->|commit sau khi luu db thanh cong| atleastonce["at-least-once (it nhat 1 lan)<br/>crash = doc lai, co the trung lap, can idempotent"]
    choice -->|dung kafka transaction api / 2pc| exactlyonce["exactly-once processing (chinh xac 1 lan)<br/>dam bao toan ven tuyet doi"]
```

1. **at-most-once (toi da mot lan)**:
   * commit offset ngay khi vua nhan ban tin tu broker, sau do moi xu ly.
   * neu tien trinh crash trong luc xu ly: ban tin bi mat vinh vien, khong bao gio doc lai. phu hop cho metrics giam sat hoac log khong quan trong.
2. **at-least-once (it nhat mot lan - khuyen nghi cho production)**:
   * xu ly va luu du lieu vao co so du lieu thanh cong roi moi commit offset.
   * neu tien trinh crash truoc khi commit: khi khoi dong lai, consumer se doc lai ban tin do $\rightarrow$ co the bi trung du lieu.
   * **giai phap bat buoc**: thiet ke consumer idempotent (kiem tra `uniqueid` hoac `linkedid` trong database truoc khi insert).
3. **exactly-once (chinh xac mot lan - eos)**:
   * ket hop idempotent producer (`enable.idempotence=true`) va transactional api (`sendoffsetstotransaction`). dam bao du lieu chi duoc ghi nhan dung mot lan duy nhat xuyen suot chuoi pipeline.

---

## 6. co che luu tru vat ly: tai sao kafka cuc ky nhanh?

nhieu ky su lam tuong rang doc/ghi tu dia cung (hdd/ssd) se luon cham hon ram. kafka dat duoc thong luong hang trieu message/giay nho 3 ky thuat cot loi:

```mermaid
graph lr
    subgraph diskio["1. sequential disk i/o"]
        d1[append-only log] -->|ghi noi tiep lien tuc| d2[toc do dat ~600mb/s tren hdd]
    end

    subgraph osmemory["2. os pagecache"]
        kernel[os kernel memory] -->|cache nong cac segment gan nhat| nojvm[khong ton ram jvm heap, khong bi gc pause]
    end

    subgraph netzerocopy["3. zero-copy transfer (sendfile)"]
        cache[pagecache] -->|chuyen truc tiep qua dma| nic[network socket / nic buffer]
        style nic fill:#bfb,stroke:#2b2
    end
```

### 6.1. sequential disk i/o (ghi dia tuan tu)
* ghi ngau nhien (random i/o) tren dia ton chi phi di chuyen dau doc vat ly (~vai tram iops).
* kafka chi su dung thao tac **append-only (ghi noi tiep vao cuoi file)**. toc do ghi tuan tu tren dia cung co the dat hang tram mb/giay, nhanh ngang ngua voi thao tac tren bo nho ram.

### 6.2. log segments & index
moi partition duoc chia nho thanh cac file phan doan (**segments**, mac dinh 1gb):
* `00000000000000000000.log`: chua noi dung byte thuc te cua cac message.
* `00000000000000000000.index`: bang chi muc thua (sparse index) anh xa giua `offset` $\rightarrow$ `vi tri byte vat ly trong file .log`.
* `00000000000000000000.timeindex`: anh xa giua `timestamp` $\rightarrow$ `offset` phuc vu tim kiem theo thoi gian.

### 6.3. zero-copy qua linux system call `sendfile()`
trong cac he thong thong thuong, du lieu truyen tu dia ra mang phai qua 4 lan copy va 4 lan chuyen doi ngu canh (context switches):
$$\text{disk} \xrightarrow{\text{copy 1}} \text{os pagecache} \xrightarrow{\text{copy 2}} \text{jvm user memory} \xrightarrow{\text{copy 3}} \text{socket buffer} \xrightarrow{\text{copy 4}} \text{nic}$$

kafka su dung loi goi he thong `sendfile()` cua linux:
$$\text{os pagecache} \xrightarrow{\text{dma direct copy}} \text{nic (network interface card)}$$
du lieu di thang tu bo dem cua kernel ra card mang ma khong bao gio bi copy vao bo nho cua ung dung java, tiet kiem 100% tai nguyen cpu va loai bo hoan toan hien tuong garbage collection dung he thong.

---

## 7. phan tan, chiu loi & co che dong thuan (kraft vs zookeeper)

### 7.1. replication factor (he so nhan ban)
de chong mat du lieu khi may chu bi chay hoac sap nguon, moi partition duoc sao chep sang nhieu broker:
* **partition leader**: dam nhan tat ca tac vu ghi (write) va doc (read) cua client.
* **follower replicas**: dong vai tro la ban sao thu dong, lien tuc gui yeu cau fetch de dong bo du lieu tu leader.
* **in-sync replicas (isr)**: tap hop cac ban sao dang bat kip tien do voi leader. neu mot follower bi mat ket noi qua thoi gian `replica.lag.time.max.ms`, no se bi loai khoi danh sach isr.

```mermaid
graph td
    subgraph broker1["broker 1"]
        l0["partition 0 (leader)"]
        f1["partition 1 (follower)"]
    end

    subgraph broker2["broker 2"]
        f0["partition 0 (follower)"]
        l1["partition 1 (leader)"]
    end

    subgraph broker3["broker 3"]
        f0_3["partition 0 (follower)"]
        f1_3["partition 1 (follower)"]
    end

    clientwrite[client write] -->|chi ghi vao leader| l0
    f0 -.->|fetch dong bo| l0
    f0_3 -.->|fetch dong bo| l0
```

### 7.2. cau hinh do an toan `acks` cua producer:
* `acks=0`: producer gui xong khong can cho broker phan hoi (cuc nhanh, rui ro mat du lieu cao).
* `acks=1`: producer cho dung mot minh partition leader ghi vao dia thanh cong (mac dinh).
* `acks=all` (hoac `-1`): producer cho toan bo cac broker trong danh sach **isr** xac nhan ghi dia thanh cong ket hop `min.insync.replicas=2`. day la tieu chuan vang cho cac he thong thanh toan, ngan hang va cuoc vien thong de cam ket **zero data loss**.

### 7.3. buoc chuyen minh sang kraft (kafka raft consensus)
truoc phien ban 3.x, kafka phu thuoc vao cum apache zookeeper ben ngoai de bau cu controller va luu metadata, dan den do tre dong bo cao va gioi han so luong partition o muc hang chuc ngan.
tu phien ban **kafka 4.x**, zookeeper bi loai bo hoan toan:
* cum kafka tu van hanh thuat toan dong thuan **kraft (event-driven raft)**.
* metadata cua toan bo cum duoc luu tru truc tiep duoi dang mot internal topic (`@metadata`).
* toc do bau cu lai leader nhanh hon gap 10 lan, khoi phuc cum tuc thi va ho tro mo rong len den **hang trieu partitions**.

---

## 8. nam api chinh thuc cua apache kafka (5 core apis)

he sinh thai apache kafka cung cap 5 bo api lap trinh tieu chuan:

```mermaid
graph td
    admin[1. admin api<br/>quan tri topics, brokers, quotas, acls]
    producer[2. producer api<br/>ghi luong su kien vao topics]
    consumer[3. consumer api<br/>doc va xu ly luong su kien tu topics]
    streams[4. kafka streams api<br/>xu ly luong thoi gian thuc, stateful joins, windows]
    connect[5. kafka connect api<br/>tich hop out-of-the-box voi db, s3, elasticsearch]
```

1. **admin api**: dung trong tooling quan tri (tao/xoa topic, thay doi cau hinh runtime, kiem tra acls, reassign partition).
2. **producer api**: thu vien client phia ung dung de day du lieu vao topic kem co che batching, nen (lz4, zstd, snappy) va retry.
3. **consumer api**: thu vien client phia ung dung de lang nghe topic, tu dong quan ly ket noi va rebalance khi scale out/in.
4. **kafka streams api**: thu vien java gon nhe nhung truc tiep vao microservices, ho tro bien doi stream-to-stream, xu ly windowing theo thoi gian su kien (event-time), state store cuc bo rocksdb va stream-table duality (kstream/ktable).
5. **kafka connect api**: framework chuan hoa giup ket noi kafka voi he thong ben ngoai ma khong can viet code:
   * **source connectors**: tu dong bat su kien tu postgresql (debezium cdc), mysql, oracle day vao kafka.
   * **sink connectors**: tu dong tieu thu du lieu tu kafka do vao elasticsearch, clickhouse, amazon s3, snowflake.

---

## 9. nam tinh huong thuc chien: vi sao kafka thay the webhook http?

*(phan tich thuc te tu tai lieu `docs/kafka-101.html` ap dung trong he thong tong dai pbx)*

### tinh huong 1: backend sap 2 tieng luc 2 gio sang
* **http webhook**: pbx gui http post nhan loi `connection refused` hoac `504 timeout`. muon khong mat du lieu, doi pbx phai tu code them co che hang doi dem va retry phuc tap trong tong dai.
* **apache kafka**: pbx day vao kafka chi mat ~3ms roi giai phong tai nguyen. message nam nguyen ven an toan tren partition. 4 gio sang backend khoi dong lai, consumer tu dong doc noi tiep tu offset cu va xu ly 100% du lieu ma khong that thoat mot ban ghi nao.

### tinh huong 2: trien khai phien ban moi (deployment rolling update 10 phut)
* **http webhook**: cac ket noi dang dang do bi dut gay giua chung (connection reset by peer). hoac phai dung ha tang blue-green ton kem, hoac phai chap nhan gian doan.
* **apache kafka**: tat toan bo consumer backend de deploy. du lieu cuoc goi van deu dan do vao kafka. sau 10 phut backend bat len, consumer tang toc tieu thu (catch up lag) ve 0 chi trong vai chuc giay.

### tinh huong 3: gio cao diem 200 cuoc/phut nhung database chi ghi kip 50 cuoc/phut
* **http webhook**: webhook don u, backend can kiet connection pool cua database, gay sap do day chuyen (cascading failure).
* **apache kafka**: kafka hoat dong nhu mot **be chua dem khong lo (backpressure absorber)**. producer van gui 200 cuoc/phut, consumer van thong tha doc 50 cuoc/phut theo dung nang luc cua database. khong he thong nao bi qua tai.

### tinh huong 4: phat hien loi parse sai du lieu suot 3 ngay qua
* **http webhook**: du lieu da gui di la het. muon sua phai nho doi van hanh pbx xuat file excel tho roi viet script va du lieu thu cong.
* **apache kafka**: sua loi bug trong code, sau do dung lenh quan tri tua lai bookmark:
  ```bash
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group group.crm --topic mblife.pbx.cdr.v1 \
    --reset-offsets --to-offset 0 --execute
  ```
  he thong tu dong chay lai toan bo du lieu 3 ngay voi logic chuan xac trong vai phut.

### tinh huong 5: khach hang muon tich hop them he thong bi / data warehouse
* **http webhook**: ky su pbx phai sua code tong dai de ban them mot webhook endpoint thu hai. latency cuoc goi bi nhan doi; neu he thong bi bi cham se keo sap ca luong crm chinh.
* **apache kafka**: doi pbx **khong can cham vao mot dong code nao**. doi bi chi viec tao mot consumer group moi (`group.bi`) va bat dau subscribe vao topic co san. hoan toan cach ly va doc lap.

---

## 10. ba quy tac vang khi tien hoa schema (schema evolution)

kafka xem noi dung payload cua message la mot chuoi bytes tho. do do, producer va consumer phai thong nhat mot cau truc du lieu chung (schema). de tranh lam sap cac consumer dang chay khi cap nhat he thong, bat buoc phai tuan thu 3 quy tac:

| loai thay doi | duoc lam tren `.v1` khong? | nguyen tac ky thuat |
| :--- | :---: | :--- |
| **them truong moi** | **duoc** | truong moi phai la truong tuy chon (optional) hoac co gia tri mac dinh (`default`). consumer phien ban cu doc ban tin moi se tu dong bo qua truong nay ma khong bi loi json parse. |
| **doi y nghia truong cu** | **cam tuyet doi** | vi du: truong `billsec` dang tinh bang giay, khong duoc tu y doi sang mili-giay. consumer cu lay so mili-giay nhan voi don gia se tinh sai cuoc phi hang ngan lan. truong hop nay phai tao topic moi `.v2`. |
| **xoa truong cu** | **cam tuyet doi** | neu khong dung truong cu nua, hay tiep tuc gui kem gia tri rong (`null` hoac `""`) va danh dau `deprecated`. cam xoa han khoi schema vi cac consumer cu van dang phu thuoc vao truong do. |

---

## 11. redpanda vs apache kafka: diem khac biet then chot

[redpanda](https://redpanda.com) la he thong streaming the he moi tuong thich **100% kafka wire protocol** (moi thu vien `confluent-kafka`, kafka cli, kafka connect deu hoat dong nguyen ven ma khong can sua code):

```mermaid
graph td
    subgraph kafkaarch["apache kafka (jvm engine)"]
        k_jvm[java virtual machine] --> k_gc[garbage collection pauses]
        k_os[os pagecache management]
    end

    subgraph redpandaarch["redpanda (native c++ engine)"]
        r_cpp[c++ 20 native code] --> r_sea[seastar framework: thread-per-core]
        r_dir[direct i/o: bo qua pagecache, ghi thang nvme ssd]
        r_raft[tich hop san built-in raft consensus]
    end
```

* **khong co jvm & khong co gc pauses**: viet bang c++20 toi uu, loai bo hoan toan hien tuong jitter do tre do garbage collection cua java.
* **kien truc thread-per-core (seastar framework)**: moi cpu core xu ly mot thread doc lap, khong lock tranh chap bo nho, toi uu toi da nang luc phan cung hien dai.
* **do tre p99 cuc thap**: thap hon kafka tu 3 den 6 lan trong cac bai kiem thu tai cao.
* **bo cong cu dong lenh cuc nhanh (`rpk`)**: thay the hang loat file script `.sh` phuc tap cua kafka bang mot file binary duy nhat.

---

## 12. code mau thuc chien (python confluent-kafka)

### 12.1. producer — gui su kien an toan kem partition key
```python
# name: pbx_producer.py
# description: kafka producer gui du lieu cdr kem linkedid lam partition key

import json
from confluent_kafka import producer

def delivery_report(err, msg):
    """callback thong bao trang thai ghi ban tin len broker."""
    if err is not none:
        print(f"❌ ghi that bai: {err}")
    else:
        print(f"✅ ghi thanh cong vao [{msg.topic()}] partition: {msg.partition()} offset: {msg.offset()}")

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''client.id'': ''mblife-pbx-producer'',
    ''acks'': ''all'',  # dam bao toan bo isr da nhan tin
    ''enable.idempotence'': true,  # chong trung lap du lieu phia producer
    ''retries'': 5
}

producer = producer(conf)

cdr_payload = {
    "linkedid": "1759734000.1",
    "uniqueid": "1759734000.1",
    "direction": "outbound",
    "caller": "0912345678",
    "callee": "19001234",
    "disposition": "answered",
    "duration": 45,
    "billsec": 38,
    "start_time": "2026-10-10 10:00:00"
}

# quan trong: gan key la linkedid de moi su kien cua cuoc goi nay luon roi vao cung 1 partition
producer.produce(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_payload[''linkedid''].encode(''utf-8''),
    value=json.dumps(cdr_payload).encode(''utf-8''),
    callback=delivery_report
)

# cho hoan tat gui toan bo batch trong hang doi
producer.flush()
```

### 12.2. consumer — doc du lieu, xu ly idempotent va graceful shutdown
```python
# name: pbx_consumer.py
# description: consumer doc cdr voi cam ket at-least-once va graceful shutdown

import json
import signal
import sys
from confluent_kafka import consumer, kafkaerror

running = true

def handle_shutdown(sig, frame):
    global running
    print("\ndang nhan tin hieu dung, dong consumer an toan...")
    running = false

signal.signal(signal.sigint, handle_shutdown)
signal.signal(signal.sigterm, handle_shutdown)

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''group.id'': ''mblife.crm.cdr-sync'',
    ''auto.offset.reset'': ''earliest'',
    ''enable.auto.commit'': false,  # tat auto-commit de kiem soat thu cong
    ''max.poll.interval.ms'': 300000
}

consumer = consumer(conf)
consumer.subscribe([''mblife.pbx.cdr.v1''])

print("🚀 consumer dang chay. bam ctrl+c de thoat.")

try:
    while running:
        msg = consumer.poll(timeout=1.0)
        if msg is none:
            continue
        if msg.error():
            if msg.error().code() == kafkaerror._partition_eof:
                continue
            else:
                print(f"loi consumer: {msg.error()}")
                break

        # 1. giai ma du lieu
        data = json.loads(msg.value().decode(''utf-8''))
        call_id = msg.key().decode(''utf-8'')

        # 2. xu ly nghiep vu (idempotent insert vao crm db)
        print(f"xu ly cuoc goi: {call_id} | thoi luong: {data.get(''duration'')}s")

        # 3. commit offset sau khi ghi co so du lieu thanh cong (at-least-once)
        consumer.commit(message=msg, asynchronous=false)

finally:
    # dong ket noi va ban giao lai partition cho group
    consumer.close()
    print("consumer da dong an toan.")
```

---

## 13. cheat sheet cac lenh cli quan tri can thiet

| muc dich | lenh chuan apache kafka cli | lenh nhanh redpanda cli (`rpk`) |
| :--- | :--- | :--- |
| **tao topic moi** | `kafka-topics.sh --create --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --partitions 3 --replication-factor 3` | `rpk topic create mblife.pbx.cdr.v1 -p 3 -r 3` |
| **xem danh sach topics** | `kafka-topics.sh --list --bootstrap-server localhost:9092` | `rpk topic list` |
| **xem chi tiet topic & partitions** | `kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1` | `rpk topic describe mblife.pbx.cdr.v1` |
| **kiem tra consumer lag** | `kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync` | `rpk group describe mblife.crm.cdr-sync` |
| **doc thu tin nhan tu dau** | `kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --from-beginning --property print.key=true` | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n'' --offset start` |
| **tua lai offset (replay)** | `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync --topic mblife.pbx.cdr.v1 --reset-offsets --to-earliest --execute` | `rpk group seek mblife.crm.cdr-sync --to start --topics mblife.pbx.cdr.v1` |

---

## 14. tong ket

hieu ro ly thuyet cot loi cua apache kafka va redpanda giup chung ta nhan ra rang:
1. **kafka khong phai la message queue thong thuong**: no la mot **distributed append-only commit log** kiem he thong luu tru ben vung.
2. **thu tu nghiep vu nam o partition key**: luon chon khoa phan vung can than (`linkedid`, `order_id`) de khong lam xao tron chuoi su kien.
3. **consumer doc lap hoan toan**: mot nguon su kien duy nhat co the nuoi song dong thoi toan bo cac he sinh thai tu crm, data lake cho toi realtime ai ma khong gay nghen he thong nguon.
');
INSERT INTO articles (id, slug, title, description, pub_date, updated_date, thumbnail, thumbnail_alt, hashtags, seo_keywords, draft, is_knowledge_base, kb_category, target_agents, summary_for_agents, raw_markdown, raw_content, file_path, created_at, updated_at, source, search_text) VALUES ('kafka-pbx-event-streaming-architecture', 'kafka-pbx-event-streaming-architecture', 'Kiến Trúc Event Streaming PBX Telephony: Từ Webhook sang Apache Kafka & Redpanda', 'Nghiên cứu kiến trúc thay thế webhook truyền thống trong hệ thống tổng đài PBX bằng Redpanda/Kafka. Phân tích phân bổ Partition Key theo linkedid, Consumer Groups độc lập, Offset Semantics và phòng chống Hot Partition.', '2026-10-10T00:00:00.000Z', '2026-10-10T15:18:14.370Z', '/images/blog/default.png', 'Kiến trúc Event Streaming PBX Telephony với Kafka và Redpanda', '["ApacheKafka","Redpanda","EventDriven","TelephonyPBX","SystemArchitecture"]', '[]', 0, 1, 'architecture', '["claude","cursor","codex","anti"]', 'Deep-dive architecture into event-driven PBX telephony using Redpanda/Kafka. Replaces fragile HTTP webhooks with durable append-only event streams. Explains linkedid partition hashing for strict call event ordering, consumer group decoupling for CRM/Analytics/Voice-AI, offset commit semantics, and mitigation of hot partitions and rebalance storms.', '
## 1. Bài toán: Giới hạn của Webhook truyền thống trong tổng đài PBX

Trong hệ thống tổng đài doanh nghiệp (PBX mblife), mỗi cuộc gọi phát sinh nhiều sự kiện vòng đời:
1. **CDR (Call Detail Record)**: Sinh ra ngay khi cúp máy (thời lượng, đầu số gọi, đầu số nhận, cước phí, trạng thái `ANSWERED` / `BUSY` / `NO ANSWER`). Kích thước nhỏ (~vài trăm bytes).
2. **Call Insights (ASR + LLM Summary)**: Xử lý file ghi âm thành văn bản (Speech-to-Text) và chạy mô hình ngôn ngữ tóm tắt nội dung cuộc gọi. Kích thước lớn (~vài trăm KB), độ trễ hoàn thành sau cuộc gọi vài phút.

```mermaid
graph LR
    PBX[PBX Telephony Core] -->|Drop khi quá tải| Webhook[HTTP Webhook Endpoint]
    Webhook --> CRM[(CRM Database)]
    Webhook -.->|Chậm trễ / Timeout| ASR[Voice AI / ASR]
```

### Các rủi ro chí mạng khi dùng Webhook HTTP truyền thống:
- **Tắc nghẽn giờ cao điểm**: Khi lưu lượng cuộc gọi tăng vọt lên 200 cuộc/phút nhưng backend CRM khách hàng chỉ xử lý kịp 50 cuộc/phút, webhook HTTP sẽ timeout (504 Gateway Timeout), dẫn đến mất mát bản tin cuộc gọi vĩnh viễn.
- **Phụ thuộc thời gian hoạt động (Coupling)**: Nếu backend khách hàng bảo trì hoặc gặp sự cố sập mạng 2 tiếng, toàn bộ webhook gửi đến đều bị từ chối kết nối.
- **Không có cơ chế Replay**: Khi phát hiện lỗi parser hoặc logic nghiệp vụ sai trong code, hệ thống webhook không thể tua lại để phát lại dữ liệu đã qua.

---

## 2. Giải pháp: Kiến trúc Distributed Event Streaming

Để giải quyết triệt để sự phụ thuộc, hệ thống chuyển sang mô hình **Distributed Log (Cuốn sổ ghi thêm)** sử dụng **Redpanda** (tương thích 100% giao thức Apache Kafka).

```mermaid
flowchart TD
    PBX[Tổng Đài PBX mblife] -->|Produce JSON| TopicCDR[Topic: mblife.pbx.cdr.v1]
    PBX -->|Produce Audio URL| TopicInsight[Topic: mblife.pbx.insight.v1]

    subgraph KafkaCluster[Redpanda / Kafka Broker Cluster]
        TopicCDR
        TopicInsight
    end

    TopicCDR -->|Consumer Group 1| CRMWorker[CRM Sync Service]
    TopicCDR -->|Consumer Group 2| BIWorker[Real-time Analytics / BI]
    TopicInsight -->|Consumer Group 3| VoiceAIWorker[Voice Transcription & LLM]
```

### Tại sao chọn Redpanda thay cho Apache Kafka gốc?
- **Zero JVM, Zero Garbage Collection pause**: Viết bằng C++ trên nền tảng Seastar (Thread-per-core), độ trễ p99 cực thấp và ổn định.
- **Không cần Apache ZooKeeper / KRaft phức tạp**: Tích hợp sẵn giao thức đồng thuận Raft bên trong nhị phân duy nhất.
- **Tiết kiệm tài nguyên hạ tầng**: Phù hợp triển khai biên (Edge) hoặc VM tài nguyên giới hạn (1 node UAT RAM ~2GB) mà vẫn đạt thông lượng hàng chục nghìn message/giây.

---

## 3. Thiết kế Topic & Phân tách dữ liệu

Hệ thống thiết kế tách biệt 2 topic riêng biệt thay vì gộp chung:

| Thuộc tính | `mblife.pbx.cdr.v1` | `mblife.pbx.insight.v1` |
| :--- | :--- | :--- |
| **Thời điểm sinh** | Ngay lập tức khi cúp máy | 2 - 5 phút sau cuộc gọi |
| **Kích thước** | ~500 bytes (metadata cuộc gọi) | ~200 - 500 KB (transcript + LLM summary) |
| **Thời gian lưu (Retention)** | 30 - 90 ngày | 7 - 14 ngày |
| **Mục đích** | Đồng bộ CRM, tính cước, giám sát | Đào tạo AI, kiểm tra chất lượng cuộc gọi |

> **Nguyên tắc phân tách**: Nếu gộp chung vào 1 topic, các service chỉ cần cập nhật trạng thái cuộc gọi vào CRM cũng buộc phải tải về toàn bộ transcript nặng hàng trăm KB rồi vứt bỏ, gây lãng phí băng thông mạng nghiêm trọng.

---

## 4. Chiến lược Chọn Key & Phân bổ Partition

Một topic được chia thành nhiều partition con (ví dụ: 6 partitions) để cho phép nhiều consumer đọc song song. Tuy nhiên, việc chọn Message Key quyết định tính đúng đắn của toàn bộ hệ thống.

```mermaid
graph TD
    subgraph Partitions[Topic: mblife.pbx.cdr.v1]
        P0[Partition 0]
        P1[Partition 1]
        P2[Partition 2]
        P3[Partition 3]
        P4[Partition 4]
        P5[Partition 5]
    end

    Event1["call.inbound (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event2["call.answered (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event3["call.ended (key=''1710928301.12'')"] -->|MurmurHash2| P2
```

### 3 Nguyên tắc phân bổ bắt buộc:

1. **Thứ tự chỉ được đảm bảo trong cùng một Partition**:
   Kafka **không** đảm bảo thứ tự thời gian giữa các partition khác nhau. Cuộc gọi kết thúc lúc 10:00 ở Partition 1 có thể được đọc *sau* cuộc gọi kết thúc lúc 10:05 ở Partition 3.
2. **Bắt buộc dùng `linkedid` (Call ID) làm Message Key**:
   Tất cả sự kiện của cùng 1 cuộc gọi (`call.inbound`, `call.answered`, `call.ended`) phải có cùng một key là `linkedid`. Thuật toán băm MurmurHash2 sẽ đưa toàn bộ sự kiện này vào **cùng một partition duy nhất**, đảm bảo thứ tự thời gian tuyệt đối.
3. **Tuyệt đối tránh Hot Partition (Data Skew)**:
   Không được dùng `enterprise_id` hay `tenant_id` làm key. Nếu 1 doanh nghiệp lớn chiếm 80% sản lượng cuộc gọi, toàn bộ 80% lưu lượng sẽ dồn vào đúng 1 partition, khiến consumer phụ trách partition đó chạm ngưỡng 100% CPU trong khi 5 consumer còn lại ngồi nhàn rỗi.

---

## 5. Offset Semantics & Ba điều kiện bắt buộc ở Consumer

Offset đóng vai trò như chiếc "kẹp đánh dấu trang sách" của từng Consumer Group trên từng Partition.

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer Worker
    participant DB as CRM Database
    participant K as Kafka Broker (Redpanda)

    K->>C: Poll batch message (offset 101 - 105)
    C->>DB: Thực hiện ghi Idempotent (UPSERT theo linkedid)
    DB-->>C: Ghi thành công
    C->>K: Commit Offset (105)
```

### Ba điều kiện bắt buộc khi triển khai Consumer:
1. **Ghi Database Idempotent theo `linkedid`**:
   Vì Kafka tuân thủ cơ chế *At-least-once delivery* (ít nhất một lần), khi consumer crash trước khi commit offset, message có thể được gửi lại. Database phải sử dụng câu lệnh `UPSERT` / `ON CONFLICT DO UPDATE` dựa trên khóa chính `linkedid`.
2. **Commit Offset SAU KHI ghi Database thành công**:
   Tắt tự động commit (`enable.auto.commit = False`). Chỉ commit offset lên Broker sau khi giao dịch cơ sở dữ liệu đã commit thành công.
3. **Không giả định thứ tự giữa các cuộc gọi khác nhau**:
   Hệ thống chỉ tuần tự trong phạm vi từng cuộc gọi đơn lẻ.

---

## 6. Mẫu Code Triển Khai (Python)

### Producer (PBX Event Publisher):
```python
import json
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=[''10.0.0.10:9092''],
    key_serializer=lambda k: k.encode(''utf-8''),
    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode(''utf-8''),
    acks=''all'',  # Đảm bảo broker đã ghi vào đĩa
    retries=3
)

cdr_event = {
    "linkedid": "1710928301.12",
    "call_date": "2026-10-10T10:30:00+07:00",
    "caller": "0982294937",
    "callee": "19001234",
    "duration": 145,
    "disposition": "ANSWERED"
}

# Gửi với key là linkedid để đảm bảo thứ tự
producer.send(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_event[''linkedid''],
    value=cdr_event
)
producer.flush()
```

### Consumer (CRM Sync Worker):
```python
import json
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    ''mblife.pbx.cdr.v1'',
    bootstrap_servers=[''10.0.0.10:9092''],
    group_id=''crm-sync-service-v1'',
    auto_offset_reset=''earliest'',
    enable_auto_commit=False,  # Quản lý commit thủ công
    key_deserializer=lambda k: k.decode(''utf-8'') if k else None,
    value_deserializer=lambda v: json.loads(v.decode(''utf-8''))
)

for msg in consumer:
    cdr = msg.value
    try:
        # 1. Ghi Idempotent vào DB
        upsert_to_crm_database(cdr[''linkedid''], cdr)
        
        # 2. Commit offset sau khi DB lưu thành công
        consumer.commit()
    except Exception as e:
        logger.error(f"Lỗi xử lý record {msg.offset}: {e}")
        # Không commit offset để retry
        break
```

---

## 7. Bảng Cheat Sheet thao tác nhanh `rpk` (Redpanda CLI)

| Tác vụ | Câu lệnh CLI |
| :--- | :--- |
| **Kiểm tra sức khỏe cluster** | `rpk cluster info` |
| **Tạo topic 6 partitions** | `rpk topic create mblife.pbx.cdr.v1 -p 6 -r 1` |
| **Xem danh sách topic** | `rpk topic list` |
| **Xem chi tiết partition & offset** | `rpk topic describe mblife.pbx.cdr.v1` |
| **Giám sát Consumer Lag** | `rpk group describe crm-sync-service-v1` |
| **Tua lại offset (Replay từ đầu)** | `rpk group seek crm-sync-service-v1 --to-oldest --topics mblife.pbx.cdr.v1` |
| **Lắng nghe trực tiếp message** | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n''` |
', '---
title: >-
  Kiến Trúc Event Streaming PBX Telephony: Từ Webhook sang Apache Kafka &
  Redpanda
description: >-
  Nghiên cứu kiến trúc thay thế webhook truyền thống trong hệ thống tổng đài PBX
  bằng Redpanda/Kafka. Phân tích phân bổ Partition Key theo linkedid, Consumer
  Groups độc lập, Offset Semantics và phòng chống Hot Partition.
pubDate: ''2026-10-10T00:00:00.000Z''
updatedDate: ''2026-10-10T15:18:14.370Z''
thumbnail: /images/blog/default.png
thumbnailAlt: Kiến trúc Event Streaming PBX Telephony với Kafka và Redpanda
hashtags:
  - ApacheKafka
  - Redpanda
  - EventDriven
  - TelephonyPBX
  - SystemArchitecture
draft: false
isKnowledgeBase: true
kbCategory: architecture
targetAgents:
  - claude
  - cursor
  - codex
  - anti
summaryForAgents: >-
  Deep-dive architecture into event-driven PBX telephony using Redpanda/Kafka.
  Replaces fragile HTTP webhooks with durable append-only event streams.
  Explains linkedid partition hashing for strict call event ordering, consumer
  group decoupling for CRM/Analytics/Voice-AI, offset commit semantics, and
  mitigation of hot partitions and rebalance storms.
---

## 1. Bài toán: Giới hạn của Webhook truyền thống trong tổng đài PBX

Trong hệ thống tổng đài doanh nghiệp (PBX mblife), mỗi cuộc gọi phát sinh nhiều sự kiện vòng đời:
1. **CDR (Call Detail Record)**: Sinh ra ngay khi cúp máy (thời lượng, đầu số gọi, đầu số nhận, cước phí, trạng thái `ANSWERED` / `BUSY` / `NO ANSWER`). Kích thước nhỏ (~vài trăm bytes).
2. **Call Insights (ASR + LLM Summary)**: Xử lý file ghi âm thành văn bản (Speech-to-Text) và chạy mô hình ngôn ngữ tóm tắt nội dung cuộc gọi. Kích thước lớn (~vài trăm KB), độ trễ hoàn thành sau cuộc gọi vài phút.

```mermaid
graph LR
    PBX[PBX Telephony Core] -->|Drop khi quá tải| Webhook[HTTP Webhook Endpoint]
    Webhook --> CRM[(CRM Database)]
    Webhook -.->|Chậm trễ / Timeout| ASR[Voice AI / ASR]
```

### Các rủi ro chí mạng khi dùng Webhook HTTP truyền thống:
- **Tắc nghẽn giờ cao điểm**: Khi lưu lượng cuộc gọi tăng vọt lên 200 cuộc/phút nhưng backend CRM khách hàng chỉ xử lý kịp 50 cuộc/phút, webhook HTTP sẽ timeout (504 Gateway Timeout), dẫn đến mất mát bản tin cuộc gọi vĩnh viễn.
- **Phụ thuộc thời gian hoạt động (Coupling)**: Nếu backend khách hàng bảo trì hoặc gặp sự cố sập mạng 2 tiếng, toàn bộ webhook gửi đến đều bị từ chối kết nối.
- **Không có cơ chế Replay**: Khi phát hiện lỗi parser hoặc logic nghiệp vụ sai trong code, hệ thống webhook không thể tua lại để phát lại dữ liệu đã qua.

---

## 2. Giải pháp: Kiến trúc Distributed Event Streaming

Để giải quyết triệt để sự phụ thuộc, hệ thống chuyển sang mô hình **Distributed Log (Cuốn sổ ghi thêm)** sử dụng **Redpanda** (tương thích 100% giao thức Apache Kafka).

```mermaid
flowchart TD
    PBX[Tổng Đài PBX mblife] -->|Produce JSON| TopicCDR[Topic: mblife.pbx.cdr.v1]
    PBX -->|Produce Audio URL| TopicInsight[Topic: mblife.pbx.insight.v1]

    subgraph KafkaCluster[Redpanda / Kafka Broker Cluster]
        TopicCDR
        TopicInsight
    end

    TopicCDR -->|Consumer Group 1| CRMWorker[CRM Sync Service]
    TopicCDR -->|Consumer Group 2| BIWorker[Real-time Analytics / BI]
    TopicInsight -->|Consumer Group 3| VoiceAIWorker[Voice Transcription & LLM]
```

### Tại sao chọn Redpanda thay cho Apache Kafka gốc?
- **Zero JVM, Zero Garbage Collection pause**: Viết bằng C++ trên nền tảng Seastar (Thread-per-core), độ trễ p99 cực thấp và ổn định.
- **Không cần Apache ZooKeeper / KRaft phức tạp**: Tích hợp sẵn giao thức đồng thuận Raft bên trong nhị phân duy nhất.
- **Tiết kiệm tài nguyên hạ tầng**: Phù hợp triển khai biên (Edge) hoặc VM tài nguyên giới hạn (1 node UAT RAM ~2GB) mà vẫn đạt thông lượng hàng chục nghìn message/giây.

---

## 3. Thiết kế Topic & Phân tách dữ liệu

Hệ thống thiết kế tách biệt 2 topic riêng biệt thay vì gộp chung:

| Thuộc tính | `mblife.pbx.cdr.v1` | `mblife.pbx.insight.v1` |
| :--- | :--- | :--- |
| **Thời điểm sinh** | Ngay lập tức khi cúp máy | 2 - 5 phút sau cuộc gọi |
| **Kích thước** | ~500 bytes (metadata cuộc gọi) | ~200 - 500 KB (transcript + LLM summary) |
| **Thời gian lưu (Retention)** | 30 - 90 ngày | 7 - 14 ngày |
| **Mục đích** | Đồng bộ CRM, tính cước, giám sát | Đào tạo AI, kiểm tra chất lượng cuộc gọi |

> **Nguyên tắc phân tách**: Nếu gộp chung vào 1 topic, các service chỉ cần cập nhật trạng thái cuộc gọi vào CRM cũng buộc phải tải về toàn bộ transcript nặng hàng trăm KB rồi vứt bỏ, gây lãng phí băng thông mạng nghiêm trọng.

---

## 4. Chiến lược Chọn Key & Phân bổ Partition

Một topic được chia thành nhiều partition con (ví dụ: 6 partitions) để cho phép nhiều consumer đọc song song. Tuy nhiên, việc chọn Message Key quyết định tính đúng đắn của toàn bộ hệ thống.

```mermaid
graph TD
    subgraph Partitions[Topic: mblife.pbx.cdr.v1]
        P0[Partition 0]
        P1[Partition 1]
        P2[Partition 2]
        P3[Partition 3]
        P4[Partition 4]
        P5[Partition 5]
    end

    Event1["call.inbound (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event2["call.answered (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event3["call.ended (key=''1710928301.12'')"] -->|MurmurHash2| P2
```

### 3 Nguyên tắc phân bổ bắt buộc:

1. **Thứ tự chỉ được đảm bảo trong cùng một Partition**:
   Kafka **không** đảm bảo thứ tự thời gian giữa các partition khác nhau. Cuộc gọi kết thúc lúc 10:00 ở Partition 1 có thể được đọc *sau* cuộc gọi kết thúc lúc 10:05 ở Partition 3.
2. **Bắt buộc dùng `linkedid` (Call ID) làm Message Key**:
   Tất cả sự kiện của cùng 1 cuộc gọi (`call.inbound`, `call.answered`, `call.ended`) phải có cùng một key là `linkedid`. Thuật toán băm MurmurHash2 sẽ đưa toàn bộ sự kiện này vào **cùng một partition duy nhất**, đảm bảo thứ tự thời gian tuyệt đối.
3. **Tuyệt đối tránh Hot Partition (Data Skew)**:
   Không được dùng `enterprise_id` hay `tenant_id` làm key. Nếu 1 doanh nghiệp lớn chiếm 80% sản lượng cuộc gọi, toàn bộ 80% lưu lượng sẽ dồn vào đúng 1 partition, khiến consumer phụ trách partition đó chạm ngưỡng 100% CPU trong khi 5 consumer còn lại ngồi nhàn rỗi.

---

## 5. Offset Semantics & Ba điều kiện bắt buộc ở Consumer

Offset đóng vai trò như chiếc "kẹp đánh dấu trang sách" của từng Consumer Group trên từng Partition.

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer Worker
    participant DB as CRM Database
    participant K as Kafka Broker (Redpanda)

    K->>C: Poll batch message (offset 101 - 105)
    C->>DB: Thực hiện ghi Idempotent (UPSERT theo linkedid)
    DB-->>C: Ghi thành công
    C->>K: Commit Offset (105)
```

### Ba điều kiện bắt buộc khi triển khai Consumer:
1. **Ghi Database Idempotent theo `linkedid`**:
   Vì Kafka tuân thủ cơ chế *At-least-once delivery* (ít nhất một lần), khi consumer crash trước khi commit offset, message có thể được gửi lại. Database phải sử dụng câu lệnh `UPSERT` / `ON CONFLICT DO UPDATE` dựa trên khóa chính `linkedid`.
2. **Commit Offset SAU KHI ghi Database thành công**:
   Tắt tự động commit (`enable.auto.commit = False`). Chỉ commit offset lên Broker sau khi giao dịch cơ sở dữ liệu đã commit thành công.
3. **Không giả định thứ tự giữa các cuộc gọi khác nhau**:
   Hệ thống chỉ tuần tự trong phạm vi từng cuộc gọi đơn lẻ.

---

## 6. Mẫu Code Triển Khai (Python)

### Producer (PBX Event Publisher):
```python
import json
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=[''10.0.0.10:9092''],
    key_serializer=lambda k: k.encode(''utf-8''),
    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode(''utf-8''),
    acks=''all'',  # Đảm bảo broker đã ghi vào đĩa
    retries=3
)

cdr_event = {
    "linkedid": "1710928301.12",
    "call_date": "2026-10-10T10:30:00+07:00",
    "caller": "0982294937",
    "callee": "19001234",
    "duration": 145,
    "disposition": "ANSWERED"
}

# Gửi với key là linkedid để đảm bảo thứ tự
producer.send(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_event[''linkedid''],
    value=cdr_event
)
producer.flush()
```

### Consumer (CRM Sync Worker):
```python
import json
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    ''mblife.pbx.cdr.v1'',
    bootstrap_servers=[''10.0.0.10:9092''],
    group_id=''crm-sync-service-v1'',
    auto_offset_reset=''earliest'',
    enable_auto_commit=False,  # Quản lý commit thủ công
    key_deserializer=lambda k: k.decode(''utf-8'') if k else None,
    value_deserializer=lambda v: json.loads(v.decode(''utf-8''))
)

for msg in consumer:
    cdr = msg.value
    try:
        # 1. Ghi Idempotent vào DB
        upsert_to_crm_database(cdr[''linkedid''], cdr)
        
        # 2. Commit offset sau khi DB lưu thành công
        consumer.commit()
    except Exception as e:
        logger.error(f"Lỗi xử lý record {msg.offset}: {e}")
        # Không commit offset để retry
        break
```

---

## 7. Bảng Cheat Sheet thao tác nhanh `rpk` (Redpanda CLI)

| Tác vụ | Câu lệnh CLI |
| :--- | :--- |
| **Kiểm tra sức khỏe cluster** | `rpk cluster info` |
| **Tạo topic 6 partitions** | `rpk topic create mblife.pbx.cdr.v1 -p 6 -r 1` |
| **Xem danh sách topic** | `rpk topic list` |
| **Xem chi tiết partition & offset** | `rpk topic describe mblife.pbx.cdr.v1` |
| **Giám sát Consumer Lag** | `rpk group describe crm-sync-service-v1` |
| **Tua lại offset (Replay từ đầu)** | `rpk group seek crm-sync-service-v1 --to-oldest --topics mblife.pbx.cdr.v1` |
| **Lắng nghe trực tiếp message** | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n''` |
', 'src/content/blog/kafka-pbx-event-streaming-architecture.mdx', '2026-10-10 15:09:42', '2026-10-10 15:18:14', 'git', 'kien truc event streaming pbx telephony: tu webhook sang apache kafka & redpanda nghien cuu kien truc thay the webhook truyen thong trong he thong tong dai pbx bang redpanda/kafka. phan tich phan bo partition key theo linkedid, consumer groups doc lap, offset semantics va phong chong hot partition. apachekafka redpanda eventdriven telephonypbx systemarchitecture deep-dive architecture into event-driven pbx telephony using redpanda/kafka. replaces fragile http webhooks with durable append-only event streams. explains linkedid partition hashing for strict call event ordering, consumer group decoupling for crm/analytics/voice-ai, offset commit semantics, and mitigation of hot partitions and rebalance storms. 
## 1. bai toan: gioi han cua webhook truyen thong trong tong dai pbx

trong he thong tong dai doanh nghiep (pbx mblife), moi cuoc goi phat sinh nhieu su kien vong doi:
1. **cdr (call detail record)**: sinh ra ngay khi cup may (thoi luong, dau so goi, dau so nhan, cuoc phi, trang thai `answered` / `busy` / `no answer`). kich thuoc nho (~vai tram bytes).
2. **call insights (asr + llm summary)**: xu ly file ghi am thanh van ban (speech-to-text) va chay mo hinh ngon ngu tom tat noi dung cuoc goi. kich thuoc lon (~vai tram kb), do tre hoan thanh sau cuoc goi vai phut.

```mermaid
graph lr
    pbx[pbx telephony core] -->|drop khi qua tai| webhook[http webhook endpoint]
    webhook --> crm[(crm database)]
    webhook -.->|cham tre / timeout| asr[voice ai / asr]
```

### cac rui ro chi mang khi dung webhook http truyen thong:
- **tac nghen gio cao diem**: khi luu luong cuoc goi tang vot len 200 cuoc/phut nhung backend crm khach hang chi xu ly kip 50 cuoc/phut, webhook http se timeout (504 gateway timeout), dan den mat mat ban tin cuoc goi vinh vien.
- **phu thuoc thoi gian hoat dong (coupling)**: neu backend khach hang bao tri hoac gap su co sap mang 2 tieng, toan bo webhook gui den deu bi tu choi ket noi.
- **khong co co che replay**: khi phat hien loi parser hoac logic nghiep vu sai trong code, he thong webhook khong the tua lai de phat lai du lieu da qua.

---

## 2. giai phap: kien truc distributed event streaming

de giai quyet triet de su phu thuoc, he thong chuyen sang mo hinh **distributed log (cuon so ghi them)** su dung **redpanda** (tuong thich 100% giao thuc apache kafka).

```mermaid
flowchart td
    pbx[tong dai pbx mblife] -->|produce json| topiccdr[topic: mblife.pbx.cdr.v1]
    pbx -->|produce audio url| topicinsight[topic: mblife.pbx.insight.v1]

    subgraph kafkacluster[redpanda / kafka broker cluster]
        topiccdr
        topicinsight
    end

    topiccdr -->|consumer group 1| crmworker[crm sync service]
    topiccdr -->|consumer group 2| biworker[real-time analytics / bi]
    topicinsight -->|consumer group 3| voiceaiworker[voice transcription & llm]
```

### tai sao chon redpanda thay cho apache kafka goc?
- **zero jvm, zero garbage collection pause**: viet bang c++ tren nen tang seastar (thread-per-core), do tre p99 cuc thap va on dinh.
- **khong can apache zookeeper / kraft phuc tap**: tich hop san giao thuc dong thuan raft ben trong nhi phan duy nhat.
- **tiet kiem tai nguyen ha tang**: phu hop trien khai bien (edge) hoac vm tai nguyen gioi han (1 node uat ram ~2gb) ma van dat thong luong hang chuc nghin message/giay.

---

## 3. thiet ke topic & phan tach du lieu

he thong thiet ke tach biet 2 topic rieng biet thay vi gop chung:

| thuoc tinh | `mblife.pbx.cdr.v1` | `mblife.pbx.insight.v1` |
| :--- | :--- | :--- |
| **thoi diem sinh** | ngay lap tuc khi cup may | 2 - 5 phut sau cuoc goi |
| **kich thuoc** | ~500 bytes (metadata cuoc goi) | ~200 - 500 kb (transcript + llm summary) |
| **thoi gian luu (retention)** | 30 - 90 ngay | 7 - 14 ngay |
| **muc dich** | dong bo crm, tinh cuoc, giam sat | dao tao ai, kiem tra chat luong cuoc goi |

> **nguyen tac phan tach**: neu gop chung vao 1 topic, cac service chi can cap nhat trang thai cuoc goi vao crm cung buoc phai tai ve toan bo transcript nang hang tram kb roi vut bo, gay lang phi bang thong mang nghiem trong.

---

## 4. chien luoc chon key & phan bo partition

mot topic duoc chia thanh nhieu partition con (vi du: 6 partitions) de cho phep nhieu consumer doc song song. tuy nhien, viec chon message key quyet dinh tinh dung dan cua toan bo he thong.

```mermaid
graph td
    subgraph partitions[topic: mblife.pbx.cdr.v1]
        p0[partition 0]
        p1[partition 1]
        p2[partition 2]
        p3[partition 3]
        p4[partition 4]
        p5[partition 5]
    end

    event1["call.inbound (key=''1710928301.12'')"] -->|murmurhash2| p2
    event2["call.answered (key=''1710928301.12'')"] -->|murmurhash2| p2
    event3["call.ended (key=''1710928301.12'')"] -->|murmurhash2| p2
```

### 3 nguyen tac phan bo bat buoc:

1. **thu tu chi duoc dam bao trong cung mot partition**:
   kafka **khong** dam bao thu tu thoi gian giua cac partition khac nhau. cuoc goi ket thuc luc 10:00 o partition 1 co the duoc doc *sau* cuoc goi ket thuc luc 10:05 o partition 3.
2. **bat buoc dung `linkedid` (call id) lam message key**:
   tat ca su kien cua cung 1 cuoc goi (`call.inbound`, `call.answered`, `call.ended`) phai co cung mot key la `linkedid`. thuat toan bam murmurhash2 se dua toan bo su kien nay vao **cung mot partition duy nhat**, dam bao thu tu thoi gian tuyet doi.
3. **tuyet doi tranh hot partition (data skew)**:
   khong duoc dung `enterprise_id` hay `tenant_id` lam key. neu 1 doanh nghiep lon chiem 80% san luong cuoc goi, toan bo 80% luu luong se don vao dung 1 partition, khien consumer phu trach partition do cham nguong 100% cpu trong khi 5 consumer con lai ngoi nhan roi.

---

## 5. offset semantics & ba dieu kien bat buoc o consumer

offset dong vai tro nhu chiec "kep danh dau trang sach" cua tung consumer group tren tung partition.

```mermaid
sequencediagram
    autonumber
    participant c as consumer worker
    participant db as crm database
    participant k as kafka broker (redpanda)

    k->>c: poll batch message (offset 101 - 105)
    c->>db: thuc hien ghi idempotent (upsert theo linkedid)
    db-->>c: ghi thanh cong
    c->>k: commit offset (105)
```

### ba dieu kien bat buoc khi trien khai consumer:
1. **ghi database idempotent theo `linkedid`**:
   vi kafka tuan thu co che *at-least-once delivery* (it nhat mot lan), khi consumer crash truoc khi commit offset, message co the duoc gui lai. database phai su dung cau lenh `upsert` / `on conflict do update` dua tren khoa chinh `linkedid`.
2. **commit offset sau khi ghi database thanh cong**:
   tat tu dong commit (`enable.auto.commit = false`). chi commit offset len broker sau khi giao dich co so du lieu da commit thanh cong.
3. **khong gia dinh thu tu giua cac cuoc goi khac nhau**:
   he thong chi tuan tu trong pham vi tung cuoc goi don le.

---

## 6. mau code trien khai (python)

### producer (pbx event publisher):
```python
import json
from kafka import kafkaproducer

producer = kafkaproducer(
    bootstrap_servers=[''10.0.0.10:9092''],
    key_serializer=lambda k: k.encode(''utf-8''),
    value_serializer=lambda v: json.dumps(v, ensure_ascii=false).encode(''utf-8''),
    acks=''all'',  # dam bao broker da ghi vao dia
    retries=3
)

cdr_event = {
    "linkedid": "1710928301.12",
    "call_date": "2026-10-10t10:30:00+07:00",
    "caller": "0982294937",
    "callee": "19001234",
    "duration": 145,
    "disposition": "answered"
}

# gui voi key la linkedid de dam bao thu tu
producer.send(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_event[''linkedid''],
    value=cdr_event
)
producer.flush()
```

### consumer (crm sync worker):
```python
import json
from kafka import kafkaconsumer

consumer = kafkaconsumer(
    ''mblife.pbx.cdr.v1'',
    bootstrap_servers=[''10.0.0.10:9092''],
    group_id=''crm-sync-service-v1'',
    auto_offset_reset=''earliest'',
    enable_auto_commit=false,  # quan ly commit thu cong
    key_deserializer=lambda k: k.decode(''utf-8'') if k else none,
    value_deserializer=lambda v: json.loads(v.decode(''utf-8''))
)

for msg in consumer:
    cdr = msg.value
    try:
        # 1. ghi idempotent vao db
        upsert_to_crm_database(cdr[''linkedid''], cdr)
        
        # 2. commit offset sau khi db luu thanh cong
        consumer.commit()
    except exception as e:
        logger.error(f"loi xu ly record {msg.offset}: {e}")
        # khong commit offset de retry
        break
```

---

## 7. bang cheat sheet thao tac nhanh `rpk` (redpanda cli)

| tac vu | cau lenh cli |
| :--- | :--- |
| **kiem tra suc khoe cluster** | `rpk cluster info` |
| **tao topic 6 partitions** | `rpk topic create mblife.pbx.cdr.v1 -p 6 -r 1` |
| **xem danh sach topic** | `rpk topic list` |
| **xem chi tiet partition & offset** | `rpk topic describe mblife.pbx.cdr.v1` |
| **giam sat consumer lag** | `rpk group describe crm-sync-service-v1` |
| **tua lai offset (replay tu dau)** | `rpk group seek crm-sync-service-v1 --to-oldest --topics mblife.pbx.cdr.v1` |
| **lang nghe truc tiep message** | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n''` |
');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#bài-toán-tôi-muốn-giải-quyết', 'building-omnimer-health', 'bài-toán-tôi-muốn-giải-quyết', 'Bài toán tôi muốn giải quyết', 2, 0, 'Dữ liệu sức khỏe từ wearable không chỉ là một chuỗi con số. Nhịp tim 95 BPM có thể bình thường với một người đang vận động, nhưng lại là tín hiệu đáng chú ý nếu baseline nghỉ ngơi của họ thường ở mức thấp hơn nhiều.

Vì vậy, mục tiêu của Omnimer không phải là đưa ra một ngưỡng chung cho tất cả mọi người. Tôi muốn xây dựng một hệ thống có thể:

- tiếp nhận luồng dữ liệu biometric theo thời gian thực;
- học baseline riêng của từng người;
- phát hiện các thay đổi có ý nghĩa;
- và giúp người dùng hiểu dữ liệu bằng một AI agent có lớp bảo vệ an toàn.

> Một hệ thống sức khỏe hữu ích phải hiểu bối cảnh cá nhân trước khi cố gắng đưa ra câu trả lời.', 171, 'bai toan toi muon giai quyet du lieu suc khoe tu wearable khong chi la mot chuoi con so. nhip tim 95 bpm co the binh thuong voi mot nguoi dang van dong, nhung lai la tin hieu dang chu y neu baseline nghi ngoi cua ho thuong o muc thap hon nhieu.

vi vay, muc tieu cua omnimer khong phai la dua ra mot nguong chung cho tat ca moi nguoi. toi muon xay dung mot he thong co the:

- tiep nhan luong du lieu biometric theo thoi gian thuc;
- hoc baseline rieng cua tung nguoi;
- phat hien cac thay doi co y nghia;
- va giup nguoi dung hieu du lieu bang mot ai agent co lop bao ve an toan.

> mot he thong suc khoe huu ich phai hieu boi canh ca nhan truoc khi co gang dua ra cau tra loi.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#kiến-trúc-tổng-thể', 'building-omnimer-health', 'kiến-trúc-tổng-thể', 'Kiến trúc tổng thể', 2, 1, 'Pipeline backend được chia thành những trách nhiệm rõ ràng. **Kafka** tiếp nhận event từ wearable, các service **FastAPI** xử lý nghiệp vụ, **Redis** giữ trạng thái có độ trễ thấp, còn dữ liệu truy xuất được phân bổ giữa **Qdrant** và **Neo4j**.

![Sơ đồ và giao diện dự án Omnimer Health](/og.png)

Luồng xử lý chính:

1. Wearable gửi biometric event vào Kafka.
2. Service xử lý cập nhật baseline và đánh giá anomaly.
3. Dữ liệu liên quan được lưu vào operational store, vector store và knowledge graph.
4. LangGraph agent lập kế hoạch truy xuất và gọi công cụ.
5. Safety layer kiểm tra các tình huống có rủi ro cao trước khi tạo phản hồi cuối.', 170, 'kien truc tong the pipeline backend duoc chia thanh nhung trach nhiem ro rang. **kafka** tiep nhan event tu wearable, cac service **fastapi** xu ly nghiep vu, **redis** giu trang thai co do tre thap, con du lieu truy xuat duoc phan bo giua **qdrant** va **neo4j**.

![so do va giao dien du an omnimer health](/og.png)

luong xu ly chinh:

1. wearable gui biometric event vao kafka.
2. service xu ly cap nhat baseline va danh gia anomaly.
3. du lieu lien quan duoc luu vao operational store, vector store va knowledge graph.
4. langgraph agent lap ke hoach truy xuat va goi cong cu.
5. safety layer kiem tra cac tinh huong co rui ro cao truoc khi tao phan hoi cuoi.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#baseline-cá-nhân-hóa', 'building-omnimer-health', 'baseline-cá-nhân-hóa', 'Baseline cá nhân hóa', 2, 2, 'Thay vì lưu toàn bộ lịch sử chỉ để tính lại trung bình và độ lệch chuẩn, tôi sử dụng **Welford’s online algorithm**. Thuật toán này cập nhật thống kê theo từng event với bộ nhớ cố định:

```python
count += 1
delta = value - mean
mean += delta / count
delta_2 = value - mean
m2 += delta * delta_2
```

Từ baseline đó, Z-score giúp biểu diễn mức độ khác thường của tín hiệu đối với chính người dùng đang được theo dõi.', 110, 'baseline ca nhan hoa thay vi luu toan bo lich su chi de tinh lai trung binh va do lech chuan, toi su dung **welford’s online algorithm**. thuat toan nay cap nhat thong ke theo tung event voi bo nho co dinh:

```python
count += 1
delta = value - mean
mean += delta / count
delta_2 = value - mean
m2 += delta * delta_2
```

tu baseline do, z-score giup bieu dien muc do khac thuong cua tin hieu doi voi chinh nguoi dung dang duoc theo doi.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#vì-sao-cần-hybridrag', 'building-omnimer-health', 'vì-sao-cần-hybridrag', 'Vì sao cần HybridRAG', 2, 3, 'Một vector index rất mạnh khi tìm nội dung gần nhau về ngữ nghĩa, nhưng có thể bỏ qua thuật ngữ chính xác hoặc mối quan hệ giữa các thực thể. Omnimer kết hợp ba nguồn:

- dense retrieval cho semantic similarity;
- sparse retrieval cho keyword và thuật ngữ chính xác;
- graph traversal cho các quan hệ sức khỏe được kết nối.

Kết quả được hợp nhất trước khi agent tạo câu trả lời. Cách tiếp cận này giúp evidence đa dạng hơn và giảm việc phụ thuộc vào một kiểu truy xuất duy nhất.', 127, 'vi sao can hybridrag mot vector index rat manh khi tim noi dung gan nhau ve ngu nghia, nhung co the bo qua thuat ngu chinh xac hoac moi quan he giua cac thuc the. omnimer ket hop ba nguon:

- dense retrieval cho semantic similarity;
- sparse retrieval cho keyword va thuat ngu chinh xac;
- graph traversal cho cac quan he suc khoe duoc ket noi.

ket qua duoc hop nhat truoc khi agent tao cau tra loi. cach tiep can nay giup evidence da dang hon va giam viec phu thuoc vao mot kieu truy xuat duy nhat.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#evaluation-là-một-phần-của-sản-phẩm', 'building-omnimer-health', 'evaluation-là-một-phần-của-sản-phẩm', 'Evaluation là một phần của sản phẩm', 2, 4, 'Tôi xây dựng bộ benchmark gồm 100 câu hỏi và 20 tình huống có rủi ro cao. Hệ thống đạt:

- **0.85** answer relevancy;
- **0.78** faithfulness;
- **90%** safety recall.

Các con số không có nghĩa hệ thống đã hoàn hảo. Chúng tạo ra một baseline đo lường để mọi thay đổi sau này đều có thể được so sánh thay vì đánh giá bằng cảm giác.', 88, 'evaluation la mot phan cua san pham toi xay dung bo benchmark gom 100 cau hoi va 20 tinh huong co rui ro cao. he thong dat:

- **0.85** answer relevancy;
- **0.78** faithfulness;
- **90%** safety recall.

cac con so khong co nghia he thong da hoan hao. chung tao ra mot baseline do luong de moi thay doi sau nay deu co the duoc so sanh thay vi danh gia bang cam giac.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('building-omnimer-health#bài-học-quan-trọng', 'building-omnimer-health', 'bài-học-quan-trọng', 'Bài học quan trọng', 2, 5, 'Điều khó nhất không phải là ghép nhiều công nghệ vào cùng một repository. Thách thức thật sự là xác định ranh giới trách nhiệm: dữ liệu nào cần xử lý ngay, dữ liệu nào phục vụ truy xuất, agent được phép làm gì và khi nào hệ thống phải dừng lại để ưu tiên an toàn.

Đây cũng là hướng tôi muốn tiếp tục ghi lại trong Blog: không chỉ sản phẩm cuối cùng trông như thế nào, mà cả những quyết định kỹ thuật đã tạo nên nó.', 110, 'bai hoc quan trong dieu kho nhat khong phai la ghep nhieu cong nghe vao cung mot repository. thach thuc that su la xac dinh ranh gioi trach nhiem: du lieu nao can xu ly ngay, du lieu nao phuc vu truy xuat, agent duoc phep lam gi va khi nao he thong phai dung lai de uu tien an toan.

day cung la huong toi muon tiep tuc ghi lai trong blog: khong chi san pham cuoi cung trong nhu the nao, ma ca nhung quyet dinh ky thuat da tao nen no.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#the-wall-street-dilemma-data-overload--emotional-trading', 'finance-analysis', 'the-wall-street-dilemma-data-overload--emotional-trading', 'The Wall Street Dilemma: Data Overload & Emotional Trading', 2, 0, 'The stock market is a battlefield where cold, hard numbers constantly clash with human emotion. For retail investors and financial analysts alike, evaluating a single investment opportunity often turns into an exhausting marathon:
* Endlessly scrolling through fragmented news feeds and macro updates.
* Painstakingly reading and manually extracting data from 100-page PDF financial statements (10-K, 10-Q).
* Context-switching between multiple complex charting platforms.
* Ultimately, falling prey to emotional trading—buying into FOMO at the peak or panic-selling at the bottom.

Recognizing this massive inefficiency, I set out to build **AI Finance Pro**—an enterprise-grade, automated financial analysis workspace designed to unify every essential tool into one seamless, distraction-free Single Page Application (SPA).', 218, 'the wall street dilemma: data overload & emotional trading the stock market is a battlefield where cold, hard numbers constantly clash with human emotion. for retail investors and financial analysts alike, evaluating a single investment opportunity often turns into an exhausting marathon:
* endlessly scrolling through fragmented news feeds and macro updates.
* painstakingly reading and manually extracting data from 100-page pdf financial statements (10-k, 10-q).
* context-switching between multiple complex charting platforms.
* ultimately, falling prey to emotional trading—buying into fomo at the peak or panic-selling at the bottom.

recognizing this massive inefficiency, i set out to build **ai finance pro**—an enterprise-grade, automated financial analysis workspace designed to unify every essential tool into one seamless, distraction-free single page application (spa).', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#enter-ai-finance-pro-your-unfair-market-advantage', 'finance-analysis', 'enter-ai-finance-pro-your-unfair-market-advantage', 'Enter AI Finance Pro: Your Unfair Market Advantage', 2, 1, '**AI Finance Pro** is not just another stock tracker. It is a comprehensive platform that marries the precision of quantitative technical data, the depth of automated PDF financial statement extraction, and the reasoning capabilities of local Artificial Intelligence.

> The result? The average research time required per stock plummets from **~45 minutes to under 2 minutes**. More importantly, it provides a 100% objective, emotion-free risk scoring system.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/1.png" alt="AI Finance Pro Dashboard" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 1: The Frictionless 3-Panel Workspace: Watchlist, Center Stage, and AI Copilot</p>
</div>', 218, 'enter ai finance pro: your unfair market advantage **ai finance pro** is not just another stock tracker. it is a comprehensive platform that marries the precision of quantitative technical data, the depth of automated pdf financial statement extraction, and the reasoning capabilities of local artificial intelligence.

> the result? the average research time required per stock plummets from **~45 minutes to under 2 minutes**. more importantly, it provides a 100% objective, emotion-free risk scoring system.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/1.png" alt="ai finance pro dashboard" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">figure 1: the frictionless 3-panel workspace: watchlist, center stage, and ai copilot</p>
</div>', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#breakthrough-features-that-change-how-you-invest', 'finance-analysis', 'breakthrough-features-that-change-how-you-invest', 'Breakthrough Features That Change How You Invest', 3, 2, '1. **Advanced PDF Parsing & AI Copilot:** Drop in any company earnings release (`.pdf`). Our advanced parsing engine (powered by Docling) perfectly preserves complex structures like Balance Sheets and Income Statements. You can then interrogate the document using the AI Copilot. Ask, *"Why did short-term debt spike in Q3?"* and get an instant answer with exact citations.
2. **Quantitative Risk Engine (`BUY_RISK` / `SELL_RISK`):** Stop guessing. Our automated risk engine measures the probability of FOMO traps by analyzing bearish RSI divergences (`MOM_BEAR_DIV`) and abnormal volume surges. It also warns you when selling pressure is exhausted, preventing panic selling at the market bottom.
3. **Piotroski F-Score (9-Criteria Health Matrix):** Perform a lightning-fast fundamental health audit of any business across three pillars: Profitability, Leverage & Liquidity, and Operating Efficiency.
4. **Professional Interactive Charting:** Fully equipped with technical overlays (MA20, MA50, Bollinger Bands) and real-time market momentum indicators—all without leaving the app.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/2.png" alt="Conversational AI Copilot" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Figure 2: The Conversational AI Copilot extracting precise insights from uploaded financial PDFs.</p>
</div>', 385, 'breakthrough features that change how you invest 1. **advanced pdf parsing & ai copilot:** drop in any company earnings release (`.pdf`). our advanced parsing engine (powered by docling) perfectly preserves complex structures like balance sheets and income statements. you can then interrogate the document using the ai copilot. ask, *"why did short-term debt spike in q3?"* and get an instant answer with exact citations.
2. **quantitative risk engine (`buy_risk` / `sell_risk`):** stop guessing. our automated risk engine measures the probability of fomo traps by analyzing bearish rsi divergences (`mom_bear_div`) and abnormal volume surges. it also warns you when selling pressure is exhausted, preventing panic selling at the market bottom.
3. **piotroski f-score (9-criteria health matrix):** perform a lightning-fast fundamental health audit of any business across three pillars: profitability, leverage & liquidity, and operating efficiency.
4. **professional interactive charting:** fully equipped with technical overlays (ma20, ma50, bollinger bands) and real-time market momentum indicators—all without leaving the app.

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/finance_analysis/2.png" alt="conversational ai copilot" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">figure 2: the conversational ai copilot extracting precise insights from uploaded financial pdfs.</p>
</div>', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#the-architecture-privacy-first--bank-grade-security', 'finance-analysis', 'the-architecture-privacy-first--bank-grade-security', 'The Architecture: Privacy-First & Bank-Grade Security', 2, 3, 'In the world of finance, data privacy is paramount. Sending sensitive financial documents to public cloud APIs (like OpenAI or Anthropic) is often a dealbreaker for institutions and cautious investors.

That is why AI Finance Pro is built with a **Privacy-First Architecture**:
* **100% Local Inference:** All AI reasoning and PDF extraction are processed entirely on your local machine using **Ollama** (Llama 3.1 / Qwen 2.5). Your financial data never leaves your device.
* **Deterministic Financial Extractions:** Metrics are extracted directly from tables with structural integrity—meaning zero "hallucinated" financial figures.
* **Strict No-Advice Mandate:** The AI is tightly constrained by system guardrails. It delivers risk probabilities and factual analysis only, ensuring it never provides speculative or emotional buy/sell commands.

The tech stack is built for speed and reliability, featuring **Next.js** for a highly responsive frontend, **FastAPI** for a robust backend core, and **PostgreSQL (Neon Serverless)** coupled with `vnstock` for real-time market data ingestion.', 287, 'the architecture: privacy-first & bank-grade security in the world of finance, data privacy is paramount. sending sensitive financial documents to public cloud apis (like openai or anthropic) is often a dealbreaker for institutions and cautious investors.

that is why ai finance pro is built with a **privacy-first architecture**:
* **100% local inference:** all ai reasoning and pdf extraction are processed entirely on your local machine using **ollama** (llama 3.1 / qwen 2.5). your financial data never leaves your device.
* **deterministic financial extractions:** metrics are extracted directly from tables with structural integrity—meaning zero "hallucinated" financial figures.
* **strict no-advice mandate:** the ai is tightly constrained by system guardrails. it delivers risk probabilities and factual analysis only, ensuring it never provides speculative or emotional buy/sell commands.

the tech stack is built for speed and reliability, featuring **next.js** for a highly responsive frontend, **fastapi** for a robust backend core, and **postgresql (neon serverless)** coupled with `vnstock` for real-time market data ingestion.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#experience-it-yourself', 'finance-analysis', 'experience-it-yourself', 'Experience It Yourself', 2, 4, 'Are you ready to optimize your financial research and leave emotional trading behind? AI Finance Pro is completely open-source, serving as a powerful reference architecture for the community to explore the intersection of Generative AI and Fintech.

👉 **Explore and clone the source code on GitHub:**
[HuynhTri-dev/finance-analysis](https://github.com/HuynhTri-dev/finance-analysis.git)

If you find this project valuable for your work or as inspiration for your own AI applications, I''d deeply appreciate a Star ⭐️ on the repository!', 141, 'experience it yourself are you ready to optimize your financial research and leave emotional trading behind? ai finance pro is completely open-source, serving as a powerful reference architecture for the community to explore the intersection of generative ai and fintech.

👉 **explore and clone the source code on github:**
[huynhtri-dev/finance-analysis](https://github.com/huynhtri-dev/finance-analysis.git)

if you find this project valuable for your work or as inspiration for your own ai applications, i''d deeply appreciate a star ⭐️ on the repository!', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('finance-analysis#related-links--references', 'finance-analysis', 'related-links--references', 'Related Links & References', 2, 5, '- [Read the full AI Finance Pro Project Showcase](/projects/finance-analysis)
- [View all my projects](/projects)', 30, 'related links & references - [read the full ai finance pro project showcase](/projects/finance-analysis)
- [view all my projects](/projects)', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#1-bản-chất-của-event-streaming-hệ-thần-kinh-trung-ương-kỹ-thuật-số', 'kafka-core-concepts-and-architecture', '1-bản-chất-của-event-streaming-hệ-thần-kinh-trung-ương-kỹ-thuật-số', '1. Bản chất của Event Streaming: "Hệ thần kinh trung ương kỹ thuật số"', 2, 0, 'Theo tài liệu chính thức của Apache Kafka (*Kafka 4.x Documentation*), trong thế giới doanh nghiệp hiện đại định hướng bằng phần mềm và tự động hóa, **Event Streaming** đóng vai trò tương đương với **hệ thần kinh trung ương (Central Nervous System)** của cơ thể con người.

```mermaid
graph TD
    subgraph Sources["Nguồn Sinh Sự Kiện (Event Sources)"]
        DB[(Cơ sở dữ liệu CDC)]
        IoT[Thiết bị IoT / Sensors]
        PBX[Tổng đài PBX / Viễn thông]
        App[Ứng dụng Mobile / Web]
    end

    subgraph KafkaCore["Apache Kafka / Redpanda Cluster"]
        Broker1[Broker 01]
        Broker2[Broker 02]
        Broker3[Broker 03]
        Log[(Append-Only Commit Log<br/>Durable Storage)]
    end

    subgraph Destinations["Hệ Thống Tiêu Thụ (Consumers / Sinks)"]
        Analytics[(BI / Data Lakehouse)]
        CRM[Hệ thống CRM / ERP]
        AI[Voice AI / LLM Inference]
        Alert[Real-time Monitoring / Alert]
    end

    Sources -->|Publish Streams of Events| KafkaCore
    KafkaCore -->|Subscribe & Stream Real-time| Destinations
```', 279, '1. ban chat cua event streaming: "he than kinh trung uong ky thuat so" theo tai lieu chinh thuc cua apache kafka (*kafka 4.x documentation*), trong the gioi doanh nghiep hien dai dinh huong bang phan mem va tu dong hoa, **event streaming** dong vai tro tuong duong voi **he than kinh trung uong (central nervous system)** cua co the con nguoi.

```mermaid
graph td
    subgraph sources["nguon sinh su kien (event sources)"]
        db[(co so du lieu cdc)]
        iot[thiet bi iot / sensors]
        pbx[tong dai pbx / vien thong]
        app[ung dung mobile / web]
    end

    subgraph kafkacore["apache kafka / redpanda cluster"]
        broker1[broker 01]
        broker2[broker 02]
        broker3[broker 03]
        log[(append-only commit log<br/>durable storage)]
    end

    subgraph destinations["he thong tieu thu (consumers / sinks)"]
        analytics[(bi / data lakehouse)]
        crm[he thong crm / erp]
        ai[voice ai / llm inference]
        alert[real-time monitoring / alert]
    end

    sources -->|publish streams of events| kafkacore
    kafkacore -->|subscribe & stream real-time| destinations
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#11-định-nghĩa-kỹ-thuật', 'kafka-core-concepts-and-architecture', '11-định-nghĩa-kỹ-thuật', '1.1. Định nghĩa kỹ thuật', 3, 1, '**Event Streaming** là phương thức:
1. **Thu thập thời gian thực (Capture in real-time)** các dòng sự kiện từ nguồn phát sinh (database transactions, telemetry sensors, thiết bị di động, cloud services, ứng dụng nghiệp vụ).
2. **Lưu trữ bền vững (Durable storage)** các luồng sự kiện này theo cơ chế phân tán, đảm bảo tính sẵn sàng cao và không bị mất mát dữ liệu.
3. **Xử lý và phản hồi (Manipulate & react)** theo thời gian thực (real-time stream processing) cũng như truy hồi lịch sử (retrospective processing).
4. **Định tuyến linh hoạt (Route event streams)** đến các hạ tầng đích khi có nhu cầu mà không làm thay đổi tầng nguồn.', 167, '1.1. dinh nghia ky thuat **event streaming** la phuong thuc:
1. **thu thap thoi gian thuc (capture in real-time)** cac dong su kien tu nguon phat sinh (database transactions, telemetry sensors, thiet bi di dong, cloud services, ung dung nghiep vu).
2. **luu tru ben vung (durable storage)** cac luong su kien nay theo co che phan tan, dam bao tinh san sang cao va khong bi mat mat du lieu.
3. **xu ly va phan hoi (manipulate & react)** theo thoi gian thuc (real-time stream processing) cung nhu truy hoi lich su (retrospective processing).
4. **dinh tuyen linh hoat (route event streams)** den cac ha tang dich khi co nhu cau ma khong lam thay doi tang nguon.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#12-ba-trụ-cột-năng-lực-cốt-lõi-của-apache-kafka', 'kafka-core-concepts-and-architecture', '12-ba-trụ-cột-năng-lực-cốt-lõi-của-apache-kafka', '1.2. Ba trụ cột năng lực cốt lõi của Apache Kafka', 3, 2, 'Apache Kafka kết hợp 3 khả năng then chốt trong một nền tảng duy nhất:
* **Publish & Subscribe**: Ghi (publish) và đọc (subscribe) các dòng sự kiện với thông lượng hàng triệu message mỗi giây mà không gây nghẽn cổ chai.
* **Durable Storage**: Lưu trữ an toàn, tin cậy trên đĩa cứng trong thời gian tùy chọn (từ vài giờ, vài tuần cho đến vĩnh viễn), không xóa message ngay sau khi đọc.
* **Process in Real-time**: Khả năng phân tích, tổng hợp, biến đổi luồng dữ liệu liên tục ngay khi chúng phát sinh thông qua Kafka Streams API.

---', 141, '1.2. ba tru cot nang luc cot loi cua apache kafka apache kafka ket hop 3 kha nang then chot trong mot nen tang duy nhat:
* **publish & subscribe**: ghi (publish) va doc (subscribe) cac dong su kien voi thong luong hang trieu message moi giay ma khong gay nghen co chai.
* **durable storage**: luu tru an toan, tin cay tren dia cung trong thoi gian tuy chon (tu vai gio, vai tuan cho den vinh vien), khong xoa message ngay sau khi doc.
* **process in real-time**: kha nang phan tich, tong hop, bien doi luong du lieu lien tuc ngay khi chung phat sinh thong qua kafka streams api.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#2-mô-hình-mental-model-sổ-cái-kế-toán-vs-hàng-đợi-truyền-thống', 'kafka-core-concepts-and-architecture', '2-mô-hình-mental-model-sổ-cái-kế-toán-vs-hàng-đợi-truyền-thống', '2. Mô hình Mental Model: Sổ cái kế toán vs Hàng đợi truyền thống', 2, 3, 'Để hiểu cặn kẽ Kafka ngay từ ngày đầu tiên, hãy xóa bỏ tư duy về các Message Queue truyền thống (như RabbitMQ, ActiveMQ) và chuyển sang tư duy **Sổ cái kế toán ghi nối tiếp (Append-Only Ledger)**:

```mermaid
graph LR
    subgraph TraditionalMQ["Message Queue Truyền Thống (RabbitMQ)"]
        Q[Hàng đợi Queue] -->|Lấy ra & XÓA BỎ| W1[Worker A]
        Q -.->|Đã bị xóa| W2[Worker B không đọc được nữa]
    end

    subgraph KafkaLog["Apache Kafka (Distributed Commit Log)"]
        L0[Offset 0] --> L1[Offset 1] --> L2[Offset 2] --> L3[Offset 3] --> L4[Offset 4]
        C1[Bookmark Group CRM: Offset 4]
        C2[Bookmark Group BI: Offset 2]
    end
```

| Đặc Điểm | Message Queue Truyền Thống (RabbitMQ / ActiveMQ) | Apache Kafka / Redpanda |
| :--- | :--- | :--- |
| **Bản chất lưu trữ** | Bộ nhớ tạm (Transient buffer) — Message bị **xóa ngay** sau khi Consumer xác nhận (ACK). | Cuốn sổ cái chỉ ghi thêm (**Append-only Commit Log**) — Message được lưu bền vững trên đĩa theo thời gian (`retention.ms`). |
| **Cơ chế đọc** | Broker chủ động đẩy message xuống Consumer (**Push model**). | Consumer chủ động kéo message theo tốc độ xử lý của mình (**Pull model**). |
| **Vị trí đọc (Offset)** | Do Broker theo dõi trong RAM; khó scale khi có hàng triệu queue. | Do Consumer tự quản lý (**Bookmarks**), lưu tại topic nội bộ `__consumer_offsets`. |
| **Đa người đọc** | Muốn nhiều service đọc cùng dữ liệu phải tạo Fanout Exchange và duplicate dữ liệu ra nhiều queue. | Nhiều Consumer Group độc lập cùng đọc chung 1 log duy nhất với tốc độ và vị trí riêng. |
| **Khả năng Replay** | **Không thể** — Đã lấy ra là mất vĩnh viễn. | **Cực kỳ dễ dàng** — Chỉ cần tua lại Offset (seek) để đọc lại dữ liệu 7 ngày trước. |

---', 454, '2. mo hinh mental model: so cai ke toan vs hang doi truyen thong de hieu can ke kafka ngay tu ngay dau tien, hay xoa bo tu duy ve cac message queue truyen thong (nhu rabbitmq, activemq) va chuyen sang tu duy **so cai ke toan ghi noi tiep (append-only ledger)**:

```mermaid
graph lr
    subgraph traditionalmq["message queue truyen thong (rabbitmq)"]
        q[hang doi queue] -->|lay ra & xoa bo| w1[worker a]
        q -.->|da bi xoa| w2[worker b khong doc duoc nua]
    end

    subgraph kafkalog["apache kafka (distributed commit log)"]
        l0[offset 0] --> l1[offset 1] --> l2[offset 2] --> l3[offset 3] --> l4[offset 4]
        c1[bookmark group crm: offset 4]
        c2[bookmark group bi: offset 2]
    end
```

| dac diem | message queue truyen thong (rabbitmq / activemq) | apache kafka / redpanda |
| :--- | :--- | :--- |
| **ban chat luu tru** | bo nho tam (transient buffer) — message bi **xoa ngay** sau khi consumer xac nhan (ack). | cuon so cai chi ghi them (**append-only commit log**) — message duoc luu ben vung tren dia theo thoi gian (`retention.ms`). |
| **co che doc** | broker chu dong day message xuong consumer (**push model**). | consumer chu dong keo message theo toc do xu ly cua minh (**pull model**). |
| **vi tri doc (offset)** | do broker theo doi trong ram; kho scale khi co hang trieu queue. | do consumer tu quan ly (**bookmarks**), luu tai topic noi bo `__consumer_offsets`. |
| **da nguoi doc** | muon nhieu service doc cung du lieu phai tao fanout exchange va duplicate du lieu ra nhieu queue. | nhieu consumer group doc lap cung doc chung 1 log duy nhat voi toc do va vi tri rieng. |
| **kha nang replay** | **khong the** — da lay ra la mat vinh vien. | **cuc ky de dang** — chi can tua lai offset (seek) de doc lai du lieu 7 ngay truoc. |

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#3-cấu-trúc-một-sự-kiện-event-anatomy', 'kafka-core-concepts-and-architecture', '3-cấu-trúc-một-sự-kiện-event-anatomy', '3. Cấu trúc một Sự Kiện (Event Anatomy)', 2, 4, 'Trong Kafka, một sự kiện (Event / Record) ghi lại một dữ kiện thực tế đã xảy ra trong thế giới thực hoặc hệ thống kinh doanh ("Something happened"):

```
+-----------------------------------------------------------------+
|                       KAFKA RECORD / EVENT                      |
+-----------------------------------------------------------------+
| Headers   | trace_id=xyz-123, env=production, app=mblife-pbx   |
+-----------+-----------------------------------------------------+
| Timestamp | 1759734000120 (Epoch milliseconds - CreateTime)    |
+-----------+-----------------------------------------------------+
| Key       | "1759734000.1" (Định danh logic: linkedid cuộc gọi) |
+-----------+-----------------------------------------------------+
| Value     | { "caller": "0912345678", "callee": "19001234", ... }|
+-----------------------------------------------------------------+
```

1. **Key (Khóa)**: Chuỗi byte tùy chọn dùng để xác định **Partition đích** thông qua thuật toán băm (Hashing). Tất cả message có cùng Key luôn rơi vào đúng một Partition duy nhất.
2. **Value (Giá trị)**: Payload nội dung nghiệp vụ (JSON, Avro, Protobuf, nhị phân).
3. **Timestamp (Dấu thời gian)**: Thời điểm sự kiện được tạo (`CreateTime`) hoặc thời điểm Broker tiếp nhận (`LogAppendTime`).
4. **Headers (Siêu dữ liệu)**: Cặp key-value tùy chọn chứa thông tin metadata như `trace_id` (OpenTelemetry), nguồn gốc tenant, chữ ký xác thực.

---', 381, '3. cau truc mot su kien (event anatomy) trong kafka, mot su kien (event / record) ghi lai mot du kien thuc te da xay ra trong the gioi thuc hoac he thong kinh doanh ("something happened"):

```
+-----------------------------------------------------------------+
|                       kafka record / event                      |
+-----------------------------------------------------------------+
| headers   | trace_id=xyz-123, env=production, app=mblife-pbx   |
+-----------+-----------------------------------------------------+
| timestamp | 1759734000120 (epoch milliseconds - createtime)    |
+-----------+-----------------------------------------------------+
| key       | "1759734000.1" (dinh danh logic: linkedid cuoc goi) |
+-----------+-----------------------------------------------------+
| value     | { "caller": "0912345678", "callee": "19001234", ... }|
+-----------------------------------------------------------------+
```

1. **key (khoa)**: chuoi byte tuy chon dung de xac dinh **partition dich** thong qua thuat toan bam (hashing). tat ca message co cung key luon roi vao dung mot partition duy nhat.
2. **value (gia tri)**: payload noi dung nghiep vu (json, avro, protobuf, nhi phan).
3. **timestamp (dau thoi gian)**: thoi diem su kien duoc tao (`createtime`) hoac thoi diem broker tiep nhan (`logappendtime`).
4. **headers (sieu du lieu)**: cap key-value tuy chon chua thong tin metadata nhu `trace_id` (opentelemetry), nguon goc tenant, chu ky xac thuc.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#4-topics-và-3-nguyên-lý-vàng-về-partition', 'kafka-core-concepts-and-architecture', '4-topics-và-3-nguyên-lý-vàng-về-partition', '4. Topics và 3 Nguyên Lý Vàng Về Partition', 2, 5, '', 0, '4. topics va 3 nguyen ly vang ve partition ', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#41-topic-là-gì', 'kafka-core-concepts-and-architecture', '41-topic-là-gì', '4.1. Topic là gì?', 3, 6, 'Topic là đơn vị tổ chức logic của các dòng sự kiện (tương đương với một bảng trong Database hoặc một thư mục trên File System).
* **Quy ước đặt tên Topic chuẩn doanh nghiệp**:
  $$\text{<domain>}.\text{<subdomain>}.\text{<entity>}.\text{<version>}$$
  * Ví dụ viễn thông PBX: `mblife.pbx.cdr.v1` (bản ghi cước cuộc gọi), `mblife.pbx.call-insight.v1` (kết quả phân tích giọng nói).
* **Vì sao phải tách Topic thay vì gộp chung?**
  * **Khác biệt về SLA & Tần suất**: CDR sinh ra ngay tức thì (vài trăm bytes), trong khi Voice Insight cần xử lý AI mất 2-3 phút (hàng trăm KB).
  * **Chính sách Retention khác nhau**: CDR cần lưu trữ 90 ngày phục vụ đối soát cước phí, Insight chỉ cần lưu 7 ngày để đẩy vào Data Lake.', 188, '4.1. topic la gi? topic la don vi to chuc logic cua cac dong su kien (tuong duong voi mot bang trong database hoac mot thu muc tren file system).
* **quy uoc dat ten topic chuan doanh nghiep**:
  $$\text{<domain>}.\text{<subdomain>}.\text{<entity>}.\text{<version>}$$
  * vi du vien thong pbx: `mblife.pbx.cdr.v1` (ban ghi cuoc cuoc goi), `mblife.pbx.call-insight.v1` (ket qua phan tich giong noi).
* **vi sao phai tach topic thay vi gop chung?**
  * **khac biet ve sla & tan suat**: cdr sinh ra ngay tuc thi (vai tram bytes), trong khi voice insight can xu ly ai mat 2-3 phut (hang tram kb).
  * **chinh sach retention khac nhau**: cdr can luu tru 90 ngay phuc vu doi soat cuoc phi, insight chi can luu 7 ngay de day vao data lake.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#42-partition-đơn-vị-co-giãn-vật-lý-unit-of-scalability', 'kafka-core-concepts-and-architecture', '42-partition-đơn-vị-co-giãn-vật-lý-unit-of-scalability', '4.2. Partition: Đơn vị co giãn vật lý (Unit of Scalability)', 3, 7, 'Một Topic được chia thành nhiều lát cắt vật lý gọi là **Partition** nằm rải rác trên các Broker khác nhau:

```mermaid
graph TD
    subgraph Topic["Topic: mblife.pbx.cdr.v1 (3 Partitions)"]
        subgraph P0["Partition 0 (Broker 1)"]
            P0_0[Offset 0] --> P0_1[Offset 1] --> P0_2[Offset 2]
        end
        subgraph P1["Partition 1 (Broker 2)"]
            P1_0[Offset 0] --> P1_1[Offset 1] --> P1_2[Offset 2]
        end
        subgraph P2["Partition 2 (Broker 3)"]
            P2_0[Offset 0] --> P2_1[Offset 1] --> P2_2[Offset 2]
        end
    end

    Producer[Producer] -->|hash(key) % 3| Topic
```', 163, '4.2. partition: don vi co gian vat ly (unit of scalability) mot topic duoc chia thanh nhieu lat cat vat ly goi la **partition** nam rai rac tren cac broker khac nhau:

```mermaid
graph td
    subgraph topic["topic: mblife.pbx.cdr.v1 (3 partitions)"]
        subgraph p0["partition 0 (broker 1)"]
            p0_0[offset 0] --> p0_1[offset 1] --> p0_2[offset 2]
        end
        subgraph p1["partition 1 (broker 2)"]
            p1_0[offset 0] --> p1_1[offset 1] --> p1_2[offset 2]
        end
        subgraph p2["partition 2 (broker 3)"]
            p2_0[offset 0] --> p2_1[offset 1] --> p2_2[offset 2]
        end
    end

    producer[producer] -->|hash(key) % 3| topic
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#3-nguyên-lý-vàng-bắt-buộc-phải-thuộc-lòng', 'kafka-core-concepts-and-architecture', '3-nguyên-lý-vàng-bắt-buộc-phải-thuộc-lòng', '3 NGUYÊN LÝ VÀNG BẮT BUỘC PHẢI THUỘC LÒNG:', 3, 8, '#### 1. Thứ tự chỉ được đảm bảo TUYỆT ĐỐI trong CÙNG MỘT PARTITION
* Kafka **không bao giờ đảm bảo thứ tự toàn cục (Global Ordering)** trên toàn bộ Topic.
* Nếu cuộc gọi có 3 sự kiện: `DIALING` $\rightarrow$ `ANSWERED` $\rightarrow$ `HANGUP`, bạn **bắt buộc** phải đảm bảo cả 3 sự kiện này rơi vào cùng một partition. Nếu rơi vào 2 partition khác nhau, Consumer đọc song song có thể nhận `HANGUP` trước khi nhận `ANSWERED`.

#### 2. Key quyết định Partition
* Thuật toán mặc định: $\text{partition} = \text{murmur2}(\text{key}) \pmod{\text{total\_partitions}}$.
* Cùng một Key $\rightarrow$ Luôn vào cùng một Partition $\rightarrow$ Luôn giữ đúng thứ tự thời gian.
* **Không có Key (`key = null`)**: Kafka gửi ngẫu nhiên theo cơ chế Round-robin (hoặc Sticky Partitioning để tối ưu batching). Dữ liệu sẽ bị rải đều nhưng mất hoàn toàn thứ tự nghiệp vụ giữa các bản tin liên quan.

#### 3. Giới hạn song song của Consumer: $N_{consumer} \le N_{partitions}$
* Tại một thời điểm, **một partition chỉ được giao cho duy nhất một Consumer trong cùng một Consumer Group**.
* Nếu Topic có 3 Partitions:
  * 1 Consumer: Đọc cả 3 partitions (chậm).
  * 3 Consumers: Mỗi con đọc 1 partition (tối ưu tối đa thông lượng).
  * 4 Consumers: **Consumer thứ 4 sẽ ngồi chơi xơi nước (idle)**, chỉ hoạt động khi 1 trong 3 con kia bị chết (Failover).

```mermaid
graph LR
    subgraph TopicPartitions["Topic: 3 Partitions"]
        Part0[Partition 0]
        Part1[Partition 1]
        Part2[Partition 2]
    end

    subgraph ConsumerGroup["Consumer Group: 4 Consumers"]
        C1[Consumer 1]
        C2[Consumer 2]
        C3[Consumer 3]
        C4[Consumer 4: IDLE / STANDBY]
    end

    Part0 --> C1
    Part1 --> C2
    Part2 --> C3
    style C4 fill:#fbb,stroke:#d33,stroke-dasharray: 5 5
```

---', 470, '3 nguyen ly vang bat buoc phai thuoc long: #### 1. thu tu chi duoc dam bao tuyet doi trong cung mot partition
* kafka **khong bao gio dam bao thu tu toan cuc (global ordering)** tren toan bo topic.
* neu cuoc goi co 3 su kien: `dialing` $\rightarrow$ `answered` $\rightarrow$ `hangup`, ban **bat buoc** phai dam bao ca 3 su kien nay roi vao cung mot partition. neu roi vao 2 partition khac nhau, consumer doc song song co the nhan `hangup` truoc khi nhan `answered`.

#### 2. key quyet dinh partition
* thuat toan mac dinh: $\text{partition} = \text{murmur2}(\text{key}) \pmod{\text{total\_partitions}}$.
* cung mot key $\rightarrow$ luon vao cung mot partition $\rightarrow$ luon giu dung thu tu thoi gian.
* **khong co key (`key = null`)**: kafka gui ngau nhien theo co che round-robin (hoac sticky partitioning de toi uu batching). du lieu se bi rai deu nhung mat hoan toan thu tu nghiep vu giua cac ban tin lien quan.

#### 3. gioi han song song cua consumer: $n_{consumer} \le n_{partitions}$
* tai mot thoi diem, **mot partition chi duoc giao cho duy nhat mot consumer trong cung mot consumer group**.
* neu topic co 3 partitions:
  * 1 consumer: doc ca 3 partitions (cham).
  * 3 consumers: moi con doc 1 partition (toi uu toi da thong luong).
  * 4 consumers: **consumer thu 4 se ngoi choi xoi nuoc (idle)**, chi hoat dong khi 1 trong 3 con kia bi chet (failover).

```mermaid
graph lr
    subgraph topicpartitions["topic: 3 partitions"]
        part0[partition 0]
        part1[partition 1]
        part2[partition 2]
    end

    subgraph consumergroup["consumer group: 4 consumers"]
        c1[consumer 1]
        c2[consumer 2]
        c3[consumer 3]
        c4[consumer 4: idle / standby]
    end

    part0 --> c1
    part1 --> c2
    part2 --> c3
    style c4 fill:#fbb,stroke:#d33,stroke-dasharray: 5 5
```

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#5-offset-và-cơ-chế-consumer-group-độc-lập', 'kafka-core-concepts-and-architecture', '5-offset-và-cơ-chế-consumer-group-độc-lập', '5. Offset và Cơ chế Consumer Group Độc Lập', 2, 9, '', 0, '5. offset va co che consumer group doc lap ', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#51-offset-là-gì', 'kafka-core-concepts-and-architecture', '51-offset-là-gì', '5.1. Offset là gì?', 3, 10, 'Offset là số nguyên tăng dần liên tục $(0, 1, 2, 3...)$ gán cho mỗi message khi được ghi vào partition. Offset không bao giờ bị tái sử dụng. Nó đóng vai trò như **số trang sách (Bookmark)** để Consumer ghi nhớ mình đã đọc tới đâu.', 61, '5.1. offset la gi? offset la so nguyen tang dan lien tuc $(0, 1, 2, 3...)$ gan cho moi message khi duoc ghi vao partition. offset khong bao gio bi tai su dung. no dong vai tro nhu **so trang sach (bookmark)** de consumer ghi nho minh da doc toi dau.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#52-sự-độc-lập-giữa-các-consumer-group', 'kafka-core-concepts-and-architecture', '52-sự-độc-lập-giữa-các-consumer-group', '5.2. Sự độc lập giữa các Consumer Group', 3, 11, 'Nhiều phòng ban hoặc dịch vụ khác nhau có thể đọc cùng một Topic mà không ảnh hưởng tới nhau:

```mermaid
graph TD
    Topic[Topic: mblife.pbx.cdr.v1]

    subgraph GroupCRM["Consumer Group: group.crm (Đọc Real-time)"]
        CRM1[CRM Worker 1: Offset 1050]
    end

    subgraph GroupBI["Consumer Group: group.bi-warehouse (Chạy Batch)"]
        BI1[BI Worker 1: Offset 420]
    end

    subgraph GroupAI["Consumer Group: group.voice-ai (Đang Replay)"]
        AI1[AI Worker 1: Offset 0]
    end

    Topic --> GroupCRM
    Topic --> GroupBI
    Topic --> GroupAI
```

* Nhóm `group.crm`: Đọc realtime ở vị trí mới nhất (Offset 1050) để hiển thị lên màn hình điện thoại viên.
* Nhóm `group.bi-warehouse`: Đọc chậm rãi (Offset 420) gom batch 15 phút một lần lưu vào BigQuery.
* Nhóm `group.voice-ai`: Vừa fix xong model, reset offset về 0 để đọc lại toàn bộ dữ liệu 3 ngày qua mà **không hề làm chậm hay gián đoạn nhóm CRM**.', 244, '5.2. su doc lap giua cac consumer group nhieu phong ban hoac dich vu khac nhau co the doc cung mot topic ma khong anh huong toi nhau:

```mermaid
graph td
    topic[topic: mblife.pbx.cdr.v1]

    subgraph groupcrm["consumer group: group.crm (doc real-time)"]
        crm1[crm worker 1: offset 1050]
    end

    subgraph groupbi["consumer group: group.bi-warehouse (chay batch)"]
        bi1[bi worker 1: offset 420]
    end

    subgraph groupai["consumer group: group.voice-ai (dang replay)"]
        ai1[ai worker 1: offset 0]
    end

    topic --> groupcrm
    topic --> groupbi
    topic --> groupai
```

* nhom `group.crm`: doc realtime o vi tri moi nhat (offset 1050) de hien thi len man hinh dien thoai vien.
* nhom `group.bi-warehouse`: doc cham rai (offset 420) gom batch 15 phut mot lan luu vao bigquery.
* nhom `group.voice-ai`: vua fix xong model, reset offset ve 0 de doc lai toan bo du lieu 3 ngay qua ma **khong he lam cham hay gian doan nhom crm**.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#53-các-cơ-chế-đảm-bảo-truyền-phát-delivery-semantics', 'kafka-core-concepts-and-architecture', '53-các-cơ-chế-đảm-bảo-truyền-phát-delivery-semantics', '5.3. Các cơ chế đảm bảo truyền phát (Delivery Semantics)', 3, 12, '```mermaid
flowchart TD
    Start[Consumer Nhận Message] --> Choice{Chọn Thời Điểm Commit Offset}
    Choice -->|Commit TRƯỚC khi xử lý| AtMostOnce["At-Most-Once (Tối đa 1 lần)<br/>Crash = Mất tin, Không bao giờ trùng"]
    Choice -->|Commit SAU khi lưu DB thành công| AtLeastOnce["At-Least-Once (Ít nhất 1 lần)<br/>Crash = Đọc lại, Có thể trùng lặp, Cần Idempotent"]
    Choice -->|Dùng Kafka Transaction API / 2PC| ExactlyOnce["Exactly-Once Processing (Chính xác 1 lần)<br/>Đảm bảo toàn vẹn tuyệt đối"]
```

1. **At-Most-Once (Tối đa một lần)**:
   * Commit offset ngay khi vừa nhận bản tin từ Broker, sau đó mới xử lý.
   * Nếu tiến trình crash trong lúc xử lý: Bản tin bị mất vĩnh viễn, không bao giờ đọc lại. Phù hợp cho metrics giám sát hoặc log không quan trọng.
2. **At-Least-Once (Ít nhất một lần - Khuyến nghị cho Production)**:
   * Xử lý và lưu dữ liệu vào cơ sở dữ liệu thành công rồi mới commit offset.
   * Nếu tiến trình crash trước khi commit: Khi khởi động lại, consumer sẽ đọc lại bản tin đó $\rightarrow$ Có thể bị trùng dữ liệu.
   * **Giải pháp bắt buộc**: Thiết kế Consumer Idempotent (kiểm tra `uniqueid` hoặc `linkedid` trong Database trước khi INSERT).
3. **Exactly-Once (Chính xác một lần - EOS)**:
   * Kết hợp Idempotent Producer (`enable.idempotence=true`) và Transactional API (`sendOffsetsToTransaction`). Đảm bảo dữ liệu chỉ được ghi nhận đúng một lần duy nhất xuyên suốt chuỗi pipeline.

---', 375, '5.3. cac co che dam bao truyen phat (delivery semantics) ```mermaid
flowchart td
    start[consumer nhan message] --> choice{chon thoi diem commit offset}
    choice -->|commit truoc khi xu ly| atmostonce["at-most-once (toi da 1 lan)<br/>crash = mat tin, khong bao gio trung"]
    choice -->|commit sau khi luu db thanh cong| atleastonce["at-least-once (it nhat 1 lan)<br/>crash = doc lai, co the trung lap, can idempotent"]
    choice -->|dung kafka transaction api / 2pc| exactlyonce["exactly-once processing (chinh xac 1 lan)<br/>dam bao toan ven tuyet doi"]
```

1. **at-most-once (toi da mot lan)**:
   * commit offset ngay khi vua nhan ban tin tu broker, sau do moi xu ly.
   * neu tien trinh crash trong luc xu ly: ban tin bi mat vinh vien, khong bao gio doc lai. phu hop cho metrics giam sat hoac log khong quan trong.
2. **at-least-once (it nhat mot lan - khuyen nghi cho production)**:
   * xu ly va luu du lieu vao co so du lieu thanh cong roi moi commit offset.
   * neu tien trinh crash truoc khi commit: khi khoi dong lai, consumer se doc lai ban tin do $\rightarrow$ co the bi trung du lieu.
   * **giai phap bat buoc**: thiet ke consumer idempotent (kiem tra `uniqueid` hoac `linkedid` trong database truoc khi insert).
3. **exactly-once (chinh xac mot lan - eos)**:
   * ket hop idempotent producer (`enable.idempotence=true`) va transactional api (`sendoffsetstotransaction`). dam bao du lieu chi duoc ghi nhan dung mot lan duy nhat xuyen suot chuoi pipeline.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#6-cơ-chế-lưu-trữ-vật-lý-tại-sao-kafka-cực-kỳ-nhanh', 'kafka-core-concepts-and-architecture', '6-cơ-chế-lưu-trữ-vật-lý-tại-sao-kafka-cực-kỳ-nhanh', '6. Cơ Chế Lưu Trữ Vật Lý: Tại Sao Kafka Cực Kỳ Nhanh?', 2, 13, 'Nhiều kỹ sư lầm tưởng rằng đọc/ghi từ đĩa cứng (HDD/SSD) sẽ luôn chậm hơn RAM. Kafka đạt được thông lượng hàng triệu message/giây nhờ 3 kỹ thuật cốt lõi:

```mermaid
graph LR
    subgraph DiskIO["1. Sequential Disk I/O"]
        D1[Append-only Log] -->|Ghi nối tiếp liên tục| D2[Tốc độ đạt ~600MB/s trên HDD]
    end

    subgraph OSMemory["2. OS PageCache"]
        Kernel[OS Kernel Memory] -->|Cache nóng các segment gần nhất| NoJVM[Không tốn RAM JVM Heap, Không bị GC Pause]
    end

    subgraph NetZeroCopy["3. Zero-Copy Transfer (sendfile)"]
        Cache[PageCache] -->|Chuyển trực tiếp qua DMA| NIC[Network Socket / NIC Buffer]
        style NIC fill:#bfb,stroke:#2b2
    end
```', 181, '6. co che luu tru vat ly: tai sao kafka cuc ky nhanh? nhieu ky su lam tuong rang doc/ghi tu dia cung (hdd/ssd) se luon cham hon ram. kafka dat duoc thong luong hang trieu message/giay nho 3 ky thuat cot loi:

```mermaid
graph lr
    subgraph diskio["1. sequential disk i/o"]
        d1[append-only log] -->|ghi noi tiep lien tuc| d2[toc do dat ~600mb/s tren hdd]
    end

    subgraph osmemory["2. os pagecache"]
        kernel[os kernel memory] -->|cache nong cac segment gan nhat| nojvm[khong ton ram jvm heap, khong bi gc pause]
    end

    subgraph netzerocopy["3. zero-copy transfer (sendfile)"]
        cache[pagecache] -->|chuyen truc tiep qua dma| nic[network socket / nic buffer]
        style nic fill:#bfb,stroke:#2b2
    end
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#61-sequential-disk-io-ghi-đĩa-tuần-tự', 'kafka-core-concepts-and-architecture', '61-sequential-disk-io-ghi-đĩa-tuần-tự', '6.1. Sequential Disk I/O (Ghi đĩa tuần tự)', 3, 14, '* Ghi ngẫu nhiên (Random I/O) trên đĩa tốn chi phí di chuyển đầu đọc vật lý (~vài trăm IOPS).
* Kafka chỉ sử dụng thao tác **Append-Only (ghi nối tiếp vào cuối file)**. Tốc độ ghi tuần tự trên đĩa cứng có thể đạt hàng trăm MB/giây, nhanh ngang ngửa với thao tác trên bộ nhớ RAM.', 74, '6.1. sequential disk i/o (ghi dia tuan tu) * ghi ngau nhien (random i/o) tren dia ton chi phi di chuyen dau doc vat ly (~vai tram iops).
* kafka chi su dung thao tac **append-only (ghi noi tiep vao cuoi file)**. toc do ghi tuan tu tren dia cung co the dat hang tram mb/giay, nhanh ngang ngua voi thao tac tren bo nho ram.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#62-log-segments--index', 'kafka-core-concepts-and-architecture', '62-log-segments--index', '6.2. Log Segments & Index', 3, 15, 'Mỗi partition được chia nhỏ thành các file phân đoạn (**Segments**, mặc định 1GB):
* `00000000000000000000.log`: Chứa nội dung byte thực tế của các message.
* `00000000000000000000.index`: Bảng chỉ mục thưa (Sparse index) ánh xạ giữa `Offset` $\rightarrow$ `Vị trí byte vật lý trong file .log`.
* `00000000000000000000.timeindex`: Ánh xạ giữa `Timestamp` $\rightarrow$ `Offset` phục vụ tìm kiếm theo thời gian.', 108, '6.2. log segments & index moi partition duoc chia nho thanh cac file phan doan (**segments**, mac dinh 1gb):
* `00000000000000000000.log`: chua noi dung byte thuc te cua cac message.
* `00000000000000000000.index`: bang chi muc thua (sparse index) anh xa giua `offset` $\rightarrow$ `vi tri byte vat ly trong file .log`.
* `00000000000000000000.timeindex`: anh xa giua `timestamp` $\rightarrow$ `offset` phuc vu tim kiem theo thoi gian.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#63-zero-copy-qua-linux-system-call-sendfile', 'kafka-core-concepts-and-architecture', '63-zero-copy-qua-linux-system-call-sendfile', '6.3. Zero-Copy qua Linux System Call `sendfile()`', 3, 16, 'Trong các hệ thống thông thường, dữ liệu truyền từ đĩa ra mạng phải qua 4 lần copy và 4 lần chuyển đổi ngữ cảnh (Context switches):
$$\text{Disk} \xrightarrow{\text{copy 1}} \text{OS PageCache} \xrightarrow{\text{copy 2}} \text{JVM User Memory} \xrightarrow{\text{copy 3}} \text{Socket Buffer} \xrightarrow{\text{copy 4}} \text{NIC}$$

Kafka sử dụng lời gọi hệ thống `sendfile()` của Linux:
$$\text{OS PageCache} \xrightarrow{\text{DMA Direct Copy}} \text{NIC (Network Interface Card)}$$
Dữ liệu đi thẳng từ bộ đệm của Kernel ra card mạng mà không bao giờ bị copy vào bộ nhớ của ứng dụng Java, tiết kiệm 100% tài nguyên CPU và loại bỏ hoàn toàn hiện tượng Garbage Collection dừng hệ thống.

---', 183, '6.3. zero-copy qua linux system call `sendfile()` trong cac he thong thong thuong, du lieu truyen tu dia ra mang phai qua 4 lan copy va 4 lan chuyen doi ngu canh (context switches):
$$\text{disk} \xrightarrow{\text{copy 1}} \text{os pagecache} \xrightarrow{\text{copy 2}} \text{jvm user memory} \xrightarrow{\text{copy 3}} \text{socket buffer} \xrightarrow{\text{copy 4}} \text{nic}$$

kafka su dung loi goi he thong `sendfile()` cua linux:
$$\text{os pagecache} \xrightarrow{\text{dma direct copy}} \text{nic (network interface card)}$$
du lieu di thang tu bo dem cua kernel ra card mang ma khong bao gio bi copy vao bo nho cua ung dung java, tiet kiem 100% tai nguyen cpu va loai bo hoan toan hien tuong garbage collection dung he thong.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#7-phân-tán-chịu-lỗi--cơ-chế-đồng-thuận-kraft-vs-zookeeper', 'kafka-core-concepts-and-architecture', '7-phân-tán-chịu-lỗi--cơ-chế-đồng-thuận-kraft-vs-zookeeper', '7. Phân Tán, Chịu Lỗi & Cơ Chế Đồng Thuận (KRaft vs ZooKeeper)', 2, 17, '', 0, '7. phan tan, chiu loi & co che dong thuan (kraft vs zookeeper) ', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#71-replication-factor-hệ-số-nhân-bản', 'kafka-core-concepts-and-architecture', '71-replication-factor-hệ-số-nhân-bản', '7.1. Replication Factor (Hệ số nhân bản)', 3, 18, 'Để chống mất dữ liệu khi máy chủ bị cháy hoặc sập nguồn, mỗi Partition được sao chép sang nhiều Broker:
* **Partition Leader**: Đảm nhận tất cả tác vụ ghi (write) và đọc (read) của client.
* **Follower Replicas**: Đóng vai trò là bản sao thụ động, liên tục gửi yêu cầu fetch để đồng bộ dữ liệu từ Leader.
* **In-Sync Replicas (ISR)**: Tập hợp các bản sao đang bắt kịp tiến độ với Leader. Nếu một Follower bị mất kết nối quá thời gian `replica.lag.time.max.ms`, nó sẽ bị loại khỏi danh sách ISR.

```mermaid
graph TD
    subgraph Broker1["Broker 1"]
        L0["Partition 0 (LEADER)"]
        F1["Partition 1 (Follower)"]
    end

    subgraph Broker2["Broker 2"]
        F0["Partition 0 (Follower)"]
        L1["Partition 1 (LEADER)"]
    end

    subgraph Broker3["Broker 3"]
        F0_3["Partition 0 (Follower)"]
        F1_3["Partition 1 (Follower)"]
    end

    ClientWrite[Client Write] -->|Chỉ ghi vào Leader| L0
    F0 -.->|Fetch đồng bộ| L0
    F0_3 -.->|Fetch đồng bộ| L0
```', 260, '7.1. replication factor (he so nhan ban) de chong mat du lieu khi may chu bi chay hoac sap nguon, moi partition duoc sao chep sang nhieu broker:
* **partition leader**: dam nhan tat ca tac vu ghi (write) va doc (read) cua client.
* **follower replicas**: dong vai tro la ban sao thu dong, lien tuc gui yeu cau fetch de dong bo du lieu tu leader.
* **in-sync replicas (isr)**: tap hop cac ban sao dang bat kip tien do voi leader. neu mot follower bi mat ket noi qua thoi gian `replica.lag.time.max.ms`, no se bi loai khoi danh sach isr.

```mermaid
graph td
    subgraph broker1["broker 1"]
        l0["partition 0 (leader)"]
        f1["partition 1 (follower)"]
    end

    subgraph broker2["broker 2"]
        f0["partition 0 (follower)"]
        l1["partition 1 (leader)"]
    end

    subgraph broker3["broker 3"]
        f0_3["partition 0 (follower)"]
        f1_3["partition 1 (follower)"]
    end

    clientwrite[client write] -->|chi ghi vao leader| l0
    f0 -.->|fetch dong bo| l0
    f0_3 -.->|fetch dong bo| l0
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#72-cấu-hình-độ-an-toàn-acks-của-producer', 'kafka-core-concepts-and-architecture', '72-cấu-hình-độ-an-toàn-acks-của-producer', '7.2. Cấu hình độ an toàn `acks` của Producer:', 3, 19, '* `acks=0`: Producer gửi xong không cần chờ Broker phản hồi (Cực nhanh, rủi ro mất dữ liệu cao).
* `acks=1`: Producer chờ đúng một mình Partition Leader ghi vào đĩa thành công (Mặc định).
* `acks=all` (hoặc `-1`): Producer chờ toàn bộ các Broker trong danh sách **ISR** xác nhận ghi đĩa thành công kết hợp `min.insync.replicas=2`. Đây là tiêu chuẩn vàng cho các hệ thống thanh toán, ngân hàng và cước viễn thông để cam kết **Zero Data Loss**.', 117, '7.2. cau hinh do an toan `acks` cua producer: * `acks=0`: producer gui xong khong can cho broker phan hoi (cuc nhanh, rui ro mat du lieu cao).
* `acks=1`: producer cho dung mot minh partition leader ghi vao dia thanh cong (mac dinh).
* `acks=all` (hoac `-1`): producer cho toan bo cac broker trong danh sach **isr** xac nhan ghi dia thanh cong ket hop `min.insync.replicas=2`. day la tieu chuan vang cho cac he thong thanh toan, ngan hang va cuoc vien thong de cam ket **zero data loss**.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#73-bước-chuyển-mình-sang-kraft-kafka-raft-consensus', 'kafka-core-concepts-and-architecture', '73-bước-chuyển-mình-sang-kraft-kafka-raft-consensus', '7.3. Bước chuyển mình sang KRaft (Kafka Raft Consensus)', 3, 20, 'Trước phiên bản 3.x, Kafka phụ thuộc vào cụm Apache ZooKeeper bên ngoài để bầu cử Controller và lưu metadata, dẫn đến độ trễ đồng bộ cao và giới hạn số lượng partition ở mức hàng chục ngàn.
Từ phiên bản **Kafka 4.x**, ZooKeeper bị loại bỏ hoàn toàn:
* Cụm Kafka tự vận hành thuật toán đồng thuận **KRaft (Event-driven Raft)**.
* Metadata của toàn bộ cụm được lưu trữ trực tiếp dưới dạng một internal topic (`@metadata`).
* Tốc độ bầu cử lại Leader nhanh hơn gấp 10 lần, khôi phục cụm tức thì và hỗ trợ mở rộng lên đến **hàng triệu Partitions**.

---', 145, '7.3. buoc chuyen minh sang kraft (kafka raft consensus) truoc phien ban 3.x, kafka phu thuoc vao cum apache zookeeper ben ngoai de bau cu controller va luu metadata, dan den do tre dong bo cao va gioi han so luong partition o muc hang chuc ngan.
tu phien ban **kafka 4.x**, zookeeper bi loai bo hoan toan:
* cum kafka tu van hanh thuat toan dong thuan **kraft (event-driven raft)**.
* metadata cua toan bo cum duoc luu tru truc tiep duoi dang mot internal topic (`@metadata`).
* toc do bau cu lai leader nhanh hon gap 10 lan, khoi phuc cum tuc thi va ho tro mo rong len den **hang trieu partitions**.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#8-năm-api-chính-thức-của-apache-kafka-5-core-apis', 'kafka-core-concepts-and-architecture', '8-năm-api-chính-thức-của-apache-kafka-5-core-apis', '8. Năm API Chính Thức Của Apache Kafka (5 Core APIs)', 2, 21, 'Hệ sinh thái Apache Kafka cung cấp 5 bộ API lập trình tiêu chuẩn:

```mermaid
graph TD
    Admin[1. Admin API<br/>Quản trị Topics, Brokers, Quotas, ACLs]
    Producer[2. Producer API<br/>Ghi luồng sự kiện vào Topics]
    Consumer[3. Consumer API<br/>Đọc và xử lý luồng sự kiện từ Topics]
    Streams[4. Kafka Streams API<br/>Xử lý luồng thời gian thực, Stateful Joins, Windows]
    Connect[5. Kafka Connect API<br/>Tích hợp Out-of-the-box với DB, S3, Elasticsearch]
```

1. **Admin API**: Dùng trong tooling quản trị (tạo/xóa topic, thay đổi cấu hình runtime, kiểm tra ACLs, reassign partition).
2. **Producer API**: Thư viện client phía ứng dụng để đẩy dữ liệu vào topic kèm cơ chế batching, nén (lz4, zstd, snappy) và retry.
3. **Consumer API**: Thư viện client phía ứng dụng để lắng nghe topic, tự động quản lý kết nối và rebalance khi scale out/in.
4. **Kafka Streams API**: Thư viện Java gọn nhẹ nhúng trực tiếp vào microservices, hỗ trợ biến đổi stream-to-stream, xử lý windowing theo thời gian sự kiện (Event-time), state store cục bộ RocksDB và stream-table duality (KStream/KTable).
5. **Kafka Connect API**: Framework chuẩn hóa giúp kết nối Kafka với hệ thống bên ngoài mà không cần viết code:
   * **Source Connectors**: Tự động bắt sự kiện từ PostgreSQL (Debezium CDC), MySQL, Oracle đẩy vào Kafka.
   * **Sink Connectors**: Tự động tiêu thụ dữ liệu từ Kafka đổ vào Elasticsearch, ClickHouse, Amazon S3, Snowflake.

---', 377, '8. nam api chinh thuc cua apache kafka (5 core apis) he sinh thai apache kafka cung cap 5 bo api lap trinh tieu chuan:

```mermaid
graph td
    admin[1. admin api<br/>quan tri topics, brokers, quotas, acls]
    producer[2. producer api<br/>ghi luong su kien vao topics]
    consumer[3. consumer api<br/>doc va xu ly luong su kien tu topics]
    streams[4. kafka streams api<br/>xu ly luong thoi gian thuc, stateful joins, windows]
    connect[5. kafka connect api<br/>tich hop out-of-the-box voi db, s3, elasticsearch]
```

1. **admin api**: dung trong tooling quan tri (tao/xoa topic, thay doi cau hinh runtime, kiem tra acls, reassign partition).
2. **producer api**: thu vien client phia ung dung de day du lieu vao topic kem co che batching, nen (lz4, zstd, snappy) va retry.
3. **consumer api**: thu vien client phia ung dung de lang nghe topic, tu dong quan ly ket noi va rebalance khi scale out/in.
4. **kafka streams api**: thu vien java gon nhe nhung truc tiep vao microservices, ho tro bien doi stream-to-stream, xu ly windowing theo thoi gian su kien (event-time), state store cuc bo rocksdb va stream-table duality (kstream/ktable).
5. **kafka connect api**: framework chuan hoa giup ket noi kafka voi he thong ben ngoai ma khong can viet code:
   * **source connectors**: tu dong bat su kien tu postgresql (debezium cdc), mysql, oracle day vao kafka.
   * **sink connectors**: tu dong tieu thu du lieu tu kafka do vao elasticsearch, clickhouse, amazon s3, snowflake.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#9-năm-tình-huống-thực-chiến-vì-sao-kafka-thay-thế-webhook-http', 'kafka-core-concepts-and-architecture', '9-năm-tình-huống-thực-chiến-vì-sao-kafka-thay-thế-webhook-http', '9. Năm Tình Huống Thực Chiến: Vì Sao Kafka Thay Thế Webhook HTTP?', 2, 22, '*(Phân tích thực tế từ tài liệu `docs/kafka-101.html` áp dụng trong hệ thống tổng đài PBX)*', 24, '9. nam tinh huong thuc chien: vi sao kafka thay the webhook http? *(phan tich thuc te tu tai lieu `docs/kafka-101.html` ap dung trong he thong tong dai pbx)*', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#tình-huống-1-backend-sập-2-tiếng-lúc-2-giờ-sáng', 'kafka-core-concepts-and-architecture', 'tình-huống-1-backend-sập-2-tiếng-lúc-2-giờ-sáng', 'Tình huống 1: Backend sập 2 tiếng lúc 2 giờ sáng', 3, 23, '* **HTTP Webhook**: PBX gửi HTTP POST nhận lỗi `Connection Refused` hoặc `504 Timeout`. Muốn không mất dữ liệu, đội PBX phải tự code thêm cơ chế hàng đợi đệm và retry phức tạp trong tổng đài.
* **Apache Kafka**: PBX đẩy vào Kafka chỉ mất ~3ms rồi giải phóng tài nguyên. Message nằm nguyên vẹn an toàn trên partition. 4 giờ sáng backend khởi động lại, Consumer tự động đọc nối tiếp từ offset cũ và xử lý 100% dữ liệu mà không thất thoát một bản ghi nào.', 119, 'tinh huong 1: backend sap 2 tieng luc 2 gio sang * **http webhook**: pbx gui http post nhan loi `connection refused` hoac `504 timeout`. muon khong mat du lieu, doi pbx phai tu code them co che hang doi dem va retry phuc tap trong tong dai.
* **apache kafka**: pbx day vao kafka chi mat ~3ms roi giai phong tai nguyen. message nam nguyen ven an toan tren partition. 4 gio sang backend khoi dong lai, consumer tu dong doc noi tiep tu offset cu va xu ly 100% du lieu ma khong that thoat mot ban ghi nao.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#tình-huống-2-triển-khai-phiên-bản-mới-deployment-rolling-update-10-phút', 'kafka-core-concepts-and-architecture', 'tình-huống-2-triển-khai-phiên-bản-mới-deployment-rolling-update-10-phút', 'Tình huống 2: Triển khai phiên bản mới (Deployment Rolling Update 10 phút)', 3, 24, '* **HTTP Webhook**: Các kết nối đang dang dở bị đứt gãy giữa chừng (Connection reset by peer). Hoặc phải dựng hạ tầng Blue-Green tốn kém, hoặc phải chấp nhận gián đoạn.
* **Apache Kafka**: Tắt toàn bộ Consumer backend để deploy. Dữ liệu cuộc gọi vẫn đều đặn đổ vào Kafka. Sau 10 phút backend bật lên, consumer tăng tốc tiêu thụ (catch up lag) về 0 chỉ trong vài chục giây.', 98, 'tinh huong 2: trien khai phien ban moi (deployment rolling update 10 phut) * **http webhook**: cac ket noi dang dang do bi dut gay giua chung (connection reset by peer). hoac phai dung ha tang blue-green ton kem, hoac phai chap nhan gian doan.
* **apache kafka**: tat toan bo consumer backend de deploy. du lieu cuoc goi van deu dan do vao kafka. sau 10 phut backend bat len, consumer tang toc tieu thu (catch up lag) ve 0 chi trong vai chuc giay.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#tình-huống-3-giờ-cao-điểm-200-cuộcphút-nhưng-database-chỉ-ghi-kịp-50-cuộcphút', 'kafka-core-concepts-and-architecture', 'tình-huống-3-giờ-cao-điểm-200-cuộcphút-nhưng-database-chỉ-ghi-kịp-50-cuộcphút', 'Tình huống 3: Giờ cao điểm 200 cuộc/phút nhưng Database chỉ ghi kịp 50 cuộc/phút', 3, 25, '* **HTTP Webhook**: Webhook dồn ứ, backend cạn kiệt Connection Pool của Database, gây sập đổ dây chuyền (Cascading Failure).
* **Apache Kafka**: Kafka hoạt động như một **bể chứa đệm khổng lồ (Backpressure Absorber)**. Producer vẫn gửi 200 cuộc/phút, Consumer vẫn thong thả đọc 50 cuộc/phút theo đúng năng lực của Database. Không hệ thống nào bị quá tải.', 94, 'tinh huong 3: gio cao diem 200 cuoc/phut nhung database chi ghi kip 50 cuoc/phut * **http webhook**: webhook don u, backend can kiet connection pool cua database, gay sap do day chuyen (cascading failure).
* **apache kafka**: kafka hoat dong nhu mot **be chua dem khong lo (backpressure absorber)**. producer van gui 200 cuoc/phut, consumer van thong tha doc 50 cuoc/phut theo dung nang luc cua database. khong he thong nao bi qua tai.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#tình-huống-4-phát-hiện-lỗi-parse-sai-dữ-liệu-suốt-3-ngày-qua', 'kafka-core-concepts-and-architecture', 'tình-huống-4-phát-hiện-lỗi-parse-sai-dữ-liệu-suốt-3-ngày-qua', 'Tình huống 4: Phát hiện lỗi parse sai dữ liệu suốt 3 ngày qua', 3, 26, '* **HTTP Webhook**: Dữ liệu đã gửi đi là hết. Muốn sửa phải nhờ đội vận hành PBX xuất file Excel thô rồi viết script vá dữ liệu thủ công.
* **Apache Kafka**: Sửa lỗi bug trong code, sau đó dùng lệnh quản trị tua lại bookmark:
  ```bash
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group group.crm --topic mblife.pbx.cdr.v1 \
    --reset-offsets --to-offset 0 --execute
  ```
  Hệ thống tự động chạy lại toàn bộ dữ liệu 3 ngày với logic chuẩn xác trong vài phút.', 128, 'tinh huong 4: phat hien loi parse sai du lieu suot 3 ngay qua * **http webhook**: du lieu da gui di la het. muon sua phai nho doi van hanh pbx xuat file excel tho roi viet script va du lieu thu cong.
* **apache kafka**: sua loi bug trong code, sau do dung lenh quan tri tua lai bookmark:
  ```bash
  kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
    --group group.crm --topic mblife.pbx.cdr.v1 \
    --reset-offsets --to-offset 0 --execute
  ```
  he thong tu dong chay lai toan bo du lieu 3 ngay voi logic chuan xac trong vai phut.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#tình-huống-5-khách-hàng-muốn-tích-hợp-thêm-hệ-thống-bi--data-warehouse', 'kafka-core-concepts-and-architecture', 'tình-huống-5-khách-hàng-muốn-tích-hợp-thêm-hệ-thống-bi--data-warehouse', 'Tình huống 5: Khách hàng muốn tích hợp thêm hệ thống BI / Data Warehouse', 3, 27, '* **HTTP Webhook**: Kỹ sư PBX phải sửa code tổng đài để bắn thêm một Webhook endpoint thứ hai. Latency cuộc gọi bị nhân đôi; nếu hệ thống BI bị chậm sẽ kéo sập cả luồng CRM chính.
* **Apache Kafka**: Đội PBX **không cần chạm vào một dòng code nào**. Đội BI chỉ việc tạo một Consumer Group mới (`group.bi`) và bắt đầu subscribe vào topic có sẵn. Hoàn toàn cách ly và độc lập.

---', 100, 'tinh huong 5: khach hang muon tich hop them he thong bi / data warehouse * **http webhook**: ky su pbx phai sua code tong dai de ban them mot webhook endpoint thu hai. latency cuoc goi bi nhan doi; neu he thong bi bi cham se keo sap ca luong crm chinh.
* **apache kafka**: doi pbx **khong can cham vao mot dong code nao**. doi bi chi viec tao mot consumer group moi (`group.bi`) va bat dau subscribe vao topic co san. hoan toan cach ly va doc lap.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#10-ba-quy-tắc-vàng-khi-tiến-hóa-schema-schema-evolution', 'kafka-core-concepts-and-architecture', '10-ba-quy-tắc-vàng-khi-tiến-hóa-schema-schema-evolution', '10. Ba Quy Tắc Vàng Khi Tiến Hóa Schema (Schema Evolution)', 2, 28, 'Kafka xem nội dung payload của message là một chuỗi bytes thô. Do đó, Producer và Consumer phải thống nhất một cấu trúc dữ liệu chung (Schema). Để tránh làm sập các Consumer đang chạy khi cập nhật hệ thống, bắt buộc phải tuân thủ 3 quy tắc:

| Loại Thay Đổi | Được Làm Trên `.v1` Không? | Nguyên Tắc Kỹ Thuật |
| :--- | :---: | :--- |
| **Thêm trường mới** | **ĐƯỢC** | Trường mới phải là trường tùy chọn (optional) hoặc có giá trị mặc định (`default`). Consumer phiên bản cũ đọc bản tin mới sẽ tự động bỏ qua trường này mà không bị lỗi JSON parse. |
| **Đổi ý nghĩa trường cũ** | **CẤM TUYỆT ĐỐI** | Ví dụ: trường `billsec` đang tính bằng giây, không được tự ý đổi sang mili-giây. Consumer cũ lấy số mili-giây nhân với đơn giá sẽ tính sai cước phí hàng ngàn lần. Trường hợp này phải tạo topic mới `.v2`. |
| **Xóa trường cũ** | **CẤM TUYỆT ĐỐI** | Nếu không dùng trường cũ nữa, hãy tiếp tục gửi kèm giá trị rỗng (`null` hoặc `""`) và đánh dấu `deprecated`. Cấm xóa hẳn khỏi schema vì các Consumer cũ vẫn đang phụ thuộc vào trường đó. |

---', 274, '10. ba quy tac vang khi tien hoa schema (schema evolution) kafka xem noi dung payload cua message la mot chuoi bytes tho. do do, producer va consumer phai thong nhat mot cau truc du lieu chung (schema). de tranh lam sap cac consumer dang chay khi cap nhat he thong, bat buoc phai tuan thu 3 quy tac:

| loai thay doi | duoc lam tren `.v1` khong? | nguyen tac ky thuat |
| :--- | :---: | :--- |
| **them truong moi** | **duoc** | truong moi phai la truong tuy chon (optional) hoac co gia tri mac dinh (`default`). consumer phien ban cu doc ban tin moi se tu dong bo qua truong nay ma khong bi loi json parse. |
| **doi y nghia truong cu** | **cam tuyet doi** | vi du: truong `billsec` dang tinh bang giay, khong duoc tu y doi sang mili-giay. consumer cu lay so mili-giay nhan voi don gia se tinh sai cuoc phi hang ngan lan. truong hop nay phai tao topic moi `.v2`. |
| **xoa truong cu** | **cam tuyet doi** | neu khong dung truong cu nua, hay tiep tuc gui kem gia tri rong (`null` hoac `""`) va danh dau `deprecated`. cam xoa han khoi schema vi cac consumer cu van dang phu thuoc vao truong do. |

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#11-redpanda-vs-apache-kafka-điểm-khác-biệt-then-chốt', 'kafka-core-concepts-and-architecture', '11-redpanda-vs-apache-kafka-điểm-khác-biệt-then-chốt', '11. Redpanda vs Apache Kafka: Điểm Khác Biệt Then Chốt', 2, 29, '[Redpanda](https://redpanda.com) là hệ thống streaming thế hệ mới tương thích **100% Kafka Wire Protocol** (mọi thư viện `confluent-kafka`, Kafka CLI, Kafka Connect đều hoạt động nguyên vẹn mà không cần sửa code):

```mermaid
graph TD
    subgraph KafkaArch["Apache Kafka (JVM Engine)"]
        K_JVM[Java Virtual Machine] --> K_GC[Garbage Collection Pauses]
        K_OS[OS PageCache Management]
    end

    subgraph RedpandaArch["Redpanda (Native C++ Engine)"]
        R_CPP[C++ 20 Native Code] --> R_SEA[Seastar Framework: Thread-Per-Core]
        R_DIR[Direct I/O: Bỏ qua PageCache, Ghi thẳng NVMe SSD]
        R_RAFT[Tích hợp sẵn Built-in Raft Consensus]
    end
```

* **Không có JVM & Không có GC Pauses**: Viết bằng C++20 tối ưu, loại bỏ hoàn toàn hiện tượng jitter độ trễ do Garbage Collection của Java.
* **Kiến trúc Thread-per-core (Seastar Framework)**: Mỗi CPU Core xử lý một thread độc lập, không lock tranh chấp bộ nhớ, tối ưu tối đa năng lực phần cứng hiện đại.
* **Độ trễ P99 cực thấp**: Thấp hơn Kafka từ 3 đến 6 lần trong các bài kiểm thử tải cao.
* **Bộ công cụ dòng lệnh cực nhanh (`rpk`)**: Thay thế hàng loạt file script `.sh` phức tạp của Kafka bằng một file binary duy nhất.

---', 318, '11. redpanda vs apache kafka: diem khac biet then chot [redpanda](https://redpanda.com) la he thong streaming the he moi tuong thich **100% kafka wire protocol** (moi thu vien `confluent-kafka`, kafka cli, kafka connect deu hoat dong nguyen ven ma khong can sua code):

```mermaid
graph td
    subgraph kafkaarch["apache kafka (jvm engine)"]
        k_jvm[java virtual machine] --> k_gc[garbage collection pauses]
        k_os[os pagecache management]
    end

    subgraph redpandaarch["redpanda (native c++ engine)"]
        r_cpp[c++ 20 native code] --> r_sea[seastar framework: thread-per-core]
        r_dir[direct i/o: bo qua pagecache, ghi thang nvme ssd]
        r_raft[tich hop san built-in raft consensus]
    end
```

* **khong co jvm & khong co gc pauses**: viet bang c++20 toi uu, loai bo hoan toan hien tuong jitter do tre do garbage collection cua java.
* **kien truc thread-per-core (seastar framework)**: moi cpu core xu ly mot thread doc lap, khong lock tranh chap bo nho, toi uu toi da nang luc phan cung hien dai.
* **do tre p99 cuc thap**: thap hon kafka tu 3 den 6 lan trong cac bai kiem thu tai cao.
* **bo cong cu dong lenh cuc nhanh (`rpk`)**: thay the hang loat file script `.sh` phuc tap cua kafka bang mot file binary duy nhat.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#12-code-mẫu-thực-chiến-python-confluent-kafka', 'kafka-core-concepts-and-architecture', '12-code-mẫu-thực-chiến-python-confluent-kafka', '12. Code Mẫu Thực Chiến (Python confluent-kafka)', 2, 30, '', 0, '12. code mau thuc chien (python confluent-kafka) ', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#121-producer--gửi-sự-kiện-an-toàn-kèm-partition-key', 'kafka-core-concepts-and-architecture', '121-producer--gửi-sự-kiện-an-toàn-kèm-partition-key', '12.1. Producer — Gửi sự kiện an toàn kèm Partition Key', 3, 31, '```python
# name: pbx_producer.py
# description: Kafka producer gửi dữ liệu CDR kèm linkedid làm partition key

import json
from confluent_kafka import Producer

def delivery_report(err, msg):
    """Callback thông báo trạng thái ghi bản tin lên Broker."""
    if err is not None:
        print(f"❌ Ghi thất bại: {err}")
    else:
        print(f"✅ Ghi thành công vào [{msg.topic()}] Partition: {msg.partition()} Offset: {msg.offset()}")

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''client.id'': ''mblife-pbx-producer'',
    ''acks'': ''all'',  # Đảm bảo toàn bộ ISR đã nhận tin
    ''enable.idempotence'': True,  # Chống trùng lặp dữ liệu phía Producer
    ''retries'': 5
}

producer = Producer(conf)

cdr_payload = {
    "linkedid": "1759734000.1",
    "uniqueid": "1759734000.1",
    "direction": "outbound",
    "caller": "0912345678",
    "callee": "19001234",
    "disposition": "ANSWERED",
    "duration": 45,
    "billsec": 38,
    "start_time": "2026-10-10 10:00:00"
}

# QUAN TRỌNG: Gán key là linkedid để mọi sự kiện của cuộc gọi này luôn rơi vào cùng 1 partition
producer.produce(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_payload[''linkedid''].encode(''utf-8''),
    value=json.dumps(cdr_payload).encode(''utf-8''),
    callback=delivery_report
)

# Chờ hoàn tất gửi toàn bộ batch trong hàng đợi
producer.flush()
```', 349, '12.1. producer — gui su kien an toan kem partition key ```python
# name: pbx_producer.py
# description: kafka producer gui du lieu cdr kem linkedid lam partition key

import json
from confluent_kafka import producer

def delivery_report(err, msg):
    """callback thong bao trang thai ghi ban tin len broker."""
    if err is not none:
        print(f"❌ ghi that bai: {err}")
    else:
        print(f"✅ ghi thanh cong vao [{msg.topic()}] partition: {msg.partition()} offset: {msg.offset()}")

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''client.id'': ''mblife-pbx-producer'',
    ''acks'': ''all'',  # dam bao toan bo isr da nhan tin
    ''enable.idempotence'': true,  # chong trung lap du lieu phia producer
    ''retries'': 5
}

producer = producer(conf)

cdr_payload = {
    "linkedid": "1759734000.1",
    "uniqueid": "1759734000.1",
    "direction": "outbound",
    "caller": "0912345678",
    "callee": "19001234",
    "disposition": "answered",
    "duration": 45,
    "billsec": 38,
    "start_time": "2026-10-10 10:00:00"
}

# quan trong: gan key la linkedid de moi su kien cua cuoc goi nay luon roi vao cung 1 partition
producer.produce(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_payload[''linkedid''].encode(''utf-8''),
    value=json.dumps(cdr_payload).encode(''utf-8''),
    callback=delivery_report
)

# cho hoan tat gui toan bo batch trong hang doi
producer.flush()
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#122-consumer--đọc-dữ-liệu-xử-lý-idempotent-và-graceful-shutdown', 'kafka-core-concepts-and-architecture', '122-consumer--đọc-dữ-liệu-xử-lý-idempotent-và-graceful-shutdown', '12.2. Consumer — Đọc dữ liệu, Xử lý Idempotent và Graceful Shutdown', 3, 32, '```python
# name: pbx_consumer.py
# description: Consumer đọc CDR với cam kết At-Least-Once và Graceful Shutdown

import json
import signal
import sys
from confluent_kafka import Consumer, KafkaError

running = True

def handle_shutdown(sig, frame):
    global running
    print("\nĐang nhận tín hiệu dừng, đóng Consumer an toàn...")
    running = False

signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''group.id'': ''mblife.crm.cdr-sync'',
    ''auto.offset.reset'': ''earliest'',
    ''enable.auto.commit'': False,  # Tắt auto-commit để kiểm soát thủ công
    ''max.poll.interval.ms'': 300000
}

consumer = Consumer(conf)
consumer.subscribe([''mblife.pbx.cdr.v1''])

print("🚀 Consumer đang chạy. Bấm Ctrl+C để thoát.")

try:
    while running:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                continue
            else:
                print(f"Lỗi Consumer: {msg.error()}")
                break

        # 1. Giải mã dữ liệu
        data = json.loads(msg.value().decode(''utf-8''))
        call_id = msg.key().decode(''utf-8'')

        # 2. Xử lý nghiệp vụ (Idempotent Insert vào CRM DB)
        print(f"Xử lý cuộc gọi: {call_id} | Thời lượng: {data.get(''duration'')}s")

        # 3. Commit offset SAU KHI ghi cơ sở dữ liệu thành công (At-Least-Once)
        consumer.commit(message=msg, asynchronous=False)

finally:
    # Đóng kết nối và bàn giao lại partition cho group
    consumer.close()
    print("Consumer đã đóng an toàn.")
```

---', 440, '12.2. consumer — doc du lieu, xu ly idempotent va graceful shutdown ```python
# name: pbx_consumer.py
# description: consumer doc cdr voi cam ket at-least-once va graceful shutdown

import json
import signal
import sys
from confluent_kafka import consumer, kafkaerror

running = true

def handle_shutdown(sig, frame):
    global running
    print("\ndang nhan tin hieu dung, dong consumer an toan...")
    running = false

signal.signal(signal.sigint, handle_shutdown)
signal.signal(signal.sigterm, handle_shutdown)

conf = {
    ''bootstrap.servers'': ''localhost:9092'',
    ''group.id'': ''mblife.crm.cdr-sync'',
    ''auto.offset.reset'': ''earliest'',
    ''enable.auto.commit'': false,  # tat auto-commit de kiem soat thu cong
    ''max.poll.interval.ms'': 300000
}

consumer = consumer(conf)
consumer.subscribe([''mblife.pbx.cdr.v1''])

print("🚀 consumer dang chay. bam ctrl+c de thoat.")

try:
    while running:
        msg = consumer.poll(timeout=1.0)
        if msg is none:
            continue
        if msg.error():
            if msg.error().code() == kafkaerror._partition_eof:
                continue
            else:
                print(f"loi consumer: {msg.error()}")
                break

        # 1. giai ma du lieu
        data = json.loads(msg.value().decode(''utf-8''))
        call_id = msg.key().decode(''utf-8'')

        # 2. xu ly nghiep vu (idempotent insert vao crm db)
        print(f"xu ly cuoc goi: {call_id} | thoi luong: {data.get(''duration'')}s")

        # 3. commit offset sau khi ghi co so du lieu thanh cong (at-least-once)
        consumer.commit(message=msg, asynchronous=false)

finally:
    # dong ket noi va ban giao lai partition cho group
    consumer.close()
    print("consumer da dong an toan.")
```

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#13-cheat-sheet-các-lệnh-cli-quản-trị-cần-thiết', 'kafka-core-concepts-and-architecture', '13-cheat-sheet-các-lệnh-cli-quản-trị-cần-thiết', '13. Cheat Sheet Các Lệnh CLI Quản Trị Cần Thiết', 2, 33, '| Mục Đích | Lệnh Chuẩn Apache Kafka CLI | Lệnh Nhanh Redpanda CLI (`rpk`) |
| :--- | :--- | :--- |
| **Tạo Topic mới** | `kafka-topics.sh --create --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --partitions 3 --replication-factor 3` | `rpk topic create mblife.pbx.cdr.v1 -p 3 -r 3` |
| **Xem danh sách Topics** | `kafka-topics.sh --list --bootstrap-server localhost:9092` | `rpk topic list` |
| **Xem chi tiết Topic & Partitions** | `kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1` | `rpk topic describe mblife.pbx.cdr.v1` |
| **Kiểm tra Consumer Lag** | `kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync` | `rpk group describe mblife.crm.cdr-sync` |
| **Đọc thử tin nhắn từ đầu** | `kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --from-beginning --property print.key=true` | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n'' --offset start` |
| **Tua lại Offset (Replay)** | `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync --topic mblife.pbx.cdr.v1 --reset-offsets --to-earliest --execute` | `rpk group seek mblife.crm.cdr-sync --to start --topics mblife.pbx.cdr.v1` |

---', 332, '13. cheat sheet cac lenh cli quan tri can thiet | muc dich | lenh chuan apache kafka cli | lenh nhanh redpanda cli (`rpk`) |
| :--- | :--- | :--- |
| **tao topic moi** | `kafka-topics.sh --create --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --partitions 3 --replication-factor 3` | `rpk topic create mblife.pbx.cdr.v1 -p 3 -r 3` |
| **xem danh sach topics** | `kafka-topics.sh --list --bootstrap-server localhost:9092` | `rpk topic list` |
| **xem chi tiet topic & partitions** | `kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1` | `rpk topic describe mblife.pbx.cdr.v1` |
| **kiem tra consumer lag** | `kafka-consumer-groups.sh --describe --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync` | `rpk group describe mblife.crm.cdr-sync` |
| **doc thu tin nhan tu dau** | `kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic mblife.pbx.cdr.v1 --from-beginning --property print.key=true` | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n'' --offset start` |
| **tua lai offset (replay)** | `kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group mblife.crm.cdr-sync --topic mblife.pbx.cdr.v1 --reset-offsets --to-earliest --execute` | `rpk group seek mblife.crm.cdr-sync --to start --topics mblife.pbx.cdr.v1` |

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-core-concepts-and-architecture#14-tổng-kết', 'kafka-core-concepts-and-architecture', '14-tổng-kết', '14. Tổng Kết', 2, 34, 'Hiểu rõ lý thuyết cốt lõi của Apache Kafka và Redpanda giúp chúng ta nhận ra rằng:
1. **Kafka không phải là Message Queue thông thường**: Nó là một **Distributed Append-Only Commit Log** kiêm hệ thống lưu trữ bền vững.
2. **Thứ tự nghiệp vụ nằm ở Partition Key**: Luôn chọn khóa phân vùng cẩn thận (`linkedid`, `order_id`) để không làm xáo trộn chuỗi sự kiện.
3. **Consumer độc lập hoàn toàn**: Một nguồn sự kiện duy nhất có thể nuôi sống đồng thời toàn bộ các hệ sinh thái từ CRM, Data Lake cho tới Realtime AI mà không gây nghẽn hệ thống nguồn.', 144, '14. tong ket hieu ro ly thuyet cot loi cua apache kafka va redpanda giup chung ta nhan ra rang:
1. **kafka khong phai la message queue thong thuong**: no la mot **distributed append-only commit log** kiem he thong luu tru ben vung.
2. **thu tu nghiep vu nam o partition key**: luon chon khoa phan vung can than (`linkedid`, `order_id`) de khong lam xao tron chuoi su kien.
3. **consumer doc lap hoan toan**: mot nguon su kien duy nhat co the nuoi song dong thoi toan bo cac he sinh thai tu crm, data lake cho toi realtime ai ma khong gay nghen he thong nguon.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#1-bài-toán-giới-hạn-của-webhook-truyền-thống-trong-tổng-đài-pbx', 'kafka-pbx-event-streaming-architecture', '1-bài-toán-giới-hạn-của-webhook-truyền-thống-trong-tổng-đài-pbx', '1. Bài toán: Giới hạn của Webhook truyền thống trong tổng đài PBX', 2, 0, 'Trong hệ thống tổng đài doanh nghiệp (PBX mblife), mỗi cuộc gọi phát sinh nhiều sự kiện vòng đời:
1. **CDR (Call Detail Record)**: Sinh ra ngay khi cúp máy (thời lượng, đầu số gọi, đầu số nhận, cước phí, trạng thái `ANSWERED` / `BUSY` / `NO ANSWER`). Kích thước nhỏ (~vài trăm bytes).
2. **Call Insights (ASR + LLM Summary)**: Xử lý file ghi âm thành văn bản (Speech-to-Text) và chạy mô hình ngôn ngữ tóm tắt nội dung cuộc gọi. Kích thước lớn (~vài trăm KB), độ trễ hoàn thành sau cuộc gọi vài phút.

```mermaid
graph LR
    PBX[PBX Telephony Core] -->|Drop khi quá tải| Webhook[HTTP Webhook Endpoint]
    Webhook --> CRM[(CRM Database)]
    Webhook -.->|Chậm trễ / Timeout| ASR[Voice AI / ASR]
```', 184, '1. bai toan: gioi han cua webhook truyen thong trong tong dai pbx trong he thong tong dai doanh nghiep (pbx mblife), moi cuoc goi phat sinh nhieu su kien vong doi:
1. **cdr (call detail record)**: sinh ra ngay khi cup may (thoi luong, dau so goi, dau so nhan, cuoc phi, trang thai `answered` / `busy` / `no answer`). kich thuoc nho (~vai tram bytes).
2. **call insights (asr + llm summary)**: xu ly file ghi am thanh van ban (speech-to-text) va chay mo hinh ngon ngu tom tat noi dung cuoc goi. kich thuoc lon (~vai tram kb), do tre hoan thanh sau cuoc goi vai phut.

```mermaid
graph lr
    pbx[pbx telephony core] -->|drop khi qua tai| webhook[http webhook endpoint]
    webhook --> crm[(crm database)]
    webhook -.->|cham tre / timeout| asr[voice ai / asr]
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#các-rủi-ro-chí-mạng-khi-dùng-webhook-http-truyền-thống', 'kafka-pbx-event-streaming-architecture', 'các-rủi-ro-chí-mạng-khi-dùng-webhook-http-truyền-thống', 'Các rủi ro chí mạng khi dùng Webhook HTTP truyền thống:', 3, 1, '- **Tắc nghẽn giờ cao điểm**: Khi lưu lượng cuộc gọi tăng vọt lên 200 cuộc/phút nhưng backend CRM khách hàng chỉ xử lý kịp 50 cuộc/phút, webhook HTTP sẽ timeout (504 Gateway Timeout), dẫn đến mất mát bản tin cuộc gọi vĩnh viễn.
- **Phụ thuộc thời gian hoạt động (Coupling)**: Nếu backend khách hàng bảo trì hoặc gặp sự cố sập mạng 2 tiếng, toàn bộ webhook gửi đến đều bị từ chối kết nối.
- **Không có cơ chế Replay**: Khi phát hiện lỗi parser hoặc logic nghiệp vụ sai trong code, hệ thống webhook không thể tua lại để phát lại dữ liệu đã qua.

---', 144, 'cac rui ro chi mang khi dung webhook http truyen thong: - **tac nghen gio cao diem**: khi luu luong cuoc goi tang vot len 200 cuoc/phut nhung backend crm khach hang chi xu ly kip 50 cuoc/phut, webhook http se timeout (504 gateway timeout), dan den mat mat ban tin cuoc goi vinh vien.
- **phu thuoc thoi gian hoat dong (coupling)**: neu backend khach hang bao tri hoac gap su co sap mang 2 tieng, toan bo webhook gui den deu bi tu choi ket noi.
- **khong co co che replay**: khi phat hien loi parser hoac logic nghiep vu sai trong code, he thong webhook khong the tua lai de phat lai du lieu da qua.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#2-giải-pháp-kiến-trúc-distributed-event-streaming', 'kafka-pbx-event-streaming-architecture', '2-giải-pháp-kiến-trúc-distributed-event-streaming', '2. Giải pháp: Kiến trúc Distributed Event Streaming', 2, 2, 'Để giải quyết triệt để sự phụ thuộc, hệ thống chuyển sang mô hình **Distributed Log (Cuốn sổ ghi thêm)** sử dụng **Redpanda** (tương thích 100% giao thức Apache Kafka).

```mermaid
flowchart TD
    PBX[Tổng Đài PBX mblife] -->|Produce JSON| TopicCDR[Topic: mblife.pbx.cdr.v1]
    PBX -->|Produce Audio URL| TopicInsight[Topic: mblife.pbx.insight.v1]

    subgraph KafkaCluster[Redpanda / Kafka Broker Cluster]
        TopicCDR
        TopicInsight
    end

    TopicCDR -->|Consumer Group 1| CRMWorker[CRM Sync Service]
    TopicCDR -->|Consumer Group 2| BIWorker[Real-time Analytics / BI]
    TopicInsight -->|Consumer Group 3| VoiceAIWorker[Voice Transcription & LLM]
```', 178, '2. giai phap: kien truc distributed event streaming de giai quyet triet de su phu thuoc, he thong chuyen sang mo hinh **distributed log (cuon so ghi them)** su dung **redpanda** (tuong thich 100% giao thuc apache kafka).

```mermaid
flowchart td
    pbx[tong dai pbx mblife] -->|produce json| topiccdr[topic: mblife.pbx.cdr.v1]
    pbx -->|produce audio url| topicinsight[topic: mblife.pbx.insight.v1]

    subgraph kafkacluster[redpanda / kafka broker cluster]
        topiccdr
        topicinsight
    end

    topiccdr -->|consumer group 1| crmworker[crm sync service]
    topiccdr -->|consumer group 2| biworker[real-time analytics / bi]
    topicinsight -->|consumer group 3| voiceaiworker[voice transcription & llm]
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#tại-sao-chọn-redpanda-thay-cho-apache-kafka-gốc', 'kafka-pbx-event-streaming-architecture', 'tại-sao-chọn-redpanda-thay-cho-apache-kafka-gốc', 'Tại sao chọn Redpanda thay cho Apache Kafka gốc?', 3, 3, '- **Zero JVM, Zero Garbage Collection pause**: Viết bằng C++ trên nền tảng Seastar (Thread-per-core), độ trễ p99 cực thấp và ổn định.
- **Không cần Apache ZooKeeper / KRaft phức tạp**: Tích hợp sẵn giao thức đồng thuận Raft bên trong nhị phân duy nhất.
- **Tiết kiệm tài nguyên hạ tầng**: Phù hợp triển khai biên (Edge) hoặc VM tài nguyên giới hạn (1 node UAT RAM ~2GB) mà vẫn đạt thông lượng hàng chục nghìn message/giây.

---', 113, 'tai sao chon redpanda thay cho apache kafka goc? - **zero jvm, zero garbage collection pause**: viet bang c++ tren nen tang seastar (thread-per-core), do tre p99 cuc thap va on dinh.
- **khong can apache zookeeper / kraft phuc tap**: tich hop san giao thuc dong thuan raft ben trong nhi phan duy nhat.
- **tiet kiem tai nguyen ha tang**: phu hop trien khai bien (edge) hoac vm tai nguyen gioi han (1 node uat ram ~2gb) ma van dat thong luong hang chuc nghin message/giay.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#3-thiết-kế-topic--phân-tách-dữ-liệu', 'kafka-pbx-event-streaming-architecture', '3-thiết-kế-topic--phân-tách-dữ-liệu', '3. Thiết kế Topic & Phân tách dữ liệu', 2, 4, 'Hệ thống thiết kế tách biệt 2 topic riêng biệt thay vì gộp chung:

| Thuộc tính | `mblife.pbx.cdr.v1` | `mblife.pbx.insight.v1` |
| :--- | :--- | :--- |
| **Thời điểm sinh** | Ngay lập tức khi cúp máy | 2 - 5 phút sau cuộc gọi |
| **Kích thước** | ~500 bytes (metadata cuộc gọi) | ~200 - 500 KB (transcript + LLM summary) |
| **Thời gian lưu (Retention)** | 30 - 90 ngày | 7 - 14 ngày |
| **Mục đích** | Đồng bộ CRM, tính cước, giám sát | Đào tạo AI, kiểm tra chất lượng cuộc gọi |

> **Nguyên tắc phân tách**: Nếu gộp chung vào 1 topic, các service chỉ cần cập nhật trạng thái cuộc gọi vào CRM cũng buộc phải tải về toàn bộ transcript nặng hàng trăm KB rồi vứt bỏ, gây lãng phí băng thông mạng nghiêm trọng.

---', 188, '3. thiet ke topic & phan tach du lieu he thong thiet ke tach biet 2 topic rieng biet thay vi gop chung:

| thuoc tinh | `mblife.pbx.cdr.v1` | `mblife.pbx.insight.v1` |
| :--- | :--- | :--- |
| **thoi diem sinh** | ngay lap tuc khi cup may | 2 - 5 phut sau cuoc goi |
| **kich thuoc** | ~500 bytes (metadata cuoc goi) | ~200 - 500 kb (transcript + llm summary) |
| **thoi gian luu (retention)** | 30 - 90 ngay | 7 - 14 ngay |
| **muc dich** | dong bo crm, tinh cuoc, giam sat | dao tao ai, kiem tra chat luong cuoc goi |

> **nguyen tac phan tach**: neu gop chung vao 1 topic, cac service chi can cap nhat trang thai cuoc goi vao crm cung buoc phai tai ve toan bo transcript nang hang tram kb roi vut bo, gay lang phi bang thong mang nghiem trong.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#4-chiến-lược-chọn-key--phân-bổ-partition', 'kafka-pbx-event-streaming-architecture', '4-chiến-lược-chọn-key--phân-bổ-partition', '4. Chiến lược Chọn Key & Phân bổ Partition', 2, 5, 'Một topic được chia thành nhiều partition con (ví dụ: 6 partitions) để cho phép nhiều consumer đọc song song. Tuy nhiên, việc chọn Message Key quyết định tính đúng đắn của toàn bộ hệ thống.

```mermaid
graph TD
    subgraph Partitions[Topic: mblife.pbx.cdr.v1]
        P0[Partition 0]
        P1[Partition 1]
        P2[Partition 2]
        P3[Partition 3]
        P4[Partition 4]
        P5[Partition 5]
    end

    Event1["call.inbound (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event2["call.answered (key=''1710928301.12'')"] -->|MurmurHash2| P2
    Event3["call.ended (key=''1710928301.12'')"] -->|MurmurHash2| P2
```', 164, '4. chien luoc chon key & phan bo partition mot topic duoc chia thanh nhieu partition con (vi du: 6 partitions) de cho phep nhieu consumer doc song song. tuy nhien, viec chon message key quyet dinh tinh dung dan cua toan bo he thong.

```mermaid
graph td
    subgraph partitions[topic: mblife.pbx.cdr.v1]
        p0[partition 0]
        p1[partition 1]
        p2[partition 2]
        p3[partition 3]
        p4[partition 4]
        p5[partition 5]
    end

    event1["call.inbound (key=''1710928301.12'')"] -->|murmurhash2| p2
    event2["call.answered (key=''1710928301.12'')"] -->|murmurhash2| p2
    event3["call.ended (key=''1710928301.12'')"] -->|murmurhash2| p2
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#3-nguyên-tắc-phân-bổ-bắt-buộc', 'kafka-pbx-event-streaming-architecture', '3-nguyên-tắc-phân-bổ-bắt-buộc', '3 Nguyên tắc phân bổ bắt buộc:', 3, 6, '1. **Thứ tự chỉ được đảm bảo trong cùng một Partition**:
   Kafka **không** đảm bảo thứ tự thời gian giữa các partition khác nhau. Cuộc gọi kết thúc lúc 10:00 ở Partition 1 có thể được đọc *sau* cuộc gọi kết thúc lúc 10:05 ở Partition 3.
2. **Bắt buộc dùng `linkedid` (Call ID) làm Message Key**:
   Tất cả sự kiện của cùng 1 cuộc gọi (`call.inbound`, `call.answered`, `call.ended`) phải có cùng một key là `linkedid`. Thuật toán băm MurmurHash2 sẽ đưa toàn bộ sự kiện này vào **cùng một partition duy nhất**, đảm bảo thứ tự thời gian tuyệt đối.
3. **Tuyệt đối tránh Hot Partition (Data Skew)**:
   Không được dùng `enterprise_id` hay `tenant_id` làm key. Nếu 1 doanh nghiệp lớn chiếm 80% sản lượng cuộc gọi, toàn bộ 80% lưu lượng sẽ dồn vào đúng 1 partition, khiến consumer phụ trách partition đó chạm ngưỡng 100% CPU trong khi 5 consumer còn lại ngồi nhàn rỗi.

---', 229, '3 nguyen tac phan bo bat buoc: 1. **thu tu chi duoc dam bao trong cung mot partition**:
   kafka **khong** dam bao thu tu thoi gian giua cac partition khac nhau. cuoc goi ket thuc luc 10:00 o partition 1 co the duoc doc *sau* cuoc goi ket thuc luc 10:05 o partition 3.
2. **bat buoc dung `linkedid` (call id) lam message key**:
   tat ca su kien cua cung 1 cuoc goi (`call.inbound`, `call.answered`, `call.ended`) phai co cung mot key la `linkedid`. thuat toan bam murmurhash2 se dua toan bo su kien nay vao **cung mot partition duy nhat**, dam bao thu tu thoi gian tuyet doi.
3. **tuyet doi tranh hot partition (data skew)**:
   khong duoc dung `enterprise_id` hay `tenant_id` lam key. neu 1 doanh nghiep lon chiem 80% san luong cuoc goi, toan bo 80% luu luong se don vao dung 1 partition, khien consumer phu trach partition do cham nguong 100% cpu trong khi 5 consumer con lai ngoi nhan roi.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#5-offset-semantics--ba-điều-kiện-bắt-buộc-ở-consumer', 'kafka-pbx-event-streaming-architecture', '5-offset-semantics--ba-điều-kiện-bắt-buộc-ở-consumer', '5. Offset Semantics & Ba điều kiện bắt buộc ở Consumer', 2, 7, 'Offset đóng vai trò như chiếc "kẹp đánh dấu trang sách" của từng Consumer Group trên từng Partition.

```mermaid
sequenceDiagram
    autonumber
    participant C as Consumer Worker
    participant DB as CRM Database
    participant K as Kafka Broker (Redpanda)

    K->>C: Poll batch message (offset 101 - 105)
    C->>DB: Thực hiện ghi Idempotent (UPSERT theo linkedid)
    DB-->>C: Ghi thành công
    C->>K: Commit Offset (105)
```', 114, '5. offset semantics & ba dieu kien bat buoc o consumer offset dong vai tro nhu chiec "kep danh dau trang sach" cua tung consumer group tren tung partition.

```mermaid
sequencediagram
    autonumber
    participant c as consumer worker
    participant db as crm database
    participant k as kafka broker (redpanda)

    k->>c: poll batch message (offset 101 - 105)
    c->>db: thuc hien ghi idempotent (upsert theo linkedid)
    db-->>c: ghi thanh cong
    c->>k: commit offset (105)
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#ba-điều-kiện-bắt-buộc-khi-triển-khai-consumer', 'kafka-pbx-event-streaming-architecture', 'ba-điều-kiện-bắt-buộc-khi-triển-khai-consumer', 'Ba điều kiện bắt buộc khi triển khai Consumer:', 3, 8, '1. **Ghi Database Idempotent theo `linkedid`**:
   Vì Kafka tuân thủ cơ chế *At-least-once delivery* (ít nhất một lần), khi consumer crash trước khi commit offset, message có thể được gửi lại. Database phải sử dụng câu lệnh `UPSERT` / `ON CONFLICT DO UPDATE` dựa trên khóa chính `linkedid`.
2. **Commit Offset SAU KHI ghi Database thành công**:
   Tắt tự động commit (`enable.auto.commit = False`). Chỉ commit offset lên Broker sau khi giao dịch cơ sở dữ liệu đã commit thành công.
3. **Không giả định thứ tự giữa các cuộc gọi khác nhau**:
   Hệ thống chỉ tuần tự trong phạm vi từng cuộc gọi đơn lẻ.

---', 159, 'ba dieu kien bat buoc khi trien khai consumer: 1. **ghi database idempotent theo `linkedid`**:
   vi kafka tuan thu co che *at-least-once delivery* (it nhat mot lan), khi consumer crash truoc khi commit offset, message co the duoc gui lai. database phai su dung cau lenh `upsert` / `on conflict do update` dua tren khoa chinh `linkedid`.
2. **commit offset sau khi ghi database thanh cong**:
   tat tu dong commit (`enable.auto.commit = false`). chi commit offset len broker sau khi giao dich co so du lieu da commit thanh cong.
3. **khong gia dinh thu tu giua cac cuoc goi khac nhau**:
   he thong chi tuan tu trong pham vi tung cuoc goi don le.

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#6-mẫu-code-triển-khai-python', 'kafka-pbx-event-streaming-architecture', '6-mẫu-code-triển-khai-python', '6. Mẫu Code Triển Khai (Python)', 2, 9, '', 0, '6. mau code trien khai (python) ', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#producer-pbx-event-publisher', 'kafka-pbx-event-streaming-architecture', 'producer-pbx-event-publisher', 'Producer (PBX Event Publisher):', 3, 10, '```python
import json
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers=[''10.0.0.10:9092''],
    key_serializer=lambda k: k.encode(''utf-8''),
    value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode(''utf-8''),
    acks=''all'',  # Đảm bảo broker đã ghi vào đĩa
    retries=3
)

cdr_event = {
    "linkedid": "1710928301.12",
    "call_date": "2026-10-10T10:30:00+07:00",
    "caller": "0982294937",
    "callee": "19001234",
    "duration": 145,
    "disposition": "ANSWERED"
}

# Gửi với key là linkedid để đảm bảo thứ tự
producer.send(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_event[''linkedid''],
    value=cdr_event
)
producer.flush()
```', 180, 'producer (pbx event publisher): ```python
import json
from kafka import kafkaproducer

producer = kafkaproducer(
    bootstrap_servers=[''10.0.0.10:9092''],
    key_serializer=lambda k: k.encode(''utf-8''),
    value_serializer=lambda v: json.dumps(v, ensure_ascii=false).encode(''utf-8''),
    acks=''all'',  # dam bao broker da ghi vao dia
    retries=3
)

cdr_event = {
    "linkedid": "1710928301.12",
    "call_date": "2026-10-10t10:30:00+07:00",
    "caller": "0982294937",
    "callee": "19001234",
    "duration": 145,
    "disposition": "answered"
}

# gui voi key la linkedid de dam bao thu tu
producer.send(
    topic=''mblife.pbx.cdr.v1'',
    key=cdr_event[''linkedid''],
    value=cdr_event
)
producer.flush()
```', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#consumer-crm-sync-worker', 'kafka-pbx-event-streaming-architecture', 'consumer-crm-sync-worker', 'Consumer (CRM Sync Worker):', 3, 11, '```python
import json
from kafka import KafkaConsumer

consumer = KafkaConsumer(
    ''mblife.pbx.cdr.v1'',
    bootstrap_servers=[''10.0.0.10:9092''],
    group_id=''crm-sync-service-v1'',
    auto_offset_reset=''earliest'',
    enable_auto_commit=False,  # Quản lý commit thủ công
    key_deserializer=lambda k: k.decode(''utf-8'') if k else None,
    value_deserializer=lambda v: json.loads(v.decode(''utf-8''))
)

for msg in consumer:
    cdr = msg.value
    try:
        # 1. Ghi Idempotent vào DB
        upsert_to_crm_database(cdr[''linkedid''], cdr)
        
        # 2. Commit offset sau khi DB lưu thành công
        consumer.commit()
    except Exception as e:
        logger.error(f"Lỗi xử lý record {msg.offset}: {e}")
        # Không commit offset để retry
        break
```

---', 206, 'consumer (crm sync worker): ```python
import json
from kafka import kafkaconsumer

consumer = kafkaconsumer(
    ''mblife.pbx.cdr.v1'',
    bootstrap_servers=[''10.0.0.10:9092''],
    group_id=''crm-sync-service-v1'',
    auto_offset_reset=''earliest'',
    enable_auto_commit=false,  # quan ly commit thu cong
    key_deserializer=lambda k: k.decode(''utf-8'') if k else none,
    value_deserializer=lambda v: json.loads(v.decode(''utf-8''))
)

for msg in consumer:
    cdr = msg.value
    try:
        # 1. ghi idempotent vao db
        upsert_to_crm_database(cdr[''linkedid''], cdr)
        
        # 2. commit offset sau khi db luu thanh cong
        consumer.commit()
    except exception as e:
        logger.error(f"loi xu ly record {msg.offset}: {e}")
        # khong commit offset de retry
        break
```

---', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('kafka-pbx-event-streaming-architecture#7-bảng-cheat-sheet-thao-tác-nhanh-rpk-redpanda-cli', 'kafka-pbx-event-streaming-architecture', '7-bảng-cheat-sheet-thao-tác-nhanh-rpk-redpanda-cli', '7. Bảng Cheat Sheet thao tác nhanh `rpk` (Redpanda CLI)', 2, 12, '| Tác vụ | Câu lệnh CLI |
| :--- | :--- |
| **Kiểm tra sức khỏe cluster** | `rpk cluster info` |
| **Tạo topic 6 partitions** | `rpk topic create mblife.pbx.cdr.v1 -p 6 -r 1` |
| **Xem danh sách topic** | `rpk topic list` |
| **Xem chi tiết partition & offset** | `rpk topic describe mblife.pbx.cdr.v1` |
| **Giám sát Consumer Lag** | `rpk group describe crm-sync-service-v1` |
| **Tua lại offset (Replay từ đầu)** | `rpk group seek crm-sync-service-v1 --to-oldest --topics mblife.pbx.cdr.v1` |
| **Lắng nghe trực tiếp message** | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n''` |', 154, '7. bang cheat sheet thao tac nhanh `rpk` (redpanda cli) | tac vu | cau lenh cli |
| :--- | :--- |
| **kiem tra suc khoe cluster** | `rpk cluster info` |
| **tao topic 6 partitions** | `rpk topic create mblife.pbx.cdr.v1 -p 6 -r 1` |
| **xem danh sach topic** | `rpk topic list` |
| **xem chi tiet partition & offset** | `rpk topic describe mblife.pbx.cdr.v1` |
| **giam sat consumer lag** | `rpk group describe crm-sync-service-v1` |
| **tua lai offset (replay tu dau)** | `rpk group seek crm-sync-service-v1 --to-oldest --topics mblife.pbx.cdr.v1` |
| **lang nghe truc tiep message** | `rpk topic consume mblife.pbx.cdr.v1 -f ''%k: %v\n''` |', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#bối-cảnh', 'post-template', 'bối-cảnh', 'Bối cảnh', 2, 0, 'Giới thiệu vấn đề, dự án hoặc ý tưởng bạn muốn chia sẻ. Việc sử dụng các thẻ Heading `##` (H2) sẽ tự động tạo Table of Contents (Mục lục) ở thanh điều hướng bên trái.', 44, 'boi canh gioi thieu van de, du an hoac y tuong ban muon chia se. viec su dung cac the heading `##` (h2) se tu dong tao table of contents (muc luc) o thanh dieu huong ben trai.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#chi-tiết-vấn-đề-h3', 'post-template', 'chi-tiết-vấn-đề-h3', 'Chi tiết vấn đề (H3)', 3, 1, 'Bạn có thể sử dụng `###` để tạo các mục con.', 12, 'chi tiet van de (h3) ban co the su dung `###` de tao cac muc con.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#quyết-định-và-cách-triển-khai', 'post-template', 'quyết-định-và-cách-triển-khai', 'Quyết định và cách triển khai', 2, 2, 'Nội dung chi tiết có thể sử dụng đầy đủ cú pháp Markdown/MDX:

- danh sách;
- **chữ in đậm**;
- [liên kết bài viết khác](/blog/ten-bai-viet);
- blockquote;
- và hình ảnh hoặc code.', 48, 'quyet dinh va cach trien khai noi dung chi tiet co the su dung day du cu phap markdown/mdx:

- danh sach;
- **chu in dam**;
- [lien ket bai viet khac](/blog/ten-bai-viet);
- blockquote;
- va hinh anh hoac code.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#1-mdx-image-box-giao-diện-giống-dự-án-omnimer-health', 'post-template', '1-mdx-image-box-giao-diện-giống-dự-án-omnimer-health', '1. MDX Image Box (Giao diện giống dự án OmniMer Health)', 3, 3, 'Bạn có thể sử dụng trực tiếp HTML và Tailwind CSS để tạo các box giao diện đẹp mắt ngay trong file `.mdx`:

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/images/blog/your-image.png" alt="Mô tả hình ảnh thiết kế" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">Hình 1: Mô tả chi tiết cho hình ảnh</p>
</div>', 113, '1. mdx image box (giao dien giong du an omnimer health) ban co the su dung truc tiep html va tailwind css de tao cac box giao dien dep mat ngay trong file `.mdx`:

<div class="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50 p-2">
  <img src="/images/blog/your-image.png" alt="mo ta hinh anh thiet ke" class="w-full h-auto rounded-xl object-contain" />
  <p class="text-center text-sm text-slate-400 mt-2 italic">hinh 1: mo ta chi tiet cho hinh anh</p>
</div>', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#2-code-box', 'post-template', '2-code-box', '2. Code Box', 3, 4, 'Khối code mặc định sẽ tự động được highlight cú pháp và có giao diện terminal dark theme:

```ts
// src/services/example.ts
export async function calculateMetrics(data: number[]) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}
```

> Đổi `draft: false` khi bài viết đã sẵn sàng xuất hiện trên website.', 88, '2. code box khoi code mac dinh se tu dong duoc highlight cu phap va co giao dien terminal dark theme:

```ts
// src/services/example.ts
export async function calculatemetrics(data: number[]) {
  const sum = data.reduce((a, b) => a + b, 0);
  return sum / data.length;
}
```

> doi `draft: false` khi bai viet da san sang xuat hien tren website.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#liên-kết-và-tham-khảo', 'post-template', 'liên-kết-và-tham-khảo', 'Liên kết và Tham khảo', 2, 5, 'Bạn có thể dễ dàng viết liên kết trỏ về các bài viết khác hoặc các trang dự án:
- [Đọc thêm về hệ thống Agentic AI](/projects/omnimer-health)
- [Xem tất cả dự án](/projects)', 46, 'lien ket va tham khao ban co the de dang viet lien ket tro ve cac bai viet khac hoac cac trang du an:
- [doc them ve he thong agentic ai](/projects/omnimer-health)
- [xem tat ca du an](/projects)', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO article_sections (id, slug, anchor, heading, level, ordinal, content, token_estimate, search_text, created_at, updated_at) VALUES ('post-template#bài-học', 'post-template', 'bài-học', 'Bài học', 2, 6, 'Tóm tắt điều bạn rút ra và hướng phát triển tiếp theo.', 15, 'bai hoc tom tat dieu ban rut ra va huong phat trien tiep theo.', '2026-10-10 15:18:14', '2026-10-10 15:18:14');
INSERT INTO kb_problems (id, parent_slug, title, error_code, error_snippet, environment, root_cause, solution_markdown, tags, file_path, created_at, updated_at, error_code_norm, search_text) VALUES ('building-omnimer-health-fhir-bundle-memory-leak', 'building-omnimer-health', 'Memory leak khi parse FHIR Resource Bundle dung lượng lớn trên V8', 'ERR_WORKER_OUT_OF_MEMORY', 'FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory', 'Node 22, Fastify, FHIR R4 JSON parser', 'Parse toàn bộ JSON bundle 50MB cùng lúc vào bộ nhớ trong quá trình giải mã streaming khiến GC không kịp giải phóng.', 'Chuyển sang sử dụng `stream-json` parser pipeline kết hợp TransformStream để xử lý từng Entry tuần tự.', '["fhir","healthtech","memory-leak","streaming"]', 'src/content/problems/building-omnimer-health/fhir-bundle-memory-leak.md', '2026-10-10 03:59:03', '2026-10-10 15:18:14', 'ERR_WORKER_OUT_OF_MEMORY', 'memory leak khi parse fhir resource bundle dung luong lon tren v8 err_worker_out_of_memory err_worker_out_of_memory fatal error: ineffective mark-compacts near heap limit allocation failed - javascript heap out of memory parse toan bo json bundle 50mb cung luc vao bo nho trong qua trinh giai ma streaming khien gc khong kip giai phong. chuyen sang su dung `stream-json` parser pipeline ket hop transformstream de xu ly tung entry tuan tu. fhir healthtech memory-leak streaming');
INSERT INTO kb_problems (id, parent_slug, title, error_code, error_snippet, environment, root_cause, solution_markdown, tags, file_path, created_at, updated_at, error_code_norm, search_text) VALUES ('kafka-core-concepts-and-architecture-db-connection-pool-exhaustion', 'kafka-core-concepts-and-architecture', 'Cạn kiệt Connection Pool và Treo Database khi Consumer Group tăng tốc đọc bù Lag', 'DB_CONNECTION_POOL_EXHAUSTION_AFTER_LAG_RECOVERY', 'FATAL: remaining connection slots are reserved for non-replication superuser connections (PostgreSQL 53300) / pool timeout 30000ms.', 'Fastify / Node.js / Python Consumer Service, PostgreSQL 16', 'Sau khi hệ thống phục hồi sau 2 tiếng gián đoạn, Consumer Group tăng tốc kéo message từ Kafka với thông lượng tối đa (Catch-up lag). Việc thực hiện đơn lẻ từng câu lệnh INSERT trực tiếp vào Database đã làm quá tải và sập toàn bộ Connection Pool.', '1. Chuyển sang cơ chế Batch Processing: Gom các bản ghi trong đợt `poll()` và thực thi một câu lệnh `INSERT ... ON CONFLICT` duy nhất cho 50-100 bản ghi.
2. Cấu hình Semaphore / Concurrency Limiter tại Consumer để giới hạn số truy vấn đồng thời vào Database.
3. Tinh chỉnh `fetch.max.bytes` và `max.poll.records` phù hợp với năng lực chịu tải của tầng lưu trữ đích.', '["kafka","consumer-lag","database-exhaustion","backpressure","batch-insert"]', 'src/content/problems/kafka-core-concepts-and-architecture/db-connection-pool-exhaustion.md', '2026-10-10 15:18:14', '2026-10-10 15:18:14', 'DB_CONNECTION_POOL_EXHAUSTION_AFTER_LAG_RECOVERY', 'can kiet connection pool va treo database khi consumer group tang toc doc bu lag db_connection_pool_exhaustion_after_lag_recovery db_connection_pool_exhaustion_after_lag_recovery fatal: remaining connection slots are reserved for non-replication superuser connections (postgresql 53300) / pool timeout 30000ms. sau khi he thong phuc hoi sau 2 tieng gian doan, consumer group tang toc keo message tu kafka voi thong luong toi da (catch-up lag). viec thuc hien don le tung cau lenh insert truc tiep vao database da lam qua tai va sap toan bo connection pool. 1. chuyen sang co che batch processing: gom cac ban ghi trong dot `poll()` va thuc thi mot cau lenh `insert ... on conflict` duy nhat cho 50-100 ban ghi.
2. cau hinh semaphore / concurrency limiter tai consumer de gioi han so truy van dong thoi vao database.
3. tinh chinh `fetch.max.bytes` va `max.poll.records` phu hop voi nang luc chiu tai cua tang luu tru dich. kafka consumer-lag database-exhaustion backpressure batch-insert');
INSERT INTO kb_problems (id, parent_slug, title, error_code, error_snippet, environment, root_cause, solution_markdown, tags, file_path, created_at, updated_at, error_code_norm, search_text) VALUES ('kafka-core-concepts-and-architecture-hot-partition-imbalance', 'kafka-core-concepts-and-architecture', 'Hiện tượng Hot Partition (Lệch tải đĩa và CPU) do chọn sai Partition Key', 'ERR_HOT_PARTITION_IMBALANCE', 'Broker alert: Partition 2 disk usage is 94% (850GB) while Partitions 0, 1, 3 are at 12% (110GB). Consumer assigned to Partition 2 lag exceeds 45,000 records.', 'Apache Kafka 3.x / 4.x / Redpanda, Multi-tenant Architecture', 'Chọn `tenant_id` làm Partition Key đơn thuần. Trong môi trường Multi-tenant, khách hàng VIP chiếm 80% lưu lượng, khiến mọi sự kiện dồn hết vào Partition 2. Các partition còn lại hầu như nhàn rỗi.', 'Áp dụng Composite Key hoặc Key Salting: Kết hợp `tenant_id` với entity UUID: `f''{tenant_id}:{linkedid}''`. Vì `linkedid` có tính ngẫu nhiên cao, thuật toán băm Murmur2 rải đều tải khắp toàn bộ các Partition trong khi vẫn đảm bảo chuỗi sự kiện của từng phiên gọi duy nhất luôn nằm trên cùng 1 partition.', '["kafka","hot-partition","partition-key","hashing","scalability"]', 'src/content/problems/kafka-core-concepts-and-architecture/hot-partition-imbalance.md', '2026-10-10 15:18:14', '2026-10-10 15:18:14', 'ERR_HOT_PARTITION_IMBALANCE', 'hien tuong hot partition (lech tai dia va cpu) do chon sai partition key err_hot_partition_imbalance err_hot_partition_imbalance broker alert: partition 2 disk usage is 94% (850gb) while partitions 0, 1, 3 are at 12% (110gb). consumer assigned to partition 2 lag exceeds 45,000 records. chon `tenant_id` lam partition key don thuan. trong moi truong multi-tenant, khach hang vip chiem 80% luu luong, khien moi su kien don het vao partition 2. cac partition con lai hau nhu nhan roi. ap dung composite key hoac key salting: ket hop `tenant_id` voi entity uuid: `f''{tenant_id}:{linkedid}''`. vi `linkedid` co tinh ngau nhien cao, thuat toan bam murmur2 rai deu tai khap toan bo cac partition trong khi van dam bao chuoi su kien cua tung phien goi duy nhat luon nam tren cung 1 partition. kafka hot-partition partition-key hashing scalability');
INSERT INTO kb_problems (id, parent_slug, title, error_code, error_snippet, environment, root_cause, solution_markdown, tags, file_path, created_at, updated_at, error_code_norm, search_text) VALUES ('kafka-pbx-event-streaming-architecture-call-event-ordering', 'kafka-pbx-event-streaming-architecture', 'Mất thứ tự sự kiện cuộc gọi (Call Ended chạy trước Call Answered) do thiếu Partition Key', 'DATA_INCONSISTENCY_EVENT_ORDER', '[CRM Sync Worker] Conflict detected for call_id=''1710928301.12'': Received ''call.answered'' but current status is already ''ENDED''.', 'Python kafka-python / aiokafka, Redpanda v23+, Linux x86_64', 'Producer gửi event nhưng đặt key=None hoặc không cấu hình serializer. Kafka sử dụng thuật toán round-robin phân tán các event của cùng một cuộc gọi sang nhiều partition khác nhau. Vì các partition được consumer đọc song song, sự kiện ''call.ended'' vô tình được xử lý trước ''call.answered''.', 'Bắt buộc mọi event liên quan đến cuộc gọi phải chỉ định key là linkedid: `producer.send(topic, key=cdr[''linkedid''].encode(''utf-8''), value=payload)`. MurmurHash2 sẽ đưa toàn bộ vòng đời cuộc gọi vào cùng 1 partition, đảm bảo thứ tự thời gian tuần tự 100%.', '["kafka","redpanda","ordering","partition-key","pbx"]', 'src/content/problems/kafka-pbx-event-streaming-architecture/call-event-ordering.md', '2026-10-10 15:18:14', '2026-10-10 15:18:14', 'DATA_INCONSISTENCY_EVENT_ORDER', 'mat thu tu su kien cuoc goi (call ended chay truoc call answered) do thieu partition key data_inconsistency_event_order data_inconsistency_event_order [crm sync worker] conflict detected for call_id=''1710928301.12'': received ''call.answered'' but current status is already ''ended''. producer gui event nhung dat key=none hoac khong cau hinh serializer. kafka su dung thuat toan round-robin phan tan cac event cua cung mot cuoc goi sang nhieu partition khac nhau. vi cac partition duoc consumer doc song song, su kien ''call.ended'' vo tinh duoc xu ly truoc ''call.answered''. bat buoc moi event lien quan den cuoc goi phai chi dinh key la linkedid: `producer.send(topic, key=cdr[''linkedid''].encode(''utf-8''), value=payload)`. murmurhash2 se dua toan bo vong doi cuoc goi vao cung 1 partition, dam bao thu tu thoi gian tuan tu 100%. kafka redpanda ordering partition-key pbx');
INSERT INTO kb_problems (id, parent_slug, title, error_code, error_snippet, environment, root_cause, solution_markdown, tags, file_path, created_at, updated_at, error_code_norm, search_text) VALUES ('kafka-pbx-event-streaming-architecture-commit-failed-exception', 'kafka-pbx-event-streaming-architecture', 'Consumer bị ngắt kết nối (CommitFailedException) và Rebalance Storm do tác vụ ASR/LLM quá tải', 'CommitFailedException', 'kafka.errors.CommitFailedException: Commit cannot be completed since the group has already rebalanced and assigned the partitions to another member.', 'Python kafka-python, Whisper ASR Worker, Ollama/LLM Summarizer', 'Consumer nhận message chứa audio URL và tiến hành tải/chuyển đổi giọng nói mất hơn 5 phút. Thời gian xử lý vượt quá cấu hình `max.poll.interval.ms` (mặc định 300,000ms = 5 phút), khiến Broker đánh giá worker đã chết và kích hoạt Rebalance liên tục, gây đứng toàn bộ cụm consumer group.', '1. Tách pipeline: Consumer chỉ nhận message và đẩy tác vụ vào hàng đợi bất đồng bộ (Thread/Celery pool), lập tức hoàn tất vòng lặp `poll()`.
2. Hoặc tinh chỉnh cấu hình Kafka Consumer: đặt `max.poll.interval.ms=900000` (15 phút) và giới hạn `max.poll.records=1` để worker chỉ nhận đúng 1 audio task mỗi lần poll.', '["kafka","rebalance","max-poll-interval","asr","timeout","consumer-group","commit-failed"]', 'src/content/problems/kafka-pbx-event-streaming-architecture/commit-failed-exception.md', '2026-10-10 15:18:14', '2026-10-10 15:18:14', 'COMMITFAILEDEXCEPTION', 'consumer bi ngat ket noi (commitfailedexception) va rebalance storm do tac vu asr/llm qua tai commitfailedexception commitfailedexception kafka.errors.commitfailedexception: commit cannot be completed since the group has already rebalanced and assigned the partitions to another member. consumer nhan message chua audio url va tien hanh tai/chuyen doi giong noi mat hon 5 phut. thoi gian xu ly vuot qua cau hinh `max.poll.interval.ms` (mac dinh 300,000ms = 5 phut), khien broker danh gia worker da chet va kich hoat rebalance lien tuc, gay dung toan bo cum consumer group. 1. tach pipeline: consumer chi nhan message va day tac vu vao hang doi bat dong bo (thread/celery pool), lap tuc hoan tat vong lap `poll()`.
2. hoac tinh chinh cau hinh kafka consumer: dat `max.poll.interval.ms=900000` (15 phut) va gioi han `max.poll.records=1` de worker chi nhan dung 1 audio task moi lan poll. kafka rebalance max-poll-interval asr timeout consumer-group commit-failed');

CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
    slug UNINDEXED,
    title,
    description,
    hashtags,
    kb_category,
    summary_for_agents,
    raw_markdown,
    search_text,
    content='articles',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS kb_problems_fts USING fts5(
    id UNINDEXED,
    parent_slug UNINDEXED,
    title,
    error_code,
    error_snippet,
    root_cause,
    solution_markdown,
    tags,
    search_text,
    content='kb_problems',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    slug UNINDEXED,
    anchor UNINDEXED,
    heading,
    content,
    search_text,
    content='article_sections',
    content_rowid='rowid',
    tokenize = 'unicode61 remove_diacritics 2'
);

-- Triggers
CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
    INSERT INTO articles_fts(articles_fts, rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES ('delete', old.rowid, old.slug, old.title, old.description, old.hashtags, old.kb_category, old.summary_for_agents, old.raw_markdown, old.search_text);
    INSERT INTO articles_fts(rowid, slug, title, description, hashtags, kb_category, summary_for_agents, raw_markdown, search_text)
    VALUES (new.rowid, new.slug, new.title, new.description, new.hashtags, new.kb_category, new.summary_for_agents, new.raw_markdown, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_ai AFTER INSERT ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_ad AFTER DELETE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS kb_problems_au AFTER UPDATE ON kb_problems BEGIN
    INSERT INTO kb_problems_fts(kb_problems_fts, rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES ('delete', old.rowid, old.id, old.parent_slug, old.title, old.error_code, old.error_snippet, old.root_cause, old.solution_markdown, old.tags, old.search_text);
    INSERT INTO kb_problems_fts(rowid, id, parent_slug, title, error_code, error_snippet, root_cause, solution_markdown, tags, search_text)
    VALUES (new.rowid, new.id, new.parent_slug, new.title, new.error_code, new.error_snippet, new.root_cause, new.solution_markdown, new.tags, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS sections_ai AFTER INSERT ON article_sections BEGIN
    INSERT INTO sections_fts(rowid, slug, anchor, heading, content, search_text)
    VALUES (new.rowid, new.slug, new.anchor, new.heading, new.content, new.search_text);
END;

CREATE TRIGGER IF NOT EXISTS sections_ad AFTER DELETE ON article_sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, slug, anchor, heading, content, search_text)
    VALUES ('delete', old.rowid, old.slug, old.anchor, old.heading, old.content, old.search_text);
END;

CREATE TRIGGER IF NOT EXISTS sections_au AFTER UPDATE ON article_sections BEGIN
    INSERT INTO sections_fts(sections_fts, rowid, slug, anchor, heading, content, search_text)
    VALUES ('delete', old.rowid, old.slug, old.anchor, old.heading, old.content, old.search_text);
    INSERT INTO sections_fts(rowid, slug, anchor, heading, content, search_text)
    VALUES (new.rowid, new.slug, new.anchor, new.heading, new.content, new.search_text);
END;

-- Rebuild
INSERT INTO articles_fts(articles_fts) VALUES('rebuild');
INSERT INTO sections_fts(sections_fts) VALUES('rebuild');
INSERT INTO kb_problems_fts(kb_problems_fts) VALUES('rebuild');
