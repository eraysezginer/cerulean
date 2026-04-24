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

##R Codes for the analysis

This is the engineering specification question. Let me build every formula for every feature precisely.

Notation used throughout
	T = text of current update (string)
	H = list of prior update texts for same company, oldest first [T₁, T₂, ... Tₙ₋₁]
	W(T) = word count of T
	tokens(T) = list of lowercase tokens after removing punctuation
	sents(T) = list of sentences in T (spaCy sentence segmentation)
	embed(s) = FinBERT embedding vector for string s (768-dim float array)
	cos(a,b) = cosine similarity between vectors a and b = (a·b) / (‖a‖ × ‖b‖)
	All scores are clamped to [0, 1] unless stated otherwise
	All thresholds marked [CALIBRATE] are starting values to be refined against the R proof-of-concept corpus

F1 — Metric Count and Consistency
Parameters
METRIC_KEYWORDS = [
  'arr', 'mrr', 'revenue', 'customers', 'users', 'churn',
  'runway', 'burn', 'nps', 'dau', 'mau', 'cac', 'ltv',
  'headcount', 'employees', 'team', 'pipeline', 'bookings',
  'retention', 'conversion', 'gmv', 'take_rate', 'margin'
]

CONTEXT_WINDOW = 8 tokens either side of each number

BASELINE_WINDOW = 5  # use prior 5 updates to compute baseline
DENSITY_DROP_THRESHOLD = 0.40  # [CALIBRATE] 40% drop triggers flag
CCR_ABSENCE_THRESHOLD = 3  # [CALIBRATE] 3+ absent metrics triggers flag
Data inputs
Current update text T. Prior update texts H. Extracted metric dict from each prior update (stored in database after each ingestion).
Formulae
Step 1 — extract metrics from T:
NUMBER_PATTERN = r'\$[\d,]+(?:\.\d+)?[KMBkmb]?|\d+(?:\.\d+)?%|\b\d{2,}\b'

function extract_metrics(T):
    numbers = regex_findall(NUMBER_PATTERN, T)
    metrics = {}
    for each number n at position p in T:
        context = tokens(T)[max(0, p-8) : p+8]
        for keyword k in METRIC_KEYWORDS:
            if k in context:
                metrics[k] = n
                break
    return metrics   # e.g. {'arr': '$2.4M', 'customers': '47'}
Step 2 — metric density:
MetricDensity(T) = |metrics(T)| / W(T) × 1000
# "number of distinct metric types per 1,000 words"
Step 3 — IUMVar (Inter-Update Metric Variance):
baseline_densities = [MetricDensity(Tᵢ) for Tᵢ in last 5 of H]
μ_baseline = mean(baseline_densities)

IUMVar = max(0, (μ_baseline - MetricDensity(T)) / μ_baseline)
# 0 = no drop, 1 = complete collapse
# Undefined (return 0) if |H| < 3
Step 4 — CCR (Claim-to-Corroboration Ratio):
# For each metric that appeared in ≥3 of the last 5 updates,
# check if it appears in T

persistent_metrics = {k for k in METRIC_KEYWORDS
                      if count(k in metrics(Tᵢ) for Tᵢ in last 5 of H) >= 3}

absent_count = |{k for k in persistent_metrics if k not in metrics(T)}|

CCR = absent_count / max(|persistent_metrics|, 1)
# 0 = all persistent metrics present, 1 = all absent
Flag condition
M1_flag = (IUMVar > 0.40) OR (CCR > 0.60)
M1_score = 0.6 × IUMVar + 0.4 × CCR  # weighted composite

F2 — AI-Washing Detection
Parameters
AI_CLAIM_LEXICON = [
  'autonomous', 'ai-powered', 'machine learning', 'neural network',
  'self-optimizing', 'ai-native', 'intelligent automation',
  'deep learning', 'llm', 'large language model', 'generative ai',
  'computer vision', 'natural language processing', 'predictive',
  'ai-driven', 'algorithmic', 'trained model', 'ai engine'
]  # expand continuously from fraud case corpus

