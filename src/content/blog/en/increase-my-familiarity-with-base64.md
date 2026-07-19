---
title: Increase my familiarity with BASE64.
description: >-
  Greetings from the island nation of Japan.  Here in the age of shiny
  Multimodal AI, we have a...
date: '2025-11-16'
tags:
  - api
  - tutorial
  - ai
  - base64
lang: en
pair: base64-guide
source: dev
accent: '#00A0E9'
---

<!-- generated from articles/dev/2025-11-16-increase-my-familiarity-with-base64.md by scripts/import-articles.ts - do not edit -->

Greetings from the island nation of Japan.

Here in the age of shiny Multimodal AI, we have a persistent, 30-year-old digital frenemy: BASE64. It's the technical equivalent of sending a 4K video by printing and faxing it—a mandatory, inefficient step that makes your data 33% heavier. We all recognize the painful necessity. This article strips away the nostalgia and offers a cynical guide to pragmatic coexistence, examining why this artifact remains essential in the JSON and REST-API world and providing the necessary code to master the relationship. If we must dance with this data encoding devil, allow me to escort you through the steps to lead the way.


---
# BASE64, Me, Past, and Future

## Introduction
Recently, whether in personal hobby projects or work development, I keep encountering "BASE64."
It might just be a coincidence, but it feels like I run into it again in completely different projects after months apart.
I'm meeting it more frequently than some of my actual friends.
Encode, decode—both feel like "oh, we meet again" level encounters.
Here's my "we meet again" series from this past year:

- Sending images to Claude API → BASE64
- Calling Stable Diffusion API → BASE64
- Handling files in Dify → BASE64
- Analyzing email data with LLM → BASE64

I can handle and implement it well enough that it doesn't affect my work or development. But still, why does this guy always sit next to me...?
It's like BASE64 and I have a terrifying match rate on a dating app. But it's not love. Though there might be friendship at this point.

Thinking about this, I realize I've been writing the same kind of processing over and over.
Actually, I've learned it pretty well now. I want to understand you better, buddy...
This article covers **how to properly deal with the inescapable BASE64**, from historical background to practical topics.

## Why BASE64 Is Still Used Today

### Legacy from the Email Era
So, when did you start existing? Where are you from? That's the question.
BASE64's history dates back to the 1990s.
The email systems of that time (SMTP) could only handle **7-bit ASCII text**.
**Note:** ASCII = character encoding for alphanumeric characters and symbols only. It was an era when non-ASCII characters (like Japanese, Chinese, Arabic) and images couldn't be sent.

However, there was a need to send binary data like images and attachments via email.

That's when **BASE64 encoding** was conceived.
By converting binary data into "safe text," it became possible to transport it through text-based systems.
Surprisingly, it's actually quite recent in historical terms.

It was standardized in **RFC 2045 (MIME - Multipurpose Internet Mail Extensions)** and has since become established as a standard internet technology.

### Why Is It Still Needed Today?

"That's an old story, right? It's different now, isn't it? We're in 2025 now!"
You'd want to think so, but the fact is that **the internet's foundation is designed to be text-based** hasn't changed.
Well, it's a world of bits, so that makes sense, but couldn't it be a bit more stylish?

#### 1. Compatibility Issues with JSON

The standard format for modern REST APIs is **JSON**.
JSON is really strong. Though, JSON was born around 2001, created by Douglas Crockford, and officially standardized as RFC 4627 in 2006.
It's short for JavaScript Object Notation and is widely used for data transfer between servers and clients in web applications, so we're constantly relying on it in recent AI development and RAG contexts.
However, according to JSON specifications, you cannot directly include binary data.

```json
{
  "image": "Can't put binary data here!"
}
```

