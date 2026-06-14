/**
 * projects.js — Shared data layer for portfolio projects, skills, courses & experience
 * Uses localStorage for persistence across pages
 */

const STORAGE_KEYS = {
  PROJECTS:   'portfolio_projects',
  SKILLS:     'portfolio_skills',
  COURSES:    'portfolio_courses',
  EXPERIENCE: 'portfolio_experience',
  META:       'portfolio_meta',
};

/* ── Default seed data ─────────────────────────────────────── */
const DEFAULT_META = {
  name:     'Seif H. Eltaweel',
  role:     'Data Scientist & ML Engineer',
  bio:      'Data Scientist with a passion to use data analysis and machine learning to help solve real-life problems. I turn raw data into actionable insights and build predictive models that drive smarter decisions.',
  email:    '',
  github:   'https://github.com/Seif-Eltaweel',
  linkedin: 'https://www.linkedin.com/in/seif-hussien/',
  twitter:  '',
  cvUrl:    '',
  avatarUrl: '',
  googleAnalyticsId: '',
  password: 'admin123',
  // Section visibility — true = visible
  sections: {
    about:      true,
    skills:     true,
    experience: true,
    courses:    true,
    projects:   true,
    contact:    true,
  },
};

const DEFAULT_SKILLS = [
  { id: 's1', name: 'Python',           icon: '🐍', level: 'Expert'       },
  { id: 's2', name: 'Machine Learning', icon: '🤖', level: 'Advanced'     },
  { id: 's3', name: 'SQL & Databases',  icon: '🗄️', level: 'Advanced'    },
  { id: 's4', name: 'Docker & DevOps',  icon: '🐳', level: 'Intermediate' },
  { id: 's5', name: 'Figma',            icon: '🎨', level: 'Intermediate' },
  { id: 's6', name: 'Deep Learning',    icon: '🧠', level: 'Advanced'     },
  { id: 's7', name: 'Data Visualization', icon: '📊', level: 'Advanced'   },
  { id: 's8', name: 'Power BI',         icon: '📈', level: 'Advanced'     },
  { id: 's9', name: 'Pandas & NumPy',   icon: '🐼', level: 'Expert'       },
  { id: 's10', name: 'NLP / RAG',       icon: '💬', level: 'Intermediate' },
  { id: 's11', name: 'Google Sheets',   icon: '📋', level: 'Advanced'     },
  { id: 's12', name: 'Scikit-learn',    icon: '⚙️', level: 'Advanced'     },
];

const DEFAULT_COURSES = [
  {
    id:          'c1',
    title:       'Data Science Specialization',
    provider:    'Coursera / Johns Hopkins',
    description: 'Comprehensive data science track covering R, statistics, machine learning, and reproducible research.',
    icon:        '📚',
    date:        '2023',
    url:         '',
  },
];

const DEFAULT_EXPERIENCE = [
  {
    id:       'e1',
    period:   '2025 — Present',
    role:     'Data Scientist',
    company:  'Building ML & Data Projects · Freelance / Personal',
    description: 'End-to-end ML projects: RAG-based customer segmentation, house price prediction with deployment, decision tree regression models, and NLP pipelines.',
  },
  {
    id:       'e2',
    period:   '2023 — 2024',
    role:     'Data Analyst & Researcher',
    company:  'Portfolio Projects · Self-directed',
    description: 'Analyzed national agriculture data with Python, built interactive Power BI dashboards for water access development, and explored SDG 6 data for clean water & sanitation.',
  },
  {
    id:       'e3',
    period:   '2023',
    role:     'SQL & Data Analytics',
    company:  'Learning & Building · Self-taught',
    description: 'Mastered SQL through hands-on projects like the TMDB Movies Database analysis, while building data visualization skills with Google Sheets and Power BI.',
  },
];

