const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../src/config/database');
const Prompt = require('../src/models/Prompt');
const Conversation = require('../src/models/Conversation');

jest.mock('axios');
const axios = require('axios');

describe('POST /api/chat/prompt', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('hauria de crear una conversa i guardar un prompt amb resposta', async () => {
    axios.post.mockResolvedValue({
      data: { response: 'Resposta simulada d’Ollama' }
    });

    const res = await request(app)
      .post('/api/chat/prompt')
      .send({
        prompt: 'Hola, com estàs?',
        model: 'llama3.2-vision:latest',
        stream: false
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('conversationId');
    expect(res.body).toHaveProperty('promptId');
    expect(res.body.response).toBe('Resposta simulada d’Ollama');

    const prompt = await Prompt.findByPk(res.body.promptId);
    expect(prompt).not.toBeNull();
    expect(prompt.response).toBe('Resposta simulada d’Ollama');

    const conversation = await Conversation.findByPk(res.body.conversationId);
    expect(conversation).not.toBeNull();
  });
});
