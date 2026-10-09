import { NextResponse } from "next/server";
import { problemDetailsSchema } from "@artex/contracts";

interface ProblemInput {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export function problemResponse(problem: ProblemInput) {
  return NextResponse.json(problemDetailsSchema.parse(problem), {
    status: problem.status,
    headers: { "Content-Type": "application/problem+json" },
  });
}
