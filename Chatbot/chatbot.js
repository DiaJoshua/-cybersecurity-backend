document.addEventListener("DOMContentLoaded", function () {
    const chatboxMessages = document.getElementById("chatbox-messages");
    const sendMessageButton = document.querySelector(".chatbox-footer button");
    const userInput = document.getElementById("user-input");

    let chatbotData = {};
    let datasetLoaded = false;
    let conversationHistory = [];

    // Load Chatbot Dataset
    fetch("../scripts/chatbot_dataset.json")
        .then(response => response.json())
        .then(data => {
            chatbotData = data;
            datasetLoaded = true;
            console.log("✅ Chatbot dataset successfully loaded!");
        })
        .catch(error => {
            console.error("❌ Error loading chatbot dataset:", error);
            chatboxMessages.innerHTML += `<p><strong>Chatbot:</strong> Error loading chatbot data. Please try again later.</p>`;
        });

    function sendMessage() {
        let userQuestion = userInput.value.trim();
        if (userQuestion === "") return;

        chatboxMessages.innerHTML += `<p><strong>You:</strong> ${userQuestion}</p>`;
        userInput.value = "";
        chatboxMessages.innerHTML += `<p id="typing-animation"><em>Chatbot is typing...</em></p>`;
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

        setTimeout(() => {
            document.getElementById("typing-animation").remove();
            let botResponse = getBestMatch(userQuestion) || chatbotData["default"];
            botResponse = formatResponse(botResponse, userQuestion);
            chatboxMessages.innerHTML += `<p><strong>Chatbot:</strong><br>${botResponse.replace(/\n/g, "<br>")}</p>`;
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

            conversationHistory.push(userQuestion);
            if (conversationHistory.length > 5) conversationHistory.shift();
        }, Math.floor(Math.random() * 1000) + 500);
    }

    function getBestMatch(input) {
        input = input.toLowerCase().trim();
        if (!datasetLoaded) return null;

        if (chatbotData[input]) return chatbotData[input];

        let bestMatch = null;
        let highestScore = 0;

        Object.keys(chatbotData).forEach(question => {
            let score = similarityScore(input, question.toLowerCase());
            if (score > highestScore) {
                highestScore = score;
                bestMatch = question;
            }
        });

        return highestScore > 0.45 ? chatbotData[bestMatch] : handleContextualQuestions(input);
    }

    function handleContextualQuestions(input) {
        let lastQuestion = conversationHistory[conversationHistory.length - 1] || "";

        if (input === "yes" || input === "tell me more") {
            return chatbotData[lastQuestion] || "Can you clarify what you want to know more about?";
        }
        if (input.includes("help") || input.includes("assist")) {
            return "I'm here to help! Ask me about online scams, cybercrime laws, or how to report fraud.";
        }
        if (input.includes("example") || input.includes("like what")) {
            return "You can ask me things like 'What is phishing?', 'How do I report a scam?', or 'What are the signs of a fraudulent website?'";
        }
        if (input.includes("explain") && lastQuestion) {
            return `Sure! Let me explain '${lastQuestion}' in a simpler way: ${chatbotData[lastQuestion]}`;
        }
        if (input.includes("joke")) {
            return "😂 Here's one: Why do hackers love dark mode? Because the light theme exposes too much data!";
        }
        if (input.includes("insight") || input.includes("tip")) {
            return "💡 Cybersecurity Tip: Always use multi-factor authentication (MFA) to secure your accounts.";
        }

        return "❓ I didn't quite get that. Could you try rephrasing your question? 😊";
    }

    function formatResponse(response) {
        return response
            // ✅ Convert bullet points
            .replace(/- /g, "✅ ") 
            .replace(/• /g, "✅ ") 
            .replace(/● /g, "✅ ") 
            .replace(/✅/g, "✅ ")
            .replace(/⚠️/g, "⚠️ ")
            .replace(/💡/g, "💡 ")

            // 🔹 Bold key phrases before colons and dashes
            .replace(/(^|\n)([^:\n]+):/g, '$1<strong>$2</strong>:')
            .replace(/(^|\n)([^-\n]+) - /g, '$1<strong>$2</strong> - ')

            // 🔹 Bold numbered lists (1., 2., 3., etc.)
            .replace(/(^|\n)(\d+)\./g, '$1<strong>$2.</strong>')

            // 🔹 Bold specific keywords
            .replace(/(TIP:|Tip:)/g, "<strong>💡 TIP:</strong>")
            .replace(/(WARNING:|Warning:)/g, "<strong>⚠️ WARNING:</strong>")
            .replace(/(NOTE:|Note:)/g, "<strong>📌 NOTE:</strong>")

            .replace(/\n\n/g, "<br><br>")
            .replace(/\n/g, "<br>");
    }

    function similarityScore(str1, str2) {
        let longer = str1.length > str2.length ? str1 : str2;
        let shorter = str1.length > str2.length ? str2 : str1;
        let longerLength = longer.length;
        if (longerLength === 0) return 1.0;
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
        let costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i == 0) costs[j] = j;
                else {
                    if (j > 0) {
                        let newValue = costs[j - 1];
                        if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    sendMessageButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