const DEFAULT_PROJECTS = [
  {
    id:          'p1',
    title:       'Python Agriculture Data Analysis',
    description: 'Data analysis using Python that helped in solving the agriculture problem of a whole nation. Explored key agricultural metrics, performed EDA, and delivered actionable insights for policy-making.',
    tags:        ['Python', 'Data Analysis', 'Pandas', 'Matplotlib'],
    imageUrl:    '',
    emoji:       '🌾',
    demoUrl:     '',
    githubUrl:   'https://github.com/Seif-Eltaweel/Seif-Data-Science-Portfolio/tree/main/Python_agri_project',
    videoUrl:    '',
    difficulty:  'Intermediate',
    showDemo:    false,
    showGithub:  true,
    showVideo:   false,
    featured:    true,
  },
  {
    id:          'p2',
    title:       'SDG 6: Clean Water — Google Sheets Analysis',
    description: 'Explores UN Sustainable Development Goal 6 (SDG 6): Clean Water and Sanitation, using data from the WHO/UNICEF Joint Monitoring Programme (JMP). Analyzes global inequalities in access to safe drinking water from 2000 to 2020, focusing on urban vs. rural disparities.',
    tags:        ['Google Sheets', 'Data Analysis', 'SDG', 'Visualization'],
    imageUrl:    '',
    emoji:       '💧',
    demoUrl:     'https://docs.google.com/spreadsheets/d/1gbgzMAZo0XPmiiFw5TvPC88yIYSsK7WYBrHizP0OVZw/edit?usp=sharing',
    githubUrl:   '',
    videoUrl:    '',
    difficulty:  'Beginner',
    showDemo:    true,
    showGithub:  false,
    showVideo:   false,
    featured:    false,
  },
  {
    id:          'p3',
    title:       'SQL Data Analysis — The Movies Database',
    description: 'Explored The Movie Database (TMDB), a comprehensive dataset containing information about movies, TV shows, actors, genres, and awards. Using SQL and data analysis techniques, answered a series of questions to uncover insights about the film industry.',
    tags:        ['SQL', 'Data Analysis', 'TMDB', 'Python'],
    imageUrl:    '',
    emoji:       '🎬',
    demoUrl:     '',
    githubUrl:   'https://github.com/Seif-Eltaweel/Seif-Data-Science-Portfolio/blob/main/Movie_project.ipynb',
    videoUrl:    '',
    difficulty:  'Intermediate',
    showDemo:    false,
    showGithub:  true,
    showVideo:   false,
    featured:    true,
  },
  {
    id:          'p4',
    title:       'Power BI — Water Access Development Dashboard',
    description: 'Moderates and analyzes national water development data using Power BI and other analytics tools, tracking key metrics to support informed decision-making on sustainable water management. Interactive dashboards enhance transparency while data-driven recommendations improve water infrastructure.',
    tags:        ['Power BI', 'Data Visualization', 'Dashboard', 'Analytics'],
    imageUrl:    '',
    emoji:       '📊',
    demoUrl:     'https://drive.google.com/file/d/1ky3wDsTx9VkreCLoAOebfK3rOSR_zFgT/view?usp=sharing',
    githubUrl:   '',
    videoUrl:    '',
    difficulty:  'Intermediate',
    showDemo:    true,
    showGithub:  false,
    showVideo:   false,
    featured:    false,
  },
  {
    id:          'p5',
    title:       'Decision Tree Regression Model',
    description: 'Builds a Decision Tree Regression model to predict population growth rates from 1960-2017. Involves calculating growth rates, splitting data into even-year training and odd-year testing sets, training the model, and evaluating performance using Root Mean Squared Logarithmic Error (RMSLE).',
    tags:        ['Python', 'Machine Learning', 'Scikit-learn', 'Decision Tree'],
    imageUrl:    '',
    emoji:       '🌳',
    demoUrl:     '',
    githubUrl:   'https://github.com/Seif-Eltaweel/Seif-Data-Science-Portfolio/blob/main/Decision_tree_Project/Decision_tree_Project.ipynb',
    videoUrl:    '',
    difficulty:  'Advanced',
    showDemo:    false,
    showGithub:  true,
    showVideo:   false,
    featured:    false,
  },
  {
    id:          'p6',
    title:       'House Price Prediction in Beijing',
    description: 'An end-to-end project covering data analysis, ML model training, and deployment for housing data in Beijing from 2013 to 2017. Predicts house prices using feature engineering and regression models.',
    tags:        ['Python', 'Machine Learning', 'Regression', 'Deployment'],
    imageUrl:    '',
    emoji:       '🏠',
    demoUrl:     '',
    githubUrl:   'https://github.com/Seif-Eltaweel/Seif-Data-Science-Portfolio/tree/main/BJ-Housing%20price%20prediction',
    videoUrl:    '',
    difficulty:  'Advanced',
    showDemo:    false,
    showGithub:  true,
    showVideo:   false,
    featured:    true,
  },
  {
    id:          'p7',
    title:       'RAG Fintech Customer Segmentation',
    description: 'Demonstrates how raw customer transaction records are transformed into retrievable monthly documents and queried via a lightweight RAG loop. Combines NLP, embeddings, and retrieval-augmented generation for intelligent customer segmentation.',
    tags:        ['Python', 'RAG', 'NLP', 'LLM', 'Fintech'],
    imageUrl:    '',
    emoji:       '🤖',
    demoUrl:     '',
    githubUrl:   'https://github.com/Seif-Eltaweel/Seif-Data-Science-Portfolio/tree/main/RAG_project_for_customer_segementation',
    videoUrl:    '',
    difficulty:  'Expert',
    showDemo:    false,
    showGithub:  true,
    showVideo:   false,
    featured:    true,
  },
];

function safeParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Error parsing JSON from localStorage:', e);
    return fallback;
  }
}