TECHNICAL_SPECIFICITY_LEXICON = [
  'f1 score', 'precision', 'recall', 'inference latency',
  'training corpus', 'false positive rate', 'model architecture',
  'parameter count', 'benchmark', 'validation set', 'auc',
  'accuracy on', 'error rate', 'throughput', 'p99 latency',
  'training data', 'fine-tuned on', 'evaluated on', 'ground truth',
  'confusion matrix', 'roc curve', 'precision-recall'
]

CSR_THRESHOLD = 6.0   # [CALIBRATE]
CSR_HIGH_THRESHOLD = 12.0  # [CALIBRATE] — above this = high confidence alone
TREND_WINDOW = 4  # updates to assess CSR trend
Formulae
ACD(T) = Σ count(term in T.lower()) for term in AI_CLAIM_LEXICON
         / W(T) × 1000
# AI Claim Density — claims per 1,000 words

TSS(T) = Σ count(term in T.lower()) for term in TECHNICAL_SPECIFICITY_LEXICON
         / W(T) × 1000
# Technical Specificity Score

CSR(T) = ACD(T) / max(TSS(T), 0.001)
# Claim-to-Specificity Ratio — higher = more washing

# Trend: is CSR increasing over time?
CSR_history = [CSR(Tᵢ) for Tᵢ in last TREND_WINDOW updates of H]
CSR_slope = linear_regression_slope(CSR_history + [CSR(T)])
# positive slope = AI claims rising relative to technical specificity

M2_score = min(1.0, CSR(T) / CSR_HIGH_THRESHOLD)
Flag condition
M2_flag = (CSR(T) > CSR_THRESHOLD) AND (|H| >= 3)
# Single update above threshold is suggestive but not flagged
# Requires context from at least 3 prior updates

M2_high = (CSR(T) > CSR_HIGH_THRESHOLD) OR
           (CSR(T) > CSR_THRESHOLD AND CSR_slope > 0 for 3+ consecutive updates)

F3 — Contradiction Detection
Parameters
FINBERT_MODEL = 'ProsusAI/finbert'  # loaded once at server start
EMBEDDING_DIM = 768

SAME_TOPIC_THRESHOLD = 0.72  # [CALIBRATE] cosine similarity
MIN_SENTENCE_LENGTH = 25  # characters — ignore very short sentences
HISTORY_WINDOW = 12  # compare against last 12 updates only
NUMBER_REGEX = r'\$[\d,.]+|\d+%|\d+\s*(million|thousand|k\b|m\b)'
Formulae
Step 1 — sentence embeddings:
function embed_update(T):
    S = [s for s in sents(T) if len(s) >= MIN_SENTENCE_LENGTH]
    E = [embed(s) for s in S]  # FinBERT inference
    return list(zip(S, E))     # [(sentence_text, vector), ...]
Step 2 — pairwise similarity matrix:
# current update sentences
C = embed_update(T)           # [(s_c, e_c), ...]

# historical sentences (all from last HISTORY_WINDOW updates)
H_emb = flatten([embed_update(Tᵢ) for Tᵢ in last 12 of H])

# Normalise all vectors
C_norm = [e / ‖e‖ for (s, e) in C]
H_norm = [e / ‖e‖ for (s, e) in H_emb]

# Similarity matrix: shape (|C|, |H_emb|)
SIM[i][j] = C_norm[i] · H_norm[j]
Step 3 — contradiction detection:
function is_contradictory(s_current, s_historical):
    # Heuristic: one sentence has specific numbers, other is vague on same topic
    curr_has_numbers = bool(regex_search(NUMBER_REGEX, s_current))
    hist_has_numbers = bool(regex_search(NUMBER_REGEX, s_historical))
    
    # Directional contradiction: specific → vague on same claimed metric
    if curr_has_numbers != hist_has_numbers:
        return True
    
    # Sentiment contradiction using FinBERT sentiment labels
    curr_sentiment = finbert_sentiment(s_current)   # positive/negative/neutral
    hist_sentiment = finbert_sentiment(s_historical)
    if curr_sentiment != hist_sentiment and 'neutral' not in [curr_sentiment, hist_sentiment]:
        return True
    
    return False

