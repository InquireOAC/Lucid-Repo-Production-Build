
-- Create explore_videos table
CREATE TABLE public.explore_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  thumbnail_url text,
  youtube_url text NOT NULL,
  youtube_id text NOT NULL,
  duration text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'lucid-dreaming',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Create explore_articles table
CREATE TABLE public.explore_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  journal text,
  year integer,
  authors text NOT NULL DEFAULT '',
  key_finding text NOT NULL DEFAULT '',
  url text NOT NULL,
  category text NOT NULL DEFAULT 'lucid-dreaming',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.explore_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explore_articles ENABLE ROW LEVEL SECURITY;

-- Public can view active videos
CREATE POLICY "Anyone can view active videos"
  ON public.explore_videos FOR SELECT
  USING (is_active = true);

-- Admins have full access to videos
CREATE POLICY "Admins can manage videos"
  ON public.explore_videos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can view active articles
CREATE POLICY "Anyone can view active articles"
  ON public.explore_articles FOR SELECT
  USING (is_active = true);

-- Admins have full access to articles
CREATE POLICY "Admins can manage articles"
  ON public.explore_articles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed videos
INSERT INTO public.explore_videos (title, thumbnail_url, youtube_url, youtube_id, duration, author, category, sort_order) VALUES
('Lucid Dreaming Explained in 37 Minutes', 'https://img.youtube.com/vi/4NEWuE0quFU/mqdefault.jpg', 'https://www.youtube.com/watch?v=4NEWuE0quFU', '4NEWuE0quFU', '37:02', 'Tipharot', 'lucid-dreaming', 0),
('How to Lucid Dream (Science-Backed Tips!)', 'https://img.youtube.com/vi/sccjyNRg-YQ/mqdefault.jpg', 'https://www.youtube.com/watch?v=sccjyNRg-YQ', 'sccjyNRg-YQ', '12:16', 'Thomas Frank', 'lucid-dreaming', 1),
('The Science of Lucid Dreaming', 'https://img.youtube.com/vi/lYSX51xBkos/mqdefault.jpg', 'https://www.youtube.com/watch?v=lYSX51xBkos', 'lYSX51xBkos', '4:51', 'AsapSCIENCE', 'lucid-dreaming', 2),
('The DEILD Technique for Lucid Dreaming', 'https://img.youtube.com/vi/bnAQ5-ijDho/mqdefault.jpg', 'https://www.youtube.com/watch?v=bnAQ5-ijDho', 'bnAQ5-ijDho', '5:43', 'Daniel Love', 'lucid-dreaming', 3),
('How to Lucid Dream Tonight – 5 Proven Methods', 'https://img.youtube.com/vi/6pKFiE4kfEI/mqdefault.jpg', 'https://www.youtube.com/watch?v=6pKFiE4kfEI', '6pKFiE4kfEI', '12:03', 'Explore Lucid Dreaming', 'lucid-dreaming', 4),
('MILD Technique – Step by Step Guide', 'https://img.youtube.com/vi/w1LJeiJBHeA/mqdefault.jpg', 'https://www.youtube.com/watch?v=w1LJeiJBHeA', 'w1LJeiJBHeA', '11:15', 'Explore Lucid Dreaming', 'lucid-dreaming', 5),
('What Happens In Your Brain During Lucid Dreams', 'https://img.youtube.com/vi/rnWMpFSBi0g/mqdefault.jpg', 'https://www.youtube.com/watch?v=rnWMpFSBi0g', 'rnWMpFSBi0g', '10:29', 'SciShow Psych', 'lucid-dreaming', 6),
('11 Advanced Lucid Dreaming Secrets', 'https://img.youtube.com/vi/eMODBwPxRjc/mqdefault.jpg', 'https://www.youtube.com/watch?v=eMODBwPxRjc', 'eMODBwPxRjc', '22:14', 'Tipharot', 'lucid-dreaming', 7),
('How Meditation Works & Science-Based Effective Meditations', 'https://img.youtube.com/vi/wTBSGgbIvsY/mqdefault.jpg', 'https://www.youtube.com/watch?v=wTBSGgbIvsY', 'wTBSGgbIvsY', '2:04:06', 'Andrew Huberman', 'meditation', 0),
('The Best Science-Based Meditation for Focus & Productivity', 'https://img.youtube.com/vi/7TAi-8GofBk/mqdefault.jpg', 'https://www.youtube.com/watch?v=7TAi-8GofBk', '7TAi-8GofBk', '10:12', 'Better Than Yesterday', 'meditation', 1),
('How Meditation Changes Your Brain', 'https://img.youtube.com/vi/m8rRzTtP7Tc/mqdefault.jpg', 'https://www.youtube.com/watch?v=m8rRzTtP7Tc', 'm8rRzTtP7Tc', '6:31', 'AsapSCIENCE', 'meditation', 2),
('Meditation for Beginners – 20 Practical Tips', 'https://img.youtube.com/vi/o-kMJBWk9E0/mqdefault.jpg', 'https://www.youtube.com/watch?v=o-kMJBWk9E0', 'o-kMJBWk9E0', '15:23', 'Matt D''Avella', 'meditation', 3),
('Yoga Nidra: The Art of Conscious Sleep', 'https://img.youtube.com/vi/M0u9GST_j3s/mqdefault.jpg', 'https://www.youtube.com/watch?v=M0u9GST_j3s', 'M0u9GST_j3s', '20:00', 'Ally Boothroyd', 'meditation', 4),
('10-Minute Meditation For Sleep', 'https://img.youtube.com/vi/aEqlQvczMJQ/mqdefault.jpg', 'https://www.youtube.com/watch?v=aEqlQvczMJQ', 'aEqlQvczMJQ', '10:01', 'Goodful', 'meditation', 5),
('Jon Kabat-Zinn: Guided Mindfulness Meditation', 'https://img.youtube.com/vi/_DTmGtznab4/mqdefault.jpg', 'https://www.youtube.com/watch?v=_DTmGtznab4', '_DTmGtznab4', '43:02', 'Jon Kabat-Zinn', 'meditation', 6),
('Guided Body Scan Meditation for Deep Relaxation', 'https://img.youtube.com/vi/15q-N-_kkrU/mqdefault.jpg', 'https://www.youtube.com/watch?v=15q-N-_kkrU', '15q-N-_kkrU', '20:00', 'The Honest Guys', 'meditation', 7),
('Breathwork for Energy & Focus – Wim Hof Method', 'https://img.youtube.com/vi/tybOi4hjZFQ/mqdefault.jpg', 'https://www.youtube.com/watch?v=tybOi4hjZFQ', 'tybOi4hjZFQ', '11:48', 'Wim Hof', 'meditation', 8),
('Pranayama Breathing Techniques for Beginners', 'https://img.youtube.com/vi/IElHgJG5Fe4/mqdefault.jpg', 'https://www.youtube.com/watch?v=IElHgJG5Fe4', 'IElHgJG5Fe4', '15:37', 'Yoga With Adriene', 'meditation', 9),
('Guided Chakra Meditation – Energy Healing', 'https://img.youtube.com/vi/mEL8GJhMo-I/mqdefault.jpg', 'https://www.youtube.com/watch?v=mEL8GJhMo-I', 'mEL8GJhMo-I', '30:12', 'Michael Sealey', 'meditation', 10),
('Energy Control Breathing – Box Breathing Technique', 'https://img.youtube.com/vi/n6RbW2LtdFs/mqdefault.jpg', 'https://www.youtube.com/watch?v=n6RbW2LtdFs', 'n6RbW2LtdFs', '5:30', 'Mark Divine', 'meditation', 11);

