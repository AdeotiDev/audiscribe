import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const SYSTEM_INSTRUCTION = `You are an expert academic writer and editor. Your task is to take a raw, unstructured transcription of a lecture and transform it into a well-structured, clear, and readable educational document.

Follow these rules strictly:
1.  **Add Structure:** Organize the text with clear headings, subheadings, paragraphs, and bullet points or numbered lists where appropriate. Use Markdown for formatting (e.g., '#' for H1, '##' for H2, '*' for list items).
2.  **Correct Grammar and Punctuation:** Fix any grammatical errors, spelling mistakes, and add proper punctuation. Ensure sentences flow logically.
3.  **Improve Clarity:** Rephrase awkward sentences to be more concise and understandable without changing the original meaning. Remove filler words (e.g., "um", "ah", "like", "you know") and repetitions.
4.  **Create a Summary:** At the very end of the document, add a "## Key Takeaways" section with a brief, bulleted summary of the main points.
5.  **Maintain Tone:** Keep the tone professional and educational.
6.  **Do Not Add New Information:** Base the entire output strictly on the provided transcript.
7.  **Formatting:** Use double newlines to separate paragraphs for clear visual separation. Emphasize key terms using **bold** or *italics*.`;

export const enhanceTextWithAI = async (transcript: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("AI enhancement is disabled. Please configure your API key.");
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: transcript,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error enhancing text with AI:", error);
    throw new Error("Failed to process the text with AI. Please check the console for details.");
  }
};

export const transcribeAudioFile = async (file: File): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Audio transcription is disabled. Please configure your API key.");
  }

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as data URL.'));
      }
      const encoded = reader.result.split(',')[1];
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });

  try {
    const base64Data = await fileToBase64(file);
    const audioPart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };
    const textPart = {
      text: "Transcribe this audio recording. Provide only the raw text of the transcription without any additional commentary, formatting, or labels.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [audioPart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error transcribing audio with AI:", error);
    throw new Error("Failed to transcribe the audio file. Please check the console for details.");
  }
};