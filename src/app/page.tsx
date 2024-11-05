"use client";
import { useState } from "react";
import data from "../data.json";
import { Assessment, promptAssessment } from "@/services";

export default function Home() {
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<null | Assessment[]>(null);

  const handleClick = async () => {
    setLoading(true);
    const response = await promptAssessment(answer);
    setAssessment(response);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      {!assessment && !loading && (
        <>
          <p>{data.question}</p>
          <div className="flex gap-1">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-gray-400 rounded-md p-2 w-96"
            />
            <button
              onClick={handleClick}
              className="rounded-md p-2 text-white bg-cyan-700"
            >
              Send
            </button>
          </div>
        </>
      )}
      {loading && <p>loading...</p>}
      {assessment && (
        <table>
          <thead>
            <tr>
              <th>Læringsmål</th>
              <th>Vurdering</th>
              <th>Score</th>
              <th>Anbefaling</th>
            </tr>
          </thead>
          <tbody>
            {assessment.map((item, index) => (
              <tr key={index}>
                <td>{item.assessmentCriteria}</td>
                <td>{item.assessment.written_assessment}</td>
                <td>{item.assessment.score}</td>
                <td>{item.assessment.directions_for_improvement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
