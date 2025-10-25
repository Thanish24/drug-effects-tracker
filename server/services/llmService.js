const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class LLMService {
  static async analyzeSideEffect(sideEffectData) {
    try {
      const { description, severity, impactOnDailyLife, drugName, patientAge, otherMedications } = sideEffectData;

      const prompt = `
You are a medical AI assistant analyzing patient-reported side effects. Please analyze the following side effect report and provide your assessment.

Side Effect Details:
- Description: ${description}
- Severity: ${severity}
- Impact on Daily Life: ${impactOnDailyLife}
- Drug: ${drugName}
- Patient Age: ${patientAge || 'Not specified'}
- Other Medications: ${otherMedications ? otherMedications.join(', ') : 'None reported'}

Please provide your analysis in the following JSON format:
{
  "concernLevel": "low|moderate|high|critical",
  "isConcerning": boolean,
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2"
  ],
  "suggestedActions": [
    "immediate action if needed",
    "follow-up action"
  ],
  "potentialCauses": [
    "possible cause 1",
    "possible cause 2"
  ],
  "interactionWarnings": [
    "warning about drug interactions if any"
  ],
  "urgency": "routine|urgent|emergency",
  "reasoning": "brief explanation of your assessment reasoning"
}

Focus on:
1. Identifying potentially serious side effects
2. Detecting possible drug interactions
3. Assessing if immediate medical attention is needed
4. Providing actionable recommendations
5. Flagging any red flags that require urgent attention

Be thorough but concise in your analysis.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant specializing in drug side effect analysis. Provide accurate, helpful assessments while being cautious about medical advice. Always recommend consulting healthcare providers for serious concerns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate the response structure
      if (!analysis.concernLevel || !analysis.isConcerning !== undefined) {
        throw new Error('Invalid LLM response structure');
      }

      return analysis;
    } catch (error) {
      console.error('LLM analysis error:', error);
      
      // Fallback analysis for critical cases
      const fallbackAnalysis = {
        concernLevel: "moderate",
        isConcerning: severity === 'severe' || impactOnDailyLife === 'severe',
        recommendations: [
          "Monitor symptoms closely",
          "Contact healthcare provider if symptoms worsen"
        ],
        suggestedActions: [
          "Continue monitoring",
          "Report to doctor if concerned"
        ],
        potentialCauses: ["Drug side effect"],
        interactionWarnings: [],
        urgency: severity === 'severe' ? "urgent" : "routine",
        reasoning: "Fallback analysis due to LLM service error"
      };

      return fallbackAnalysis;
    }
  }

  static async detectDrugInteractions(drugs, sideEffects) {
    try {
      const prompt = `
Analyze the following drug combinations and reported side effects to detect potential interactions:

Drugs: ${drugs.join(', ')}
Reported Side Effects: ${sideEffects.map(se => `${se.description} (${se.severity})`).join('; ')}

Please analyze for:
1. Known drug-drug interactions
2. Unusual side effect patterns
3. Potential synergistic effects
4. Unexpected reactions

Provide your analysis in JSON format:
{
  "hasInteractions": boolean,
  "interactionType": "pharmacokinetic|pharmacodynamic|synergistic|antagonistic|unknown",
  "severity": "minor|moderate|major|severe",
  "description": "detailed description of the interaction",
  "clinicalSignificance": "low|moderate|high",
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2"
  ],
  "monitoringRequired": [
    "what to monitor"
  ],
  "confidence": 0.0-1.0
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacist AI assistant specializing in drug interaction analysis. Provide accurate assessments of potential drug interactions based on pharmacological principles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Drug interaction analysis error:', error);
      return {
        hasInteractions: false,
        interactionType: "unknown",
        severity: "minor",
        description: "Unable to analyze interactions due to service error",
        clinicalSignificance: "low",
        recommendations: ["Consult healthcare provider"],
        monitoringRequired: ["Monitor for unusual symptoms"],
        confidence: 0.0
      };
    }
  }

  static async generateAnalyticsInsights(data) {
    try {
      const prompt = `
Analyze the following aggregated drug side effect data to identify patterns and insights:

${JSON.stringify(data, null, 2)}

Please provide insights in JSON format:
{
  "patterns": [
    {
      "type": "side_effect_spike|drug_interaction|unexpected_reaction|dosage_concern",
      "description": "description of the pattern",
      "severity": "low|medium|high|critical",
      "affectedDrugs": ["drug1", "drug2"],
      "confidence": 0.0-1.0,
      "recommendations": ["recommendation1", "recommendation2"]
    }
  ],
  "alerts": [
    {
      "type": "alert_type",
      "message": "alert message",
      "priority": "low|medium|high|critical"
    }
  ],
  "summary": "overall summary of findings"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical data analyst AI assistant. Analyze drug side effect data to identify concerning patterns, potential interactions, and safety issues. Be thorough but focused on actionable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Analytics insights error:', error);
      return {
        patterns: [],
        alerts: [],
        summary: "Unable to generate insights due to service error"
      };
    }
  }
}

module.exports = LLMService;
