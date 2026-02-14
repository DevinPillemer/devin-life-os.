import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/entities/User";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Trophy,
  Award,
  CheckCircle,
  Download,
  Share2,
  BookOpen,
  Star,
  Zap,
  Home
} from "lucide-react";
import { motion } from "framer-motion";
import SimpleMarkdown from "../SimpleMarkdown";

export default function CompletionPage({ course, userProgress }) {
  const [userStats, setUserStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updateUserStats();
  }, []);

  const updateUserStats = async () => {
    try {
      const user = await User.me();
      setUserStats(user);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const printCertificate = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Certificate - ${course.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap');
            body {
              font-family: 'Poppins', sans-serif;
              text-align: center;
              padding: 2rem;
              background-color: #eef2ff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
            .certificate-container {
              border: 10px solid #1e293b;
              padding: 50px;
              width: 800px;
              height: 580px;
              margin: 0 auto;
              background-color: #ffffff;
              position: relative;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23e0e7ff' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M11 0l5 20H6l5-20zm42 31l5 20H48l5-20zm-32 32l5 20H16l5-20z'/%3E%3C/g%3E%3C/svg%3E");
            }
            .certificate-border {
              position: absolute;
              top: 20px;
              left: 20px;
              right: 20px;
              bottom: 20px;
              border: 3px solid #a5b4fc;
              box-sizing: border-box;
            }
            .certificate-header h1 {
              font-family: 'Playfair Display', serif;
              font-size: 48px;
              color: #334155;
              margin-bottom: 10px;
            }
            .certificate-header p {
              font-size: 18px;
              color: #64748b;
              margin-bottom: 30px;
            }
            .recipient-name {
              font-family: 'Playfair Display', serif;
              font-size: 40px;
              font-weight: 700;
              color: #4f46e5;
              margin: 20px 0;
              border-bottom: 2px solid #cbd5e1;
              display: inline-block;
              padding-bottom: 5px;
            }
            .course-details {
              font-size: 16px;
              line-height: 1.6;
              color: #475569;
            }
            .course-title {
              font-weight: 600;
              color: #1e293b;
            }
            .humorous-line {
              font-style: italic;
              color: #64748b;
              margin-top: 20px;
              font-size: 14px;
            }
            .certificate-footer {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              position: absolute;
              bottom: 50px;
              width: calc(100% - 100px);
            }
            .footer-item {
              text-align: center;
              width: 200px;
            }
            .footer-item p {
              border-top: 1px solid #cbd5e1;
              padding-top: 5px;
              font-size: 14px;
              color: #475569;
              font-weight: 600;
              margin-bottom: 0;
            }
             .footer-item span { font-size: 12px; color: #64748b; }
            .seal {
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #4f46e5, #7c3aed);
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              font-size: 12px;
              line-height: 1.2;
              border: 5px solid #a5b4fc;
              box-shadow: 0 4px 10px rgba(0,0,0,0.2);
              position: relative;
            }
            .seal .seal-text {
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .seal .star {
              font-size: 24px;
              line-height: 1;
              margin-bottom: 5px;
            }
             @media print {
              body {
                background-color: #fff;
              }
              .certificate-container {
                box-shadow: none;
                margin: 0;
                width: 100%;
                height: 100%;
              }
            }
            .download-hint {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #4f46e5;
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 1000;
            }
            @media print {
              .download-hint { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="download-hint">
            💡 Press Ctrl+P (or Cmd+P on Mac) to save as PDF
          </div>
          <div class="certificate-container">
            <div class="certificate-border"></div>
            <div class="certificate-header">
              <h1>Certificate of Awesome Achievement</h1>
              <p>This certificate is proudly awarded to</p>
            </div>

            <h2 class="recipient-name">${userStats?.full_name || 'A True Scholar'}</h2>

            <div class="course-details">
              For demonstrating heroic levels of patience and brainpower in conquering the course:
              <br>
              <span class="course-title">"${course.title}"</span>
            </div>

            <p class="humorous-line">
              This officially certifies that they are now at least ${userProgress?.final_score || 0}% smarter about this topic and are legally permitted to bring it up at dinner parties.
            </p>

            <div class="certificate-footer">
              <div class="footer-item">
                <p>${new Date(userProgress.completion_date || Date.now()).toLocaleDateString()}</p>
                <span>Completion Date</span>
              </div>
              <div class="seal">
                <div class="star">★</div>
                <div class="seal-text">Official Floopify Seal</div>
                <div class="seal-text">of Accomplishment</div>
              </div>
              <div class="footer-item">
                <p>Dr. Floop</p>
                <span>Chief Knowledge Officer</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printCheatSheet = () => {
    const titleSlug = course.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cheat Sheet - ${course.title}</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 2rem; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 2rem; }
            .header h1 { font-size: 24px; margin: 0; color: #1e3a8a; }
            .header .brand { font-size: 16px; font-weight: bold; color: #4f46e5; }
            .meta { display: flex; justify-content: space-between; font-size: 14px; color: #475569; margin-bottom: 2rem; }
            .section-title { font-size: 18px; font-weight: bold; color: #3b82f6; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
            ul { list-style-type: disc; padding-left: 20px; }
            li { margin-bottom: 0.5rem; line-height: 1.5; }
            .cheat-sheet-section { margin-bottom: 1.5rem; }
            .cheat-sheet-section h4 { font-size: 16px; font-weight: bold; margin-bottom: 0.5rem; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .no-print { display: none; }
            }
            .print-hint { position: fixed; top: 20px; right: 20px; background: #4f46e5; color: white; padding: 12px 20px; border-radius: 8px; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; }
          </style>
        </head>
        <body>
          <div class="print-hint no-print">💡 Press Ctrl+P (or Cmd+P on Mac) to save as PDF</div>
          <div class="header">
            <p class="brand">Floopify</p>
            <h1>Cheat Sheet: ${course.title}</h1>
          </div>
          <div class="meta">
            <span><strong>Author:</strong> ${course.author}</span>
            <span><strong>Completed:</strong> ${new Date(userProgress.completion_date || Date.now()).toLocaleDateString()}</span>
          </div>
          <div>
            <h3 class="section-title">Key Takeaways</h3>
            <ul>
              ${course.key_takeaways?.map(item => `<li>${item}</li>`).join('') || '<li>No key takeaways available.</li>'}
            </ul>
          </div>
          <div>
            <h3 class="section-title">Quick Reference</h3>
            ${course.cheat_sheet?.sections?.map(section => `
              <div class="cheat-sheet-section">
                <h4>${section.title}</h4>
                <ul>
                  ${section.items?.map(item => `<li>${item.replace(/^- /, '')}</li>`).join('') || '<li>No items available.</li>'}
                </ul>
              </div>
            `).join('') || '<p>No cheat sheet sections available.</p>'}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.document.title = `Cheat_Sheet_${titleSlug}`;
  };

  const shareCertificate = () => {
    const url = `${window.location.origin}${createPageUrl(`Certificate?progressId=${userProgress.id}`)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center"
      >
        <Card className="border-slate-700 shadow-2xl overflow-hidden bg-slate-800">
          <div className="bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 p-8 text-white">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Award className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
              <h1 className="text-4xl font-bold mb-2 text-white">Congratulations!</h1>
              <p className="text-xl text-blue-200 mb-4">
                You've completed the "{course.title}" learning module
              </p>
              <div className="flex justify-center gap-4">
                <Badge className="bg-white/10 text-white px-4 py-2 text-lg">
                  <Trophy className="w-4 h-4 mr-2" />
                  Course Complete
                </Badge>
                <Badge className="bg-yellow-400/20 text-yellow-200 px-4 py-2 text-lg">
                  <Zap className="w-4 h-4 mr-2" />
                  +₪{(course.modules?.length || 5) * 10} Earned
                </Badge>
                {(userProgress?.final_score || 0) >= 80 && (
                  <Badge className="bg-green-400/20 text-green-200 px-4 py-2 text-lg">
                    <Award className="w-4 h-4 mr-2" />
                    Certificate Eligible
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Key Takeaways */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <Star className="w-7 h-7 text-yellow-400" />
              Your Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {course.key_takeaways?.map((takeaway, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300 font-medium leading-relaxed">{takeaway}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cheat Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-slate-700 bg-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <BookOpen className="w-7 h-7 text-blue-400" />
              Quick Reference Cheat Sheet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {course.cheat_sheet?.sections?.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-slate-800/70 rounded-lg p-6 border border-slate-700"
                >
                  <h4 className="font-bold text-white mb-3 text-lg">{section.title}</h4>
                  <ul className="space-y-2">
                    {section.items?.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-slate-300 flex items-start gap-2">
                        <span className="text-blue-400 font-bold mt-1">•</span>
                        <span><SimpleMarkdown text={item.replace(/^- /, '')} /></span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Final Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">The Ultimate Truth</h3>
            <blockquote className="text-xl text-slate-300 italic leading-relaxed max-w-3xl mx-auto">
              "You can't control complicated people, but you can control how complicated you let them make your life."
            </blockquote>
            <p className="text-slate-400 mt-6 leading-relaxed">
              Every generous interaction, every moment of curiosity, and every healthy boundary you set creates ripple effects that
              make work more human and manageable – one relationship at a time.
            </p>

            <div className="mt-8 p-6 bg-green-900/30 rounded-lg border border-green-500/50">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h4 className="font-bold text-green-200 mb-2">🎉 Learning Complete!</h4>
              <p className="text-green-300">
                You now have the tools to transform your most challenging workplace relationships. Remember to bookmark this page for
                future reference!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-wrap justify-center items-center gap-4"
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={printCheatSheet}
                variant="outline"
                className="font-semibold px-6 py-3 border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Cheat Sheet
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white border-slate-700">
              <p>Download takeaways and cheat sheet as PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {(userProgress?.final_score || 0) >= 80 ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={printCertificate}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3"
                  >
                    <Award className="w-5 h-5 mr-2" />
                    Download Certificate as PDF
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-slate-700">
                  <p>Generate and save your certificate as a PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={shareCertificate}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 mr-2" /> : <Share2 className="w-5 h-5 mr-2" />}
                    {copied ? "Link Copied!" : "Share Certificate"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-slate-700">
                  <p>Copy shareable certificate link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <div className="text-center">
             <Button
              disabled
              variant="outline"
              className="font-semibold px-6 py-3 border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed"
            >
              <Award className="w-5 h-5 mr-2" />
              Certificate Not Earned
            </Button>
            <p className="text-xs text-slate-500 mt-1">A quiz score of 80% or higher is required.</p>
          </div>
        )}

        <Link to={createPageUrl("Dashboard")}>
          <Button className="bg-green-300 text-slate-900 font-semibold px-6 py-3 hover:bg-green-400">
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
