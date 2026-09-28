// ==========================================
// HTML ELEMENTS
// ==========================================

const analyzeBtn =
    document.getElementById("analyzeBtn");

const feedbackInput =
    document.getElementById("feedback");

const resultCard =
    document.getElementById("resultCard");

const sentimentResult =
    document.getElementById("sentimentResult");

const confidenceResult =
    document.getElementById("confidenceResult");

const themesResult =
    document.getElementById("themesResult");

const totalCount =
    document.getElementById("totalCount");

const positiveCount =
    document.getElementById("positiveCount");

const neutralCount =
    document.getElementById("neutralCount");

const negativeCount =
    document.getElementById("negativeCount");

const feedbackTable =
    document.getElementById("feedbackTable");

const refreshBtn =
    document.getElementById("refreshBtn");

const characterCount =
    document.getElementById("characterCount");


// Chart objects

let sentimentChart = null;

let themesChart = null;


// ==========================================
// CHARACTER COUNTER
// ==========================================

feedbackInput.addEventListener(
    "input",
    () => {

        characterCount.innerText =
            `${feedbackInput.value.length} / 3000`;

    }
);


// ==========================================
// ANALYZE FEEDBACK
// ==========================================

analyzeBtn.addEventListener(
    "click",
    async () => {

        const feedback =
            feedbackInput.value.trim();


        if (!feedback) {

            alert(
                "Please enter customer feedback."
            );

            feedbackInput.focus();

            return;
        }


        analyzeBtn.disabled = true;

        analyzeBtn.innerText =
            "Analyzing...";


        try {

            const response =
                await fetch(
                    "/analyze",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                feedback: feedback
                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to analyze feedback."
                );

            }


            displayAnalysis(
                data
            );


            // Update everything after analysis

            await Promise.all([

                loadDashboard(),

                loadFeedbackHistory(),

                loadSentimentChart(),

                loadThemesChart()

            ]);


        }

        catch (error) {

            console.error(
                "Analysis Error:",
                error
            );

            alert(
                error.message ||
                "Something went wrong."
            );

        }

        finally {

            analyzeBtn.disabled =
                false;

            analyzeBtn.innerText =
                "Analyze Feedback";

        }

    }
);


// ==========================================
// DISPLAY RESULT
// ==========================================

