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
            description: "Id-en til svaret. Brukes for å identifisere svaret",
          },
          score: {
            type: "integer",
            description:
              "1 betyr ikke riktig, 2 betyr delvis riktig, 3 betyr riktig",
            minimum: 1,
            maximum: 3,
          },
        },
      },
    },
    overAllAssessment: {
      type: "string",
      description: "",
    },
  },
};

export const longFormAnswerSchema = {
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
