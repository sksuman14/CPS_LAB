"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, Server, Blocks, ChevronRight, Play } from "lucide-react";

export default function LearnN8nPage() {
  const [copied, setCopied] = useState(false);

  const n8nTemplate = `{
  "nodes": [
    {
      "parameters": {},
      "id": "chat-trigger",
      "name": "Chat Trigger",
      "type": "@n8n/n8n-nodes-langchain.chatTrigger",
      "position": [ 100, 300 ]
    },
    {
      "parameters": {
        "url": "https://api.yourcpslab.com/sensors/live",
        "options": {}
      },
      "id": "fetch-sensors",
      "name": "Fetch CPS Sensor Data (API)",
      "type": "n8n-nodes-base.httpRequest",
      "position": [ 300, 300 ]
    },
    {
      "parameters": {
        "model": "gpt-3.5-turbo"
      },
      "id": "openai-model",
      "name": "OpenAI Chat Model",
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "position": [ 500, 450 ]
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=You are the CPS Lab Assistant. The user just asked a question. Here is the live sensor data from the lab: {{ $json.data }}\n\nPlease answer their question based on the sensor data."
      },
      "id": "analyze-sensor",
      "name": "Analyze Sensor Data",
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "position": [ 500, 300 ]
    }
  ],
  "connections": {
    "Chat Trigger": {
      "main": [ [ { "node": "Fetch CPS Sensor Data (API)", "type": "main", "index": 0 } ] ]
    },
    "Fetch CPS Sensor Data (API)": {
      "main": [ [ { "node": "Analyze Sensor Data", "type": "main", "index": 0 } ] ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [ [ { "node": "Analyze Sensor Data", "type": "ai_languageModel", "index": 0 } ] ]
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(n8nTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      icon: <Server className="w-6 h-6" />,
      title: "Step 1: Start n8n (Choose a Method)",
      desc: (
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-primary font-bold block mb-2">Option A: n8n Cloud (Easiest, No Install)</span>
            <ol className="list-decimal ml-5 space-y-1.5 text-xs text-white/80">
              <li>Click the link below to go to the n8n website.</li>
              <li>Sign up for a free account using your Google account or email.</li>
              <li>Once you reach the dashboard, click <span className="font-bold text-white">"Add Workflow"</span>.</li>
            </ol>
            <div className="mt-3 bg-black/50 border border-white/5 rounded-lg p-3 font-mono text-xs text-primary flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-white/50" />
              <a href="https://app.n8n.cloud" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors">
                https://app.n8n.cloud
              </a>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <span className="text-primary font-bold block mb-2">Option B: Local Terminal (Advanced)</span>
            <ol className="list-decimal ml-5 space-y-1.5 text-xs text-white/80">
              <li>Open your computer&apos;s terminal (Command Prompt).</li>
              <li>Type <code className="text-primary bg-black/50 px-1 rounded">npm install -g n8n</code> and press Enter.</li>
              <li>Wait for the download to finish.</li>
              <li>Type <code className="text-primary bg-black/50 px-1 rounded">n8n</code> and press Enter to start the server.</li>
              <li>Open <a href="http://localhost:5678" target="_blank" className="text-primary hover:underline">http://localhost:5678</a> in your browser.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      icon: <Copy className="w-6 h-6" />,
      title: "Step 2: Copy the Demo Template",
      desc: "Scroll down to the 'Starter Template' section below and click the Copy button. n8n workflows are just JSON code, making them incredibly easy to share!",
    },
    {
      icon: <Blocks className="w-6 h-6" />,
      title: "Step 3: Paste and Build",
      desc: "Go to your open n8n browser tab. Create a new workflow, click anywhere on the empty grid, and press Ctrl+V (or Cmd+V). The CPS Lab Sensor Bot structure will magically appear!",
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: "Step 4: Add Keys & Test",
      desc: "Double click the 'OpenAI' node, add your API key (create a credential), and click 'Execute Workflow'. A chat window will appear for you to test your new AI Agent!",
    }
  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#09090b] flex flex-col font-sans overflow-hidden">

      {/* Header — exactly matching AI Chat / Games style */}
      <header className="h-16 border-b border-slate-300 dark:border-white/10 flex items-center justify-between px-6 bg-slate-50 dark:bg-[#09090b]/80 backdrop-blur-xl z-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/learning"
            className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-colors border border-slate-300 dark:border-white/10"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 text-white">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">Build AI Chatbots (n8n)</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">CPS Lab Workshops</p>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Background Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-30"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 w-full py-16 pb-20">

          {/* Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-stretch">
            {steps.map((step: any, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-primary/40 transition-colors ${idx === 0 ? 'md:col-span-3' : 'md:col-span-1'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {step.desc}
                </div>
                {step.code && (
                  <div className="bg-black/50 border border-white/5 rounded-lg p-3 font-mono text-sm text-primary flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                    {step.code.startsWith('http') ? (
                      <a href={step.code} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors">
                        {step.code}
                      </a>
                    ) : (
                      step.code
                    )}
                  </div>
                )}
                {step.note && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-3 italic">{step.note}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Demo Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <div className="bg-slate-100 dark:bg-black/40 border-b border-slate-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <span className="font-mono text-sm text-slate-500 dark:text-slate-400 ml-2">cps-sensor-bot-template.json</span>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  copied ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary hover:bg-primary/30'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied to Clipboard!" : "Copy Demo Code"}
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="font-mono text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
                <code>{n8nTemplate}</code>
              </pre>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
