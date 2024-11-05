"use server";
require("dotenv").config();
import OpenAI from "openai";
import { topic, question, solution } from "./data.json";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORGANIZATION_ID,
  project: process.env.PROJECT_ID,
});

export type Assessment = {
  assessmentCriteria: string;
  assessment: {
    written_assessment: string;
    score: number;
    directions_for_improvement: string;
  };
};

const schema = {
  type: "object",
  description: "En vurdering av studentens fagkunnskaper",
  properties: {
    assessment: {
      type: "array",
      description:
        "En liste med vurderinger av studentens fagkunnskaper, basert på en iterativ gjennomgang av vurderingskriteriene hvor studentens svar vurderes opp imot læringsmålet, én av gangen",
      items: {
        type: "object",
        description:
          "En vurdering av studentens ferdigheter innenfor et område definert av det enkelte vurderingskriteriet",
        properties: {
          assessmentCriteria: {
            type: "string",
            description:
              "Teksten i vurderingskriteriet som svaret vurderes ut ifra. Viktig at teksten er uendret",
          },
          assessment: {
            type: "object",
            properties: {
              written_assessment: {
                type: "string",
                description:
                  "En beskrivelse av hva studenten har fått til og ikke fått til med tanke det gitte læringsmålet",
              },
              score: {
                type: "integer",
                description:
                  "Et tall mellom 1 og 5 poeng, som beskriver studentens måloppnåelse innenfor det gitte læringsmålet",
                minimum: 1,
                maximum: 5,
              },
              directions_for_improvement: {
                type: "string",
                description:
                  "Tips for hvordan studenten kan forbedre seg innenfor området",
              },
            },
          },
        },
      },
    },
  },
};

const systemMessage = `
  Du er lærer på ungdomsskole-nivå og skal vurdere besvarelsen til en student (brukeren) på oppgaven definert nedenfor.
  Din oppgave er å vurdere studentens besvarelse på en presis og kortfattet måte, med utgangspunkt i læreplanmålene definert nedenfor.
  Gjennomgå læringsmålene én av gangen, og vurder studentens besvarelse opp imot hvert enkelt læringsmål, og gi en kortfattet tilbakemelding på hva studenten har fått til og ikke fått til.
  Studentens besvarelse skal vurderes ut ifra hvor godt de har forstått følgende fagtekst (fasit): ${solution}.
  
  Her er en oppgaven studenten svarer på omhandler tema ${topic} og lyder som følger: ${question}
  
  Studentens besvarelse forventes å være kortere, og mindre omfattende enn fagteksten.

  Svar direkte til studenten.
  
  Din vurdering av studentens besvarelse skal inneholde en vurdering av følgende liste med vurderingskriterier. Studenten:
  - Eleven forstår betydningen av fagforeningens rolle i arbeidslivet, og kan forklare hvordan det har påvirket arbeidernes forhold og rettigheter.`;

export const promptAssessment = async (studentAnswer: string) => {
  const prompt = `Returner en faglig vurdering for følgende besvarelse: ${studentAnswer}`;
  const assessment = openai.chat.completions
    .create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      functions: [{ name: "get_assessment", parameters: schema }],
      function_call: { name: "get_assessment" },
    })
    .then((completion) => {
      // Note the updated location for the response
      const json = JSON.parse(
        // @ts-ignore
        completion.choices[0].message.function_call.arguments
      );
      return json.assessment;
    })
    .catch((error) => {
      console.log(error);
    });
  return assessment as unknown as Assessment[];
};
