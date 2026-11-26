<p align="center" dir="ltr">
  <a href="README.en-GB.md" title="الإنجليزية (المملكة المتحدة)"><img src="./assets/flags/gb-eng.svg" width="28" alt="الإنجليزية (المملكة المتحدة)" /></a>
  ·
  <a href="README.md" title="الإنجليزية (الولايات المتحدة)"><img src="./assets/flags/us.svg" width="28" alt="الإنجليزية (الولايات المتحدة)" /></a>
  ·
  <a href="README.pt-BR.md" title="البرتغالية"><img src="./assets/flags/br.svg" width="28" alt="البرتغالية" /></a>
  ·
  <a href="README.ru.md" title="الروسية"><img src="./assets/flags/ru.svg" width="28" alt="الروسية" /></a>
  ·
  <a href="README.zh-CN.md" title="الصينية"><img src="./assets/flags/cn.svg" width="28" alt="الصينية" /></a>
  ·
  <a href="README.ar.md" title="العربية"><img src="./assets/flags/sa.svg" width="32" alt="العربية" /></a>
</p>

<div dir="rtl">

<div align="center">

<img src="./assets/hero.svg" alt="JONIS.AI — خادم رقمي يعمل باستقلالية، ولا يرتبط بنموذج بعينه، ومفتوح المصدر" width="100%" />

# JONIS.AI
### خادمك الرقمي، في نسخة مطوّرة.
**يعمل باستقلالية. لا يرتبط بنموذج بعينه. مفتوح المصدر. مجاني للتشغيل المحلي.**

خادم رقمي مستقل ومفتوح المصدر — بصفته JARVIS مطوّرًا — مصمم لتنفيذ مهام حقيقية في نظامك، مع وجه ثلاثي الأبعاد/HUD اختياري وصوت ثنائي الاتجاه. شغّل نماذج محلية مجانية عبر Ollama أو استخدم مفاتيحك الخاصة لـ Claude وGemini وOpenAI/Codex.

<div align="center" dir="ltr">

<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="رخصة MIT" /></a>
<a href="https://github.com/JONIS-AI/JONIS.AI/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="نرحّب بطلبات السحب" /></a>
<a href="#التشغيل-المحلي-مقابل-واجهات-api-السحابية"><img src="https://img.shields.io/badge/Mode-Local%20%26%20Cloud%20BYOK-blueviolet" alt="وضعا التشغيل المحلي والسحابي باستخدام مفتاحك الخاص (BYOK)" /></a>
<a href="#محركات-النماذج"><img src="https://img.shields.io/badge/LLMs-Ollama%20%7C%20Claude%20%7C%20Gemini%20%7C%20OpenAI-blue" alt="محركات نماذج Ollama وClaude وGemini وOpenAI" /></a>

<br/>

<a href="https://github.com/JONIS-AI"><img src="https://img.shields.io/badge/ORG-JONIS--AI-0b1020?style=flat-square&logo=github&logoColor=22d3ee" alt="منظمة JONIS.AI" /></a>
<img src="https://img.shields.io/badge/STATUS-BUILDING-0b1020?style=flat-square&logo=statuspage&logoColor=8b5cf6" alt="الحالة: قيد البناء" />
<img src="https://komarev.com/ghpvc/?username=jonypeixoto&style=flat-square&color=22d3ee&label=VIEWS" alt="عدد مشاهدات الملف الشخصي" />

</div>

<br/><br/>

<a href="#خادم-رقمي-صمم-ليخدم-وينفذ">عن المشروع</a> · <a href="#التشغيل-المحلي-مقابل-واجهات-api-السحابية">المحلي والسحابة</a> · <a href="#العرض-التجريبي-والتجربة">العرض</a> · <a href="#ما-الذي-يفعله-jonis-من-أجلك">الإمكانات</a> · <a href="#-وحدات-وقدرات-الخادم-الرقمي">الوحدات</a> · <a href="#العقل-الثاني-مع-obsidian">Obsidian</a> · <a href="#محركات-النماذج">المحركات</a> · <a href="#-البدء-السريع">البدء السريع</a> · <a href="#-خطة-العمل">خطة العمل</a> · <a href="#-الأسئلة-الشائعة">الأسئلة الشائعة</a>

