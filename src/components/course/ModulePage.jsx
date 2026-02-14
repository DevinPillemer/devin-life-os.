
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Lightbulb, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  TrendingUp,
  ClipboardList, // Changed from Users to ClipboardList
  Zap,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import SimpleMarkdown from "../SimpleMarkdown";

export default function ModulePage({ course, moduleIndex, onNext, onPrevious }) {
  const module = course.modules?.[moduleIndex];
  
  if (!module) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-white">Module not found</h2>
      </div>
    );
  }

  // Enhanced content parser that recognizes different content types
  const parseContent = (content) => {
    const sections = content.split('\n\n');
    const parsedSections = [];

    sections.forEach((section, index) => {
      // Check for bullet points (lines starting with • or -)
      if (section.includes('•') || section.includes('-')) {
        const lines = section.split('\n');
        const title = lines[0];
        const bullets = lines.slice(1).filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
        
        if (bullets.length > 0) {
          parsedSections.push({
            type: 'bullets',
            title: title,
            items: bullets.map(bullet => bullet.replace(/^[\s•\-]+/, '').trim())
          });
          return;
        }
      }

      // Check for tables (lines with | separators)
      if (section.includes('|')) {
        const lines = section.split('\n').filter(line => line.includes('|'));
        if (lines.length >= 2) {
          const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
          const rows = lines.slice(1).map(line => 
            line.split('|').map(cell => cell.trim()).filter(cell => cell)
          );
          
          parsedSections.push({
            type: 'table',
            headers: headers,
            rows: rows
          });
          return;
        }
      }

      // Check for numbered lists
      if (/^\d+\./.test(section.trim())) {
        const lines = section.split('\n');
        const items = lines.filter(line => /^\d+\./.test(line.trim()));
        
        if (items.length > 0) {
          parsedSections.push({
            type: 'numbered_list',
            items: items.map(item => item.replace(/^\d+\.\s*/, '').trim())
          });
          return;
        }
      }

      // Default to paragraph
      parsedSections.push({
        type: 'paragraph',
        content: section
      });
    });

    return parsedSections;
  };

  const renderContentSection = (section, index) => {
    const baseDelay = 0.3 + index * 0.1;

    switch (section.type) {
      case 'bullets':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: baseDelay }}
            className="mb-8"
          >
            {section.title && (
              <h4 className="text-xl font-semibold text-blue-300 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                {section.title}
              </h4>
            )}
            <div className="space-y-3">
              {section.items.map((item, bulletIndex) => (
                <motion.div
                  key={bulletIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: baseDelay + bulletIndex * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium"><SimpleMarkdown text={item} /></p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'table':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: baseDelay }}
            className="mb-8"
          >
            <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h4 className="text-lg font-semibold text-green-300">Comparison Table</h4>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600">
                    {section.headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="text-left py-3 px-4 font-semibold text-blue-300">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, rowIndex) => (
                    <motion.tr
                      key={rowIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: baseDelay + (rowIndex + 1) * 0.1 }}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-3 px-4 text-slate-200">
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );

      case 'numbered_list':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-purple-400" /> {/* Changed from Users to ClipboardList */}
              <h4 className="text-lg font-semibold text-purple-300">Step-by-Step Process</h4>
            </div>
            <div className="space-y-4">
              {section.items.map((item, stepIndex) => (
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: baseDelay + stepIndex * 0.15 }}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-500/30"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                    {stepIndex + 1}
                  </div>
                  <p className="text-slate-200 leading-relaxed font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: baseDelay }}
            className="mb-6"
          >
            <div className="prose prose-lg max-w-none">
              <p className="leading-relaxed text-lg text-slate-200 font-medium bg-slate-800/30 p-6 rounded-lg border-l-4 border-slate-500">
                {section.content}
              </p>
            </div>
          </motion.div>
        );
    }
  };

  const parsedContent = parseContent(module.content);

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Badge className="bg-blue-900 text-blue-300 mb-4 px-4 py-2 text-sm">
          Module {moduleIndex + 1} of 5
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{module.title}</h1>
      </motion.div>

      {/* Key Insight Box */}
      {module.key_insights && module.key_insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-700 bg-slate-800 shadow-lg overflow-hidden">
            <div className="border-l-4 border-pink-500 p-6 bg-gradient-to-r from-pink-900/20 to-rose-900/20">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-6 h-6 text-pink-400" />
                <h3 className="text-lg font-bold text-pink-300">💡 Key Insight</h3>
              </div>
              <p className="text-pink-200 font-medium text-lg italic">
                "{module.key_insights[0]}"
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-3 text-xl text-white">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Module Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {parsedContent.map((section, index) => renderContentSection(section, index))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Key Takeaways */}
      {module.key_insights && module.key_insights.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-700 bg-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <Brain className="w-6 h-6 text-green-400" />
                🎯 Key Takeaways
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {module.key_insights.slice(1).map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium leading-relaxed group-hover:text-white transition-colors">
                          {insight}
                        </p>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                      >
                        <Zap className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-between items-center pt-6"
      >
        <Button
          onClick={onPrevious}
          variant="outline"
          className="flex items-center gap-2 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
          disabled={moduleIndex === 0}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-center">
          <span className="bg-slate-800 px-4 py-2 rounded-full text-sm text-slate-400">
            {moduleIndex + 2} of 8
          </span>
        </div>

        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