Therefore, when sending binary data like images via API, you need to convert it to text using BASE64.

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
}
```

#### 2. Constraints of Text-Based Protocols

HTTP, SMTP, and many other communication protocols are fundamentally designed to be text-based.
To safely transport binary data, "text conversion" is necessary.
Rather than "text conversion," it might be more intuitive to think of it as making it easier to exchange data between computers using a common language.

#### 3. The Curse of Backward Compatibility

Massive existing systems all operate on the premise of BASE64.
The cost of changing it now is too enormous, and that's the reality.
This came up recently in discussions about system migration—it really takes a lot of cost and time, so it's better not to change it now.
Especially when it's already become the foundation of the internet itself, trying to flip it over now would indeed be nonsensical, and I've come to accept that.

#### 4. Security Safety

BASE64-encoded data can be treated as "just a string," making it easier to prevent injection attacks caused by special characters.
This is very commendable. You always want to lock the door, of course.
Security should always be robust.

### Necessity in AI Development

This problem is particularly pronounced in AI development.
This is probably why I've been meeting him (BASE64) so often lately.

- **API communication = JSON = text only**
- **Images, audio, video = binary data**

**BASE64** is what bridges these two.

The fact that OpenAI, Anthropic, Google, and virtually all AI APIs adopt BASE64 for image input is due to these structural reasons.

---

## Specific Use Cases in AI Development

From here, let's look at how BASE64 is actually used in AI development.

### Case 1: Sending Images to APIs

This is the most frequent pattern.
Claude, GPT, Gemini—almost all AIs that handle images require BASE64 format.

**What you want to do**: Have AI analyze a local image file

```python
import base64
import requests

# BASE64 encode the image
with open("image.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# API request
# Note: Use the latest model names
# Check Anthropic's documentation for the latest models: https://docs.anthropic.com/
response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "x-api-key": "YOUR_API_KEY",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    },
    json={
        "model": "claude-3-opus-20240229",
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": image_data
                        }
                    },
                    {
                        "type": "text",
                        "text": "Please describe this image"
                    }
                ]
            }
        ]
    }
)
```

### Case 2: Analyzing Email Data with LLM

Email data received from Marketing Automation mass mailing services or retrieved from Gmail
often comes in **multipart format** (mixed HTML + text), depending on the sending service.

**Problem**: When you throw multipart format directly at an LLM, the structure is too complex for it to interpret correctly

**Solution**: BASE64 encode it to make it "just text data" that can be handled

```python
import base64
import json

# Multipart format email data
email_content = """
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset="UTF-8"

Plain text version

--boundary123
Content-Type: text/html; charset="UTF-8"

<html><body>HTML version</body></html>
--boundary123--
"""

# BASE64 encode
encoded_email = base64.b64encode(email_content.encode('utf-8')).decode('utf-8')

# Store in JSON and send to ChatGPT
payload = {
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": f"Please analyze the following BASE64-encoded email:\n{encoded_email}"
        }
    ]
}
```

### Case 3: Using Data URI Format in Dify

In no-code AI platforms like Dify, files are sometimes handled in **Data URI format**.

**What you want to do**: Output Markdown content as an HTML file

```python
import base64

html_content = """
<!DOCTYPE html>
<html>
<head><title>Generated Content</title></head>
<body>
<h1>AI-Generated Content</h1>
<p>Body text...</p>
</body>
</html>
"""

# Convert to Data URI format
encoded = base64.b64encode(html_content.encode('utf-8')).decode('utf-8')
data_uri = f"data:text/html;base64,{encoded}"

# This string can be handled in Dify's workflow
print(data_uri)
```

**Why Data URI?**
Due to system convenience, it's a format that's easy to handle as a file and easy to embed.
Well, if you can use plugins or tools, you can solve it with those.
Or rather, that would be more elegant. But there are often circumstances where you can't install these extension parts due to various reasons.

### Case 4: Saving Images from Canvas

When creating a drawing app using HTML Canvas in JavaScript, BASE64 also appears.

```javascript
// Get image from Canvas
const canvas = document.getElementById('myCanvas');
const dataURL = canvas.toDataURL('image/png'); // ← BASE64 format!