contradictions = []
for i, (s_c, e_c) in enumerate(C):
    for j, (s_h, e_h) in enumerate(H_emb):
        if SIM[i][j] >= SAME_TOPIC_THRESHOLD:
            if is_contradictory(s_c, s_h):
                contradictions.append({
                    'current': s_c,
                    'historical': s_h,
                    'similarity': SIM[i][j],
                    'score': SIM[i][j]  # higher similarity = more confident contradiction
                })
Step 4 — SCS (Semantic Contradiction Score):
if len(contradictions) == 0:
    SCS = 0.0
else:
    # Top-3 contradictions weighted by similarity score
    top3 = sorted(contradictions, key=lambda x: x['score'], reverse=True)[:3]
    SCS = mean([c['score'] for c in top3])
    # Capped at 1.0
Step 5 — NECR (Named Entity Consistency Rate):
# Extract named entities from all H
all_H_entities = flatten([NER(Tᵢ) for Tᵢ in last 6 of H])
# Filter for ORG (customer names), PRODUCT (product names), GPE (geographies)
persistent_entities = {ent for ent, label in all_H_entities
                       if label in ('ORG', 'PRODUCT', 'GPE')
                       and count(ent in NER(Tᵢ) for Tᵢ in last 6 of H) >= 3}

present_in_current = {ent for ent in persistent_entities if ent in T}
absent_count = |persistent_entities| - |present_in_current|

NECR = absent_count / max(|persistent_entities|, 1)
# 0 = all persistent entities present, 1 = all absent
Flag condition
M3_score = 0.7 × SCS + 0.3 × NECR
M3_flag = SCS > 0.68 OR NECR > 0.60

F4 — Narrative Abstraction Gradient
Parameters
LM_UNCERTAINTY_WORDS = [
  'approximately', 'roughly', 'expect', 'anticipate', 'may',
  'could', 'should', 'might', 'potentially', 'believe',
  'estimate', 'intend', 'plan', 'hope', 'targeting', 'aim'
]

CONCRETE_SIGNALS = [
  r'\$[\d,.]+[KMBkmb]?',   # dollar figures
  r'\d+(?:\.\d+)?%',        # percentages
  r'\b(january|february|march|april|may|june|july|august|'
  r'september|october|november|december|q[1-4])\b',  # dates
  r'\b(signed|launched|shipped|hired|closed|onboarded|'
  r'deployed|delivered|completed)\b'  # definitive verbs
]

ABSTRACT_SIGNALS = [
  'transformational', 'unprecedented', 'significant', 'meaningful',
  'trajectory', 'momentum', 'exciting', 'revolutionary', 'innovative',
  'world-class', 'best-in-class', 'leading', 'cutting-edge',
  'game-changing', 'disruptive', 'paradigm', 'synergy', 'impactful'
]

GRADIENT_WINDOW = 4   # updates for trend computation
CAR_DROP_THRESHOLD = 0.50  # [CALIBRATE] 50% drop from baseline = flag
GRADIENT_THRESHOLD = 0.15  # [CALIBRATE] slope of CAR time series
Formulae
# Readability (using textstat library)
FK_grade(T)   = flesch_kincaid_grade(T)
Flesch_ease(T) = flesch_reading_ease(T)

# Uncertainty density
UncDensity(T) = Σ count(w in T.lower()) for w in LM_UNCERTAINTY_WORDS
                / W(T) × 1000

# CAR (Concrete-to-Abstract Ratio)
concrete_count(T) = Σ len(regex_findall(pattern, T.lower()))
                    for pattern in CONCRETE_SIGNALS

abstract_count(T) = Σ count(term in T.lower())
                    for term in ABSTRACT_SIGNALS

CAR(T) = concrete_count(T) / max(abstract_count(T), 1)
# Higher CAR = more concrete (good). Lower CAR = more abstract (bad).

# CAR gradient (trend across updates)
CAR_history = [CAR(Tᵢ) for Tᵢ in last GRADIENT_WINDOW of H] + [CAR(T)]
x = [0, 1, 2, ..., len(CAR_history)-1]
CAR_slope = linear_regression_slope(x, CAR_history)
# negative slope = CAR falling = abstraction increasing = M4 signal
Gradient = -CAR_slope   # positive = increasingly abstract

