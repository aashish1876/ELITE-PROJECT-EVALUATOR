/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import OpenAI from "openai";
import { 
  Search, 
  Rocket, 
  Brain, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Share2, 
  UserCheck, 
  MessageSquareQuote,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ClipboardCheck,
  Clipboard,
  File,
  Upload,
  X,
  FileCode,
  History,
  Download,
  Lightbulb,
  Shield,
  Zap,
  Code2,
  Terminal,
  Cpu,
  Globe,
  Award,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Trophy,
  Star,
  Github,
  GitBranch,
  GitCommit,
  Sparkles,
  Copy,
  History as HistoryIcon,
  Link as LinkIcon,
  Mic,
  Wand2,
  Volume2,
  Presentation,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';

// Initialize Groq (OpenAI-compatible)
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

const EVALUATION_PROMPT = `
You are an elite panel of experts combined into one system:
- Senior Software Engineer (10+ years experience)
- Technical Interviewer (FAANG-level)
- System Architect
- Open-source Reviewer (GitHub standards)
- Startup Product Manager

Your task is to perform a DEEP, HONEST, and STRICT evaluation of a developer's project.
You are NOT a chatbot. You are a professional evaluator whose job is to judge real-world quality.

Follow these phases strictly:

🔍 PHASE 1: UNDERSTAND THE PROJECT
Clearly explain what the project does. Identify core purpose, target users, and innovation level.

🚀 PHASE 2: PROJECT SCORING (STRICT EVALUATION)
Give scores (out of 10) for: Code Quality, Logic, Structure, Scalability, Usefulness, UI/UX, Innovation, Performance.
Calculate ⭐ FINAL SCORE (average, strict rating).
RULE: Do NOT give high scores easily. Most student projects should fall between 4–7 unless exceptional.

🧠 PHASE 3: DEVELOPER PROFILING
Determine Skill Level (Beginner/Intermediate/Advanced/Professional), Thinking Style, and Strength Type.

📊 PHASE 4: CODE & ARCHITECTURE REVIEW
Analyze readability, modularity, naming, reusability, error handling, efficiency. Detect bad practices or AI-generated patterns.

❌ PHASE 5: WEAKNESS BREAKDOWN
Give brutally honest issues: Technical flaws, missing features, poor design, scalability problems. Be specific.

✅ PHASE 6: STRENGTH ANALYSIS
Highlight smart decisions, clean implementations, good ideas.

🚀 PHASE 7: INDUSTRY UPGRADE PLAN
Roadmap to Internship, Product, and Startup level. Include features, tech, and architecture improvements.

💡 PHASE 8: VIRAL & GITHUB IMPACT STRATEGY
Suggest features to stand out, impress recruiters, and make it "star-worthy".

🎯 PHASE 9: HIRING DECISION
Final verdict: Hire, Maybe, No Hire. With a clear reason.

📣 PHASE 10: ONE-LINE TRUTH
A brutally honest one-line summary.

📊 PHASE 11: DATA BLOCK (JSON)
At the VERY end of your response, provide a JSON block enclosed in triple backticks with the language set to 'json'.
The JSON must contain the scores for the radar chart and summary.
Format:
\`\`\`json
{
  "scores": {
    "Code Quality": 7,
    "Logic": 6,
    "Structure": 8,
    "Scalability": 5,
    "Usefulness": 9,
    "UI/UX": 7,
    "Innovation": 6,
    "Performance": 5
  },
  "final_score": 6.6,
  "skill_level": "Intermediate",
  "hiring_verdict": "Maybe"
}
\`\`\`

STRICT RULES:
- Be honest, not polite.
- Avoid generic AI responses.
- Think like a real interviewer.
- Give structured, clean output.
- Prioritize depth over length.
- Compare with industry standards (FAANG, top startups).
`;

const AI_DETECTOR_PROMPT = `
Analyze the following project/code and estimate whether it is AI-generated.

Return:

AI Generation Probability: __%

Reasons:
- Pattern 1
- Pattern 2
- Pattern 3

Check for:
- Repetitive structure
- Generic naming
- Over-optimized or too-perfect formatting
- Lack of human inconsistency

Be realistic, not extreme.
`;

const RECRUITER_PROMPT = `
Act as a strict technical recruiter reviewing this project for hiring.

Focus ONLY on hiring perspective.

Return:

🔴 Red Flags:
- Issue 1
- Issue 2

🟢 Strong Points:
- Point 1
- Point 2

📄 Resume Impact:
(Does this project strengthen a resume?)

🎯 Hiring Decision:
(Hire / Maybe / No Hire)

Be strict and realistic.
`;

const COMPARISON_PROMPT = `
Compare the following two projects as a senior engineer.

Return:

🏆 Winner: (Project A / Project B)

📊 Comparison:
- Code Quality: A vs B
- Innovation: A vs B
- Practical Use: A vs B

🧠 Final Reason:
(Why the winner is better)

Be clear and decisive.
`;

const ROAST_PROMPT = `
Roast this project in a brutally honest but funny way.

Rules:
- 1 or 2 lines only
- No explanation
- Slightly harsh but not abusive
`;

const CAREER_PROMPT = `
Evaluate how this project impacts a developer's career.

Return:

📊 Resume Strength Score: X/10  
📈 Interview Chance: (Low / Medium / High)

💼 Recruiter Impression:
(Short explanation)

🚀 What is missing to make it job-ready:
- Point 1
- Point 2
`;

const README_PROMPT = `
Generate a professional GitHub README for this project.

Include:
- Title
- Description
- Features
- Tech Stack
- Future Improvements

Keep it clean, attractive, and concise.
`;

const SCORE_CARD_PROMPT = `
From the following evaluation output, extract and format a clean, minimal "Score Card".

Output ONLY in this format:

Project Score: X/10  
Skill Level: ___  
AI Probability: ___%  
Verdict: ___  

Keep it short, clean, and professional.
`;

const INTERVIEW_PROMPT = `
Generate 5 custom, high-pressure technical interview questions based on the flaws and logic found in this project.
Focus on:
- Edge cases
- Scalability
- Security vulnerabilities
- Design pattern choices
- Performance bottlenecks

Format:
Q1: [Question]
A1: [Expected Answer/Key Points]
...
`;

const REFACTOR_PROMPT = `
Act as a Principal Engineer at a FAANG company. Refactor the provided code to be production-ready, highly scalable, and following best practices.
Show the refactored code and explain the key improvements made.
Focus on:
- Clean Code principles
- Design Patterns
- Performance optimization
- Error handling
`;

const PITCH_PROMPT = `
Analyze this project's market potential and generate a 5-slide startup pitch deck outline.
Slides:
1. Problem Statement
2. Solution (The Project)
3. Market Opportunity
4. Business Model
5. Roadmap

Keep it professional, persuasive, and visionary.
`;

type EvalMode = 'elite' | 'ai_detector' | 'recruiter' | 'comparison' | 'roast' | 'career' | 'readme' | 'interview' | 'refactor' | 'pitch';

export default function App() {
  const [projectInput, setProjectInput] = useState('');
  const [projectBInput, setProjectBInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; content: string; preview: string }[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);
  const [scoreCard, setScoreCard] = useState<string | null>(null);
  const [isGeneratingScoreCard, setIsGeneratingScoreCard] = useState(false);
  const [parsedScores, setParsedScores] = useState<any>(null);
  const [history, setHistory] = useState<{ id: string; date: string; title: string; result: string; scores?: any; mode?: EvalMode }[]>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [inputMode, setInputMode] = useState<'manual' | 'git'>('manual');
  const [evalMode, setEvalMode] = useState<EvalMode>('elite');
  
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopSpeaking = () => {
    setIsSpeaking(false);
  };

  const speakEvaluation = async () => {
    alert("TTS not supported");
  };

  const [gitUrl, setGitUrl] = useState('');
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCommit, setSelectedCommit] = useState<any>(null);
  const [isFetchingRepo, setIsFetchingRepo] = useState(false);
  const [isFetchingCommits, setIsFetchingCommits] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const loadingSteps = [
    "Senior Engineer: Analyzing code patterns...",
    "System Architect: Reviewing scalability...",
    "Technical Interviewer: Preparing brutal feedback...",
    "Product Manager: Assessing market viability...",
    "Open Source Reviewer: Checking standards...",
    "Finalizing expert consensus..."
  ];

  useEffect(() => {
    const savedHistory = localStorage.getItem('eval_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    let interval: any;
    if (isEvaluating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingSteps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  const extractScores = (text: string) => {
    try {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
    } catch (e) {
      console.error("Failed to parse scores from response", e);
    }
    return null;
  };

  const saveToHistory = (result: string, scores: any) => {
    const title = result.split('\n').find(l => l.includes('PHASE 1'))?.replace(/.*PHASE 1: /i, '').slice(0, 40) || "Project Evaluation";
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      title: title + "...",
      result,
      scores
    };
    const updatedHistory = [newEntry, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('eval_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (entry: any) => {
    setEvaluationResult(entry.result);
    setParsedScores(entry.scores || extractScores(entry.result));
    setProjectInput('');
    setUploadedFiles([]);
  };

  const resetEvaluation = () => {
    stopSpeaking();
    setEvaluationResult(null);
    setScoreCard(null);
    setParsedScores(null);
    setProjectInput('');
    setProjectBInput('');
    setUploadedFiles([]);
    setGitUrl('');
    setBranches([]);
    setCommits([]);
    setSelectedBranch('');
    setSelectedCommit(null);
    setError(null);
  };

  const downloadMarkdown = () => {
    if (!evaluationResult) return;
    const blob = new Blob([evaluationResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setProjectInput(`// Example: Simple Express API
const express = require('express');
const app = express();

app.get('/user/:id', (req, res) => {
  const user = database.find(req.params.id); // Potential bug: database not defined
  res.send(user);
});

app.listen(3000);`);
  };

  const parseGithubUrl = (url: string) => {
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    return null;
  };

  const fetchRepoInfo = async () => {
    const repoInfo = parseGithubUrl(gitUrl);
    if (!repoInfo) {
      setError("Invalid GitHub URL. Please use format: https://github.com/owner/repo");
      return;
    }

    setIsFetchingRepo(true);
    setError(null);
    try {
      // Fetch branches
      const branchesRes = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches`);
      if (!branchesRes.ok) throw new Error("Failed to fetch branches. Is the repo public?");
      const branchesData = await branchesRes.json();
      const branchNames = branchesData.map((b: any) => b.name);
      setBranches(branchNames);
      
      const defaultBranch = branchNames.includes('main') ? 'main' : (branchNames.includes('master') ? 'master' : branchNames[0]);
      setSelectedBranch(defaultBranch);
      
      // Fetch commits for default branch
      await fetchCommits(repoInfo.owner, repoInfo.repo, defaultBranch);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingRepo(false);
    }
  };

  const fetchCommits = async (owner: string, repo: string, branch: string) => {
    setIsFetchingCommits(true);
    try {
      const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=10`);
      if (!commitsRes.ok) throw new Error("Failed to fetch commits.");
      const commitsData = await commitsRes.json();
      setCommits(commitsData);
      setSelectedCommit(commitsData[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetchingCommits(false);
    }
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    const repoInfo = parseGithubUrl(gitUrl);
    if (repoInfo) {
      fetchCommits(repoInfo.owner, repoInfo.repo, branch);
    }
  };

  const fetchGitFiles = async (owner: string, repo: string, sha: string) => {
    try {
      // Get the tree for the commit
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`);
      if (!treeRes.ok) throw new Error("Failed to fetch repository tree.");
      const treeData = await treeRes.json();
      
      // Filter for source files (limit to 30 files to avoid prompt bloat)
      const sourceFiles = treeData.tree
        .filter((item: any) => item.type === 'blob' && item.path.match(/\.(ts|tsx|js|jsx|json|md|py|go|rs|java|cpp|c|h|php|rb|sh|yml|yaml)$/i))
        .filter((item: any) => 
          !item.path.includes('node_modules') && 
          !item.path.includes('package-lock.json') && 
          !item.path.includes('yarn.lock') &&
          !item.path.includes('pnpm-lock.yaml') &&
          !item.path.includes('dist/') && 
          !item.path.includes('.git/') &&
          !item.path.includes('.next/') &&
          !item.path.includes('build/')
        )
        .slice(0, 30);

      const fileContents = await Promise.all(sourceFiles.map(async (file: any) => {
        try {
          const contentRes = await fetch(file.url);
          if (!contentRes.ok) return null;
          const contentData = await contentRes.json();
          // GitHub API returns base64.
          const binaryString = atob(contentData.content);
          // Simple way to handle potential UTF-8 issues
          const content = binaryString; 
          return `--- FILE: ${file.path} ---\n${content}`;
        } catch (e) {
          console.error(`Error fetching file ${file.path}:`, e);
          return null;
        }
      }));

      return fileContents.filter(Boolean).join('\n\n');
    } catch (err: any) {
      throw new Error(`Failed to fetch files from Git: ${err.message}`);
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: { id: string; name: string; content: string; preview: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Basic check for text-like files
      const isText = file.type.startsWith('text/') || 
                     file.name.match(/\.(ts|tsx|js|jsx|json|md|css|html|py|go|rs|java|cpp|c|h|php|rb|sh|yml|yaml)$/i);
      
      if (isText) {
        try {
          const content = await file.text();
          const preview = content.split('\n').slice(0, 5).join('\n');
          newFiles.push({ 
            id: Math.random().toString(36).substring(2, 11),
            name: file.name, 
            content, 
            preview 
          });
        } catch (err) {
          console.error(`Error reading file ${file.name}:`, err);
        }
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const handleEvaluate = async () => {
    let combinedInput = '';
    
    setIsEvaluating(true);
    setError(null);
    setEvaluationResult(null);
    setScoreCard(null);

    try {
      if (inputMode === 'git') {
        if (!selectedCommit) throw new Error("Please select a commit first.");
        const repoInfo = parseGithubUrl(gitUrl);
        if (!repoInfo) throw new Error("Invalid repository URL.");
        
        combinedInput = await fetchGitFiles(repoInfo.owner, repoInfo.repo, selectedCommit.sha);
      } else {
        if (evalMode === 'comparison') {
          combinedInput = `PROJECT A:\n${projectInput}\n\nPROJECT B:\n${projectBInput}`;
        } else {
          combinedInput = [
            projectInput.trim(),
            ...uploadedFiles.map(f => `--- FILE: ${f.name} ---\n${f.content}`)
          ].filter(Boolean).join('\n\n');
        }
      }

      if (!combinedInput) throw new Error("No project content found to evaluate.");

      let prompt = EVALUATION_PROMPT;
      switch (evalMode) {
        case 'ai_detector': prompt = AI_DETECTOR_PROMPT; break;
        case 'recruiter': prompt = RECRUITER_PROMPT; break;
        case 'comparison': prompt = COMPARISON_PROMPT; break;
        case 'roast': prompt = ROAST_PROMPT; break;
        case 'career': prompt = CAREER_PROMPT; break;
        case 'readme': prompt = README_PROMPT; break;
        case 'interview': prompt = INTERVIEW_PROMPT; break;
        case 'refactor': prompt = REFACTOR_PROMPT; break;
        case 'pitch': prompt = PITCH_PROMPT; break;
      }

      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nNow evaluate the following project:\n\n${combinedInput}`
          }
        ]
      });

      const text = response.choices[0].message.content;

      if (text) {
        const scores = extractScores(text);
        setEvaluationResult(text);
        setParsedScores(scores);
        saveToHistory(text, scores);

        if (scores?.final_score >= 8) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f97316', '#ffffff', '#fb923c']
          });
        }
      } else {
        throw new Error("No evaluation result received.");
      }
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(err.message || "An unexpected error occurred during evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const generateScoreCard = async () => {
    if (!evaluationResult) return;
    
    setIsGeneratingScoreCard(true);
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `${SCORE_CARD_PROMPT}\n\nEvaluation:\n${evaluationResult}`
          }
        ]
      });

      const text = response.choices[0].message.content;

      if (text) {
        setScoreCard(text);
      }
    } catch (err) {
      console.error("Score card error:", err);
    } finally {
      setIsGeneratingScoreCard(false);
    }
  };

  const copyToClipboard = () => {
    if (evaluationResult) {
      navigator.clipboard.writeText(evaluationResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (evaluationResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [evaluationResult]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
              title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic flex gap-1.5 leading-none">
                <span className="text-white">Elite</span>
                <span className="text-orange-600">Evaluator</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                System: <span className="text-zinc-300">Operational</span>
              </div>
              <div className="w-px h-4 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-orange-500" />
                Security: <span className="text-zinc-300">Active</span>
              </div>
            </div>
            {evaluationResult && (
              <button
                onClick={resetEvaluation}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all border border-zinc-700"
              >
                <RefreshCw className="w-3 h-3" />
                New Eval
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        {!evaluationResult && (
          <section className="mb-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] uppercase tracking-widest mb-6"
            >
              <Award className="w-3 h-3" />
              Professional Grade Analysis
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-7xl font-serif italic font-light mb-6 tracking-tighter"
            >
              Judge Your <span className="text-orange-500">Work</span>.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed"
            >
              Submit your project for a brutal, FAANG-level evaluation. 
              Our expert panel detects flaws that standard linters miss.
            </motion.p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Sidebar: History & Examples */}
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.aside 
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                className="lg:col-span-3 space-y-6 overflow-hidden"
              >
                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <History className="w-3 h-3" /> Recent
                  </h4>
                  <div className="space-y-2">
                    {history.length > 0 ? history.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => loadFromHistory(entry)}
                        className="w-full text-left p-2 rounded bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-700/50 transition-all group"
                      >
                        <div className="text-[10px] text-zinc-300 truncate group-hover:text-orange-400">{entry.title}</div>
                        <div className="text-[8px] text-zinc-600 mt-1 flex justify-between">
                          <span>{entry.date}</span>
                          {entry.scores?.final_score && (
                            <span className="text-orange-500 font-bold">{entry.scores.final_score}</span>
                          )}
                        </div>
                      </button>
                    )) : (
                      <div className="text-[10px] text-zinc-600 italic">No recent evaluations</div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" /> Quick Start
                  </h4>
                  <button
                    onClick={loadExample}
                    className="w-full text-left p-2 rounded bg-orange-500/5 hover:bg-orange-500/10 border border-orange-500/20 transition-all text-[10px] text-orange-400 flex items-center justify-between group"
                  >
                    Load Example Snippet
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Input Area */}
          <div className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-300`}>
            {!evaluationResult && (
              <div className="space-y-6">
                {/* Error Display */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* Mode Toggle */}
                <div className="flex flex-wrap gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
                  {[
                    { id: 'elite', label: 'Elite Eval', icon: Brain },
                    { id: 'ai_detector', label: 'AI Detector', icon: Search },
                    { id: 'recruiter', label: 'Recruiter', icon: UserCheck },
                    { id: 'comparison', label: 'Compare', icon: GitBranch },
                    { id: 'roast', label: 'Roast', icon: Zap },
                    { id: 'career', label: 'Career', icon: TrendingUp },
                    { id: 'readme', label: 'README', icon: FileCode },
                    { id: 'interview', label: 'Interview', icon: Mic },
                    { id: 'refactor', label: 'Refactor', icon: Wand2 },
                    { id: 'pitch', label: 'Pitch', icon: Presentation },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setEvalMode(mode.id as EvalMode)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${evalMode === mode.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <mode.icon className="w-3 h-3" />
                      {mode.label}
                    </button>
                  ))}
                </div>

                <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
                  <button
                    onClick={() => setInputMode('manual')}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${inputMode === 'manual' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <FileCode className="w-3 h-3" />
                    Manual
                  </button>
                  <button
                    onClick={() => setInputMode('git')}
                    disabled={evalMode === 'comparison'}
                    className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2 ${inputMode === 'git' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-30'}`}
                  >
                    <Github className="w-3 h-3" />
                    Git
                  </button>
                </div>

                {inputMode === 'git' ? (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-zinc-800 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[#111111] border border-zinc-800 rounded-xl overflow-hidden p-6">
                      <div className="flex flex-col gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" /> Repository URL
                          </label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={gitUrl}
                              onChange={(e) => setGitUrl(e.target.value)}
                              placeholder="https://github.com/owner/repo"
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button
                              onClick={fetchRepoInfo}
                              disabled={isFetchingRepo || !gitUrl.trim()}
                              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-300 font-mono text-xs uppercase tracking-widest rounded-lg transition-all border border-zinc-700 flex items-center gap-2"
                            >
                              {isFetchingRepo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                              Load Repo
                            </button>
                          </div>
                        </div>

                        {branches.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            <div className="space-y-2">
                              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <GitBranch className="w-3 h-3" /> Branch
                              </label>
                              <select
                                value={selectedBranch}
                                onChange={(e) => handleBranchChange(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                              >
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <GitCommit className="w-3 h-3" /> Specific Commit
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedCommit?.sha || ''}
                                  onChange={(e) => setSelectedCommit(commits.find(c => c.sha === e.target.value))}
                                  disabled={isFetchingCommits}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors appearance-none disabled:opacity-50"
                                >
                                  {isFetchingCommits ? (
                                    <option>Loading commits...</option>
                                  ) : (
                                    commits.map(c => (
                                      <option key={c.sha} value={c.sha}>
                                        {c.sha.substring(0, 7)} - {c.commit.message.substring(0, 30)}...
                                      </option>
                                    ))
                                  )}
                                </select>
                                {isFetchingCommits && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {selectedCommit && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
                          >
                            <div className="flex items-start gap-4">
                              <img 
                                src={selectedCommit.author?.avatar_url || `https://ui-avatars.com/api/?name=${selectedCommit.commit.author.name}`} 
                                alt="Author" 
                                className="w-10 h-10 rounded-full border border-zinc-700"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h5 className="text-zinc-200 font-semibold text-sm truncate">{selectedCommit.commit.message}</h5>
                                  <span className="text-[10px] font-mono text-zinc-600 shrink-0">{new Date(selectedCommit.commit.author.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">By {selectedCommit.commit.author.name} ({selectedCommit.sha.substring(0, 7)})</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={handleEvaluate}
                            disabled={isEvaluating || !selectedCommit}
                            className="group relative px-8 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2 overflow-hidden"
                          >
                            {isEvaluating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Analyzing Repo...</span>
                              </>
                            ) : (
                              <>
                                <span>Evaluate Repository</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-zinc-800 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div 
                      className={`relative bg-[#111111] border rounded-xl overflow-hidden transition-colors duration-300 ${isDragging ? 'border-orange-500 bg-orange-500/5' : 'border-zinc-800'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <AnimatePresence>
                        {isDragging && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 bg-orange-500/10 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none"
                          >
                            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-orange-500/20">
                              <Upload className="w-8 h-8 text-white animate-bounce" />
                            </div>
                            <p className="text-xl font-serif italic text-orange-500">Drop files to upload</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                          <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                          Project_Source_Input
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            multiple
                            className="hidden"
                          />
                        </div>
                      </div>

                      {evalMode === 'comparison' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                              <FileCode className="w-3 h-3" /> Project A
                            </label>
                            <textarea
                              value={projectInput}
                              onChange={(e) => setProjectInput(e.target.value)}
                              placeholder="Paste Project A code here..."
                              className="w-full h-80 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-700"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                              <FileCode className="w-3 h-3" /> Project B
                            </label>
                            <textarea
                              value={projectBInput}
                              onChange={(e) => setProjectBInput(e.target.value)}
                              placeholder="Paste Project B code here..."
                              className="w-full h-80 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-700"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Drop Zone Area */}
                          <div className="px-6 pt-6">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'}`}
                            >
                              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center group-hover:scale-110 transition-transform border border-zinc-800">
                                <Upload className={`w-6 h-6 ${isDragging ? 'text-orange-500' : 'text-zinc-500 group-hover:text-orange-500'}`} />
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-zinc-400 font-serif italic">Drag & drop project files here</p>
                                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Supports multiple source files</p>
                              </div>
                            </div>
                          </div>

                          <div className="relative flex items-center px-6 py-4">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="px-4 text-[10px] font-mono text-zinc-700 uppercase tracking-[0.3em]">OR PASTE CODE</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                          </div>

                          <textarea
                            value={projectInput}
                            onChange={(e) => setProjectInput(e.target.value)}
                            placeholder="Paste your code, file tree, or project description here..."
                            className="w-full h-60 p-6 bg-transparent text-zinc-300 font-mono text-sm focus:outline-none resize-none placeholder:text-zinc-700"
                          />
                        </>
                      )}
                      
                      {/* File List */}
                      <AnimatePresence>
                        {uploadedFiles.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="px-6 pb-4 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <FileCode className="w-3 h-3" /> Uploaded Files ({uploadedFiles.length})
                              </h4>
                              <button 
                                onClick={clearAllFiles}
                                className="text-[10px] font-mono text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Clear All
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              {uploadedFiles.map((file) => (
                                <div 
                                  key={file.id}
                                  className="group border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 hover:border-zinc-700 transition-all"
                                >
                                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center">
                                        <FileCode className="w-3.5 h-3.5 text-orange-500" />
                                      </div>
                                      <span className="text-[11px] font-mono text-zinc-300 truncate max-w-[300px]">{file.name}</span>
                                    </div>
                                    <button 
                                      onClick={() => removeFile(file.id)}
                                      className="text-zinc-600 hover:text-red-500 transition-colors p-1 flex items-center gap-1 group/remove"
                                      title="Remove file"
                                    >
                                      <span className="text-[9px] font-mono uppercase tracking-tighter opacity-0 group-hover/remove:opacity-100 transition-opacity">Remove</span>
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="p-4 bg-black/20">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-[1px] flex-grow bg-zinc-800/50"></div>
                                      <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Content Preview</span>
                                      <div className="h-[1px] flex-grow bg-zinc-800/50"></div>
                                    </div>
                                    <pre className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap break-all leading-relaxed line-clamp-4">
                                      {file.preview}
                                      {file.content.split('\n').length > 5 && "\n..."}
                                    </pre>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="p-4 border-t border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
                        <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-2">
                          <Shield className="w-3 h-3" />
                          Encrypted Session
                        </div>
                        <button
                          id="btn-evaluate-project"
                          onClick={handleEvaluate}
                          disabled={isEvaluating || (!projectInput.trim() && uploadedFiles.length === 0)}
                          className="group relative px-8 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2 overflow-hidden"
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <span>Begin Evaluation</span>
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Expert Thought Ticker */}
            <AnimatePresence>
              {isEvaluating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 bg-orange-500/5 border border-orange-500/10 rounded-lg flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <p className="text-xs font-mono text-orange-400 italic">
                    {loadingSteps[loadingStep]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
              {evaluationResult && (
                <motion.div 
                  ref={resultsRef}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Score Card Section */}
                  <div className="p-8 bg-[#111111] border border-zinc-800 rounded-xl relative overflow-hidden group glass-effect">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Award className="w-32 h-32 text-orange-500" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-serif italic text-white flex items-center gap-3">
                            <Zap className="w-6 h-6 text-orange-500" />
                            Elite Score Card
                          </h3>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Condensed Performance Metrics</p>
                        </div>
                        {!scoreCard && (
                          <button
                            id="btn-generate-scorecard"
                            onClick={generateScoreCard}
                            disabled={isGeneratingScoreCard}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                          >
                            {isGeneratingScoreCard ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Generate Card
                          </button>
                        )}
                      </div>

                      {scoreCard ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 max-w-md mx-auto shadow-2xl shadow-orange-500/5"
                        >
                          <div className="flex justify-center mb-6">
                            <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
                          </div>
                          <pre className="text-zinc-200 font-mono text-sm leading-loose whitespace-pre-wrap text-center">
                            {scoreCard}
                          </pre>
                          <div className="flex justify-center mt-8 gap-4">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(scoreCard);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-orange-500"
                              title="Copy Card"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                const blob = new Blob([scoreCard], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `scorecard-${Date.now()}.txt`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-orange-500"
                              title="Export Card"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                          <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest italic">Score card not yet generated</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Summary Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-8 bg-[#111111] border border-zinc-800 rounded-xl flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-orange-600/20 rounded-2xl flex items-center justify-center border border-orange-500/30">
                          <Trophy className="w-8 h-8 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-serif italic text-white">Project Score</h3>
                          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Expert Panel Consensus</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                          <div className="text-3xl font-bold text-orange-500 mb-1">{parsedScores?.final_score || 'N/A'}</div>
                          <div className="text-[8px] uppercase tracking-widest text-zinc-500">Final Rating</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                          <div className="text-sm font-bold text-zinc-200 mb-1 truncate px-1">{parsedScores?.skill_level || 'N/A'}</div>
                          <div className="text-[8px] uppercase tracking-widest text-zinc-500">Skill Level</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                          <div className={`text-sm font-bold mb-1 ${parsedScores?.hiring_verdict === 'Hire' ? 'text-green-500' : parsedScores?.hiring_verdict === 'Maybe' ? 'text-orange-500' : 'text-red-500'}`}>
                            {parsedScores?.hiring_verdict || 'N/A'}
                          </div>
                          <div className="text-[8px] uppercase tracking-widest text-zinc-500">Verdict</div>
                        </div>
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center">
                          <div className="text-sm font-bold text-zinc-200 mb-1">
                            {parsedScores?.scores ? Object.values(parsedScores.scores).filter((s: any) => s >= 8).length : 0}
                          </div>
                          <div className="text-[8px] uppercase tracking-widest text-zinc-500">Elite Traits</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#111111] border border-zinc-800 rounded-xl h-[300px]">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 text-center">Dimension Analysis</h4>
                      {parsedScores?.scores ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={Object.entries(parsedScores.scores).map(([key, value]) => ({ subject: key, A: value, fullMark: 10 }))}>
                            <PolarGrid stroke="#27272a" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#3f3f46', fontSize: 8 }} axisLine={false} />
                            <Radar
                              name="Project"
                              dataKey="A"
                              stroke="#f97316"
                              fill="#f97316"
                              fillOpacity={0.5}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-700 italic text-[10px]">Chart data unavailable</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-serif italic text-orange-500">Full Evaluation Report</h3>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={speakEvaluation}
                        className={`flex items-center gap-2 text-xs transition-colors ${isSpeaking ? 'text-orange-500 animate-pulse' : 'text-zinc-500 hover:text-zinc-300'}`}
                        title={isSpeaking ? "Stop Speaking" : "Listen to Evaluation"}
                      >
                        {isSpeaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {isSpeaking ? 'Stop' : 'Listen'}
                      </button>
                      <button 
                        onClick={downloadMarkdown}
                        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        MD
                      </button>
                      <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {copied ? <ClipboardCheck className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-invert prose-orange max-w-none bg-[#111111] border border-zinc-800 p-8 rounded-xl shadow-2xl">
                    <div className="markdown-body">
                      <Markdown>{evaluationResult}</Markdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <UserCheck className="w-3 h-3" /> Hiring Verdict
                      </h4>
                      <p className="text-sm text-zinc-400 italic">
                        {parsedScores?.hiring_verdict === 'Hire' ? 'Highly recommended for the role. Strong technical foundation.' : 
                         parsedScores?.hiring_verdict === 'Maybe' ? 'Potential exists, but requires significant refinement in core areas.' : 
                         'Not ready for professional placement. Focus on the upgrade plan below.'}
                      </p>
                    </div>
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Growth Roadmap
                      </h4>
                      <p className="text-sm text-zinc-400 italic">
                        Focus on improving your {parsedScores?.scores ? Object.entries(parsedScores.scores).sort((a: any, b: any) => a[1] - b[1])[0][0] : 'weakest areas'} to reach the next skill level.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Placeholder / Empty State */}
        {!evaluationResult && !isEvaluating && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {[
              { icon: Brain, title: "Deep Analysis", desc: "Beyond syntax: logic and architecture." },
              { icon: AlertTriangle, title: "Strict Scoring", desc: "Honest ratings based on industry standards." },
              { icon: Rocket, title: "Industry Plan", desc: "Actionable roadmap for professional growth." }
            ].map((item, i) => (
              <div key={i} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/20">
                <item.icon className="w-6 h-6 text-orange-500 mb-4" />
                <h4 className="text-sm font-semibold mb-2">{item.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Expert Panel Section */}
        <section className="mt-24 mb-12">
          <h3 className="text-xs font-mono uppercase tracking-[0.4em] text-zinc-600 text-center mb-12">The Expert Panel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { role: "Senior Engineer", icon: Code2, focus: "Patterns & Refactoring" },
              { role: "System Architect", icon: Cpu, focus: "Scalability & Infrastructure" },
              { role: "FAANG Interviewer", icon: Terminal, focus: "Logic & Edge Cases" },
              { role: "Product Manager", icon: Globe, focus: "Viability & UX" },
              { role: "Open Source Reviewer", icon: Zap, focus: "Standards & Reusability" }
            ].map((expert, i) => (
              <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-800/50 rounded-xl hover:border-orange-500/30 transition-all text-center group">
                <expert.icon className="w-5 h-5 text-zinc-600 group-hover:text-orange-500 mx-auto mb-3 transition-colors" />
                <h5 className="text-[10px] font-bold text-zinc-300 mb-1">{expert.role}</h5>
                <p className="text-[8px] text-zinc-600 uppercase tracking-widest">{expert.focus}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-zinc-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-600">
            ELITE EVALUATOR v1.0.4
          </p>
        </div>
      </footer>

      <style>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: 'Georgia', serif;
          font-style: italic;
          color: #f97316;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #27272a;
          padding-bottom: 0.5rem;
        }
        .markdown-body h1 { font-size: 1.875rem; }
        .markdown-body h2 { font-size: 1.5rem; }
        .markdown-body h3 { font-size: 1.25rem; }
        .markdown-body p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #d4d4d8;
          font-size: 0.9375rem;
        }
        .markdown-body ul, .markdown-body ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          color: #d4d4d8;
        }
        .markdown-body li {
          margin-bottom: 0.5rem;
        }
        .markdown-body strong {
          color: #fff;
          font-weight: 600;
        }
        .markdown-body blockquote {
          border-left: 4px solid #f97316;
          padding-left: 1rem;
          font-style: italic;
          color: #a1a1aa;
          margin: 1.5rem 0;
        }
        .markdown-body code {
          background: #27272a;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875em;
        }
        .markdown-body pre {
          background: #000;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 1px solid #27272a;
        }
        .markdown-body pre code {
          background: transparent;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
