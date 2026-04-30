/**
 * Precomputed context sent with uploaded files to the model (English in prompt).
 * Replace or extend with real metrics, RAG output, and baseline comparisons.
 */
export type IngestMonitoringContextInput = {
  companyName: string;
  fileDisplayName: string;
  documentTypeName: string;
  temporalType: string;
  updateLabel: string;
  documentDate: string;
  receivedDate: string;
  language: string;
  primaryHash: string;
  processingSeconds: number | null;
};

export function buildIngestMonitoringContextBlock(
  input: IngestMonitoringContextInput
): string {
  return `## Precomputed context (Cerulean)

- Company: ${input.companyName}
- Primary file label: ${input.fileDisplayName}
- Document type: ${input.documentTypeName}
- Temporal role: ${input.temporalType}
- Update label: ${input.updateLabel || "—"}
- Document date: ${input.documentDate || "—"}
- Received date: ${input.receivedDate || "—"}
- Language: ${input.language}
- SHA-256 (primary file): ${input.primaryHash}
- Processing time (s): ${input.processingSeconds ?? "—"}

## Monitoring Analysis Specification

Use this specification as the analysis rubric for the uploaded investor update or document.

General rules:
- T = current uploaded document text.
- H = prior update texts for the same company, oldest first, if available.
- W(T) = word count of T.
- tokens(T) = lowercase tokens after punctuation removal.
- sents(T) = sentence list.
- All scores are clamped to [0, 1] unless stated otherwise.
- Do not create a flag from a module when its minimum history, word count, or evidence requirements are not met.
- Only create investor-facing flags when the document provides concrete evidence.
- Each flag must include a precise sourceAnchor from the uploaded document.

## M1: Metric Count and Consistency

Inputs:
- Current metrics in T.
- Prior metrics in H.

Metric keywords:
arr, mrr, revenue, customers, users, churn, runway, burn, nps, dau, mau, cac, ltv, headcount, employees, team, pipeline, bookings, retention, conversion, gmv, take_rate, margin.

Extraction:
- Identify numbers matching dollar amounts, percentages, and standalone numeric values.
- A number counts as a metric when one of the metric keywords appears within 8 tokens on either side.

Scores:
- MetricDensity(T) = number of distinct metric types in T / W(T) * 1000.
- IUMVar = max(0, (baseline MetricDensity - current MetricDensity) / baseline MetricDensity).
- Baseline uses the last 5 prior updates.
- If fewer than 3 prior updates exist, treat IUMVar as 0.
- Persistent metrics are metrics that appeared in at least 3 of the last 5 prior updates.
- CCR = absent persistent metrics in T / max(persistent metric count, 1).

Flag condition:
- M1_flag = IUMVar > 0.40 OR CCR > 0.60.
- M1_score = 0.6 * IUMVar + 0.4 * CCR.

## M2: AI-Washing Detection

AI claim terms:
autonomous, ai-powered, machine learning, neural network, self-optimizing, ai-native, intelligent automation, deep learning, llm, large language model, generative ai, computer vision, natural language processing, predictive, ai-driven, algorithmic, trained model, ai engine.

Technical specificity terms:
f1 score, precision, recall, inference latency, training corpus, false positive rate, model architecture, parameter count, benchmark, validation set, auc, accuracy on, error rate, throughput, p99 latency, training data, fine-tuned on, evaluated on, ground truth, confusion matrix, roc curve, precision-recall.

Scores:
- ACD(T) = AI claim term count / W(T) * 1000.
- TSS(T) = technical specificity term count / W(T) * 1000.
- CSR(T) = ACD(T) / max(TSS(T), 0.001).
- CSR_slope = trend of CSR across the last 4 prior updates plus T.
- M2_score = min(1.0, CSR(T) / 12.0).

Flag condition:
- M2_flag = CSR(T) > 6.0 AND at least 3 prior updates exist.
- A single update above threshold is suggestive but should not be flagged without context.
- High confidence is appropriate when CSR(T) > 12.0, or CSR(T) > 6.0 with a positive CSR trend for 3+ consecutive updates.

## M3: Contradiction Detection

Inputs:
- Current sentences in T.
- Historical sentences from the last 12 prior updates.

Parameters:
- SAME_TOPIC_THRESHOLD = 0.72 cosine similarity.
- MIN_SENTENCE_LENGTH = 25 characters.
- Compare only sentences on the same or very similar topic.

Contradiction evidence:
- One sentence has specific numbers while the other is vague on the same topic.
- Sentiment or directional meaning conflicts on the same topic.
- Specific claims conflict with prior specific claims.

Scores:
- SCS = mean similarity score of the top 3 contradictions, capped at 1.0.
- Persistent entities are ORG, PRODUCT, or GPE entities appearing in at least 3 of the last 6 prior updates.
- NECR = absent persistent entities in T / max(persistent entity count, 1).
- M3_score = 0.7 * SCS + 0.3 * NECR.

Flag condition:
- M3_flag = SCS > 0.68 OR NECR > 0.60.
- Do not flag contradiction unless the source evidence clearly supports it.

## M4: Narrative Abstraction Gradient

Uncertainty words:
approximately, roughly, expect, anticipate, may, could, should, might, potentially, believe, estimate, intend, plan, hope, targeting, aim.

Concrete signals:
- Dollar figures.
- Percentages.
- Dates, months, quarters.
- Definitive verbs such as signed, launched, shipped, hired, closed, onboarded, deployed, delivered, completed.

Abstract signals:
transformational, unprecedented, significant, meaningful, trajectory, momentum, exciting, revolutionary, innovative, world-class, best-in-class, leading, cutting-edge, game-changing, disruptive, paradigm, synergy, impactful.

Scores:
- CAR(T) = concrete signal count / max(abstract signal count, 1).
- CAR_slope = trend of CAR across the last 4 prior updates plus T.
- Gradient = -CAR_slope, where a positive value means the narrative is becoming more abstract.
- CAR_drop = max(0, (baseline CAR - current CAR) / baseline CAR).
- Baseline CAR uses the first min(5, |H|) historical updates.
- M4_score = 0.5 * min(1.0, Gradient / 0.30) + 0.5 * CAR_drop.

Flag condition:
- M4_flag = Gradient > 0.15 with at least 4 prior updates, OR CAR_drop > 0.50 with at least 3 prior updates.

## M5: Ask Pattern Analysis

Financial ask terms:
bridge, extension, raise, round, runway, capital, close our, closing our, running low, need funding, introductions to investors, looking for investors, fundraising, term sheet, soft circle, lead investor, anchor investor.

Strategic ask terms:
introductions to, hire, talent, advisor, partnership, pilot, connect us, know anyone, customer introductions, bd help, warm intro.

Scores:
- financial_asks(T) = financial ask term count.
- strategic_asks(T) = strategic ask term count.
- AskType(T) = financial when financial_asks > strategic_asks; otherwise strategic.
- type_shift = current AskType is financial and fewer than 2 of the last 4 prior updates were financial.
- ADCS evaluates whether a financial ask is consistent with disclosed ARR/revenue/runway/burn context.
- If financial_asks >= 2 and ARR/revenue is disclosed as positive, ADCS = 0.15.
- If financial_asks >= 2 and ARR/revenue is disclosed but not positive, ADCS = 0.55.
- If financial_asks >= 2 and no strong metrics are disclosed, ADCS = 0.75.
- If no meaningful financial ask exists, ADCS = 1.0.
- M5_score = 1.0 - ADCS.

Flag condition:
- M5_flag = ADCS < 0.30 OR financial_asks >= 2 with type_shift.

## M6: Linguistic Deterioration

Parameters:
- BASELINE_MIN_UPDATES = 4.
- MIN_WORD_COUNT = 300.
- DELTA_THRESHOLD = 0.18.
- K_SHIFT_THRESHOLD = 0.35.

Function words:
the, a, an, this, that, these, those, and, but, or, nor, for, yet, so, although, because, since, while, though, if, unless, until, in, on, at, by, with, about, of, to, from, into, through, during, before, after, i, we, our, my, it, its, they, their, have, has, had, be, is, are, was, were, been, do, does, did, will, would, could, should, may, might, must, shall.

Scores:
- Delta(T) = Burrows' Delta between current function-word profile and the historical baseline profile.
- K_shift = relative Yule's K shift versus the historical baseline.
- M6_score = average of normalized Delta and K_shift only if M6_flag is true; otherwise 0.

Flag condition:
- M6_flag = Delta(T) > 0.18 AND K_shift > 0.35 AND W(T) >= 300 AND at least 4 prior updates exist.
- Both metrics must be anomalous simultaneously.

## M7: Milestone Drift Detection

Commitment terms:
will close, expect to, targeting, by q, by end of, next update we will, our goal is, we plan to, committed to, aiming to, plan to hire, will share, will announce, will launch, on track to, set to, schedule to, looking to close, in final stages of.

Parameters:
- ADDRESSED_THRESHOLD = 0.62 semantic similarity.
- OVERDUE_DAYS = 45.
- DISAPPEARANCE_UPDATES = 2.

Scores:
- Extract commitments, entities, deadlines, and creation dates from prior updates.
- overdue_score = min(1.0, days overdue / 90), only after deadline has passed.
- disappearance_score = 0.8 when an entity tied to a commitment was previously mentioned and then disappears from subsequent updates.
- M7_score = maximum overdue or disappearance score among open commitments.

Flag condition:
- M7_flag = any commitment score > 0.50.
- Flag evidence should include commitment text, where it appeared, entity involved, days overdue, and last update that mentioned it when available.

## M8: Update Structure Analysis

Section keywords:
- metrics: arr, mrr, revenue, customers, burn, runway, churn, growth, numbers, metrics, kpis.
- product: shipped, launched, feature, product, release, built, deployed, update, version.
- team: hire, hired, team, employee, joined, headcount, talent.
- ask: ask, help, intro, introductions, raise, bridge, looking for.
- context: market, industry, space, landscape, trend, macro, sector, competitive.

Scores:
- Map each paragraph to a section type using keywords.
- SPDS measures section position drift versus the last 4 prior updates.
- SWDS measures shrinkage of the metrics section versus the last 4 prior updates.
- M8_score = 0.5 * min(1.0, SPDS / 3.0) + 0.5 * SWDS.

Flag condition:
- M8_flag = SPDS > 2.5 AND SWDS > 0.40.
- Both structure drift and metrics shrinkage are required.
- M8 is medium confidence by default; only treat it as high confidence when it co-occurs with stronger modules such as M1 or M3.

## F9: Silence and Cadence Monitoring

Parameters:
- SILENCE_MULTIPLIER = 1.5.
- ESCALATION_MULTIPLIER = 2.0.
- MIN_UPDATES_FOR_BASELINE = 3.
- DEFAULT_CADENCE_DAYS = 30.

Scores:
- baseline_cadence = median gap between updates when at least 3 updates exist; otherwise 30 days.
- F9_flag = days_since_last_update >= baseline_cadence * 1.5.
- silence_score = normalized score between the silence threshold and escalation threshold.

Flag condition:
- Create a silence flag only when enough date context exists to support it.
- Escalate silence when the company already has active M1 or M3 flags.

## Convergence and Confidence

Module weights:
- M1 = 1.00
- M3 = 1.00
- M7 = 0.90
- M5 = 0.75
- M4 = 0.70
- M2 = 0.65
- M8 = 0.55
- M6 = 0.45
- F9 = 0.60

Module score thresholds:
- M1 = 0.40
- M2 = 0.55
- M3 = 0.55
- M4 = 0.40
- M5 = 0.55
- M6 = 0.50
- M7 = 0.50
- M8 = 0.45
- F9 = 0.50

Confidence rules:
- High confidence: 3 or more modules trigger in the same 90-day window, or one module has very strong direct evidence.
- Medium confidence: 2 modules trigger in the same 90-day window, or one module has meaningful but not decisive evidence.
- Low confidence: evidence is weak, isolated, or missing required historical context. Prefer no flag unless the document still contains a clear investor-relevant risk.
- No investor-facing flag: no module meets its flag condition or source evidence is insufficient.

## Task instructions

Analyze the uploaded document according to this monitoring specification. Return only flags that are supported by the uploaded document and the available context.`;
}
