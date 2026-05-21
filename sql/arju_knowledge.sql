-- ════════════════════════════════════════════════════════════════
-- ArjunaFit — Arju Knowledge Center SQL
-- admin-arju-knowledge-center-v1
-- EXECUTE IN: Supabase SQL Editor → Run All
-- ════════════════════════════════════════════════════════════════

-- ── 1. Documents table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arju_knowledge_documents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text NULL,
  category         text NOT NULL DEFAULT 'general',
  source_type      text NOT NULL DEFAULT 'manual',   -- manual | file | json
  source_name      text NULL,
  file_url         text NULL,
  file_path        text NULL,
  original_filename text NULL,
  mime_type        text NULL,
  tags             text[] DEFAULT '{}',
  language         text DEFAULT 'es',
  status           text DEFAULT 'active',            -- active | inactive | archived
  created_by       uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category
  ON public.arju_knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status
  ON public.arju_knowledge_documents(status);

-- ── 2. Chunks table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arju_knowledge_chunks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     uuid NOT NULL REFERENCES public.arju_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index     integer NOT NULL,
  content         text NOT NULL,
  category        text NULL,
  tags            text[] DEFAULT '{}',
  token_estimate  integer NULL,
  -- embedding vector(1536) NULL,  -- uncomment when pgvector enabled
  metadata_json   jsonb DEFAULT '{}'::jsonb,
  status          text DEFAULT 'active',
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document
  ON public.arju_knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_category
  ON public.arju_knowledge_chunks(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_status
  ON public.arju_knowledge_chunks(status);

-- Full-text search index on content (for keyword search without embeddings)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_content_trgm
  ON public.arju_knowledge_chunks USING gin(content gin_trgm_ops);
-- If pg_trgm not available, use this instead:
-- CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_content
--   ON public.arju_knowledge_chunks USING gin(to_tsvector('spanish', content));

-- ── 3. Tests table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.arju_knowledge_tests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  query           text NOT NULL,
  product_type    text NULL,
  mode            text NULL,
  retrieved_chunks jsonb DEFAULT '[]'::jsonb,
  answer_preview  text NULL,
  created_at      timestamptz DEFAULT now()
);

-- ── 4. Auto-update updated_at trigger ────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_knowledge_docs_updated ON public.arju_knowledge_documents;
CREATE TRIGGER trg_knowledge_docs_updated
  BEFORE UPDATE ON public.arju_knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. Enable RLS ────────────────────────────────────────────────
ALTER TABLE public.arju_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arju_knowledge_chunks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arju_knowledge_tests     ENABLE ROW LEVEL SECURITY;

-- ── 6. Drop old policies if they exist ───────────────────────────
DROP POLICY IF EXISTS "Admins can manage knowledge documents" ON public.arju_knowledge_documents;
DROP POLICY IF EXISTS "Admins can manage knowledge chunks"    ON public.arju_knowledge_chunks;
DROP POLICY IF EXISTS "Admins can manage knowledge tests"     ON public.arju_knowledge_tests;
DROP POLICY IF EXISTS "kn_docs_admin_all"    ON public.arju_knowledge_documents;
DROP POLICY IF EXISTS "kn_chunks_admin_all"  ON public.arju_knowledge_chunks;
DROP POLICY IF EXISTS "kn_tests_admin_all"   ON public.arju_knowledge_tests;

-- ── 7. Admin-only policies ────────────────────────────────────────
CREATE POLICY "kn_docs_admin_all"
ON public.arju_knowledge_documents FOR ALL TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "kn_chunks_admin_all"
ON public.arju_knowledge_chunks FOR ALL TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "kn_tests_admin_all"
ON public.arju_knowledge_tests FOR ALL TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ── 8. Verify ────────────────────────────────────────────────────
SELECT
  t.tablename,
  p.policyname,
  p.cmd
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.tablename LIKE 'arju_knowledge%'
AND t.schemaname = 'public'
ORDER BY t.tablename, p.cmd;
