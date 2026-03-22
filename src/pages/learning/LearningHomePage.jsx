import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Screen } from '@/components/floopify/ObsidianShell'

const curriculum = [
  { title: 'Type Systems Essentials', lessons: 12, image: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80' },
  { title: 'Accessibility for Editorial Layouts', lessons: 8, image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80' },
  { title: 'Building Visual Rhythm', lessons: 10, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80' }
]

export default function LearningHomePage() {
  return (
    <Screen title="Learning Module" subtitle="Continue your digital interface studies" showTopBar>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden bg-gradient-to-br from-primary/18 via-surface-lowest to-surface-highest/30 p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Featured Course</p>
              <h1 className="mt-3 max-w-2xl font-heading text-4xl font-extrabold leading-tight text-onsurface">Advanced Typography in Digital Interfaces</h1>
              <p className="mt-3 max-w-xl text-sm text-onsurface-variant">Master contrast, hierarchy, and type pairing systems that feel premium across mobile and desktop experiences.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button className="rounded-full px-6"><PlayCircle className="mr-2 h-4 w-4" />Resume</Button>
                <Button variant="outline" className="rounded-full px-6">Course Notes</Button>
              </div>
            </div>
            <Card className="border-primary/20 bg-surface-lowest/80 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-onsurface-variant">Progress</p>
                  <p className="mt-2 font-heading text-3xl font-extrabold text-primary">78% Complete</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">In Progress</span>
              </div>
              <div className="mt-4">
                <Progress value={78} />
              </div>
              <p className="mt-3 text-sm text-onsurface-variant">3 lessons left before the capstone critique.</p>
            </Card>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-onsurface-variant">Your Curriculum</p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-onsurface">Recommended modules</h2>
          </div>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-primary">View All Modules <ArrowRight className="h-4 w-4" /></a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {curriculum.map((course, index) => (
            <motion.div key={course.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.06 }}>
              <Card className="overflow-hidden p-0">
                <img src={course.image} alt={course.title} className="h-40 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-heading text-xl font-bold text-onsurface">{course.title}</p>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{course.lessons} lessons</span>
                  </div>
                  <p className="mt-3 text-sm text-onsurface-variant">Crisp lesson sequences with practical interface examples and guided exercises.</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Screen>
  )
}
