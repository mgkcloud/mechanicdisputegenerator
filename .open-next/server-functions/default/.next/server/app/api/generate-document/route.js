(()=>{var e={};e.id=767,e.ids=[767],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14279:(e,t,a)=>{"use strict";a.d(t,{FN:()=>s,Pc:()=>l,YE:()=>c});var r=a(91043);let i=void 0!==global.DOCUMENTS_BUCKET,n=i?null:new r.S3Client({region:process.env.S3_REGION||"auto",endpoint:process.env.S3_ENDPOINT,credentials:{accessKeyId:process.env.S3_ACCESS_KEY||"",secretAccessKey:process.env.S3_SECRET_KEY||""}}),o=process.env.S3_BUCKET_NAME||"mechanic-dispute-documents";async function s(e,t,a={}){let{contentType:c="text/html",metadata:l={},format:d="html"}=a,m=`${e}.${d}`;try{return i?await global.DOCUMENTS_BUCKET.put(m,t,{httpMetadata:{contentType:c,cacheControl:"public, max-age=31536000"},customMetadata:{...l,createdAt:new Date().toISOString()}}):await n.send(new r.PutObjectCommand({Bucket:o,Key:m,Body:t,ContentType:c,CacheControl:"public, max-age=31536000",Metadata:{...l,createdAt:new Date().toISOString()}})),`/api/documents/${e}`}catch(e){throw console.error("Error storing document:",e),Error(`Failed to store document: ${e.message}`)}}async function c(e){try{let t=e.endsWith(".html")?e:`${e}.html`;if(i){let e=await global.DOCUMENTS_BUCKET.get(t);if(null===e)return null;return await e.text()}{let e=await n.send(new r.GetObjectCommand({Bucket:o,Key:t}));return await d(e.Body)}}catch(e){if("NoSuchKey"===e.name||"NotFound"===e.name)return null;throw console.error("Error retrieving document:",e),Error(`Failed to retrieve document: ${e.message}`)}}async function l(e){try{if(i){let t=await global.DOCUMENTS_BUCKET.head(e);if(null===t)return null;return{contentType:t.httpMetadata?.contentType,metadata:t.customMetadata,lastModified:t.uploaded,contentLength:t.size}}{let t=await n.send(new r.HeadObjectCommand({Bucket:o,Key:e}));return{contentType:t.ContentType,metadata:t.Metadata,lastModified:t.LastModified,contentLength:t.ContentLength}}}catch(e){if("NotFound"===e.name||"NoSuchKey"===e.name)return null;throw console.error("Error retrieving document metadata:",e),Error(`Failed to retrieve document metadata: ${e.message}`)}}async function d(e){return new Promise((t,a)=>{let r=[];e.on("data",e=>r.push(e)),e.on("error",a),e.on("end",()=>t(Buffer.concat(r).toString("utf-8")))})}},23870:(e,t,a)=>{"use strict";a.d(t,{A:()=>c});var r=a(55511);let i={randomUUID:r.randomUUID},n=new Uint8Array(256),o=n.length,s=[];for(let e=0;e<256;++e)s.push((e+256).toString(16).slice(1));let c=function(e,t,a){if(i.randomUUID&&!t&&!e)return i.randomUUID();let c=(e=e||{}).random??e.rng?.()??(o>n.length-16&&((0,r.randomFillSync)(n),o=0),n.slice(o,o+=16));if(c.length<16)throw Error("Random bytes length must be >= 16");if(c[6]=15&c[6]|64,c[8]=63&c[8]|128,t){if((a=a||0)<0||a+16>t.length)throw RangeError(`UUID byte range ${a}:${a+15} is out of buffer bounds`);for(let e=0;e<16;++e)t[a+e]=c[e];return t}return function(e,t=0){return(s[e[t+0]]+s[e[t+1]]+s[e[t+2]]+s[e[t+3]]+"-"+s[e[t+4]]+s[e[t+5]]+"-"+s[e[t+6]]+s[e[t+7]]+"-"+s[e[t+8]]+s[e[t+9]]+"-"+s[e[t+10]]+s[e[t+11]]+s[e[t+12]]+s[e[t+13]]+s[e[t+14]]+s[e[t+15]]).toLowerCase()}(c)}},28325:(e,t,a)=>{"use strict";a.r(t),a.d(t,{patchFetch:()=>A,routeModule:()=>y,serverHooks:()=>b,workAsyncStorage:()=>v,workUnitAsyncStorage:()=>w});var r={};a.r(r),a.d(r,{POST:()=>f});var i=a(96559),n=a(48088),o=a(37719),s=a(32190),c=a(23870),l=a(85348);async function d(e){try{let t;let a=e.customer_name,r=e.customer_address,i=e.customer_phone,n=e.customer_email,o=e.mechanic_name,s=e.mechanic_address,d=e.mechanic_abn||"Not provided",m=e.vehicle_make,u=e.vehicle_model,h=e.vehicle_year,p=e.vehicle_rego,g=e.service_date,f=e.damage_description,y=e.repair_cost,v=e.payment_method,w=e.invoice_number,b="yes"===e.photo_evidence,A="yes"===e.independent_quote,C="yes"===e.insurance_claim,D=e.insurance_excess||"",I=e.insurance_claim_number||"",_=e.response_deadline||"7 days",x=`Generate a formal Letter of Demand to a mechanic in Australia regarding vehicle damage that occurred during servicing.

**Customer Information:**
Name: ${a}
Address: ${r}
Phone: ${i}
Email: ${n}

**Mechanic Information:**
Business Name: ${o}
Address: ${s}
ABN: ${d}

**Vehicle Details:**
Make: ${m}
Model: ${u}
Year: ${h}
Registration: ${p}

**Incident Details:**
Service Date: ${g}
Service Invoice Number: ${w}
Damage Description: ${f}
Repair Cost Estimate: ${y}
Payment Method Used: ${v}
Photo Evidence Available: ${b?"Yes":"No"}
Independent Quote Obtained: ${A?"Yes":"No"}
Insurance Claim Filed: ${C?"Yes":"No"}
${C?`Insurance Excess Amount: ${D}`:""}
${C?`Insurance Claim Number: ${I}`:""}

**Letter Requirements:**
1. Format as a formal legal letter with proper letterhead, date, and reference line
2. Begin with a clear statement that this is a Letter of Demand
3. Include a factual timeline of events (vehicle drop-off, damage discovery)
4. Reference the Australian Consumer Law (ACL) which requires services to be provided with due care and skill
5. Emphasize that under the ACL, a service provider must take all necessary care to avoid loss or damage to the consumer's property
6. State that by damaging the vehicle, the mechanic failed to meet this guarantee
7. Clearly state that the customer is NOT willing to sign any release of future claims or non-disparagement agreement
8. Demand a specific remedy: full compensation for the damage (either the repair cost or insurance excess)
9. Set a deadline of ${_} for response
10. State that if no satisfactory response is received by the deadline, the matter will be escalated to Consumer Affairs Victoria and potentially to VCAT
11. Maintain a firm but professional tone throughout
12. Include a signature block at the end

Format the letter professionally with appropriate sections and legal language. Make it clear, concise, and legally sound under Australian consumer protection laws.`;try{let e=process.env.OPENAI_API_KEY;if(!e)throw Error("OpenAI API key not configured");console.log("Calling OpenAI API for letter of demand generation...");let a=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4o",messages:[{role:"system",content:"You are an Australian legal document generator specializing in consumer disputes with mechanics. You create professional, legally-sound letters of demand that reference Australian Consumer Law and protect consumer rights in Victoria."},{role:"user",content:x}],max_tokens:4e3,temperature:.5})});if(!a.ok){let e=await a.json().catch(()=>({error:{message:"Unknown API error"}}));throw Error(`OpenAI API error: ${e.error?.message||"Unknown error"}`)}let r=await a.json().catch(()=>{throw Error("Failed to parse OpenAI API response")});if(!r.choices||!r.choices[0]||!r.choices[0].message||!r.choices[0].message.content)throw Error("Invalid or empty response from OpenAI API");if(t=r.choices[0].message.content,"string"!=typeof t||0===t.trim().length)throw Error("Empty or invalid letter text received from OpenAI");t=t.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g,"")}catch(e){console.error("OpenAI API Error:",e),console.log("Falling back to template due to API error"),t=(0,l.getAustralianTemplate)("letter_of_demand").replace(/\[Your Name\]/g,a).replace(/\[Your Address\]/g,r||"[Your Address]").replace(/\[Your Phone\]/g,i||"[Your Phone]").replace(/\[Your Email\]/g,n||"[Your Email]").replace(/\[Date\]/g,new Date().toLocaleDateString("en-AU")).replace(/\[Mechanic Business Name\]/g,o).replace(/\[Mechanic Address\]/g,s||"[Mechanic Address]").replace(/\[Mechanic ABN\]/g,d||"[Mechanic ABN]").replace(/\[Vehicle Make\]/g,m).replace(/\[Vehicle Model\]/g,u).replace(/\[Vehicle Year\]/g,h).replace(/\[Vehicle Registration\]/g,p||"[Vehicle Registration]").replace(/\[Service Date\]/g,g||"[Service Date]").replace(/\[Damage Description\]/g,f||"[Damage Description]").replace(/\[Repair Cost\]/g,y||"[Repair Cost]").replace(/\[Response Deadline\]/g,_).replace(/\[Response Deadline Date\]/g,(()=>{let e=Number.parseInt(_);if(isNaN(e))return"[Response Deadline Date]";let t=new Date;return t.setDate(t.getDate()+e),t.toLocaleDateString("en-AU")})())}let N=(0,c.A)().substring(0,8),E=`letter_of_demand_${N}`;return{success:!0,letterText:t,filename:E,customerName:a,mechanicName:o,generatedDate:new Date().toISOString(),documentType:"Letter of Demand to Mechanic"}}catch(e){throw console.error("Letter of demand generation error:",e),Error(`Failed to generate letter of demand: ${e.message}`)}}let m={letter_of_demand:"Letter of Demand to Mechanic",consumer_complaint:"Consumer Affairs Victoria Complaint",vcat_application:"VCAT Application Form",insurance_claim:"Insurance Claim Support Letter"},u=`
**Key Legal Principles for Australian Mechanic Disputes (Victoria Focus):**

1.  **Australian Consumer Law (ACL) - Guarantee of Due Care and Skill:**
    *   Services must be provided with due care and skill (Consumer Guarantee).
    *   Mechanics must take all reasonable care to avoid loss or damage to the vehicle.
    *   Failure to do so (e.g., causing damage) is a breach of this guarantee.
    *   Businesses cannot contract out of this guarantee; liability waivers are generally void.
    *   Remedies for breach include repair, replacement, or compensation for loss.

2.  **Bailment Law:**
    *   Leaving a car with a mechanic creates a bailment for reward.
    *   The mechanic (bailee) owes a duty of care to safeguard the property.
    *   If damage occurs in their custody, the onus is on the mechanic to prove they took reasonable care or that lack of care didn't cause the damage. Presumption is against them.

3.  **Negligence:**
    *   Mechanics owe a general duty of care under negligence law.
    *   Failure to exercise reasonable care resulting in foreseeable damage makes them liable.

4.  **Payment Under Protest:**
    *   Paying a disputed invoice "under protest" (clearly documented) reserves the right to contest the charge or seek compensation later.
    *   It prevents the argument that payment signified acceptance or waiver of rights.
    *   Useful when payment is required to retrieve the vehicle (due to mechanic's lien).

5.  **Consequential Loss:**
    *   Consumers can claim reasonably foreseeable losses resulting from the breach.
    *   Examples: Insurance excess, increased future premiums, hire car costs, time off work.

6.  **Dispute Resolution Steps (Victoria):**
    *   **Direct Communication:** Attempt to resolve directly with the mechanic/manager.
    *   **Formal Demand Letter:** Put the complaint and demand in writing, setting a deadline.
    *   **Consumer Affairs Victoria (CAV):** Lodge a complaint for free conciliation/mediation (voluntary process).
    *   **Victorian Civil and Administrative Tribunal (VCAT):** File a claim for a legally binding decision (Civil Claims List). VCAT is less formal than court.

7.  **Evidence:**
    *   Crucial: Photos (before/after), invoices, written communications, independent mechanic reports/quotes, witness statements.

8.  **Important Notes:**
    *   Do NOT sign broad waivers of future claims or non-disparagement ('gag') clauses unless fully compensated and satisfied.
    *   Credit card chargebacks can be attempted for services not rendered correctly (including damage caused).
`;async function h(e){try{let t;let r=e.document_type,i=e.customer_name,n=e.mechanic_name,o=e.mechanic_abn||"Not provided",s=e.state||"Victoria",l=e.vehicle_details||"",d=e.service_date||"",h=e.damage_description||"",p=e.repair_cost||"",g="yes"===e.photo_evidence?"Photo evidence is available and attached.":"No photo evidence attached.",f=[];e.clause_consumer_law&&f.push("Australian Consumer Law References"),e.clause_no_waiver&&f.push("No Waiver/Non-Disparagement Clause"),e.clause_insurance&&f.push("Insurance Claim Details"),e.clause_timeline&&f.push("Detailed Timeline of Events");let y=e.additional_instructions||"",v=`Generate a professional and legally-informed **${m[r]||"legal document"}** for ${i} regarding a dispute with mechanic ${n} (ABN: ${o}) in ${s}, Australia. Integrate the user's details smoothly into the appropriate template structure for this document type. Adapt the language and tone based on the specific document required (e.g., formal demand, complaint submission).

**User Provided Details:**
- Document Type Requested: ${m[r]}
- Customer Name: ${i}
- Mechanic Name: ${n}
- Mechanic ABN: ${o}
- State/Territory: ${s}
- Vehicle Details: ${l}
- Service Date: ${d}
- Damage Description: ${h}
- Repair Cost Estimate: ${p||"Not specified"}
- Photo Evidence Available: ${g}
- Special Clauses Mentioned: ${f.length?f.join(", "):"None specified"}
- Additional Instructions from User: ${y||"None"}

**Australian Legal Context to Incorporate:**
${u}

**Task:**
1.  Select the appropriate base template structure for a **${m[r]}**.
2.  Carefully integrate the user's details provided above into the template.
3.  Weave in relevant points from the **Australian Legal Context** section to strengthen the document (e.g., citing ACL guarantees in a demand letter, explaining bailment principles, referencing CAV/VCAT escalation paths).
4.  Address any 'Special Clauses' or 'Additional Instructions' requested by the user.
5.  Ensure the final document is professional, legally sound for Australia (${s}), clear, and avoids jargon where possible.
6.  If generating a letter/complaint, maintain a firm but reasonable tone focused on facts and legal rights.
7.  **Crucially:** Do NOT include any clauses that waive consumer rights, require non-disparagement, or agree to release future claims unless the user explicitly instructed this (which is highly unlikely for initial demands/complaints).
8.  Format according to professional legal document standards.
`;try{let e=process.env.OPENAI_API_KEY;if(!e)throw Error("OpenAI API key not configured");console.log("Calling OpenAI API for document generation...");let a=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4-turbo",messages:[{role:"system",content:"You are an expert Australian legal assistant specializing in consumer law and mechanic disputes. Your role is to generate precise, legally sound, and effective documents (like Letters of Demand, CAV complaints, VCAT guidance) based on user input and provided Australian legal context. You must strictly adhere to the legal principles provided, integrate user details accurately, and ensure the final document protects the consumer's rights under Australian law, particularly the ACL and bailment principles. Avoid hallucinations and stick closely to the provided context and user details."},{role:"user",content:v}],max_tokens:4e3,temperature:.5})});if(!a.ok){let e=await a.json().catch(()=>({error:{message:"Unknown API error"}}));throw Error(`OpenAI API error: ${e.error?.message||"Unknown error"}`)}let r=await a.json().catch(()=>{throw Error("Failed to parse OpenAI API response")});if(!r.choices||!r.choices[0]||!r.choices[0].message||!r.choices[0].message.content)throw Error("Invalid or empty response from OpenAI API");if(t=r.choices[0].message.content,"string"!=typeof t||0===t.trim().length)throw Error("Empty or invalid document text received from OpenAI");t=t.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g,"")}catch(c){console.error("OpenAI API Error:",c),console.log("Falling back to template due to API error");let{getAustralianTemplate:e}=await Promise.resolve().then(a.bind(a,85348)),o=m[r]?r.toLowerCase().replace(/ /g,"_"):"default_template";t=e(o).replace(/\[Your Name\]/g,i||"[Your Name]").replace(/\[Mechanic Business Name\]/g,n||"[Mechanic Business Name]").replace(/\[Vehicle Make\]/g,l.split(" ")[1]||"[Vehicle Make]").replace(/\[Vehicle Model\]/g,l.split(" ")[2]||"[Vehicle Model]").replace(/\[Vehicle Year\]/g,l.split(" ")[0]||"[Vehicle Year]").replace(/\[Vehicle Registration\]/g,l.split("Rego: ")[1]||"[Vehicle Registration]").replace(/\[Service Date\]/g,d||"[Service Date]").replace(/\[Damage Description\]/g,h||"[Damage Description]").replace(/\[Repair Cost\]/g,p||"[Repair Cost]").replace(/\[State, e.g., Victoria\]/g,s||"[State]").replace(/\[Date\]/g,new Date().toLocaleDateString("en-AU"))}let w=(0,c.A)().substring(0,8),b=`au_${r}_${w}`;return{success:!0,documentText:t,filename:b,documentType:m[r]||"Australian Legal Document",customerName:i,mechanicName:n}}catch(e){throw console.error("Australian document generation error:",e),Error(`Failed to generate Australian document: ${e.message}`)}}var p=a(14279),g=a(72698);async function f(e){try{let t;let a=await e.formData(),r=a.get("document_type");(0,g.Rv)(Object.fromEntries(a.entries()),["document_type","customer_name","customer_email","mechanic_name","damage_description"]);let i=(t="letter_of_demand"===r?await d(Object.fromEntries(a.entries())):await h(Object.fromEntries(a.entries()))).letterText||t.documentText;if(!i)throw new g.hD("Document generation resulted in empty content.",500);let n=a.get("customer_name")||t.customerName||"Customer",o=function(e,t,a){let r;let i=new Date().toLocaleDateString("en-AU",{year:"numeric",month:"long",day:"numeric"});e&&"string"==typeof e||(console.error("Invalid text input:",e),e="Error: Document generation failed. Please try again.");try{e=(e=e.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g,"")).replace(/(\d{1,2}\/\d{1,2}\/\d{4}){2,}/g,e=>e.substring(0,10))}catch(t){console.error("Error sanitizing text:",t),e="Error sanitizing document text. Please regenerate the document."}try{r=e.split("\n")}catch(e){console.error("Error splitting text into paragraphs:",e),r=["Error processing document text. Please regenerate the document."]}let n="";for(let e of r)try{if(!e.trim())continue;let t=e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");if(t.trim().startsWith("#")){let e=t.replace(/#/g,"").trim();n+=`<h2 class="document-header">${e}</h2>`}else t.trim()===t.trim().toUpperCase()&&t.trim().length>3?n+=`<h2 class="document-header">${t.trim()}</h2>`:t.trim().startsWith("•")||t.trim().startsWith("-")||t.trim().startsWith("*")?n+=`<p class="document-bullet">${t.trim()}</p>`:t.toLowerCase().includes("signature")||t.toLowerCase().includes("sign")||t.toLowerCase().includes("date:")?n+=`<p class="document-signature">${t}</p>`:n+=`<p class="document-paragraph">${t}</p>`}catch(e){console.error("Error processing paragraph:",e),n+='<p class="document-paragraph">Error processing paragraph.</p>'}let o=t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),s=a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");return`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${s} for ${o}</title>
    <style>
      body {
        font-family: 'Times New Roman', Times, serif;
        line-height: 1.5;
        color: #000;
        margin: 0 auto;
      }
      .document-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #000066;
      }
      .document-subtitle {
        text-align: center;
        font-size: 16px;
        margin-bottom: 20px;
        color: #000066;
      }
      .document-date {
        text-align: right;
        font-size: 12px;
        color: #666;
        margin-bottom: 30px;
      }
      .document-header {
        font-size: 14px;
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 10px;
        color: #000066;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
      }
      .document-paragraph {
        font-size: 12px;
        text-align: justify;
        margin-bottom: 10px;
        text-indent: 20px;
      }
      .document-bullet {
        font-size: 12px;
        margin-left: 30px;
        margin-bottom: 5px;
      }
      .document-signature {
        font-size: 12px;
        margin-top: 30px;
        margin-bottom: 30px;
      }
      @media print {
        body {
          padding: 0;
        }
        @page {
          margin: 2cm;
        }
      }
    </style>
  </head>
  <body>
    <div class="document-title">${s.toUpperCase()}</div>
    <div class="document-subtitle">For: ${o}</div>
    <div class="document-date">Date: ${i}</div>
    
    ${n}
    
    <script>
      // Optional: Auto-print when loaded
      // window.onload = function() { window.print(); };
    </script>
  </body>
  </html>
  `}(i,n,t.documentType),c=t.filename;return await (0,p.FN)(c,o,{contentType:"text/html",metadata:{documentType:t.documentType,customerName:n,filenameBase:c}}),s.NextResponse.json({success:!0,filename:c,documentType:t.documentType,customerName:n,generatedDate:new Date().toISOString()})}catch(t){let e=(0,g.hS)(t);return s.NextResponse.json(e,{status:e.statusCode})}}let y=new i.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/generate-document/route",pathname:"/api/generate-document",filename:"route",bundlePath:"app/api/generate-document/route"},resolvedPagePath:"/Users/wlvar/Downloads/mechanicdisputecfworker (2)/app/api/generate-document/route.js",nextConfigOutput:"standalone",userland:r}),{workAsyncStorage:v,workUnitAsyncStorage:w,serverHooks:b}=y;function A(){return(0,o.patchFetch)({workAsyncStorage:v,workUnitAsyncStorage:w})}},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{"use strict";e.exports=require("crypto")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},72698:(e,t,a)=>{"use strict";a.d(t,{Rv:()=>n,hD:()=>r,hS:()=>i});class r extends Error{constructor(e,t=500,a=null){super(e),this.name="ApiError",this.statusCode=t,this.details=a}}function i(e){return(console.error("API Error:",e),e instanceof r)?{success:!1,error:e.message,details:e.details,statusCode:e.statusCode}:{success:!1,error:e.message||"An unexpected error occurred",statusCode:500}}function n(e,t){let a=t.filter(t=>!e[t]);if(a.length>0)throw new r(`Missing required fields: ${a.join(", ")}`,400,{missingFields:a})}},78335:()=>{},85348:(e,t,a)=>{"use strict";a.d(t,{getAustralianTemplate:()=>n});let r={default_template:`
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Mechanic Business Name]
[Mechanic Address]
[Mechanic ABN]

Dear Sir/Madam,

RE: Mechanic Dispute - Vehicle Damage Claim

I am writing regarding damage to my vehicle that occurred while it was in your care for servicing.

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]

**Incident Details:**
On [Service Date], I brought my vehicle to your workshop for servicing. When I collected the vehicle, I discovered damage that was not present when I left the vehicle in your care.

The damage consists of [Damage Description].

**Legal Position:**
Under Australian Consumer Law, services must be provided with due care and skill. By damaging my vehicle, you have failed to meet this guarantee.

**Demand:**
I request that you pay the full cost of repairing the damage, amounting to $[Repair Cost], within [Response Deadline] days of this letter.

If I do not receive a satisfactory response by [Response Deadline Date], I will consider escalating this matter through appropriate channels.

Yours faithfully,

[Your Name]
`,letter_of_demand:`
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Mechanic Business Name]
[Mechanic Address]
[Mechanic ABN]

**VIA EMAIL AND REGISTERED POST** 

**RE: LETTER OF DEMAND – Damage to Vehicle [Vehicle Registration] During Service on [Service Date]**

Dear Sir/Madam,

I am writing to formally demand compensation for significant damage caused to my vehicle, a [Vehicle Year] [Vehicle Make] [Vehicle Model] (Registration: [Vehicle Registration]), while it was in the care of your workshop for service on [Service Date].

**Background:**
I entrusted my vehicle to your business for [Service Description] on [Service Date]. Upon collection on [Collection Date/Time], I immediately identified new damage to the [Damage Location(s)] which was not present when I delivered the vehicle. 
[Optional: Add brief timeline summary if complex, e.g., "Your staff member [Staff Name, if known] acknowledged causing the [Specific part, e.g., rear] damage... However, responsibility for the [Other part, e.g., front] damage was denied..."]

**Evidence:**
The damage consists of [Detailed Damage Description].
I have photographic evidence clearly showing the vehicle's undamaged condition prior to the service and the new damage present upon collection. 
[Optional: Mention other evidence]
  - I have obtained an independent repair quote from [Repair Shop Name] for $[Repair Cost].
  - My insurer, [Insurance Company Name], has been notified (Claim #[Insurance Claim Number]). The applicable excess is $[Insurance Excess].

**Legal Liability:**
Under Australian law, particularly the Australian Consumer Law (ACL) which applies in [State, e.g., Victoria], you have a legal obligation to provide services with due care and skill. This includes taking all necessary care to prevent loss or damage to my property while it is in your possession. 
Furthermore, under the principles of bailment, as the bailee holding my vehicle for reward, you owe a duty of care. The law presumes you are liable for damage occurring in your custody unless you can prove you took reasonable care, which has not been demonstrated.
The damage to my vehicle is a direct result of a breach of these obligations.

[Optional: Include if payment was made under protest]
**Payment Under Protest:**
Please note that the service invoice ([Invoice Number]) for $[Service Cost] was paid on [Payment Date] **under protest**. This payment was made solely to secure the release of my vehicle and does not constitute acceptance of the service quality or waiver of my rights regarding the damage caused.

**Demand for Remedy:**
I demand that you take immediate responsibility for the damage caused. To resolve this matter, you must either:
1.  **Arrange and cover the full cost of repairs** for all damage ([Damage Location(s)]) at a reputable repairer agreed upon by us, restoring the vehicle to its pre-service condition. OR
2.  **Reimburse me for the full repair cost** of $[Repair Cost] as quoted by [Repair Shop Name]. OR
3.  **If proceeding via my insurance:** Formally accept full liability in writing to my insurer ([Insurance Company Name], Claim #[Insurance Claim Number]) and reimburse me for the insurance excess of $[Insurance Excess]. Acknowledgment of liability is required to prevent adverse impacts on my insurance record and future premiums.

I require your written confirmation of how you will remedy this situation within **[Response Deadline, e.g., 10 business days]** from the date of this letter (i.e., by [Response Deadline Date]).

Please be advised that I am **not** willing to sign any release agreement that waives future claims or includes a non-disparagement clause as a condition of receiving the compensation I am legally entitled to.

**Failure to Comply:**
If I do not receive a satisfactory response and commitment to rectify the damage by [Response Deadline Date], I will escalate this matter without further notice. This will include lodging a formal complaint with Consumer Affairs Victoria and initiating legal proceedings against [Mechanic Business Name] in the Victorian Civil and Administrative Tribunal (VCAT) to recover all losses, including repair costs, insurance excess, potential increases in premiums, and associated costs.

I trust this matter can be resolved amicably and promptly.

Yours faithfully,


______________________
[Your Name]
Owner of Vehicle [Vehicle Registration]
  `,consumer_complaint:`
**CONSUMER AFFAIRS VICTORIA COMPLAINT**

**Consumer Details:**
Name: [Your Name]
Address: [Your Address]
Phone: [Your Phone]
Email: [Your Email]

**Trader Details:**
Business Name: [Mechanic Business Name]
Address: [Mechanic Address]
ABN: [Mechanic ABN]
Phone: [Mechanic Phone]
Email: [Mechanic Email]

**Complaint Details:**

**Product/Service:**
Vehicle servicing provided on [Service Date]

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]

**Description of Issue:**
I brought my vehicle to [Mechanic Business Name] for servicing on [Service Date]. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

**Steps Taken to Resolve:**
1. I immediately notified the business of the damage on [Notification Date].
2. I sent a formal letter of demand on [Letter Date] requesting compensation for the repair costs.
3. The business [describe their response or lack thereof].
4. I have obtained an independent repair quote of $[Repair Cost] from [Repair Shop Name].

**Evidence Available:**
- Photos of the damage
- Service invoice
- Independent repair quote
- Copy of letter of demand
- [Any other evidence]

**Desired Outcome:**
I am seeking full compensation for the repair costs of $[Repair Cost] without having to sign any release of future claims or non-disparagement agreement.

I believe the business has breached the Australian Consumer Law by failing to provide services with due care and skill, resulting in damage to my vehicle.

I authorize Consumer Affairs Victoria to contact the trader on my behalf to attempt to resolve this dispute.

[Your Name]
[Date]
  `,vcat_application:`
**VCAT APPLICATION GUIDANCE**

**Case Type:**
Consumer and trader dispute under the Australian Consumer Law

**Tribunal:**
Victorian Civil and Administrative Tribunal (VCAT)

**Applicant Details:**
[Your full legal name and contact details]

**Respondent Details:**
[Full legal business name of the mechanic]
[Complete business address]
[ABN/ACN if available]

**Claim Amount:**
$[Total amount claimed] - This should be the repair cost or your insurance excess

**Claim Details:**

**What Happened:**
On [Service Date], I took my [Vehicle Make/Model/Year] to [Mechanic Business Name] for servicing. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

I have obtained a repair quote of $[Repair Cost] from [Repair Shop Name].

**Legal Basis for Claim:**
Under the Australian Consumer Law (ACL), services must be provided with due care and skill. This is a consumer guarantee that cannot be excluded. The ACL requires that a service provider must take all necessary care to avoid loss or damage to the consumer's property.

By damaging my vehicle while it was in their care, [Mechanic Business Name] has failed to meet this guarantee.

**Steps Taken to Resolve:**
1. I immediately notified the business of the damage on [Notification Date].
2. I sent a formal letter of demand on [Letter Date] requesting compensation for the repair costs.
3. I filed a complaint with Consumer Affairs Victoria on [CAV Complaint Date].
4. [Describe any other steps taken]

**Evidence to Bring to Hearing:**
- Photos of the damage
- Service invoice and proof of payment
- Independent repair quote
- Copy of letter of demand
- Consumer Affairs Victoria complaint reference
- Timeline of events
- Any admission of liability from the mechanic
- Insurance claim details (if applicable)

**What to Expect at VCAT:**
1. The hearing will be relatively informal
2. You will present your case first, then the mechanic will respond
3. The VCAT member may ask questions of both parties
4. Bring three copies of all documents (one for you, one for the mechanic, one for VCAT)
5. Speak clearly and stick to the facts
6. Focus on how the mechanic breached the consumer guarantee of due care and skill

**Possible Outcomes:**
If successful, VCAT may order the mechanic to pay you compensation for the repair costs. If unsuccessful, you may be required to pay the mechanic's filing fee.

**Filing Fee:**
For claims up to $3,000: approximately $72
For claims up to $15,000: approximately $240

**Time Limit:**
Applications must generally be made within 6 years of the incident, but it's best to file as soon as possible.
  `,insurance_claim:`
[Your Name]
[Your Address]
[Your Phone]
[Your Email]

[Date]

[Insurance Company Name]
[Insurance Company Address]

RE: Insurance Claim #[Claim Number] - Vehicle Damage During Mechanic Service

Dear Claims Handler,

I am writing regarding my insurance claim for damage to my vehicle that occurred while it was being serviced by [Mechanic Business Name] on [Service Date].

**Vehicle Details:**
Make: [Vehicle Make]
Model: [Vehicle Model]
Year: [Vehicle Year]
Registration: [Vehicle Registration]
Policy Number: [Insurance Policy Number]

**Incident Details:**
On [Service Date], I brought my vehicle to [Mechanic Business Name] for servicing. When I collected the vehicle, I discovered damage to [Damage Location] that was not present when I left the vehicle in their care.

The damage consists of [Damage Description].

**Mechanic Liability:**
Under the Australian Consumer Law, the mechanic is liable for damage caused to my vehicle while it was in their care. Services must be provided with due care and skill, and the mechanic failed to meet this guarantee.

I have notified the mechanic of their liability and have sent them a formal letter of demand. [Include details of their response if applicable]

**Request:**
I understand that under my insurance policy, I am required to pay an excess of $[Excess Amount]. However, as the damage was caused by a third party who is liable under Australian Consumer Law, I request that:

1. The insurance company pursue the mechanic for recovery of all costs associated with this claim, including my excess
2. My no-claims bonus/rating be preserved as this incident was not my fault

**Evidence:**
I have attached the following documents to support my claim:
- Photos of the damage
- Service invoice from the mechanic
- Copy of my letter of demand to the mechanic
- Independent repair quote
- [Any other relevant documents]

Please advise if you require any additional information to process this claim and pursue recovery from the liable mechanic.

Thank you for your assistance in this matter.

Yours sincerely,

[Your Name]
  `},i={letter_of_demand:"letter_of_demand",consumer_complaint:"consumer_complaint",vcat_application:"vcat_application",insurance_claim:"insurance_claim"};function n(e){try{let t="string"==typeof e?e.trim().toLowerCase():"default_template",a=i[t]||t,n=r[a]||r.default_template;if(!n)return console.error(`Template not found for document type: ${t}, mapped to key: ${a}`),"Template not found. Please try a different document type.";return n=(n=(n=(n=(n=n.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g,"")).replace(/(\d{1,2}\/\d{1,2}\/\d{4}){2,}/g,e=>e.substring(0,10))).replace(/\d{4}-\d{2}-\d{2}\d+/g,e=>e.substring(0,10))).replace(/(y\d{1,2}\/\d{1,2}\/\d{4}){2,}/g,e=>e.substring(0,e.length/2))).replace(/(\d{2,}){3,}/g,"")}catch(e){return console.error("Error in getAustralianTemplate:",e),`An error occurred while retrieving the template. Please try again.

[Your Name]
[Your Address]

Dear Sir/Madam,

RE: Mechanic Dispute

I am writing regarding damage to my vehicle that occurred while it was in your care for servicing.

Yours faithfully,
[Your Name]`}}},91043:e=>{"use strict";e.exports=require("@aws-sdk/client-s3")},96487:()=>{}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[447,580],()=>a(28325));module.exports=r})();