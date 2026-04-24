CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  source_text TEXT NOT NULL,
  source_format TEXT NOT NULL DEFAULT 'plain',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE document_sections (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  section_index INT NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'paragraph',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rewrite_jobs (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  tone TEXT NOT NULL,
  strength TEXT NOT NULL,
  preserve_numbers BOOLEAN NOT NULL DEFAULT TRUE,
  preserve_entities BOOLEAN NOT NULL DEFAULT TRUE,
  preserve_links BOOLEAN NOT NULL DEFAULT TRUE,
  return_alternatives BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE section_rewrites (
  id UUID PRIMARY KEY,
  rewrite_job_id UUID NOT NULL REFERENCES rewrite_jobs(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES document_sections(id) ON DELETE CASCADE,
  chosen_candidate_id UUID,
  diagnostics JSONB,
  plan JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rewrite_candidates (
  id UUID PRIMARY KEY,
  section_rewrite_id UUID NOT NULL REFERENCES section_rewrites(id) ON DELETE CASCADE,
  candidate_index INT NOT NULL,
  text TEXT NOT NULL,
  semantic_score DOUBLE PRECISION,
  preservation_score DOUBLE PRECISION,
  naturalness_score DOUBLE PRECISION,
  repetition_score DOUBLE PRECISION,
  readability_score DOUBLE PRECISION,
  grammar_score DOUBLE PRECISION,
  final_score DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_feedback (
  id UUID PRIMARY KEY,
  rewrite_job_id UUID NOT NULL REFERENCES rewrite_jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES rewrite_candidates(id) ON DELETE SET NULL,
  rating INT,
  selected BOOLEAN DEFAULT FALSE,
  reason_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
