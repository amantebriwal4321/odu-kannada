# Deck outline

8 to 10 slides for the PDF deck. Keep each slide to a title and a few lines. No invented numbers.

## 1. Title

Odu (ಓದು). Kannada text digitization. Kannada Digital Innovation Hackathon 2026, problem statement 5, NIE Mysuru. One line: a photo of a Kannada page becomes text you can edit, hear, and find later.

## 2. Problem

Important paper shows up in dense Kannada: circulars, land extracts, ration and pension letters, school and hospital notices, old print, handwritten notes. Two people get stuck. Someone who speaks Kannada but not officialese. Someone who does not read Kannada at all. Paper is also not searchable, so "that notice about the date" disappears in a folder.

## 3. Who it is for

Rural and elderly readers dealing with a single notice. Residents who need an English gloss. Anyone who wants the page again next month without photographing it twice. One person, one phone, no account.

## 4. What Odu does

Capture from the camera, a file, or a PDF first page. Digitise to Unicode Kannada you can correct. Explain in simple Kannada and English, with chips for dates, money, offices, reference numbers, and the action. Read the summary aloud. Ask a question in either language. Keep the page in this browser and search it later. Export txt, markdown, or JSON.

## 5. Demo flow

Open a bundled fictional sample. Show image and text. Show the explain panel. Play the summary. Ask for the last date in Kannada, then ask what to do in English. Search the archive. Mention that a real photo uses the same screen.

## 6. Architecture

One diagram, left to right: capture, OCR chain, editable text, explain and Q&A, speech, IndexedDB search. Say the archive never leaves the browser. No user accounts, no server database.

## 7. AI stack

Table, same as the README. OCR: Sarvam Document AI (`kn-IN`, async digitise job), then Gemini vision, then tesseract.js `kan`. Explain and Q&A: Gemini, then Sarvam 105B, then a local extractor. Speech: Bulbul `kn-IN`, then `speechSynthesis`. Keys stay in server env vars.

## 8. Demo safety

The app builds and runs with zero keys. Five fictional pages ship with precomputed text and explanations. Uploading that exact PNG hits the same prepared text. If a provider errors, the next one in the chain runs. The offline badge is explicit.

## 9. What changes for one notice

A person can hear the page, see the date and the amount without parsing the letterhead, and find that page later by an English word or a Kannada word. That is the whole claim. Do not add usage counts or accuracy percents that this build did not measure.

## 10. Roadmap and close

Offline PWA so a kiosk keeps working when the network drops. Handwriting fine tuning once there is permissioned data. Bulk ZIP import for a stack of scans. A district office kiosk mode: big type, one button, the archive stays on the machine. Close on the live URL and the repo.
