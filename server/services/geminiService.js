/**
 * geminiService.js
 * Calls Gemini 2.5 Flash to generate personalised coaching after a yoga session.
 * Called once per session-end — no camera involved.
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Build a score-aware prompt with strict tone rules per performance band.
 */
function buildPrompt({ poseName, score, overallStatus, duration, feedback, missingJoints = [] }) {
  const mins        = Math.floor(duration / 60);
  const secs        = duration % 60;
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  // Separate visible problem joints from invisible ones
  const visibleProblems = feedback
    .filter((f) => !f.missing && (f.status === "red" || f.status === "yellow"))
    .map((f) => `${f.joint.replace(/_/g, " ")}: ${f.message} (${f.diff}° off)`)
    .join("\n  - ");

  const invisibleJoints = feedback
    .filter((f) => f.missing)
    .map((f) => f.joint.replace(/_/g, " "))
    .join(", ");

  // Build the problems section
  let problemSection = "";
  if (invisibleJoints) {
    problemSection += `\nINVISIBLE JOINTS (penalised, body not fully in frame): ${invisibleJoints}`;
  }
  if (visibleProblems) {
    problemSection += `\nJOINT CORRECTIONS NEEDED:\n  - ${visibleProblems}`;
  }
  if (!invisibleJoints && !visibleProblems) {
    problemSection = "\nAll joints within tolerance — form was excellent.";
  }

  // Tone instruction based on score band
  let toneInstruction;
  if (score < 30) {
    toneInstruction = `The score is very poor (${score}/100). Be honest and direct — do NOT say "great effort" or use generic praise. 
Immediately name the specific joints that failed and explain exactly what the student needs to fix. 
If body parts were not visible, firmly tell them to step back and ensure their FULL body is in the camera frame before starting. 
Give ONE concrete, actionable correction they must do first. Keep the tone supportive but serious — this pose needs significant work.`;
  } else if (score < 50) {
    toneInstruction = `The score is poor (${score}/100). Skip generic encouragement. 
Name the 2-3 worst joints specifically and give direct corrections. 
Acknowledge that the student is trying but be clear that major adjustments are needed.`;
  } else if (score < 70) {
    toneInstruction = `The score is fair (${score}/100). Acknowledge progress, then focus on the specific problem joints. 
Give one or two targeted tips to improve.`;
  } else if (score < 85) {
    toneInstruction = `The score is good (${score}/100). Be encouraging but still mention which joints to refine. 
Give one precise tip to push toward excellent.`;
  } else {
    toneInstruction = `The score is excellent (${score}/100). Celebrate genuinely and briefly mention any minor refinements if any exist.`;
  }

  return `You are a strict but caring yoga coach giving post-session feedback. Be specific — never give vague praise.

SESSION DATA:
- Pose: ${poseName}
- Score: ${score}/100 (${overallStatus})
- Duration held: ${durationStr}
${problemSection}

TONE INSTRUCTION:
${toneInstruction}

FORMAT RULES:
- Write exactly 3 short sentences. End after the third sentence with a full stop.
- Plain text only. No markdown, no bullets, no asterisks, no colons introducing lists.
- Name body parts in plain English (left knee, right shoulder). No camelCase.
- Do NOT start with "That was", "Great", or any generic opener if score is below 50.`;
}

/**
 * generateAIFeedback
 * Returns coaching string or null on failure — never throws.
 */
async function generateAIFeedback(sessionData) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
    console.warn("[Gemini] GEMINI_API_KEY not set — skipping AI feedback");
    return null;
  }

  try {
    const prompt = buildPrompt(sessionData);
    console.log(`[Gemini] Calling API — score: ${sessionData.score}, key: ${apiKey.slice(0, 8)}...`);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature:     0.4,
          maxOutputTokens: 1024,
          topP:            0.85,
          stopSequences:   [],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    console.log("[Gemini] Response status:", response.status);

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`[Gemini] HTTP ${response.status}:`, errBody.slice(0, 400));
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn("[Gemini] Empty response:", JSON.stringify(data).slice(0, 400));
      return null;
    }

    // Strip any accidental markdown
    const cleaned = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^#+\s*/gm, "")
      .trim();

    // Safety net: if Gemini was still cut off mid-sentence, trim to last full stop
    if (!/[.!?]$/.test(cleaned)) {
      const lastStop = Math.max(
        cleaned.lastIndexOf("."),
        cleaned.lastIndexOf("!"),
        cleaned.lastIndexOf("?"),
      );
      if (lastStop > 0) {
        console.warn("[Gemini] Trimming truncated response to last complete sentence");
        return cleaned.slice(0, lastStop + 1);
      }
    }

    return cleaned;

  } catch (err) {
    console.error("[Gemini] Error:", err.message);
    return null;
  }
}

module.exports = { generateAIFeedback };