function displayAnalysis(data) {

    sentimentResult.className = "";


    if (
        data.sentiment === "Positive"
    ) {

        sentimentResult.innerText =
            "😊 Positive";

        sentimentResult.classList.add(
            "positive"
        );

    }

    else if (
        data.sentiment === "Negative"
    ) {

        sentimentResult.innerText =
            "😞 Negative";

        sentimentResult.classList.add(
            "negative"
        );

    }

    else {

        sentimentResult.innerText =
            "😐 Neutral";

        sentimentResult.classList.add(
            "neutral"
        );

    }


    // Sentiment score

    confidenceResult.innerText =
        `${Number(data.confidence).toFixed(2)}%`;


    // Themes

    themesResult.innerHTML = "";


    if (
        Array.isArray(data.themes) &&
        data.themes.length > 0
    ) {

        data.themes.forEach(
            theme => {

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "theme-badge";

                badge.innerText =
                    theme;

                themesResult.appendChild(
                    badge
                );

            }
        );

    }

    else {

        themesResult.innerText =
            "General";

    }


    resultCard.classList.remove(
        "hidden"
    );


    resultCard.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


// ==========================================
// DASHBOARD
// ==========================================

async function loadDashboard() {

    try {

        const response =
            await fetch("/stats");


        if (!response.ok) {

            throw new Error(
                "Unable to load dashboard."
            );

        }


        const data =
            await response.json();


        totalCount.innerText =
            data.total ?? 0;

        positiveCount.innerText =
            data.positive ?? 0;

        neutralCount.innerText =
            data.neutral ?? 0;

        negativeCount.innerText =
            data.negative ?? 0;

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


// ==========================================
// FEEDBACK HISTORY
// ==========================================

async function loadFeedbackHistory() {

    try {

        const response =
            await fetch("/feedback");


        if (!response.ok) {

            throw new Error(
                "Unable to load feedback."
            );

        }


        const feedback =
            await response.json();


        feedbackTable.innerHTML =
            "";


        if (
            !Array.isArray(feedback) ||
            feedback.length === 0
        ) {

            feedbackTable.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        class="empty-message"
                    >

                        No feedback analyzed yet.

                    </td>

                </tr>

            `;

            return;

        }


        // Show latest 10

        feedback
            .slice(0, 10)
            .forEach(
                item => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    // Comment

                    const commentCell =
                        document.createElement(
                            "td"
                        );

                    commentCell.className =
                        "feedback-comment";

                    commentCell.innerText =
                        item.comment;


                    // Sentiment

                    const sentimentCell =
                        document.createElement(
                            "td"
                        );

                    const badge =
                        document.createElement(
                            "span"
                        );

                    badge.classList.add(
                        "table-sentiment"
                    );

                    badge.innerText =
                        item.sentiment;


                    if (
                        item.sentiment ===
                        "Positive"
                    ) {

                        badge.classList.add(
                            "positive"
                        );

                    }

                    else if (
                        item.sentiment ===
                        "Negative"
                    ) {

                        badge.classList.add(
                            "negative"
                        );

                    }

                    else {

                        badge.classList.add(
                            "neutral"
                        );

                    }


                    sentimentCell.appendChild(
                        badge
                    );


                    // Score

                    const scoreCell =
                        document.createElement(
                            "td"
                        );

                    scoreCell.innerText =
                        `${Number(
                            item.confidence
                        ).toFixed(2)}%`;


                    // Themes

                    const themesCell =
                        document.createElement(
                            "td"
                        );

                    themesCell.innerText =
                        item.themes ||
                        "General";


                    // Date

                    const dateCell =
                        document.createElement(
                            "td"
                        );

                    dateCell.innerText =
                        item.created_at;


                    // Add cells

                    row.appendChild(
                        commentCell
                    );

                    row.appendChild(
                        sentimentCell
                    );

                    row.appendChild(
                        scoreCell
                    );

                    row.appendChild(
                        themesCell
                    );

                    row.appendChild(
                        dateCell
                    );


                    feedbackTable.appendChild(
                        row
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Feedback History Error:",
            error
        );

    }

}


// ==========================================
// SENTIMENT CHART
// ==========================================

async function loadSentimentChart() {

    try {

        const response =
            await fetch("/stats");


        if (!response.ok) {

            throw new Error(
                "Unable to load sentiment data."
            );

        }


        const data =
            await response.json();


        const canvas =
            document.getElementById(
                "sentimentChart"
            );


        if (!canvas) {
            return;
        }


        if (sentimentChart) {

            sentimentChart.destroy();

        }


        sentimentChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: [

                            "Positive",

                            "Neutral",

                            "Negative"

                        ],

                        datasets: [{

                            data: [

                                data.positive ?? 0,

                                data.neutral ?? 0,

                                data.negative ?? 0

                            ],

                            backgroundColor: [

                                "#22c55e",

                                "#f59e0b",

                                "#ef4444"

                            ],

                            borderWidth: 0,

                            hoverOffset: 6

                        }]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout: "68%",

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    usePointStyle:
                                        true,

                                    padding: 20

                                }

                            }

                        }

                    }

                }
            );

    }

    catch (error) {

        console.error(
            "Sentiment Chart Error:",
            error
        );

    }

}


// ==========================================
// THEMES CHART
// ==========================================

async function loadThemesChart() {

    try {

        const response =
            await fetch("/themes");


        if (!response.ok) {

            throw new Error(
                "Unable to load themes."
            );

        }


        const data =
            await response.json();


        const labels =
            Object.keys(data);

        const values =
            Object.values(data);


        const canvas =
            document.getElementById(
                "themesChart"
            );


        if (!canvas) {
            return;
        }


        if (themesChart) {

            themesChart.destroy();

        }


        themesChart =
            new Chart(
                canvas,
                {

                    type: "bar",

                    data: {

                        labels: labels,

                        datasets: [{

                            label:
                                "Mentions",

                            data:
                                values,

                            backgroundColor:
                                "#6366f1",

                            borderRadius:
                                7,

                            borderSkipped:
                                false

                        }]

                    },


                    options: {

                        indexAxis:
                            "y",

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        scales: {

                            x: {

                                beginAtZero:
                                    true,

                                ticks: {

                                    precision:
                                        0

                                },

                                grid: {

                                    color:
                                        "#f1f5f9"

                                }

                            },

                            y: {

                                grid: {

                                    display:
                                        false

                                }

                            }

                        },

                        plugins: {

                            legend: {

                                display:
                                    false

                            }

                        }

                    }

                }
            );

    }

    catch (error) {

        console.error(
            "Theme Chart Error:",
            error
        );

    }

}


// ==========================================
// REFRESH ALL DATA
// ==========================================

async function refreshDashboard() {

    await Promise.all([

        loadDashboard(),

        loadFeedbackHistory(),

        loadSentimentChart(),

        loadThemesChart()

    ]);

}


// ==========================================
// REFRESH BUTTON
// ==========================================

refreshBtn.addEventListener(
    "click",
    async () => {

        refreshBtn.disabled =
            true;

        refreshBtn.innerText =
            "Refreshing...";


        await refreshDashboard();


        refreshBtn.disabled =
            false;

        refreshBtn.innerText =
            "↻ Refresh";

    }
);


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await refreshDashboard();

    }
);