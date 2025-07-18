import Incident from "../models/incident";
import openai from "../config/openai";

class IncidentService {
  async create(userId: string, incidentData: any) {
    return await Incident.create({
      ...incidentData,
      userId
    });
  }

  async update(id: string, updateData: any) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;

    Object.assign(incident, updateData);
    await incident.save();
    return incident;
  }

  async findAllByUser(userId: string) {
    return await Incident.findAll({ where: { userId } });
  }

  async findById(id: string) {
    return await Incident.findByPk(id);
  }

  async generateSummary(id: string) {
    const incident = await Incident.findByPk(id);
    if (!incident) return null;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Given the medical incident description and incident, a summary is required from a medical assistant perspective."
        },
        {
          role: "user",
          content: `Using 2 sentences, summarize the following incident description: \n${incident.description} and ${incident.type}.`
        }
      ],
      temperature: 0.4,
    });

    const summary = response.choices[0].message.content;
    if (summary) {
      await incident.update({ summary });
    }

    return summary;
  }
}

export default new IncidentService();