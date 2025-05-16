// Importacions
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Constants des de variables d'entorn
const IMAGES_SUBFOLDER = 'imatges/animals';
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif'];
const OLLAMA_URL = process.env.CHAT_API_OLLAMA_URL;
const { VISION_MODEL } = require('../../xat-api/src/config/ollamaModels');
const OLLAMA_MODEL = VISION_MODEL;

// Funció per llegir un fitxer i convertir-lo a Base64
async function imageToBase64(imagePath) {
    try {
        const data = await fs.readFile(imagePath);
        return Buffer.from(data).toString('base64');
    } catch (error) {
        console.error(`Error al llegir la imatge ${imagePath}:`, error.message);
        return null;
    }
}

// Funció per fer la petició a Ollama
async function queryOllama(base64Image) {
    const prompt = `Analitza aquesta imatge i proporciona informació detallada sobre l'animal.
Inclou:
- Nom comú i nom científic
- Classificació taxonòmica (classe, ordre, família)
- Hàbitat (tipus, regió geogràfica, clima)
- Dieta (tipus i aliments principals)
- Característiques físiques (mida, colors, trets distintius)
- Estat de conservació (classificació IUCN, amenaces principals)

Envia la resposta NOMÉS en format JSON, sense escriure res més que el JSON, amb aquest format:
{
    "analisis": [
        {
            "imatge": {
                "nom_fitxer": "nom_del_fitxer.jpg",
            },
            "analisi": {
                "nom_comu": "nom comú de l'animal",
                "nom_cientific": "nom científic si és conegut",
                "taxonomia": {
                    "classe": "mamífer/au/rèptil/amfibi/peix",
                    "ordre": "ordre taxonòmic",
                    "familia": "família taxonòmica"
                },
                "habitat": {
                    "tipus": ["tipus d'hàbitats"],
                    "regioGeografica": ["regions on viu"],
                    "clima": ["tipus de climes"]
                },
                "dieta": {
                    "tipus": "carnívor/herbívor/omnívor",
                    "aliments_principals": ["llista d'aliments"]
                },
                "caracteristiques_fisiques": {
                    "mida": {
                        "altura_mitjana_cm": "altura mitjana",
                        "pes_mitja_kg": "pes mitjà"
                    },
                    "colors_predominants": ["colors"],
                    "trets_distintius": ["característiques"]
                },
                "estat_conservacio": {
                    "classificacio_IUCN": "estat",
                    "amenaces_principals": ["amenaces"]
                }
            }
        }
    ]
}

`;

    const requestBody = {
        model: OLLAMA_MODEL,
        prompt: prompt,
        images: [base64Image],
        stream: false
    };

    try {
        const response = await fetch(`${OLLAMA_URL}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data.response)
        return data.response ? JSON.parse(data.response) : null;
    } catch (error) {
        console.error('Error en la petició a Ollama:', error);
        return null;
    }
}

// Funció principal
async function main() {
    try {
        const imagesFolderPath = path.join(__dirname, process.env.DATA_PATH, IMAGES_SUBFOLDER);
        await fs.access(imagesFolderPath);

        const animalDirectories = await fs.readdir(imagesFolderPath);
        const output = { analisis: [] };

        for (const animalDir of animalDirectories) {
            const animalDirPath = path.join(imagesFolderPath, animalDir);
            const stats = await fs.stat(animalDirPath);
            if (!stats.isDirectory()) continue;

            const imageFiles = await fs.readdir(animalDirPath);
            for (const imageFile of imageFiles) {
                const imagePath = path.join(animalDirPath, imageFile);
                if (!IMAGE_TYPES.includes(path.extname(imagePath).toLowerCase())) continue;

                const base64String = await imageToBase64(imagePath);
                if (!base64String) continue;

                const analysis = await queryOllama(base64String);
                if (analysis) {
                    output.analisis.push({
                        imatge: { nom_fitxer: imageFile },
                        analisi: analysis
                    });
                }
            }
        }

        const outputPath = path.join(__dirname, process.env.DATA_PATH, 'exercici3_resposta.json');
        await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
        console.log(`Resultats guardats a: ${outputPath}`);
    } catch (error) {
        console.error("Error durant l'execució:", error.message);
    }
}

main();