# Baseline CAR for drop calculation
CAR_baseline = mean([CAR(Tᵢ) for Tᵢ in first min(5, |H|) of H])
CAR_drop = max(0, (CAR_baseline - CAR(T)) / CAR_baseline)
Flag condition
M4_score = 0.5 × min(1.0, Gradient / 0.30) + 0.5 × CAR_drop
M4_flag  = (Gradient > GRADIENT_THRESHOLD AND |H| >= GRADIENT_WINDOW)
           OR (CAR_drop > CAR_DROP_THRESHOLD AND |H| >= 3)

F5 — Ask Pattern Analysis
Parameters
FINANCIAL_ASK_LEXICON = [
  'bridge', 'extension', 'raise', 'round', 'runway',
  'capital', 'close our', 'closing our', 'running low',
  'need funding', 'introductions to investors',
  'looking for investors', 'fundraising', 'term sheet',
  'soft circle', 'lead investor', 'anchor investor'
]

STRATEGIC_ASK_LEXICON = [
  'introductions to', 'hire', 'talent', 'advisor',
  'partnership', 'pilot', 'connect us', 'know anyone',
  'customer introductions', 'bd help', 'warm intro'
]

FINANCIAL_ASK_THRESHOLD = 2   # count in single update
ADCS_LOW_THRESHOLD = 0.30     # [CALIBRATE]
Formulae
financial_asks(T) = Σ count(phrase in T.lower()) for phrase in FINANCIAL_ASK_LEXICON
strategic_asks(T) = Σ count(phrase in T.lower()) for phrase in STRATEGIC_ASK_LEXICON

AskDensity(T) = (financial_asks(T) + strategic_asks(T)) / W(T) × 1000

# Ask type classification
AskType(T) = 'financial' if financial_asks(T) > strategic_asks(T) else 'strategic'

# Ask trend (is type shifting from strategic to financial over time?)
recent_types = [AskType(Tᵢ) for Tᵢ in last 4 of H]
type_shift = (AskType(T) == 'financial') AND
             (count('financial' in recent_types) < 2)
# True = this is a new financial ask after a history of strategic asks

# ADCS (Ask-to-Disclosure Consistency Score)
# Cross-reference the ask against what the founder disclosed this update
arr_disclosed  = 'arr' in metrics(T) or 'revenue' in metrics(T)
burn_disclosed = 'runway' in metrics(T) or 'burn' in metrics(T)
positive_metrics = (
    parse_number(metrics(T).get('arr', '0')) > 0 or
    parse_number(metrics(T).get('revenue', '0')) > 0
)

if financial_asks(T) >= FINANCIAL_ASK_THRESHOLD:
    if arr_disclosed and positive_metrics:
        ADCS = 0.15   # very inconsistent: asking while claiming strong revenue
    elif arr_disclosed and not positive_metrics:
        ADCS = 0.55   # somewhat consistent: asking because metrics declining
    else:
        ADCS = 0.75   # consistent: asking without claiming strong metrics
else:
    ADCS = 1.0        # no meaningful financial ask
Flag condition
M5_score = 1.0 - ADCS   # higher = more inconsistent ask
M5_flag  = (ADCS < ADCS_LOW_THRESHOLD) OR
           (financial_asks(T) >= FINANCIAL_ASK_THRESHOLD AND type_shift)

F6 — Linguistic Deterioration
Parameters
FUNCTION_WORDS = [
  # determiners
  'the', 'a', 'an', 'this', 'that', 'these', 'those',
  # conjunctions
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although',
  'because', 'since', 'while', 'though', 'if', 'unless', 'until',
  # prepositions
  'in', 'on', 'at', 'by', 'for', 'with', 'about', 'of', 'to',
  'from', 'into', 'through', 'during', 'before', 'after',
  # pronouns
  'i', 'we', 'our', 'my', 'it', 'its', 'they', 'their',
  # auxiliaries
  'have', 'has', 'had', 'be', 'is', 'are', 'was', 'were',
  'been', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall'
]  # 50 words — short list is fine for short documents

