-- Content: health articles

CREATE TABLE health_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  body text NOT NULL,
  category text,
  author_name text,
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT health_articles_slug_unique UNIQUE (slug)
);

-- Indexes
CREATE INDEX idx_health_articles_slug ON health_articles(slug);
CREATE INDEX idx_health_articles_category ON health_articles(category);
CREATE INDEX idx_health_articles_published ON health_articles(is_published, published_at DESC);

-- Triggers
CREATE TRIGGER trg_health_articles_updated_at
  BEFORE UPDATE ON health_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE health_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "public_read_published_articles" ON health_articles
  FOR SELECT USING (is_published = true);

-- Admins manage all articles
CREATE POLICY "admins_manage_articles" ON health_articles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
