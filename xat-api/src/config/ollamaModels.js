require('dotenv').config();

module.exports = {
  TEXT_MODEL: process.env.CHAT_API_OLLAMA_MODEL_TEXT || 'llama3.2-vision:latest',
  VISION_MODEL: process.env.CHAT_API_OLLAMA_MODEL_VISION || 'llama3.2-vision:latest'
};