BASELINE_MIN_UPDATES = 4    # need at least 4 prior updates
MIN_WORD_COUNT = 300        # skip M6 if update < 300 words
DELTA_THRESHOLD = 0.18      # [CALIBRATE] Burrows' Delta
K_SHIFT_THRESHOLD = 0.35    # [CALIBRATE] relative Yule's K shift
Formulae
# Function word profile
function fw_profile(T):
    toks = tokens(T)
    N = len(toks)
    if N == 0: return zero_vector(len(FUNCTION_WORDS))
    counts = Counter(toks)
    return array([counts.get(w, 0) / N for w in FUNCTION_WORDS])

# Burrows' Delta
function burrows_delta(profile_a, profile_b):
    return mean(abs(profile_a - profile_b))

# Baseline profile = mean of profiles from all H
baseline_profile = mean([fw_profile(Tᵢ) for Tᵢ in H])

Delta(T) = burrows_delta(fw_profile(T), baseline_profile)

# Yule's K
function yules_k(T):
    toks = tokens(T)
    N = len(toks)
    if N < 50: return None
    freq = Counter(toks)
    M2 = Σ (f × f) for f in freq.values()
    return 10000 × (M2 - N) / (N × N)

K_current = yules_k(T)
K_baseline = mean([yules_k(Tᵢ) for Tᵢ in H if yules_k(Tᵢ) is not None])

K_shift = abs(K_current - K_baseline) / max(K_baseline, 1)
           if K_current is not None else 0.0
Flag condition
# Only flag if BOTH metrics are anomalous simultaneously
M6_flag  = (Delta(T) > DELTA_THRESHOLD) AND (K_shift > K_SHIFT_THRESHOLD)
           AND (W(T) >= MIN_WORD_COUNT) AND (|H| >= BASELINE_MIN_UPDATES)

M6_score = 0.0
if W(T) >= MIN_WORD_COUNT and |H| >= BASELINE_MIN_UPDATES:
    delta_norm = min(1.0, Delta(T) / (DELTA_THRESHOLD × 2))
    kshift_norm = min(1.0, K_shift / (K_SHIFT_THRESHOLD × 2))
    M6_score = (delta_norm + kshift_norm) / 2 if M6_flag else 0.0

F7 — Milestone Drift Detection
Parameters
COMMITMENT_LEXICON = [
  'will close', 'expect to', 'targeting', 'by q', 'by end of',
  'next update we will', 'our goal is', 'we plan to',
  'committed to', 'aiming to', 'plan to hire', 'will share',
  'will announce', 'will launch', 'on track to', 'set to',
  'schedule to', 'looking to close', 'in final stages of'
]

ADDRESSED_THRESHOLD = 0.62   # [CALIBRATE] embedding similarity to count as addressed
OVERDUE_DAYS = 45            # [CALIBRATE] days past deadline before "overdue"
DISAPPEARANCE_UPDATES = 2    # commitment not mentioned for 2+ updates = flag
Formulae
# Extraction
function extract_commitments(T, update_date):
    commitments = []
    for s in sents(T):
        for phrase in COMMITMENT_LEXICON:
            if phrase in s.lower():
                entities = NER(s)  # extract subject of commitment
                deadline = extract_deadline(s)   # regex for Q1/Q2/month/year
                commitments.append({
                    'text': s,
                    'entities': entities,
                    'deadline': deadline,
                    'created': update_date,
                    'status': 'open'
                })
                break
    return commitments

# Checking whether a commitment is addressed in a new update
function is_addressed(commitment_text, T):
    sim = cos(embed(commitment_text), embed(T_summary))
    # T_summary = first 500 chars of T (computational efficiency)
    return sim >= ADDRESSED_THRESHOLD

# Overdue scoring
function overdue_score(commitment, current_date):
    if commitment.deadline is None:
        return 0.0
    days_overdue = (current_date - commitment.deadline).days
    if days_overdue <= 0:
        return 0.0
    return min(1.0, days_overdue / 90)  # saturates at 90 days overdue