</div>

---

## خادم رقمي صمم ليخدم وينفذ

تنتظر معظم أدوات الذكاء الاصطناعي طلبك التالي. أما **JONIS.AI** فقيد التطوير بوصفه خادمًا رقميًا له حضور وصوت واستقلالية محدودة بضوابط: يقرأ سياقك، ويبادر إلى العمل وفق القواعد التي تحددها، ويبدّل «عقله» ليناسب المهمة، وينفّذ إجراءات ملموسة في بيئتك.

- **مجاني ومفتوح المصدر:** برنامج مرخّص بموجب MIT، دون اشتراك إلزامي أو ارتباط بمزوّد بعينه. لا يفرض الوضع المحلي رسوم API.
- **بدّل نماذج LLM في ثوانٍ:** ابدأ بنماذج محلية مجانية عبر **Ollama**، أو اربط **Claude وGemini وOpenAI/Codex وOpenRouter** والمحركات المتوافقة باستخدام مفاتيحك الخاصة.
- **صوت وحضور بصري:** النص هو الخيار الأساسي بحكم التصميم، مع صوت ثنائي الاتجاه وصورة رمزية ثلاثية الأبعاد/واجهة HUD اختيارية في خطة العمل.
- **أنت من يضع الحدود:** القوائم المسموح بها، وتأكيد الإجراءات الحساسة، وسجل تدقيق محلي هي مبادئ أساسية في التصميم.

> خزنتك. قواعدك. أنت من يختار الذكاء الذي يستخدمه.

**حالة المشروع:** المنتج قيد التطوير. يحتوي هذا المستودع حاليًا على الرؤية والبنية والهوية البصرية وخطة العمل؛ أما الإمكانات التشغيلية الموضحة أدناه فتوصف المنتج المقصود.

---

## التشغيل المحلي مقابل واجهات API السحابية

اختر طريقة عمل خادمك بما يناسب عتادك وميزانيتك واحتياجاتك إلى الخصوصية.