// data:image/png;base64,iVBORw0KGgo... format. We've seen this before.

// When sending to server, remove the prefix
const base64Data = dataURL.replace(/^data:image\/\w+;base64,/, '');

fetch('/api/save-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: base64Data })
});
```

## Implementation Pattern Collection (Copy-Paste Ready)
I say copy-paste ready, but these days it's more about AI-assisted coding.

### Python Edition

```python
import base64

# File → BASE64
def file_to_base64(file_path):
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode('utf-8')

# BASE64 → File
def base64_to_file(base64_string, output_path):
    with open(output_path, "wb") as f:
        f.write(base64.b64decode(base64_string))

# String → BASE64
def string_to_base64(text):
    return base64.b64encode(text.encode('utf-8')).decode('utf-8')

# BASE64 → String
def base64_to_string(base64_string):
    return base64.b64decode(base64_string).decode('utf-8')

# URL-safe BASE64 (replace +/ with -_)
def url_safe_base64_encode(data):
    return base64.urlsafe_b64encode(data).decode('utf-8')
```

### JavaScript Edition

```javascript
// File → BASE64 (Browser)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Usage example
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const base64 = await fileToBase64(e.target.files[0]);
  console.log(base64);
});

// String → BASE64
function stringToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// BASE64 → String
function base64ToString(base64) {
  return decodeURIComponent(escape(atob(base64)));
}

// Node.js environment
const fs = require('fs');

function fileToBase64Node(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString('base64');
}
```

### Google Apps Script Edition (Google Drive Integration)

If you can't use Python locally or are managing files in Google Drive, GAS is also an option.
Depending on the position, there were times when there was no programming environment or only Notepad as an editor, which made me cry...
But since the company had a Google account, GAS was OK!
The source code for email conversion is below, but there's quite a bit of room for customization.
And the reason for specifying folders before and after conversion is a remnant of making it usable even for people who are extremely unfamiliar with programming, IT, and such things...

```javascript
function convertEmlToBase64() {
  // Input folder ID (get from Drive URL)
  const inputFolder = DriveApp.getFolderById('INPUT_FOLDER_ID');
  // Output folder ID
  const outputFolder = DriveApp.getFolderById('OUTPUT_FOLDER_ID');
  
  const files = inputFolder.getFiles();
  
  while (files.hasNext()) {
    const file = files.next();
    
    // Process only .eml files
    if (file.getName().endsWith('.eml')) {
      // Get file content
      const emlContent = file.getBlob().getBytes();
      
      // BASE64 encode
      const base64String = Utilities.base64Encode(emlContent);
      
      // Generate output filename
      const outputFileName = file.getName().replace('.eml', '_base64.txt');
      
      // Save to output folder
      outputFolder.createFile(outputFileName, base64String, MimeType.PLAIN_TEXT);
      
      Logger.log(`Conversion complete: ${outputFileName}`);
    }
  }
  
  Logger.log('All conversions completed');
}
```

**How to use**:
1. Create "Input" and "Output" folders in Google Drive
2. Set folder IDs in the code
3. Save the script in Apps Script editor
4. Upload .eml files to the "Input" folder
5. Run the script manually
6. BASE64 text files will be output to the "Output" folder

**Actual use case**:
Download emails received from large-scale mass-sending Marketing Automation (MA) tools as .eml, batch convert with GAS, then throw them into ChatGPT—this workflow can be utilized.

**NOTE**: Recent ChatGPT and Claude may be able to read .eml files directly. First try uploading directly, and consider BASE64 conversion only if that doesn't work. This method is a typical example of "what was necessary back then but may not be needed now."
As models become smarter year by year, text conversion might still provide better accuracy.

---

## Common Pitfalls and Solutions

### 1. Handling Line Breaks

BASE64 strings can contain line breaks.
Some APIs don't accept BASE64 with line breaks.
This caused me to get stuck in a weird way in the past, so this is a reminder.

**NG example**:
```
iVBORw0KGgoAAAANSUhEUgAAAAUA
AAAFCAYAAACNbyblAAAAHElEQVQI
12P4//8/w38GIAXDIBKE0DHxgljN
```

**OK example (no line breaks)**:
```
iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljN
```

**Solution**:
```python
# In Python, remove line breaks
base64_string = base64_string.replace('\n', '').replace('\r', '')