-- Seed articles
INSERT INTO public.explore_articles (title, journal, year, authors, key_finding, url, category, sort_order) VALUES
('Lucid Dreaming: A State of Consciousness with Features of Both Waking and Non-Lucid Dreaming', 'Sleep', 2009, 'Voss, U., Holzmann, R., Tuin, I., & Hobson, J.A.', 'Lucid dreaming activates a unique hybrid brain state combining features of both waking and REM sleep, with increased frontal cortex activity.', 'https://doi.org/10.1093/sleep/32.9.1191', 'lucid-dreaming', 0),
('Induction of Self-Awareness in Dreams Through Frontal Low Current Stimulation of Gamma Activity', 'Nature Neuroscience', 2014, 'Voss, U., Holzmann, R., Hobson, J.A., et al.', 'Applying 40 Hz electrical stimulation to the frontal cortex during REM sleep induced lucid dreaming in 77% of trials.', 'https://doi.org/10.1038/nn.3719', 'lucid-dreaming', 1),
('Induction of Lucid Dreams: A Systematic Review of Evidence', 'Consciousness and Cognition', 2012, 'Stumbrys, T., Erlacher, D., Schädlich, M., & Schredl, M.', 'MILD and WBTB techniques showed the strongest evidence for reliably inducing lucid dreams among all tested methods.', 'https://doi.org/10.1016/j.concog.2012.07.003', 'lucid-dreaming', 2),
('Reality Testing and the Mnemonic Induction of Lucid Dreams', 'Dreaming', 2017, 'Aspy, D.J., Delfabbro, P., Proeve, M., & Mohr, P.', 'Combining MILD with WBTB achieved a 46% success rate for lucid dreaming in a single night — the highest recorded in a prospective study.', 'https://doi.org/10.1037/drm0000059', 'lucid-dreaming', 3),
('Psychophysiological Correlates of Lucid Dreaming', 'Perceptual and Motor Skills', 1981, 'LaBerge, S., Nagel, L., Dement, W.C., & Zarcone, V.', 'First scientific proof that lucid dreaming occurs during REM sleep, verified through pre-arranged eye signal communication.', 'https://doi.org/10.2466/pms.1981.52.3.727', 'lucid-dreaming', 4),
('Mindfulness Practice Leads to Increases in Regional Brain Gray Matter Density', 'Psychiatry Research: Neuroimaging', 2011, 'Hölzel, B.K., Carmody, J., Vangel, M., et al.', '8 weeks of mindfulness meditation increased gray matter density in brain regions linked to learning, memory, and emotional regulation.', 'https://doi.org/10.1016/j.pscychresns.2010.08.006', 'meditation', 0),
('Meditation Experience Is Associated with Differences in Default Mode Network Activity and Connectivity', 'Proceedings of the National Academy of Sciences', 2011, 'Brewer, J.A., Worhunsky, P.D., Gray, J.R., et al.', 'Experienced meditators showed decreased activity in the default mode network, the brain''s ''wandering mind'' system.', 'https://doi.org/10.1073/pnas.1112029108', 'meditation', 1),
('A Randomized Controlled Trial of Mindfulness Meditation for Generalized Anxiety Disorder', 'The Journal of Clinical Psychiatry', 2013, 'Hoge, E.A., Bui, E., Marques, L., et al.', 'Mindfulness-based stress reduction significantly reduced anxiety symptoms compared to an active control group.', 'https://doi.org/10.4088/JCP.12m08083', 'meditation', 2),
('Alterations in Brain and Immune Function Produced by Mindfulness Meditation', 'Psychosomatic Medicine', 2003, 'Davidson, R.J., Kabat-Zinn, J., Schumacher, J., et al.', '8-week meditation program increased left-sided anterior brain activation (associated with positive affect) and boosted immune response.', 'https://doi.org/10.1097/01.PSY.0000077505.67574.E3', 'meditation', 3),
('Effect of Mindfulness-Based Stress Reduction vs Cognitive Behavioral Therapy on Sleep Quality', 'JAMA Internal Medicine', 2015, 'Black, D.S., O''Reilly, G.A., Olmstead, R., et al.', 'Mindfulness meditation significantly improved sleep quality in older adults with moderate sleep disturbances.', 'https://doi.org/10.1001/jamainternmed.2014.8081', 'meditation', 4);