# Disappearance scoring (no deadline, but entity stopped appearing)
function disappearance_score(commitment, H_recent):
    entity_names = [e[0] for e in commitment.entities if e[1] in ('ORG', 'PRODUCT')]
    if not entity_names:
        return 0.0
    # Count how many of the last N updates mention each entity
    mention_counts = [
        any(name in Tᵢ for name in entity_names)
        for Tᵢ in last 4 of H_recent
    ]
    # If entity was mentioned then stopped, flag
    if mention_counts[0] and not any(mention_counts[1:]):
        return 0.8
    return 0.0
Flag condition
open_commitments = [c for c in load_commitments(company_id) where c.status == 'open']

M7_scores = [max(overdue_score(c, today), disappearance_score(c, H))
             for c in open_commitments]

M7_score = max(M7_scores) if M7_scores else 0.0
M7_flag  = any(s > 0.50 for s in M7_scores)

# Flagged commitment includes: commitment text, update it appeared in,
# entity involved, days overdue, last update that mentioned it

F8 — Update Structure Analysis
Parameters
SECTION_KEYWORDS = {
  'metrics':   ['arr', 'mrr', 'revenue', 'customers', 'burn', 'runway',
                'churn', 'growth', 'numbers', 'metrics', 'kpis'],
  'product':   ['shipped', 'launched', 'feature', 'product', 'release',
                'built', 'deployed', 'update', 'version'],
  'team':      ['hire', 'hired', 'team', 'employee', 'joined',
                'headcount', 'talent'],
  'ask':       ['ask', 'help', 'intro', 'introductions', 'raise',
                'bridge', 'looking for'],
  'context':   ['market', 'industry', 'space', 'landscape', 'trend',
                'macro', 'sector', 'competitive']
}

SPDS_THRESHOLD = 2.5  # [CALIBRATE] section position drift
SWDS_THRESHOLD = 0.40 # [CALIBRATE] section weight drift
Formulae
# Section mapping — assign each paragraph to a section type
function map_sections(T):
    paragraphs = T.split('\n\n')
    section_map = {}
    for i, para in enumerate(paragraphs):
        para_lower = para.lower()
        for section, keywords in SECTION_KEYWORDS.items():
            if any(kw in para_lower for kw in keywords):
                section_map[section] = {
                    'position': i,
                    'word_count': len(para.split()),
                    'fraction': len(para.split()) / W(T)
                }
                break
    return section_map

# Section Position Drift Score
function SPDS(T, H):
    if |H| < 4: return 0.0
    current_map = map_sections(T)
    baseline_positions = {
        section: mean([map_sections(Tᵢ).get(section, {}).get('position', 0)
                       for Tᵢ in last 4 of H])
        for section in SECTION_KEYWORDS
    }
    drift_scores = [
        abs(current_map.get(s, {}).get('position', 0) - baseline_positions[s])
        for s in SECTION_KEYWORDS
        if s in current_map and baseline_positions[s] > 0
    ]
    return mean(drift_scores) if drift_scores else 0.0

# Section Weight Drift Score — metrics section shrinking
function SWDS(T, H):
    if |H| < 4: return 0.0
    current_metrics_weight = map_sections(T).get('metrics', {}).get('fraction', 0)
    baseline_metrics_weight = mean([
        map_sections(Tᵢ).get('metrics', {}).get('fraction', 0)
        for Tᵢ in last 4 of H
    ])
    if baseline_metrics_weight == 0: return 0.0
    drop = (baseline_metrics_weight - current_metrics_weight) / baseline_metrics_weight
    return max(0.0, drop)
Flag condition
M8_score = 0.5 × min(1.0, SPDS(T, H) / 3.0) + 0.5 × SWDS(T, H)
M8_flag  = SPDS(T, H) > SPDS_THRESHOLD AND SWDS(T, H) > SWDS_THRESHOLD
# Requires BOTH to flag — single metric is too noisy
# Medium confidence only — must co-occur with F1 or F3 for high confidence

F9 — Silence and Cadence Monitoring
Parameters
SILENCE_MULTIPLIER = 1.5     # silence threshold = baseline × 1.5
ESCALATION_MULTIPLIER = 2.0  # escalate at baseline × 2.0
MIN_UPDATES_FOR_BASELINE = 3 # need at least 3 updates for cadence
DEFAULT_CADENCE_DAYS = 30    # assumed cadence if insufficient history
Formulae
# Baseline cadence computation
function baseline_cadence(timestamps):
    if len(timestamps) < MIN_UPDATES_FOR_BASELINE:
        return DEFAULT_CADENCE_DAYS
    gaps = [(timestamps[i] - timestamps[i-1]).days
            for i in range(1, len(timestamps))]
    return median(gaps)

