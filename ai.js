// ==========================================
// ATOMIA — Assistant IA
// Qwen2.5-0.5B-Instruct
// ==========================================


// Éléments de l'interface
const loadingScreen = document.getElementById("loading-screen");
const chatScreen = document.getElementById("chat-screen");

const loadingText = document.getElementById("loading-text");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

const chatForm = document.getElementById("chat-form");
const questionInput = document.getElementById("question-input");
const messages = document.getElementById("messages");


// Le modèle sera stocké ici
let generator = null;


// ==========================================
// CHARGEMENT DE QWEN
// ==========================================

async function loadAI() {

    try {

        loadingText.textContent =
            "Chargement de l'intelligence artificielle…";


        // On importe Transformers.js directement depuis le CDN
        const { pipeline } =
            await import(
                "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1"
            );


        // Chargement de Qwen
        generator = await pipeline(
            "text-generation",
            "onnx-community/Qwen2.5-0.5B-Instruct",
            {
                dtype: "q4",
                device: "webgpu",

                // Cette fonction reçoit les informations
                // de progression pendant le téléchargement.
                progress_callback: (progress) => {

                    if (progress.status === "progress") {

                        const percent =
                            Math.round(progress.progress);

                        progressBar.style.width =
                            percent + "%";

                        progressText.textContent =
                            percent + " %";

                    }

                    if (progress.status === "initiate") {

                        loadingText.textContent =
                            "Téléchargement du modèle…";

                    }

                    if (progress.status === "done") {

                        loadingText.textContent =
                            "Préparation du modèle…";

                    }
                }
            }
        );


        // Le modèle est prêt
        progressBar.style.width = "100%";
        progressText.textContent = "100 %";

        loadingText.textContent =
            "✓ Modèle prêt";


        // Petite pause pour laisser voir le message
        await new Promise(resolve =>
            setTimeout(resolve, 700)
        );


        // On cache le chargement
        loadingScreen.classList.add("hidden");

        // On affiche le chat
        chatScreen.classList.remove("hidden");

        questionInput.focus();


    } catch (error) {

        console.error(error);

        loadingText.textContent =
            "Impossible de charger l'IA.";

        progressText.textContent =
            "Erreur";

        console.error(
            "Erreur complète :",
            error
        );
    }
}


// ==========================================
// ENVOI D'UNE QUESTION
// ==========================================

chatForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const question =
        questionInput.value.trim();


    // Ne rien faire si la zone est vide
    if (!question) {
        return;
    }


    // Afficher la question de l'utilisateur
    addMessage(
        question,
        "user"
    );


    // Vider la zone de texte
    questionInput.value = "";


    // Désactiver temporairement l'envoi
    questionInput.disabled = true;


    try {

        // Demande envoyée à Qwen
        const output = await generator(
            [
                {
                    role: "system",
                    content:
                        "Tu es l'assistant scientifique d'ATOMIA. " +
                        "Réponds en français de manière claire et concise."
                },
                {
                    role: "user",
                    content: question
                }
            ],
            {
                max_new_tokens: 128
            }
        );


        // Récupération de la réponse
        const answer =
            output[0].generated_text.at(-1).content;


        // Afficher la réponse
        addMessage(
            answer,
            "ai"
        );


    } catch (error) {

        console.error(error);

        addMessage(
            "Une erreur est survenue pendant la génération de la réponse.",
            "ai"
        );
    }


    questionInput.disabled = false;
    questionInput.focus();

});


// ==========================================
// AJOUTER UN MESSAGE AU CHAT
// ==========================================

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.className =
        "message " +
        (type === "ai"
            ? "ai-message"
            : "user-message");


    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        type === "ai"
            ? "🤖 Assistant ATOMIA"
            : "Vous";


    const content =
        document.createElement("div");

    content.className =
        "message-content";

    content.textContent =
        text;


    message.appendChild(name);
    message.appendChild(content);

    messages.appendChild(message);


    // Descendre automatiquement vers
    // le dernier message
    messages.scrollTop =
        messages.scrollHeight;
}


// ==========================================
// DÉMARRAGE
// ==========================================

loadAI();
