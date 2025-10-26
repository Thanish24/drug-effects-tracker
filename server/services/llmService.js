const OpenAI = require('openai');

// Use Groq for all LLM functionality
const groq = process.env.GROQ_API_KEY && 
             process.env.GROQ_API_KEY !== 'your_groq_api_key_here' && 
             process.env.GROQ_API_KEY !== 'skip_llm_features' 
  ? new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    })
  : null;

class LLMService {
  static async analyzeSideEffect(sideEffectData) {
    try {
      // Skip LLM analysis if Groq is not configured
      if (!groq) {
        return {
          concernLevel: 'moderate',
          isConcerning: sideEffectData.severity === 'severe' || sideEffectData.severity === 'critical',
          recommendations: ['Consult your healthcare provider'],
          suggestedActions: ['Monitor symptoms'],
          potentialCauses: ['Drug side effect'],
          interactionWarnings: [],
          urgency: sideEffectData.severity === 'severe' ? 'urgent' : 'routine',
          reasoning: 'Basic analysis without LLM'
        };
      }
      
      const { description, severity, impactOnDailyLife, drugName, patientAge, otherMedications } = sideEffectData;

      const prompt = `Analyze this side effect and respond with ONLY valid JSON (no markdown, no explanations):

Side Effect: ${description}
Severity: ${severity}
Impact: ${impactOnDailyLife}
Drug: ${drugName}
Age: ${patientAge || 'Not specified'}
Other Meds: ${otherMedications ? otherMedications.join(', ') : 'None'}

Respond with this exact JSON format:
{
  "concernLevel": "low",
  "isConcerning": false,
  "recommendations": ["consult doctor"],
  "suggestedActions": ["monitor symptoms"],
  "potentialCauses": ["drug side effect"],
  "interactionWarnings": [],
  "urgency": "routine",
  "reasoning": "analysis summary"
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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

      let analysis;
      try {
        // Clean the response to extract JSON
        let content = response.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
          content = content.split('```')[1].split('```')[0];
        }
        
        // Remove any markdown formatting
        content = content.replace(/\*\*/g, '').replace(/\*/g, '');
        
        analysis = JSON.parse(content);
      } catch (parseError) {
        console.log('JSON parse error, using fallback analysis');
        analysis = {
          concernLevel: 'moderate',
          isConcerning: severity === 'severe' || severity === 'critical',
          recommendations: ['Consult your healthcare provider'],
          suggestedActions: ['Monitor symptoms'],
          potentialCauses: ['Drug side effect'],
          interactionWarnings: [],
          urgency: severity === 'severe' ? 'urgent' : 'routine',
          reasoning: 'AI analysis failed, using basic assessment'
        };
      }
      
      // Validate the response structure
      if (!analysis.concernLevel || analysis.isConcerning === undefined) {
        analysis = {
          concernLevel: 'moderate',
          isConcerning: severity === 'severe' || severity === 'critical',
          recommendations: ['Consult your healthcare provider'],
          suggestedActions: ['Monitor symptoms'],
          potentialCauses: ['Drug side effect'],
          interactionWarnings: [],
          urgency: severity === 'severe' ? 'urgent' : 'routine',
          reasoning: 'Invalid AI response, using basic assessment'
        };
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
      // Skip LLM analysis if Groq is not configured
      if (!groq) {
        return {
          hasInteractions: false,
          interactionLevel: 'none',
          description: 'Basic analysis: No LLM available for interaction detection',
          recommendations: ['Consult healthcare provider for drug interaction assessment'],
          confidence: 0.0
        };
      }
      
      const prompt = `Analyze drug interactions and respond with ONLY valid JSON:

Drugs: ${drugs.join(', ')}
Side Effects: ${sideEffects.map(se => `${se.description} (${se.severity})`).join('; ')}

Respond with this exact JSON format:
{
  "hasInteractions": false,
  "interactionType": "none",
  "severity": "minor",
  "description": "no interactions detected",
  "clinicalSignificance": "low",
  "recommendations": ["monitor symptoms"],
  "monitoringRequired": ["watch for changes"],
  "confidence": 0.5
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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

      let analysis;
      try {
        // Clean the response to extract JSON
        let content = response.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
          content = content.split('```')[1].split('```')[0];
        }
        
        // Remove any markdown formatting
        content = content.replace(/\*\*/g, '').replace(/\*/g, '');
        
        analysis = JSON.parse(content);
      } catch (parseError) {
        console.log('Drug interaction JSON parse error, using fallback');
        analysis = {
          hasInteractions: false,
          interactionType: "unknown",
          severity: "minor",
          description: "Unable to parse AI response",
          clinicalSignificance: "low",
          recommendations: ["Consult healthcare provider"],
          monitoringRequired: ["Monitor for unusual symptoms"],
          confidence: 0.0
        };
      }
      
      return analysis;
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
      // Skip LLM analysis if Groq is not configured
      if (!groq) {
        return [
          'Analytics insights require OpenAI API key configuration',
          'Basic analysis: Monitor side effect patterns and trends',
          'Consider consulting healthcare professionals for complex cases'
        ];
      }
      
      const prompt = `Analyze drug data and respond with ONLY valid JSON:

Data: ${JSON.stringify(data, null, 2)}

Respond with this exact JSON format:
{
  "patterns": [],
  "alerts": [],
  "summary": "no significant patterns detected"
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
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

      let analysis;
      try {
        // Clean the response to extract JSON
        let content = response.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
          content = content.split('```')[1].split('```')[0];
        }
        
        // Remove any markdown formatting
        content = content.replace(/\*\*/g, '').replace(/\*/g, '');
        
        analysis = JSON.parse(content);
      } catch (parseError) {
        console.log('Analytics insights JSON parse error, using fallback');
        analysis = {
          patterns: [],
          alerts: [],
          summary: "Unable to parse AI response"
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Analytics insights error:', error);
      return {
        patterns: [],
        alerts: [],
        summary: "Unable to generate insights due to service error"
      };
    }
  }

  static async analyzeDrugInteraction(drug1Name, drug2Name, drug1Description = '', drug2Description = '') {
    try {
      // Skip LLM analysis if Groq is not configured
      if (!groq) {
        return {
          hasInteraction: false,
          severity: 'minor',
          description: 'Basic analysis: No LLM available for interaction detection',
          clinicalEffect: 'Unknown',
          management: 'Consult healthcare provider for drug interaction assessment',
          confidence: 0.0
        };
      }
      
      const prompt = `Analyze potential drug interaction and respond with ONLY valid JSON:

Drug 1: ${drug1Name}
Drug 1 Description: ${drug1Description}

Drug 2: ${drug2Name}
Drug 2 Description: ${drug2Description}

Respond with this exact JSON format:
{
  "hasInteraction": false,
  "severity": "minor",
  "description": "no significant interaction detected",
  "clinicalEffect": "minimal clinical significance",
  "management": "monitor patient",
  "confidence": 0.5
}`;

      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a clinical pharmacist AI assistant specializing in drug interaction analysis. Provide accurate assessments of potential drug interactions based on pharmacological principles. Be conservative in your assessments and always recommend consulting healthcare providers for serious concerns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      let analysis;
      try {
        // Clean the response to extract JSON
        let content = response.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.includes('```json')) {
          content = content.split('```json')[1].split('```')[0];
        } else if (content.includes('```')) {
          content = content.split('```')[1].split('```')[0];
        }
        
        // Remove any markdown formatting
        content = content.replace(/\*\*/g, '').replace(/\*/g, '');
        
        analysis = JSON.parse(content);
      } catch (parseError) {
        console.log('Drug interaction JSON parse error, using fallback');
        analysis = {
          hasInteraction: false,
          severity: "minor",
          description: "Unable to parse AI response",
          clinicalEffect: "Unknown",
          management: "Consult healthcare provider",
          confidence: 0.0
        };
      }
      
      return analysis;
    } catch (error) {
      console.error('Drug interaction analysis error:', error);
      return {
        hasInteraction: false,
        severity: "minor",
        description: "Unable to analyze interaction due to service error",
        clinicalEffect: "Unknown",
        management: "Consult healthcare provider",
        confidence: 0.0
      };
    }
  }
}

module.exports = LLMService;