| المعيار | الوضع المحلي | الوضع السحابي / BYOK |
| :--- | :--- | :--- |
| **التكلفة** | **€0 / R$0 من رسوم API** — العتاد والكهرباء فقط | أسعار المزوّد أو مستوى مجاني؛ تستخدم مفتاحك الخاص |
| **الخصوصية** | **الحد الأقصى** — تُعالج البيانات على جهازك | يُرسل السياق المحدد إلى مزوّد LLM الذي تختاره |
| **المتطلبات** | معالج وبطاقة رسومية بقدرات مناسبة (CPU/GPU)، مع تثبيت [Ollama](https://ollama.com/) | اتصال بالإنترنت ومفتاح API صالح |
| **نماذج مثالية** | `qwen2.5-coder`، `llama`، `deepseek` | Claude، Gemini، OpenAI/Codex، OpenRouter |
| **الأنسب لـ** | الاستخدام المستمر، والعمل دون اتصال، والبيانات الحساسة | الاستدلال المعقد، والسياقات الطويلة، وارتفاع الأحمال المفاجئ |

قد تتغير المستويات المجانية والحصص لدى مزوّدي السحابة، وقد يترتب على استخدام API تكاليف. لا يلزم أي مزوّد مدفوع لاستخدام الوضع المحلي المخطط له.

---

## العرض التجريبي والتجربة

<div align="center">
  <img src="./assets/jonis-core.gif" alt="نواة JONIS.AI المتحركة: شخصية مدرعة بعيون زرقاء متوهجة ومفاعل سماوي نابض في الصدر" width="320" />
  <br/>
  <sub>JONIS.AI — النواة البصرية</sub>
</div>

<br/>

<div align="center">
  <img src="./assets/terminal.svg" alt="طرفية JONIS.AI تعرض الهوية ومحركات النماذج والمهمة" width="100%" />
</div>

توضح الخطوات التالية سير العمل المتكامل المقصود.

<div dir="ltr">

```text
[JONIS.AI — سير العمل المستهدف]
> "انتقل إلى النموذج المحلي المجاني، ونظّم التقارير في /finance وأنشئ ملخصًا."

[المحرك: ollama/qwen2.5-coder:7b | الصوت: جاهز | السياسة: تأكيد الكتابة]
> تم تصنيف 14 تقريرًا
> حُفظ الملخص في /finance/monthly-summary.md
```

</div>

---

## ما الذي يفعله JONIS من أجلك

<details>
<summary><strong>01 · السياق والمبادرة</strong> — فهم الخزنة واقتراح الخطوة المفيدة التالية</summary>

<br/>

يدمج الملاحظات النشطة والمهام والنشاط الأخير في سياق عمل. ويمكنه اقتراح الخطوة التالية، وإعداد مسودة خطة، وطلب التوضيح قبل التصرف عندما يكون الطلب غامضًا.

`السياق` `التخطيط` `تنبيهات استباقية` `مراجعة بشرية`

</details>

<details>
<summary><strong>02 · تنفيذ فعلي مع ضوابط حماية</strong> — تحويل النية إلى إجراءات ملموسة في النظام</summary>

<br/>

صُمم لتنظيم الملفات، وإنشاء ملاحظات منظمة، وتشغيل مسارات عمل معتمدة، واستدعاء الأدوات المصرّح بها. تتطلب العمليات الحساسة موافقة صريحة، ويُسجَّل كل إجراء محليًا.

`استخدام الأدوات` `القوائم المسموح بها` `الموافقات` `سجل التدقيق`

</details>

<details>
<summary><strong>03 · توجيه النماذج</strong> — استخدام المحرك المناسب دون الارتباط بمزوّد بعينه</summary>

<br/>

يختار موجّه لا يرتبط بمزوّد بعينه بين المحركات المحلية والسحابية بحسب المهمة والتكلفة والخصوصية والتوافر. الوصول إلى السحابات المدفوعة اختياري دائمًا؛ ويجب ألا يرسل الموجّه بيانات الخزنة إلى واجهة API سحابية دون علمك.

`Ollama` `BYOK` `التبديل الاحتياطي` `التحكم في التكلفة`

</details>

<details>
<summary><strong>04 · الصوت والحضور البصري</strong> — التفاعل بما يتجاوز النص البسيط</summary>

<br/>

تجربة تبدأ من الطرفية تبقي الوظائف الأساسية سهلة الوصول، بينما يضيف الصوت ثنائي الاتجاه والصورة الرمزية الهولوغرامية الاختيارية ثلاثية الأبعاد/واجهة HUD طبقة أكثر غمرًا.

`صوت ثنائي الاتجاه` `صورة رمزية ثلاثية الأبعاد` `HUD` `إمكانية الوصول`

</details>

---

## 🧩 وحدات وقدرات الخادم الرقمي

تجمع النواة المعيارية المخططة ست طبقات عملية:

- **💻 التنفيذ والبرمجة:** ينشئ البنى، وينفّذ الأوامر، ويصحّح الأخطاء، ويقرأ السجلات، ويساعد في مسارات تطوير البرمجيات.
- **🎙️ الصوت ثنائي الاتجاه:** تحدّث مع الخادم الرقمي بشكل طبيعي، واحصل على ردود صوتية أو نصية.
- **🌐 وجه ثلاثي الأبعاد هولوغرامي / واجهة HUD:** طبقة بصرية اختيارية تمنح الخادم هويته وتقدّم ملاحظات فورية عن حالته.
- **📂 إدارة الملفات والبيانات:** يقرأ المستندات، وينظّم المجلدات، ويستخرج المعلومات، ويجهّز مخرجات منظمة.
- **🔎 البحث والتلخيص:** يربط المعلومات ويلخّص ما يهم دون إضاعة للوقت.
- **🔌 بنية قابلة للتوسع:** أضف مهارات وأدوات وموصّلات جديدة بما يناسب سير عملك.

---

## العقل الثاني مع Obsidian

الإضافة مصممة للعمل على سطح المكتب والجهاز اللوحي والهاتف، وتتوافق مع **الخطة المجانية**. لا يلزم Obsidian Sync أو Obsidian Publish.

- **Markdown هو المرجع الأساسي:** تبقى ملاحظاتك مقروءة وقابلة للنقل وتحت سيطرتك.
- **الاسترجاع المحلي أولًا:** تدعم SQLite/FTS والتضمينات المحلية الاختيارية البحث والإجابات المرفقة بالإسنادات.
- **سير عمل عملي:** الالتقاط، والتصنيف، والربط، والاسترجاع، والتنفيذ، والمراجعة.
- **تخزين وموصّلات اختيارية:** يوسّع 9Drive وNotion وMiro النظام دون أن تتحول إلى تبعيات إلزامية.

<div dir="ltr">

```text
الالتقاط -> التصنيف -> الربط -> الاسترجاع -> التنفيذ -> المراجعة
   |           |         |          |           |          |
 الخزنة       قواعد     ويكي      الفهرس      الأدوات    سجل
 الملاحظات    محلية     روابط     المحلي      التدقيق
```

</div>

| التكامل | الدور المخطط له | إلزامي؟ |
| :--- | :--- | :--- |
| **Obsidian** | الخزنة، والملاحظات، والمهام، وواجهة الإضافة | نعم |
| **[9Drive](https://github.com/zenhosta/9drive)** | المرفقات، والتصديرات، وتوجيه النسخ الاحتياطي عبر واجهة مزوّد تخزين | لا |
| **Notion** | موصّل اختياري لاستيراد الصفحات وقواعد البيانات ومزامنتها | لا |
| **Miro** | موصّل اختياري لاستيراد اللوحات | لا |

تبقى التخزين المحلي هو الخيار الافتراضي. ويجب أن يظل العقل الثاني مفيدًا حتى عند تعطيل جميع الموصّلات الاختيارية.

---

## محركات النماذج

يدعم Agent Harness حاليًا Ollama المحلي ونقاط النهاية المتوافقة مع OpenAI على سطح المكتب والجهاز اللوحي والهاتف. وتختار ملفات Lite وBalanced وFull نماذج محلية افتراضية أصغر أو أكبر؛ وتتطلب نقاط النهاية السحابية HTTPS، بينما يجب تمكين HTTP الخاص بشبكة LAN لـ Ollama صراحةً. وتحافظ خطة المحوّلات الأوسع على استقلال الوكيل عن أي مورّد نماذج بعينه.

| المحرك | الوضع | الدور المقصود |
| :--- | :--- | :--- |
| **Ollama** | محلي | المسار الافتراضي المجاني/دون اتصال |
| **OpenAI-compatible endpoints** | محلي أو مستضاف ذاتيًا | نشر مرن ومحلي وخاص |
| **Claude** | سحابي / BYOK | الاستدلال المعقد وإنتاج المحتوى الطويل |
| **Gemini** | سحابي / BYOK | السياقات الطويلة والمهام متعددة الوسائط |
| **OpenAI / Codex** | سحابي / BYOK | البرمجة ومسارات العمل المدعومة بالأدوات |
| **OpenRouter** | سحابي / BYOK | الوصول إلى نماذج متعددة عبر API واحد |

**السياسة الحالية:** Ollama هو الافتراضي؛ ولا يُستخدم مزوّد آخر إلا عند تهيئته صراحةً. **التوجيه المخطط له:** المحلي أولًا؛ والسحابة بإذن فقط؛ والتبديل الاحتياطي بين المزوّدين المسموح لهم فقط.

---

## 🚀 البدء السريع

ثبّت Obsidian وإضافة JONIS.AI المحلية للالتقاط بأمر واحد. ينشئ المثبّت خزنة في مجلد المستندات، ويحفظ الالتقاطات في `JONIS.AI/Inbox.md`، ثم يفتح Obsidian. لا يحتاج الالتقاط المحلي إلى Python أو مفتاح API.

### Windows — PowerShell

<div dir="ltr">

```powershell
irm https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.ps1 | iex
```

</div>

### macOS — الطرفية

<div dir="ltr">

```bash
curl -fsSL https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/main/install.sh | bash
```

</div>

يُثبّت المثبّت دائمًا **Agent Harness** المحمول داخل Obsidian. ويستخدم سطح المكتب Python 3.10+ عند توفره؛ بينما يستخدم الهاتف والجهاز اللوحي وأجهزة الكمبيوتر دون Python بيئة تشغيل JavaScript. يمكنك مراجعة [install.ps1](install.ps1) أو [install.sh](install.sh) قبل تنفيذ الأمر.

إذا أبقي Obsidian إضافات المجتمع في الوضع المقيّد، فافتح **الإعدادات ← إضافات المجتمع**، وأوقف **الوضع المقيّد**، ثم فعّل **JONIS.AI**.

### Agent Harness — جميع الأجهزة

| الملف الشخصي | الأنسب لـ | النموذج المحلي الافتراضي | الخطوات |
| :--- | :--- | :--- | :--- |
| **Lite** | كمبيوتر ضعيف الموارد | `qwen2.5-coder:1.5b` | 4 |
| **Balanced** | جهاز لوحي أو هاتف | `qwen2.5-coder:3b` | 6 |
| **Full** | حاسوب محمول أو مكتبي | `qwen2.5-coder:7b` | 8 |

1. ثبّت [Ollama](https://ollama.com) بشكل منفصل ونزّل نموذج Balanced:

<div dir="ltr">

```bash
ollama pull qwen2.5-coder:3b
```

</div>

2. في Obsidian، افتح **الإعدادات ← JONIS.AI**، واختر الملف الشخصي والمزوّد، ثم شغّل **JONIS.AI: Ask Agent Harness**.

على الهاتف/الجهاز اللوحي، لا تحتاج البيئة المحمولة إلى Python. استخدم نقطة نهاية متوافقة مع OpenAI عبر HTTPS، أو فعّل **السماح بـ HTTP الخاص بشبكة LAN لـ Ollama** في إعدادات JONIS.AI، ثم وجّه Ollama إلى كمبيوتر آخر على الشبكة الخاصة نفسها بعنوان LAN مثل `http://192.168.1.10:11434`. ويظل الالتقاط المحلي متاحًا دون اتصال.

يمكن للـ harness تنفيذ `list_notes` و`read_note` و`search_notes` و`create_note` و`append_note` داخل الخزنة. ولا ينفّذ أوامر النظام، ولا يصل إلى ملفات خارج الخزنة، كما يعامل محتوى الملاحظات بوصفه بيانات غير موثوقة. وتتطلب الكتابة تحديد المربع صراحةً في نافذة Agent Harness أو استخدام `--allow-writes` في سطر الأوامر؛ وتُسجّل كل أداة في `.jonis-ai/audit.jsonl`.

للاستخدام عبر سطر الأوامر، اختر ملفًا شخصيًا باستخدام `python -m harness --profile lite "اقرأ ملاحظاتي"`. ويمكن لإعدادات OpenAI المتوافقة استخدام `provider` و`model` و`base_url` في `.jonis-ai/config.json`، مع تمرير المفتاح عبر `JONIS_AI_API_KEY`. ويقدّم وضع Full أعلى إمكانات على الحاسوب المحمول/المكتبي؛ أما التوجيه التلقائي للنماذج، والتنفيذ الأوسع في النظام، والصوت، والواجهة ثلاثية الأبعاد/HUD فما زالت ضمن خطة العمل.

---

## حزمة التقنيات

<div align="center" dir="ltr">

<img src="https://img.shields.io/badge/Python-0b1020?style=flat-square&logo=python&logoColor=22d3ee" alt="Python" />
<img src="https://img.shields.io/badge/TypeScript-0b1020?style=flat-square&logo=typescript&logoColor=22d3ee" alt="TypeScript" />
<img src="https://img.shields.io/badge/Node.js-0b1020?style=flat-square&logo=nodedotjs&logoColor=22d3ee" alt="Node.js" />
<img src="https://img.shields.io/badge/SQLite-0b1020?style=flat-square&logo=sqlite&logoColor=8b5cf6" alt="SQLite" />
<img src="https://img.shields.io/badge/Ollama-0b1020?style=flat-square&logo=ollama&logoColor=22d3ee" alt="Ollama" />
<img src="https://img.shields.io/badge/Obsidian-0b1020?style=flat-square&logo=obsidian&logoColor=8b5cf6" alt="Obsidian" />

<br/>

<img src="https://img.shields.io/badge/9Drive-0b1020?style=flat-square&logoColor=22d3ee" alt="9Drive" />
<img src="https://img.shields.io/badge/Notion-0b1020?style=flat-square&logo=notion&logoColor=a5b4fc" alt="Notion" />
<img src="https://img.shields.io/badge/Miro-0b1020?style=flat-square&logo=miro&logoColor=8b5cf6" alt="Miro" />
<img src="https://img.shields.io/badge/Three.js-0b1020?style=flat-square&logo=threedotjs&logoColor=22d3ee" alt="Three.js" />
<img src="https://img.shields.io/badge/WebGL-0b1020?style=flat-square&logo=webgl&logoColor=22d3ee" alt="WebGL" />
<img src="https://img.shields.io/badge/GitHub%20Actions-0b1020?style=flat-square&logo=githubactions&logoColor=a5b4fc" alt="GitHub Actions" />

</div>

---

## إحصاءات حية

<div align="center">

<img src="https://github-readme-stats.vercel.app/api?username=jonypeixoto&show_icons=true&hide_title=true&hide_border=true&bg_color=0d1117&title_color=22d3ee&icon_color=8b5cf6&text_color=cbd5e1&rank_icon=github&locale=ar" alt="إحصاءات GitHub لـ jonypeixoto" width="49%" />
<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=jonypeixoto&layout=compact&langs_count=8&hide_border=true&bg_color=0d1117&title_color=22d3ee&text_color=cbd5e1&locale=ar" alt="اللغات الأكثر استخدامًا" width="41%" />

<br/>

<img src="https://streak-stats.demolab.com?user=jonypeixoto&theme=tokyonight&hide_border=true&background=0d1117&ring=8b5cf6&fire=22d3ee&currStreakLabel=22d3ee&locale=ar" alt="سلسلة المساهمات" width="49%" />

<br/>

<img src="https://github-readme-activity-graph.vercel.app/graph?username=jonypeixoto&theme=tokyo-night&bg_color=0d1117&hide_border=true&area=true&custom_title=%D9%86%D8%B4%D8%A7%D8%B7%20%D8%AD%D8%AF%D9%8A%D8%AB" alt="مخطط النشاط الأخير" width="100%" />

</div>

<details>
<summary><strong>ثعبان المساهمات</strong> — يُنشأ تلقائيًا بواسطة سير العمل</summary>

<br/>

ينشئ سير العمل [`snake.yml`](.github/workflows/snake.yml) الرسوم المتحركة وينشرها في فرع `output`. وتظهر بعد أول تشغيل لـ Action.

<div align="center">
  <img src="https://raw.githubusercontent.com/JONIS-AI/JONIS.AI/output/snake.svg" alt="ثعبان يلتهم مخطط المساهمات" width="100%" />
</div>

</details>

---

## 🗺️ خطة العمل

- [x] الهوية البصرية لـ JONIS.AI والملف الشخصي المتحرك متعدد اللغات
- [x] بنية المنتج: تشغيل محلي أولًا، وعدم ارتباط بنموذج بعينه، وأولوية لـ Obsidian
- [x] تثبيت بأمر واحد على Windows/macOS مع Obsidian والالتقاط المحلي وAgent Harness المحمول لسطح المكتب والجهاز اللوحي والهاتف
- [x] Agent Harness محلي ومحمول: مزوّدون Ollama/متوافقون مع OpenAI، وملفات Lite/Balanced/Full، وأدوات Markdown داخل الخزنة فقط، وموافقة صريحة على الكتابة وسجل تدقيق
- [ ] التنفيذ المستقل في النظام، والموجّه التلقائي للنماذج، وسياسات الإجراءات الأوسع
- [ ] النسخة الأولية (MVP) من إضافة Obsidian: الالتقاط، والتصنيف، وروابط `wikilinks`، والإجابات المرفقة بالإسنادات
- [ ] أول محوّلات سحابية خاصة تعمل بمفتاحك (BYOK): Claude وGemini وOpenAI/Codex وOpenRouter
- [ ] تخزين 9Drive، وموصّلات Notion وMiro
- [ ] صوت ثنائي الاتجاه بزمن استجابة منخفض
- [ ] وجه ثلاثي الأبعاد هولوغرامي / واجهة HUD تفاعلية
- [ ] مكتبة مجتمعية للمهارات والتكاملات
- [ ] خزنة تجريبية، وإصدارات، وتوثيق للمساهمين

---

## ❓ الأسئلة الشائعة

<details>
<summary><strong>هل JONIS.AI مجاني فعلًا؟</strong></summary>

<br/>

البرنامج مرخّص بموجب رخصة MIT، ولا يفرض Agent Harness المحلي رسوم API. لا تدفع سوى مقابل عتادك والكهرباء. واجهات API السحابية اختيارية وقد تفرض رسومًا بحسب الاستخدام لدى المزوّد.

</details>

<details>
<summary><strong>هل يعمل مع خطة Obsidian المجانية؟</strong></summary>

<br/>

نعم. تعمل إضافة الالتقاط المحلية مع خزنتك دون الحاجة إلى Obsidian Sync أو Obsidian Publish. ويستخدم Agent Harness الخزنة المحلية نفسها على سطح المكتب والجهاز اللوحي والهاتف.

</details>

<details>
<summary><strong>هل يرسل ملاحظاتي إلى السحابة؟</strong></summary>

<br/>

لا يرفع الـ harness الملاحظات من تلقاء نفسه. ويعمل Ollama محليًا وهو الخيار الافتراضي. ولا يُتصل بمزوّد متوافق مع OpenAI إلا عند تهيئته صراحةً، ولا يُرسل إلا السياق اللازم للطلب، وفق شروط ذلك المزوّد.

</details>

<details>
<summary><strong>هل يمكنني التبديل بين النماذج؟</strong></summary>

<br/>

يمكنك اختيار Ollama أو نقطة نهاية متوافقة مع OpenAI في `.jonis-ai/config.json` أو عبر وسائط سطر الأوامر، واختيار ملف Lite أو Balanced أو Full بما يناسب جهازك. أما التوجيه التلقائي بحسب المهمة، والمحوّلات الخاصة بـ Claude وGemini وOpenAI/Codex وOpenRouter، فما زالت ضمن خطة العمل.

</details>

<details>
<summary><strong>هل أحتاج إلى وجه ثلاثي الأبعاد أو ميكروفون للاستخدام؟</strong></summary>

<br/>

لا. يعمل Agent Harness الحالي داخل Obsidian على سطح المكتب والجهاز اللوحي والهاتف، كما يتوفر سطر أوامر Python على الحاسوب. وستكون وحدتا الصوت ثنائي الاتجاه والواجهة ثلاثية الأبعاد/HUD وحدتين اختياريتين يمكن تفعيلهما بشكل مستقل.

</details>

<details>
<summary><strong>هل الوكيل متاح الآن؟</strong></summary>

<br/>

يتوفر Agent Harness محدود داخل Obsidian على سطح المكتب والجهاز اللوحي والهاتف. يمكنه سرد ملاحظات Markdown وقراءتها والبحث فيها وإنشائها وإضافة المحتوى إليها داخل الخزنة؛ وتتطلب الكتابة موافقة صريحة، كما تُدقّق استدعاءات الأدوات. ولا ينفّذ أوامر النظام، ولا يصل إلى ملفات خارج الخزنة. أما التوجيه التلقائي للنماذج، والتنفيذ الأوسع في النظام، والصوت، والواجهة ثلاثية الأبعاد/HUD فلا تزال قيد التطوير.

</details>

---

## تواصل

| القناة | الوجهة |
| --- | --- |
| GitHub | [@jonypeixoto](https://github.com/jonypeixoto) |
| المنظمة | [JONIS-AI](https://github.com/JONIS-AI) |
| المحادثة | [افتح مشكلة](https://github.com/JONIS-AI/JONIS.AI/issues) |

<div align="center">

**[إذا وفّر لك JONIS.AI وقتًا اليوم، فاترك ⭐ على المستودع!](https://github.com/JONIS-AI/JONIS.AI)**

<sub>صُنع بكود مفتوح المصدر وتركيز على التنفيذ.</sub>

</div>

<div align="center">

<img src="./assets/footer.svg" alt="ابنِ المستقبل. واصنع ما يبدو مستحيلًا." width="100%" />

<sub>© 2026 JONIS.AI — صُنع بهوس بالتفاصيل.</sub>

</div>

</div>
