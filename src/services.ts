"use server";
import OpenAI from "openai";

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

export const shortFormMultipleAnswersSchema = {
  type: "object",
  description: "En vurdering av studentens fagkunnskaper",
  properties: {
    assessmentList: {
      type: "array",
      description:
        "En liste med vurderinger av studentens fagkunnskaper, basert på en iterativ gjennomgang av elevens svar, én av gangen",
      items: {
        type: "object",
        description: "",
        properties: {
          inputId: {
            type: "string",
            description:
              "Id-en til svaret. Brukes for å identifisere spørsmålet og svaret som vurderes",
          },
          score: {
            type: "integer",
            description:
              "1 betyr ikke riktig, 2 betyr delvis riktig, 3 betyr riktig",
            minimum: 1,
            maximum: 3,
          },
          assessmentReasoning: {
            type: "string",
            description: "The reasoning behind the score",
          },
        },
      },
    },
  },
};

const systemMessage = `
  Du er lærer og skal vurdere besvarelsen jeg (eleven din) har levert ut ifra oppgaven definert nedenfor.
  
  Oppgaven jeg har besvart har flere deler, som du ser som en json-struktur (inspirert av en html DOM). 
  Strukturen består av en liste med elementer, hvor hvert element har en type (header, question or instructions eller answer) og en tekst.
  Alle elementer med typen "question or instructions" representerer en deloppgave, or hvert element med typen "answer" representerer svarene mine på deloppgaven.

  Vurderingen skal gjennomgås sekvensielt, i form av en "Postorder Traversal Depth-first search" algoritme. Her er en kort beskrivelse av stegene i form av pseudokode:

  funksjon vurdering(node):
    Les nodens type og tekstinnhold
    For hvert barn:
      vurdering(barn)
    Hvis noden har en et vurderingsnummer (assessmentNr):
      Vurder elevens svar basert på nodens vurderingskriterier
      Gi en poengsum basert på elevens svar
      Skriv en begrunnelse for poengsummen
      Skriv vurderingen til listen over vurderinger

  Svar i form av en liste med vurderinger, hvor rekkefølgen på vurderingene følger oppgavenes vurderingsnummer.
  `;

const prompt = `
[
  {
    "task": "1",
    "type": "Question or instructions",
    "textContent": "What is a good definition of a society?"
    "children": [
      {
        "assessmentNr": "1",
        "assessmentCriteria": "Vurder svaret ut ifra oppgavens instruksjoner (ovenfor)",
        "type": "answer",
        "textContent": "A group of people who live together"
      }
    ],
  },
  {
    "task": "2",
    "type": "Question or instructions",
    "assessmentNr": "6",
    "assessmentCriteria": "Vurder studentens oppnåelse ut ifra oppgavende under",
    "textContent": "Find examples of societies and groups of people who does not count as societies",
    "children": [
      {
        "task: "2.1",
        "type": "Question or instructions",
        "textContent": "Find examples of two different kinds of societies",
        "children": [
          {
            "assessmentNr": "2",
            "assessmentCriteria": "Vurder svaret ut ifra oppgavens instruksjoner (ovenfor)",
            "type": "answer",
            "textContent": "sweden"
          },
          {
            "assessmentNr": "3",
            "assessmentCriteria": "Vurder svaret ut ifra oppgavens instruksjoner (ovenfor)",
            "type": "answer",
            "textContent": "people who drink coffee"
          }
        ]
      },
      {
        "task: "2.2",
        "type": "Question or instructions",
        "textContent": "Find examples of two groups of people who does not count as societies",
        "children": [
          {
            "assessmentNr": "4",
            "assessmentCriteria": "Vurder svaret ut ifra oppgavens instruksjoner (ovenfor)",
            "type": "answer",
            "textContent": "Skinny people"
          },
          {
            "assessmentNr": "5",
            "assessmentCriteria": "Vurder svaret ut ifra oppgavens instruksjoner (ovenfor)",
            "type": "answer",
            "textContent": "People who play World of Warcraft in a guild"
          }
        ]
      }
    ],
  }
]`;

export const promptAssessment = async () => {
  const assessment = openai.chat.completions
    .create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      functions: [
        { name: "get_assessment", parameters: shortFormMultipleAnswersSchema },
      ],
    })
    .then((completion) => {
      const json = JSON.parse(
        // @ts-ignore
        completion.choices[0].message.function_call.arguments
      );
      return json;
    })
    .catch((error) => {
      console.log(error);
    });
  return assessment as unknown as Assessment[];
};

async function main() {
  const assessment = await promptAssessment();
  console.log(JSON.stringify(assessment, null, 2));
}

// run with 'node --env-file .env.local --experimental-strip-types src/services.ts'
main();