/* ── Data Access Layer ─────────────────────────────────────── */
export const DataStore = {
  _data: null,

  async loadRemoteData() {
    try {
      // Use no-cache or fetch cache-busting to ensure we always get latest file from GitHub Pages
      const res = await fetch('./data/portfolio_data.json?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        this._data = json;
        // Warm up localStorage caches
        localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(json.meta || {}));
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(json.projects || []));
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(json.skills || []));
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(json.courses || []));
        localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(json.experience || []));
        return json;
      }
    } catch (e) {
      console.warn('Could not load portfolio_data.json, falling back to localStorage cache:', e);
    }
    
    // Fallback: populate from localStorage
    this._data = {
      meta: this.getMeta(),
      projects: this.getProjects(),
      skills: this.getSkills(),
      courses: this.getCourses(),
      experience: this.getExperience()
    };
    return this._data;
  },

  getAllData() {
    return {
      meta: this.getMeta(),
      projects: this.getProjects(),
      skills: this.getSkills(),
      courses: this.getCourses(),
      experience: this.getExperience()
    };
  },

  // --- Meta / Profile ---
  getMeta() {
    if (this._data && this._data.meta) {
      return { ...DEFAULT_META, ...this._data.meta, sections: { ...DEFAULT_META.sections, ...(this._data.meta.sections || {}) } };
    }
    const raw = localStorage.getItem(STORAGE_KEYS.META);
    const parsed = safeParse(raw, null);
    if (parsed) {
      return { ...DEFAULT_META, ...parsed, sections: { ...DEFAULT_META.sections, ...(parsed.sections || {}) } };
    }
    return { ...DEFAULT_META };
  },
  saveMeta(meta) {
    if (this._data) this._data.meta = meta;
    localStorage.setItem(STORAGE_KEYS.META, JSON.stringify(meta));
  },

  // --- Projects ---
  getProjects() {
    if (this._data && this._data.projects) return this._data.projects;
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      this.saveProjects(DEFAULT_PROJECTS);
      return [...DEFAULT_PROJECTS];
    }
    return safeParse(raw, DEFAULT_PROJECTS);
  },
  saveProjects(projects) {
    if (this._data) this._data.projects = projects;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },
  addProject(project) {
    const projects = this.getProjects();
    const newProj  = { ...project, id: 'p' + Date.now() };
    projects.push(newProj);
    this.saveProjects(projects);
    return newProj;
  },
  updateProject(id, updates) {
    const projects = this.getProjects().map(p => p.id === id ? { ...p, ...updates } : p);
    this.saveProjects(projects);
  },
  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    this.saveProjects(projects);
  },

  // --- Skills ---
  getSkills() {
    if (this._data && this._data.skills) return this._data.skills;
    const raw = localStorage.getItem(STORAGE_KEYS.SKILLS);
    if (!raw) {
      this.saveSkills(DEFAULT_SKILLS);
      return [...DEFAULT_SKILLS];
    }
    return safeParse(raw, DEFAULT_SKILLS);
  },
  saveSkills(skills) {
    if (this._data) this._data.skills = skills;
    localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
  },
  addSkill(skill) {
    const skills   = this.getSkills();
    const newSkill = { ...skill, id: 's' + Date.now() };
    skills.push(newSkill);
    this.saveSkills(skills);
    return newSkill;
  },
  updateSkill(id, updates) {
    const skills = this.getSkills().map(s => s.id === id ? { ...s, ...updates } : s);
    this.saveSkills(skills);
  },
  deleteSkill(id) {
    const skills = this.getSkills().filter(s => s.id !== id);
    this.saveSkills(skills);
  },

  // --- Courses ---
  getCourses() {
    if (this._data && this._data.courses) return this._data.courses;
    const raw = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!raw) {
      this.saveCourses(DEFAULT_COURSES);
      return [...DEFAULT_COURSES];
    }
    return safeParse(raw, DEFAULT_COURSES);
  },
  saveCourses(courses) {
    if (this._data) this._data.courses = courses;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },
  addCourse(course) {
    const courses    = this.getCourses();
    const newCourse  = { ...course, id: 'c' + Date.now() };
    courses.push(newCourse);
    this.saveCourses(courses);
    return newCourse;
  },
  updateCourse(id, updates) {
    const courses = this.getCourses().map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveCourses(courses);
  },
  deleteCourse(id) {
    const courses = this.getCourses().filter(c => c.id !== id);
    this.saveCourses(courses);
  },

  // --- Experience ---
  getExperience() {
    if (this._data && this._data.experience) return this._data.experience;
    const raw = localStorage.getItem(STORAGE_KEYS.EXPERIENCE);
    if (!raw) {
      this.saveExperience(DEFAULT_EXPERIENCE);
      return [...DEFAULT_EXPERIENCE];
    }
    return safeParse(raw, DEFAULT_EXPERIENCE);
  },
  saveExperience(experience) {
    if (this._data) this._data.experience = experience;
    localStorage.setItem(STORAGE_KEYS.EXPERIENCE, JSON.stringify(experience));
  },
  addExperience(item) {
    const exp     = this.getExperience();
    const newItem = { ...item, id: 'e' + Date.now() };
    exp.push(newItem);
    this.saveExperience(exp);
    return newItem;
  },
  updateExperience(id, updates) {
    const exp = this.getExperience().map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveExperience(exp);
  },
  deleteExperience(id) {
    const exp = this.getExperience().filter(e => e.id !== id);
    this.saveExperience(exp);
  },

  // --- Auth ---
  checkPassword(input) {
    const meta = this.getMeta();
    return input === meta.password;
  },
};