# Silence check (runs daily for every monitored company)
function check_silence(company_id, current_date):
    last_update_date = latest_update_timestamp(company_id)
    all_timestamps = all_update_timestamps(company_id)  # oldest first
    
    cadence = baseline_cadence(all_timestamps)
    days_since = (current_date - last_update_date).days
    
    silence_threshold = cadence × SILENCE_MULTIPLIER
    escalation_threshold = cadence × ESCALATION_MULTIPLIER
    
    silence_score = max(0.0, (days_since - silence_threshold) /
                             (escalation_threshold - silence_threshold))
    silence_score = min(1.0, silence_score)
    
    return {
        'is_silent': days_since >= silence_threshold,
        'days_since': days_since,
        'baseline_cadence': cadence,
        'threshold': silence_threshold,
        'silence_score': silence_score,
        'severity': 'high' if days_since >= escalation_threshold else 'medium'
    }
Flag condition
F9_flag = days_since >= cadence × SILENCE_MULTIPLIER

# Escalation: if company already has active M1/M3 flags AND goes silent,
# escalate silence to high confidence automatically
F9_escalated = F9_flag AND has_active_flags(company_id)

F12 — Convergence Engine
Parameters
# Starting weights — these are replaced by logistic regression
# coefficients from R calibration after corpus analysis
MODULE_WEIGHTS = {
  'M1': 1.00,   # IUMVar — high reliability on any update length
  'M3': 1.00,   # SCS — high reliability with sufficient history
  'M7': 0.90,   # Milestone drift — high reliability
  'M5': 0.75,   # Ask pattern — medium-high reliability
  'M4': 0.70,   # Abstraction gradient — medium reliability (noisy)
  'M2': 0.65,   # AI-washing — medium reliability (lexicon dependent)
  'M8': 0.55,   # Structure analysis — medium reliability
  'M6': 0.45,   # Authorship shift — lower reliability on short text
  'F9': 0.60    # Silence — medium reliability
}

# Individual module thresholds (flag if score exceeds this)
MODULE_THRESHOLDS = {
  'M1': 0.40,  # IUMVar or CCR composite
  'M2': 0.55,  # CSR normalised
  'M3': 0.55,  # SCS + NECR composite
  'M4': 0.40,  # gradient + CAR_drop composite
  'M5': 0.55,  # 1 - ADCS
  'M6': 0.50,  # Delta + K_shift composite (only if > 300 words)
  'M7': 0.50,  # max overdue/disappearance score
  'M8': 0.45,  # SPDS + SWDS composite
  'F9': 0.50   # silence score
}  # all [CALIBRATE]

HIGH_CONFIDENCE_MODULES = 3   # modules must trigger for high confidence
MEDIUM_CONFIDENCE_MODULES = 2 # modules must trigger for medium confidence
WINDOW_DAYS = 90              # modules must trigger within same 90-day window
Formulae
function compute_convergence(module_scores, company_id, current_date):
    # Load weights from calibration file (updated after each R corpus run)
    weights = load_json('config/convergence_weights.json')
    
    # Count modules triggered within the 90-day window
    recent_flags = {
        module: score
        for module, score in module_scores.items()
        if score >= MODULE_THRESHOLDS[module]
    }
    
    # Historical module triggers in the last 90 days (from database)
    historical_triggers = load_recent_module_triggers(company_id, WINDOW_DAYS)
    
    # Combined set: current + recent historical
    all_triggered = set(recent_flags.keys()) | set(historical_triggers.keys())
    modules_triggered = len(all_triggered)
    
    # Weighted convergence score
    total_weight = sum(weights[m] for m in weights)
    weighted_sum = sum(
        weights.get(m, 0) × min(1.0, module_scores.get(m, 0))
        for m in weights
    )
    convergence_score = weighted_sum / total_weight
    
    # Confidence assignment
    if modules_triggered >= HIGH_CONFIDENCE_MODULES:
        confidence = 'high'
    elif modules_triggered >= MEDIUM_CONFIDENCE_MODULES:
        confidence = 'medium'
    else:
        confidence = 'none'   # no investor-facing flag
    
    return {
        'convergence_score': convergence_score,
        'modules_triggered': modules_triggered,
        'triggered_modules': list(all_triggered),
        'confidence': confidence
    }

