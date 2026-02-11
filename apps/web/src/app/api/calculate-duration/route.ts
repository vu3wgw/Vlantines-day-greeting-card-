import { NextRequest, NextResponse } from "next/server";

/**
 * Date Calculation API
 * Calculates accurate duration between dates in days, months, and years
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: "startDate is required" },
        { status: 400 }
      );
    }

    // Use current date if no end date specified
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    // Validate dates
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { error: "Invalid startDate format. Use ISO format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    if (endDate && isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid endDate format. Use ISO format (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Calculate total days
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate years, months, and remaining days
    let years = 0;
    let months = 0;
    let days = 0;

    let current = new Date(start);

    // Calculate years
    while (true) {
      const nextYear = new Date(current);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      if (nextYear <= end) {
        years++;
        current = nextYear;
      } else {
        break;
      }
    }

    // Calculate months
    while (true) {
      const nextMonth = new Date(current);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      if (nextMonth <= end) {
        months++;
        current = nextMonth;
      } else {
        break;
      }
    }

    // Calculate remaining days
    days = Math.floor((end.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total months and total weeks
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);

    // Generate human-readable description
    let description = "";
    if (years > 0) {
      description += `${years} ${years === 1 ? "year" : "years"}`;
    }
    if (months > 0) {
      if (description) description += ", ";
      description += `${months} ${months === 1 ? "month" : "months"}`;
    }
    if (days > 0 || (!years && !months)) {
      if (description) description += ", ";
      description += `${days} ${days === 1 ? "day" : "days"}`;
    }

    // Generate milestone suggestions
    const milestones = generateMilestones(start, end, totalDays);

    return NextResponse.json({
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      duration: {
        totalDays,
        totalWeeks,
        totalMonths,
        years,
        months,
        days,
        description,
      },
      milestones,
    });
  } catch (error) {
    console.error("Date calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate duration" },
      { status: 500 }
    );
  }
}

/**
 * Generate milestone suggestions based on relationship duration
 */
function generateMilestones(start: Date, end: Date, totalDays: number) {
  const milestones: Array<{
    days: number;
    date: string;
    label: string;
    type: string;
  }> = [];

  // First day
  milestones.push({
    days: 0,
    date: start.toISOString().split("T")[0],
    label: "The Day We Met",
    type: "start",
  });

  // 1 week
  if (totalDays >= 7) {
    const date = new Date(start);
    date.setDate(date.getDate() + 7);
    milestones.push({
      days: 7,
      date: date.toISOString().split("T")[0],
      label: "One Week Together",
      type: "week",
    });
  }

  // 1 month
  if (totalDays >= 30) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + 1);
    milestones.push({
      days: Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      date: date.toISOString().split("T")[0],
      label: "One Month Together",
      type: "month",
    });
  }

  // 3 months
  if (totalDays >= 90) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + 3);
    milestones.push({
      days: Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      date: date.toISOString().split("T")[0],
      label: "Three Months Together",
      type: "quarter",
    });
  }

  // 6 months
  if (totalDays >= 180) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + 6);
    milestones.push({
      days: Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      date: date.toISOString().split("T")[0],
      label: "Six Months Together",
      type: "half-year",
    });
  }

  // 1 year
  if (totalDays >= 365) {
    const date = new Date(start);
    date.setFullYear(date.getFullYear() + 1);
    milestones.push({
      days: Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      date: date.toISOString().split("T")[0],
      label: "One Year Anniversary",
      type: "anniversary",
    });
  }

  // Additional years
  const years = Math.floor(totalDays / 365);
  for (let i = 2; i <= years; i++) {
    const date = new Date(start);
    date.setFullYear(date.getFullYear() + i);
    milestones.push({
      days: Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      date: date.toISOString().split("T")[0],
      label: `${i} Year Anniversary`,
      type: "anniversary",
    });
  }

  // Current day
  if (totalDays > 0) {
    milestones.push({
      days: totalDays,
      date: end.toISOString().split("T")[0],
      label: "Today",
      type: "current",
    });
  }

  return milestones;
}

/**
 * GET endpoint for quick calculations
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");

  if (!startDate) {
    return NextResponse.json(
      { error: "startDate query parameter is required" },
      { status: 400 }
    );
  }

  const endDate = searchParams.get("endDate");

  // Reuse POST logic
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    })
  );
}
