"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bot, 
  Cpu, 
  MessageSquareCode, 
  Lightbulb, 
  Gamepad2, 
  Workflow,
  ChevronRight
} from "lucide-react";

const PLATFORM_MODULES = [
  {
    title: 'IoT Sensor Lab',
    description: 'Read live environmental data from your sensors using block coding.',
    icon: <Bot className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-400',
    link: '/learning/iot-lab',
    disabled: false
  },
  {
    title: 'Build AI Chatbots (n8n)',
    description: 'Learn how to build powerful AI agents and connect them to live CPS lab sensors.',
    icon: <Workflow className="w-6 h-6" />,
    gradient: 'from-primary to-accent',
    link: '/learning/n8n',
    disabled: false
  },
  {
    title: 'AI Chat Assistant',
    description: 'Type questions and get AI help to build blocks and solve tasks.',
    icon: <MessageSquareCode className="w-6 h-6" />,
    gradient: 'from-violet-500 to-purple-400',
    link: '/learning/ai-chat',
    disabled: false
  },
  {
    title: 'Coding Adventures',
    description: 'A gamified journey to master logic, loops, and math through interactive challenges.',
    icon: <Gamepad2 className="w-6 h-6" />,
    gradient: 'from-yellow-400 to-orange-500',
    link: '/learning/games',
    disabled: true
  },
  {
    title: 'Robotic Car Coding',
    description: "Master block coding logic to control and navigate your smart robotic car.",
    icon: <Cpu className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-400',
    link: '/learning/block-coding',
    disabled: true
  },
  {
    title: 'Smart Sensor Insights',
    description: 'Get kid-friendly AI explanations for live sensor readings (e.g. "Hot as a summer day!").',
    icon: <Lightbulb className="w-6 h-6" />,
    gradient: 'from-orange-500 to-amber-400',
    link: '/learning/sensor-insights',
    disabled: true
  },
];

export default function LearningPortal() {
  return (
    <div className="relative flex flex-col min-h-screen bg-surface text-on-surface overflow-hidden pt-24 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 relative z-10 w-full">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-label text-xs uppercase tracking-widest mb-4">
            <Workflow className="w-4 h-4" />
            CPS Learning Portal
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black mb-6 drop-shadow-lg text-white">
            Next-Gen <br className="md:hidden" />
            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI & Coding
            </span> Platform
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto">
            Select a module below to start building, experimenting, and exploring the fascinating world of Cyber-Physical Systems.
          </p>
        </motion.div>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {PLATFORM_MODULES.map((mod, index) => {
            const CardWrapper = mod.disabled ? "div" : Link;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <CardWrapper 
                  href={mod.link as any}
                  className={`group relative flex flex-col h-full bg-surface-container border border-white/10 rounded-3xl p-8 transition-all duration-300 ${
                    mod.disabled 
                      ? "opacity-60 cursor-not-allowed" 
                      : "hover:-translate-y-2 hover:bg-white/5 hover:border-white/20 hover:shadow-2xl"
                  }`}
                >
                  {/* Coming Soon Badge for disabled items */}
                  {mod.disabled && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-wider">
                      Coming Soon
                    </div>
                  )}

                  {/* Icon Header */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${mod.gradient} p-[1px] mb-6`}>
                    <div className={`w-full h-full bg-surface-container ${!mod.disabled && "group-hover:bg-transparent"} transition-colors duration-300 rounded-2xl flex items-center justify-center`}>
                      <div className={`text-on-surface ${!mod.disabled && "group-hover:text-white"} transition-colors duration-300`}>
                        {mod.icon}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 font-headline">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6 flex-1 font-body">
                    {mod.description}
                  </p>
                  
                  {/* Action Footer */}
                  {!mod.disabled && (
                    <div className="flex items-center gap-2 text-primary text-sm font-bold mt-auto">
                      Start Learning
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

