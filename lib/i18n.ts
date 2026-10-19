export type Lang = "kn" | "en";

const copy = {
  en: {
    appName: "Odu",
    appMark: "ಓದು",
    tagline: "Read a Kannada page in plain words.",
    read: "Read",
    archive: "Archive",
    langKn: "ಕನ್ನಡ",
    langEn: "English",
    hero: "Photograph a notice, a land record, or a letter. Odu keeps the Kannada text, says what it asks you to do, and lets you find it later.",
    takePhoto: "Take photo",
    upload: "Upload image or PDF",
    camera: "Use camera",
    samplesTitle: "Try a sample",
    samplesHint: "Fictional pages. The text is already prepared. No key, no wait.",
    drop: "Or drop a photo here",
    reading: "Reading the page",
    explaining: "Writing the plain version",
    browserOcr: "Reading in this browser. The first pass can take a little while.",
    ocrError: "Could not read that file. Try a sharper photo, or open a sample.",
    pdfNote: "A PDF contributes its first page.",
    textLabel: "Kannada text",
    textHint: "Fix any wrong word. The archive updates when you leave the box.",
    explainTitle: "What this says",
    summaryKn: "Simple Kannada",
    summaryEn: "English",
    facts: "Key facts",
    docType: "Document type",
    offline: "Offline mode",
    sampleBadge: "Bundled sample",
    explainAgain: "Explain again",
    listenSummary: "Read summary",
    listenFull: "Read full text",
    stop: "Stop",
    askTitle: "Ask about this page",
    askPlaceholder: "what is the last date?",
    ask: "Ask",
    asking: "Looking through the page",
    askEmpty: "Type a question in Kannada or English.",
    saved: "Saved in this browser",
    saving: "Saving",
    saveFailed: "Could not save in this browser.",
    archiveEmpty: "Nothing saved yet. Read a page and it will wait here.",
    archiveSearch: "Search Kannada or English",
    noMatch: "Nothing matched that.",
    exportTxt: "Download .txt",
    exportMd: "Download .md",
    exportJson: "Download JSON",
    exportAll: "Export archive JSON",
    delete: "Delete",
    confirmDelete: "Delete this?",
    open: "Open",
    jsonNote: "JSON stores the text and the summary, not the photo.",
    cameraDenied: "Camera is blocked. Upload a photo instead.",
    capture: "Capture",
    close: "Close",
    cameraTitle: "Camera",
    footer: "Kannada Digital Innovation Hackathon 2026, problem 5. Kannada text digitization.",
    storageBlocked: "This browser blocked local storage. You can still read a page. It will not stay in the archive.",
    loadingArchive: "Opening the archive",
    statusLoading: "Checking providers",
    noKeys: "No API keys. Browser OCR, offline explain, browser voice.",
    factsEmpty: "No dates, amounts, or actions detected.",
    clear: "Clear page",
    pageAlt: "Document page",
    localOnly: "Stays in this browser",
    retry: "Try again",
    providerSample: "Bundled sample",
    providerSarvam: "Sarvam",
    providerGemini: "Gemini",
    providerTesseract: "Browser OCR",
    providerOffline: "Offline mode",
    providerBrowser: "Browser voice",
    voiceLabel: "Voice",
    questionKn1: "ಕೊನೆಯ ದಿನಾಂಕ ಯಾವುದು?",
    questionKn2: "ನಾನು ಏನು ಮಾಡಬೇಕು?",
    questionEn1: "what is the last date?",
    questionEn2: "what should I do?",
  },
  kn: {
    appName: "ಓದು",
    appMark: "Odu",
    tagline: "ಕನ್ನಡ ಪುಟವನ್ನು ಸರಳವಾಗಿ ಓದಿ, ಕೇಳಿ.",
    read: "ಓದು",
    archive: "ದಾಖಲೆ",
    langKn: "ಕನ್ನಡ",
    langEn: "English",
    hero: "ಸೂಚನೆ, ಭೂ ದಾಖಲೆ ಅಥವಾ ಪತ್ರದ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಓದು ಪಠ್ಯವನ್ನು ಇಡುತ್ತದೆ, ಏನು ಮಾಡಬೇಕು ಎಂದು ಹೇಳುತ್ತದೆ, ನಂತರ ಹುಡುಕಲು ಬಿಡುತ್ತದೆ.",
    takePhoto: "ಫೋಟೋ ತೆಗೆಯಿರಿ",
    upload: "ಚಿತ್ರ ಅಥವಾ PDF",
    camera: "ಕ್ಯಾಮೆರಾ",
    samplesTitle: "ಮಾದರಿ ನೋಡಿ",
    samplesHint: "ಕಾಲ್ಪನಿಕ ಪುಟಗಳು. ಪಠ್ಯ ಮುಂಚೆಯೇ ಸಿದ್ಧ. ಕೀ ಬೇಡ.",
    drop: "ಅಥವಾ ಫೋಟೋವನ್ನು ಇಲ್ಲಿ ಬಿಡಿ",
    reading: "ಪುಟ ಓದುತ್ತಿದೆ",
    explaining: "ಸರಳ ಅರ್ಥ ಬರೆಯುತ್ತಿದೆ",
    browserOcr: "ಈ ಬ್ರೌಸರ್ ನಲ್ಲೇ ಓದುತ್ತಿದೆ. ಮೊದಲ ಸುತ್ತು ಸ್ವಲ್ಪ ಹೊತ್ತು ತೆಗೆದುಕೊಳ್ಳಬಹುದು.",
    ocrError: "ಈ ಫೈಲ್ ಓದಲಾಗಲಿಲ್ಲ. ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ, ಅಥವಾ ಮಾದರಿ ತೆರೆಯಿರಿ.",
    pdfNote: "PDF ಆದರೆ ಮೊದಲ ಪುಟ ಮಾತ್ರ.",
    textLabel: "ಕನ್ನಡ ಪಠ್ಯ",
    textHint: "ತಪ್ಪಾದ ಪದವನ್ನು ಸರಿಪಡಿಸಿ. ಪೆಟ್ಟಿಗೆ ಬಿಟ್ಟರೆ ದಾಖಲೆ ನವೀಕರಿಸುತ್ತದೆ.",
    explainTitle: "ಇದು ಏನು ಹೇಳುತ್ತದೆ",
    summaryKn: "ಸರಳ ಕನ್ನಡ",
    summaryEn: "ಇಂಗ್ಲಿಷ್",
    facts: "ಮುಖ್ಯ ಅಂಶಗಳು",
    docType: "ದಾಖಲೆಯ ಬಗೆ",
    offline: "Offline mode",
    sampleBadge: "ಸಿದ್ಧ ಮಾದರಿ",
    explainAgain: "ಮತ್ತೆ ವಿವರಿಸಿ",
    listenSummary: "ಸಾರಾಂಶ ಕೇಳಿ",
    listenFull: "ಪೂರ್ಣ ಪಠ್ಯ ಕೇಳಿ",
    stop: "ನಿಲ್ಲಿಸಿ",
    askTitle: "ಈ ಪುಟದ ಬಗ್ಗೆ ಕೇಳಿ",
    askPlaceholder: "ಕೊನೆಯ ದಿನಾಂಕ ಯಾವುದು?",
    ask: "ಕೇಳಿ",
    asking: "ಪುಟ ನೋಡುತ್ತಿದೆ",
    askEmpty: "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ನಲ್ಲಿ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ.",
    saved: "ಈ ಬ್ರೌಸರ್ ನಲ್ಲಿ ಉಳಿದಿದೆ",
    saving: "ಉಳಿಸುತ್ತಿದೆ",
    saveFailed: "ಈ ಬ್ರೌಸರ್ ನಲ್ಲಿ ಉಳಿಸಲಾಗಲಿಲ್ಲ.",
    archiveEmpty: "ಇನ್ನೂ ಏನೂ ಉಳಿದಿಲ್ಲ. ಒಂದು ಪುಟ ಓದಿ, ಅದು ಇಲ್ಲಿ ಕಾಯುತ್ತದೆ.",
    archiveSearch: "ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಹುಡುಕಿ",
    noMatch: "ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ.",
    exportTxt: ".txt ಇಳಿಸಿ",
    exportMd: ".md ಇಳಿಸಿ",
    exportJson: "JSON ಇಳಿಸಿ",
    exportAll: "ದಾಖಲೆ JSON ಇಳಿಸಿ",
    delete: "ಅಳಿಸಿ",
    confirmDelete: "ಅಳಿಸಬೇಕೇ?",
    open: "ತೆರೆಯಿರಿ",
    jsonNote: "JSON ನಲ್ಲಿ ಪಠ್ಯ ಮತ್ತು ಸಾರಾಂಶ ಇರುತ್ತದೆ, ಫೋಟೋ ಇಲ್ಲ.",
    cameraDenied: "ಕ್ಯಾಮೆರಾ ನಿರ್ಬಂಧ. ಫೋಟೋ ಅಪ್ ಲೋಡ್ ಮಾಡಿ.",
    capture: "ತೆಗೆಯಿರಿ",
    close: "ಮುಚ್ಚಿ",
    cameraTitle: "ಕ್ಯಾಮೆರಾ",
    footer: "ಕನ್ನಡ ಡಿಜಿಟಲ್ ಇನ್ನೋವೇಶನ್ ಹ್ಯಾಕಥಾನ್ 2026, ಪ್ರಶ್ನೆ 5. ಕನ್ನಡ ಪಠ್ಯ ಡಿಜಿಟೈಸೇಶನ್.",
    storageBlocked: "ಈ ಬ್ರೌಸರ್ ಸ್ಥಳೀಯ ಉಳಿತಾಯವನ್ನು ನಿರ್ಬಂಧಿಸಿದೆ. ಓದಬಹುದು. ದಾಖಲೆಯಲ್ಲಿ ಉಳಿಯುವುದಿಲ್ಲ.",
    loadingArchive: "ದಾಖಲೆ ತೆರೆಯುತ್ತಿದೆ",
    statusLoading: "ಸೇವೆಗಳನ್ನು ನೋಡುತ್ತಿದೆ",
    noKeys: "API ಕೀ ಇಲ್ಲ. ಬ್ರೌಸರ್ ಓದುವಿಕೆ, offline explain, ಬ್ರೌಸರ್ ಧ್ವನಿ.",
    factsEmpty: "ದಿನಾಂಕ, ಮೊತ್ತ ಅಥವಾ ಕೆಲಸ ಸಿಗಲಿಲ್ಲ.",
    clear: "ಪುಟ ತೆರವು",
    pageAlt: "ದಾಖಲೆಯ ಪುಟ",
    localOnly: "ಈ ಬ್ರೌಸರ್ ನಲ್ಲೇ ಇರುತ್ತದೆ",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    providerSample: "ಸಿದ್ಧ ಮಾದರಿ",
    providerSarvam: "Sarvam",
    providerGemini: "Gemini",
    providerTesseract: "ಬ್ರೌಸರ್ ಓದುವಿಕೆ",
    providerOffline: "Offline mode",
    providerBrowser: "ಬ್ರೌಸರ್ ಧ್ವನಿ",
    voiceLabel: "ಧ್ವನಿ",
    questionKn1: "ಕೊನೆಯ ದಿನಾಂಕ ಯಾವುದು?",
    questionKn2: "ನಾನು ಏನು ಮಾಡಬೇಕು?",
    questionEn1: "what is the last date?",
    questionEn2: "what should I do?",
  },
} as const;

