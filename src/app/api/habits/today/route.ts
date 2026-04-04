import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo — in production use a database
const todayHabits: Record<string, boolean> = {};

const defaultHabits = [
  { id: "h1", name: "Morning Run / Swim", category: "Health", points: 15 },
  { id: "h2", name: "Cold Shower", category: "Health", points: 5 },
  { id: "h3", name: "Meditate 10 min", category: "Spiritual", points: 10 },
  { id: "h4", name: "Gratitude Journal", category: "Spiritual", points: 5 },
  { id: "h5", name: "Deep Work Block (2h)", category: "Focus", points: 20 },
  { id: "h6", name: "No Phone First Hour", category: "Focus", points: 10 },
  { id: "h7", name: "Read 30 min", category: "Learning", points: 10 },
  { id: "h8", name: "Language Practice", category: "Learning", points: 10 },
  { id: "h9", name: "Healthy Meal Prep", category: "Lifestyle", points: 10 },
  { id: "h10", name: "Screen Off by 22:00", category: "Lifestyle", points: 5 },
];

export async function GET() {
  const habits = defaultHabits.map((h) => ({
    ...h,
    completed: todayHabits[h.id] || false,
  }));
  return NextResponse.json(habits);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing habit id" }, { status: 400 });
    }

    todayHabits[id] = !!completed;

    return NextResponse.json({ id, completed: todayHabits[id] });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
