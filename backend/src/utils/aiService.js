/**
 * aiService.js
 * -------------------------------------------------------------------------
 * Content-generation engine for summaries, quizzes, and flashcards.
 *
 * By default this uses a self-contained EXTRACTIVE algorithm (word-frequency
 * scoring + sentence ranking) so the API works fully offline with zero
 * external cost or API keys. If you want to swap in a real LLM (OpenAI,
 * Anthropic, etc.), implement `callLLM()` below and set AI_PROVIDER + AI_API_KEY
 * in .env — every function's return SHAPE stays identical, so no other file
 * needs to change.
 * -------------------------------------------------------------------------
 */

const STOPWORDS = new Set(
  "a an the this that these those is are was were be been being of in on at for to from with as by and or but if then than so such not no nor it its it's he she they them his her their our your my i you we".split(" ")
);

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 400);
}

function wordFrequencies(sentences) {
  const freq = {};
  sentences.forEach((s) => {
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .forEach((w) => {
        if (!w || STOPWORDS.has(w) || w.length < 3) return;
        freq[w] = (freq[w] || 0) + 1;
      });
  });
  return freq;
}

function scoreSentences(sentences, freq) {
  return sentences.map((s, idx) => {
    const words = s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / (words.length || 1);
    // slight boost for earlier sentences (topic sentences tend to summarize)
    const positionBoost = idx < 3 ? 1.15 : 1;
    return { sentence: s, score: score * positionBoost, idx };
  });
}

function topKeywords(freq, n = 10) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

/**
 * Generates { overview, keyPoints[], definitions[{term, def}] } from raw text.
 * Falls back to a generic placeholder body if the extracted text is too short
 * (e.g. a scanned/image-only PDF with no selectable text).
 */
function generateSummary(rawText, fallbackTitle = "this document") {
  const sentences = splitSentences(rawText || "");

  if (sentences.length < 3) {
    return {
      overview: `We couldn't extract enough readable text from ${fallbackTitle} to build a rich summary (this can happen with scanned or image-only PDFs). Try a text-based PDF or DOCX file for best results.`,
      keyPoints: [],
      definitions: [],
    };
  }

  const freq = wordFrequencies(sentences);
  const scored = scoreSentences(sentences, freq).sort((a, b) => b.score - a.score);

  const overviewSentences = scored.slice(0, 3).sort((a, b) => a.idx - b.idx).map((s) => s.sentence);
  const keyPointSentences = scored.slice(3, 9).sort((a, b) => a.idx - b.idx).map((s) => s.sentence);

  const keywords = topKeywords(freq, 6);
  const definitions = keywords.slice(0, 4).map((term) => {
    const sentenceWithTerm = sentences.find((s) => s.toLowerCase().includes(term));
    return {
      term: term.charAt(0).toUpperCase() + term.slice(1),
      def: sentenceWithTerm
        ? sentenceWithTerm.slice(0, 160) + (sentenceWithTerm.length > 160 ? "…" : "")
        : `A key concept discussed throughout ${fallbackTitle}.`,
    };
  });

  return {
    overview: overviewSentences.join(" "),
    keyPoints: keyPointSentences.length ? keyPointSentences : overviewSentences,
    definitions,
  };
}

/**
 * Generates a mixed-format quiz (mcq / true_false / short) from raw text.
 */
function generateQuiz(rawText, count = 6) {
  const sentences = splitSentences(rawText || "");
  if (sentences.length < 3) return [];

  const freq = wordFrequencies(sentences);
  const scored = scoreSentences(sentences, freq)
    .sort((a, b) => b.score - a.score)
    .slice(0, count * 2);

  const keywords = topKeywords(freq, 20);
  const questions = [];
  const types = ["mcq", "true_false", "short"];

  scored.slice(0, count).forEach((s, i) => {
    const type = types[i % types.length];
    const words = s.sentence.split(" ").filter((w) => w.length > 4);
    const answerWord = words.find((w) => keywords.includes(w.toLowerCase().replace(/[^a-z0-9]/g, ""))) || words[0] || "concept";
    const cleanAnswer = answerWord.replace(/[^a-zA-Z0-9]/g, "");

    if (type === "mcq") {
      const distractors = keywords
        .filter((k) => k !== cleanAnswer.toLowerCase())
        .slice(0, 3)
        .map((k) => k.charAt(0).toUpperCase() + k.slice(1));
      const options = [...distractors, cleanAnswer].sort(() => Math.random() - 0.5);
      questions.push({
        type: "mcq",
        question: `Which term best completes the idea: "${s.sentence.replace(cleanAnswer, "ـ".repeat(cleanAnswer.length || 3))}"?`,
        options: options.length >= 2 ? options : [cleanAnswer, "None of the above"],
        answer: cleanAnswer,
      });
    } else if (type === "true_false") {
      questions.push({
        type: "true_false",
        question: s.sentence,
        options: ["True", "False"],
        answer: "True",
      });
    } else {
      questions.push({
        type: "short",
        question: `In your own words, explain the idea behind: "${s.sentence.slice(0, 90)}${s.sentence.length > 90 ? "…" : ""}"`,
        options: [],
        answer: cleanAnswer.toLowerCase(),
      });
    }
  });

  return questions;
}

/**
 * Generates flashcards ({front, back}[]) from raw text using top keywords
 * paired with the sentence that best explains them.
 */
function generateFlashcards(rawText, count = 8) {
  const sentences = splitSentences(rawText || "");
  if (sentences.length < 2) return [];

  const freq = wordFrequencies(sentences);
  const keywords = topKeywords(freq, count);

  return keywords.map((term) => {
    const sentence = sentences.find((s) => s.toLowerCase().includes(term)) || sentences[0];
    return {
      front: term.charAt(0).toUpperCase() + term.slice(1),
      back: sentence.length > 180 ? sentence.slice(0, 180) + "…" : sentence,
    };
  });
}

module.exports = { generateSummary, generateQuiz, generateFlashcards };