export type Copy = (typeof copy)[Lang];

export function messages(lang: Lang): Copy {
  return copy[lang];
}

export const docTypeLabel: Record<Lang, Record<string, string>> = {
  en: {
    notice: "Notice",
    circular: "Circular",
    land_record: "Land record",
    letter: "Letter",
    book: "Book page",
    other: "Other",
  },
  kn: {
    notice: "ಸೂಚನೆ",
    circular: "ಸುತ್ತೋಲೆ",
    land_record: "ಭೂ ದಾಖಲೆ",
    letter: "ಪತ್ರ",
    book: "ಪುಸ್ತಕದ ಪುಟ",
    other: "ಇತರೆ",
  },
};

export const factKindLabel: Record<Lang, Record<string, string>> = {
  en: {
    date: "Date",
    deadline: "Deadline",
    amount: "Amount",
    office: "Office",
    reference: "Reference",
    action: "Do this",
    name: "Name",
    other: "Note",
  },
  kn: {
    date: "ದಿನಾಂಕ",
    deadline: "ಕೊನೆಯ ದಿನ",
    amount: "ಮೊತ್ತ",
    office: "ಕಚೇರಿ",
    reference: "ಸಂಖ್ಯೆ",
    action: "ಮಾಡಬೇಕಾದ್ದು",
    name: "ಹೆಸರು",
    other: "ಇನ್ನಷ್ಟು",
  },
};

export function providerName(lang: Lang, provider: string): string {
  const t = messages(lang);
  switch (provider) {
    case "sample":
      return t.providerSample;
    case "sarvam":
      return t.providerSarvam;
    case "gemini":
      return t.providerGemini;
    case "tesseract":
      return t.providerTesseract;
    case "offline":
      return t.providerOffline;
    case "browser":
      return t.providerBrowser;
    default:
      return provider;
  }
}

export function statusLine(lang: Lang, status: { keys: { sarvam: boolean; gemini: boolean }; ocr: string; explain: string; tts: string } | null): string {
  const t = messages(lang);
  if (!status) return t.statusLoading;
  if (!status.keys.sarvam && !status.keys.gemini) return t.noKeys;
  const ocr = providerName(lang, status.ocr);
  const explain = providerName(lang, status.explain);
  const tts = status.tts === "sarvam" ? "Bulbul" : providerName(lang, "browser");
  return lang === "kn" ? `OCR ${ocr}, ವಿವರ ${explain}, ಧ್ವನಿ ${tts}` : `OCR ${ocr}, explain ${explain}, voice ${tts}`;
}