# Or generate without line breaks during encoding
base64.b64encode(data).decode('utf-8')  # This won't include line breaks
```

### 2. Data URI Prefix

There are cases with and without the prefix `data:image/png;base64,`.

**Case-by-case handling required**:
- When displaying directly in browser → Prefix **required**
- When sending to API → Prefix **not required** in most cases

```python
# Remove prefix
if base64_string.startswith('data:'):
    base64_string = base64_string.split(',')[1]

# Add prefix
data_uri = f"data:image/png;base64,{base64_string}"
```

### 3. MIME Type Specification

You need to specify the correct MIME type according to the image type, or it won't display/process correctly.

- PNG: `image/png`
- JPEG: `image/jpeg`
- GIF: `image/gif`
- WebP: `image/webp`
- PDF: `application/pdf`
- Text: `text/plain`
- HTML: `text/html`

### 4. Size Limitations

BASE64 encoding increases the size by approximately **33% from the original data**.
This was surprising.

**Why does it increase?**: BASE64 converts 3 bytes of binary data into 4 text characters, so the size inevitably increases.
- Original data: 3 bytes = 24 bits
- BASE64: 4 characters (each stored in 8 bits) = 32 bits used
- In other words, 24 bits of information is represented in 32 bits, resulting in approximately 33% (precisely 4/3 times) increase

**Formula**: `BASE64 size ≈ Original size × 4/3`

APIs often have image size limitations, so caution is needed.

**Major AI Service Limitations (as of 2024)**:
- OpenAI GPT-4V/GPT-4o: Maximum 20MB per image
- Anthropic Claude: Maximum 5MB per image (up to 8000x8000 pixels. Up to 2000x2000 pixels when sending 20+ images)
- Google Gemini: Maximum 20MB for entire request (for inline data. Maximum 2GB per file when using File API)

**Solution**:
```python
from PIL import Image
import io

def compress_image(image_path, max_size_mb=4):
    img = Image.open(image_path)
    
    # Compress image
    output = io.BytesIO()
    quality = 95
    
    while True:
        output.seek(0)
        output.truncate()
        img.save(output, format='JPEG', quality=quality)
        size_mb = output.tell() / (1024 * 1024)
        
        if size_mb <= max_size_mb or quality <= 10:
            break
        quality -= 5
    
    return output.getvalue()
```

### 5. URL-Safe BASE64

Standard BASE64 contains `+` and `/`, but these are characters that need encoding in URLs.

**URL-safe version**: Replace `+` → `-`, `/` → `_`

```python
import base64

# Standard BASE64
standard = base64.b64encode(data)

# URL-safe BASE64
url_safe = base64.urlsafe_b64encode(data)
```

### 6. Character Encoding Issues

When BASE64-encoding text, if you don't explicitly specify character encoding, you'll get garbled characters.

```python
# NG: Character encoding not specified
base64.b64encode("日本語".encode())  # Default is UTF-8 but should be explicit