R calibration — the formulas that set all the [CALIBRATE] thresholds
This runs once against the proof-of-concept corpus and again each time new labeled data arrives.
library(tidyverse)
library(pROC)
library(glmnet)
library(jsonlite)

# Load corpus scores from PostgreSQL
corpus <- tbl(con, "updates") %>%
  inner_join(tbl(con, "companies"), by = c("company_id" = "id")) %>%
  filter(!is.na(fraud_label)) %>%
  select(fraud_label, m1_score, m2_score, m3_score, m4_score,
         m5_score, m6_score, m7_score, m8_score, silence_score) %>%
  collect()

# ── Step 1: Individual module AUCs and optimal thresholds ──────────
modules <- c('m1_score','m2_score','m3_score','m4_score',
             'm5_score','m6_score','m7_score','m8_score','silence_score')

thresholds <- map_dfr(modules, function(m) {
  roc_obj <- roc(corpus$fraud_label, corpus[[m]], quiet = TRUE)
  best    <- coords(roc_obj, "best", best.method = "closest.topleft",
                    ret = c("threshold","sensitivity","specificity"))
  tibble(module = m, auc = as.numeric(auc(roc_obj)),
         threshold = best$threshold,
         sensitivity = best$sensitivity,
         specificity = best$specificity)
})

# ── Step 2: Logistic regression for convergence weights ───────────
X <- as.matrix(corpus[, modules])
y <- corpus$fraud_label

# Lasso-penalised logistic regression
# alpha=1 for lasso, performs automatic feature selection
cv_fit <- cv.glmnet(X, y, family = "binomial", alpha = 1)
best_lambda <- cv_fit$lambda.min
final_model <- glmnet(X, y, family = "binomial",
                       alpha = 1, lambda = best_lambda)

# Extract coefficients as weights
coef_df <- tidy(final_model) %>% filter(term != "(Intercept)")
weights  <- setNames(coef_df$estimate, coef_df$term)

# ── Step 3: Combined model AUC ─────────────────────────────────────
predicted <- predict(final_model, X, type = "response")[,1]
combined_auc <- auc(roc(corpus$fraud_label, predicted, quiet = TRUE))

cat("Combined model AUC:", round(combined_auc, 3), "\n")
cat("\nModule AUCs:\n")
print(thresholds %>% select(module, auc, threshold) %>% arrange(desc(auc)))

# ── Step 4: Write calibrated config for Python to read ────────────
write_json(as.list(weights),
           path = "config/convergence_weights.json",
           auto_unbox = TRUE)
write_json(
  setNames(as.list(thresholds$threshold), thresholds$module),
  path = "config/module_thresholds.json",
  auto_unbox = TRUE
)

cat("\nCalibration written to config/.\n")

How all the parameters connect
Every parameter marked [CALIBRATE] in the feature formulas feeds into a single calibration loop. The R script reads scores from PostgreSQL, runs the logistic regression, and writes two JSON files. The Python convergence engine reads those JSON files at startup. When you add new corpus data — more fraud cases, more control companies — you re-run the R script and restart Python. The thresholds update automatically without touching any Python code.
The starting parameter values given above are educated guesses informed by the academic NLP literature on financial text analysis. Most of them will move after you run the corpus. The ones most likely to move significantly are the embedding similarity thresholds for M3 (SAME_TOPIC_THRESHOLD of 0.72 may be too tight or too loose depending on how FinBERT handles financial language), the DELTA_THRESHOLD for M6 (short investor updates produce noisier stylometric profiles than the academic literature assumes), and the MODULE_WEIGHTS (M1 and M3 will likely receive higher weights than M6 and M8 once the corpus validates the relative signal strengths).


## Task instructions
Analyze the updates according to the parameters given in the R codes`;
}