# OK: Explicitly specify UTF-8
base64.b64encode("日本語".encode('utf-8'))
```

## Why Are There No Alternatives?

"If it's this troublesome, isn't there a better way?"
Or rather, please give us one. It's 2025, so I want to go stylishly, you know.
Alternative methods do exist. However, each has its constraints.
Time for the usual trade-off series.

### multipart/form-data

This is the format used for file uploads. It's more efficient than BASE64, but has the fatal flaw of **not being embeddable in JSON**.

Since most REST APIs are premised on JSON format, multipart is limited to file upload-specific purposes.

### Binary Protocols (gRPC, MessagePack, etc.)

Protocols that can handle binary data as-is do exist, but they're not as widespread as REST APIs.
Considering compatibility with existing systems and developer learning costs, migration isn't easy.
The fact that it's not widespread means... that's just how it is.

### Directly Passing File Paths

There's also a method of uploading files to the server and passing their paths to the API.

**Problems**:
- Requires a separate endpoint for file upload
- Needs two API calls (upload → processing)
- Security risks (path traversal attacks, etc.)

### Conclusion: BASE64 Is the Most Practical

Considering the balance of **versatility**, **compatibility**, and **security**, BASE64 is the most practical choice.
This means I can't avoid meeting Mr. BASE64 more than my friends from now on.
I have a feeling I'll probably meet him again soon... I'm starting to think we might become lifelong friends or something.
He might be taking a position like a comrade-in-arms in my life.

---

## Future Outlook

"So, when will we stop using BASE64?"

At least, **we'll probably continue using it for another 10, 20 years**.
It might become a longer relationship than some of my actual friends.

Reasons are as follows:

1. **The fundamental design of the internet won't change**
   - Text-based protocols like HTTP and JSON will remain mainstream

2. **Importance of backward compatibility**
   - Not breaking existing systems is the top priority

3. **New technologies take time to spread**
   - New protocols like gRPC are gradually increasing but haven't reached the point of replacing REST APIs

4. **Increasing demand in AI field**
   - With the spread of multimodal AI (images, audio, video), the need to convert binary data to text is only increasing

## Cheat Sheet & Summary

### When BASE64 Is Needed
- ✅ When sending images via REST API
- ✅ When putting binary data in JSON
- ✅ When embedding files in Data URI format
- ✅ Email attachments
- ✅ When safely transporting data with complex structures

### Commonly Used Commands

```bash
# BASE64-encode a file (Linux/Mac)
base64 -w 0 file.png

# Convert BASE64 back to file
echo "BASE64_STRING" | base64 -d > output.png

# Encode without line breaks (Linux)
base64 -w 0 file.png

# macOS (doesn't have -w option)
base64 -i file.png | tr -d '\n'
```

### Checklist
- [ ] Are line breaks removed?
- [ ] Is the Data URI prefix correct?
- [ ] Is the MIME type appropriate?
- [ ] Is the file size within limits? (Estimate: original size × 1.33)
- [ ] Is URL-safe version needed?
- [ ] Is character encoding specified? (for text)

## Conclusion

BASE64 might seem like "old-fashioned technology" at first glance.
However, when you understand the structural constraints of the internet and the reality of AI development, you can see **why this continues to be used**.

While thinking "oh, it's you again," BASE64 will continue to accompany our development.
Depending on positioning, when we meet again, I want to face him (BASE64) with a feeling like "we meet again~".

I hope this article helps bring you closer to Mr. BASE64.

## References

### Official Specifications & Standards
- [RFC 2045 - MIME Part One: Format of Internet Message Bodies](https://datatracker.ietf.org/doc/html/rfc2045)
- [RFC 4648 - The Base16, Base32, and Base64 Data Encodings](https://datatracker.ietf.org/doc/html/rfc4648)
- [MDN - Data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- [MDN - Base64 encoding and decoding](https://developer.mozilla.org/en-US/docs/Glossary/Base64)

### AI API Documentation
- [Anthropic Claude API - Vision](https://docs.anthropic.com/claude/docs/vision)
- [OpenAI GPT-4 Vision API](https://platform.openai.com/docs/guides/images-vision)
- [Google Gemini API](https://ai.google.dev/tutorials/python_quickstart)

### Tools & Platforms
- [Dify Documentation](https://docs.dify.ai/)

### Other Resources
- [Wikipedia - Base64](https://en.wikipedia.org/wiki/Base64)
- [Why does base64 encoding require padding?](https://stackoverflow.com/questions/4080988/why-does-base64-encoding-require-padding)
