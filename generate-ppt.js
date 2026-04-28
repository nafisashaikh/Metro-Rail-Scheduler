import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addText("Metro Rail Scheduler", { x: 1, y: 2, w: '80%', h: 1, fontSize: 36, bold: true, align: "center", color: "363636" });
slide1.addText("An Integrated Framework for Real-Time Transit Management", { x: 1, y: 3, w: '80%', h: 1, fontSize: 18, align: "center", color: "666666" });
slide1.addText("Developed for Mumbai Metro & Maharashtra Railway", { x: 1, y: 4, w: '80%', h: 1, fontSize: 14, align: "center", color: "999999" });

// Slide 2: Problem Statement
let slide2 = pptx.addSlide();
slide2.addText("1. Problem Statement", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide2.addText([
    { text: "Current Public Transit Issues:", options: { bullet: true, bold: true } },
    { text: "Legacy infrastructure causing poor schedule adherence", options: { bullet: true, indentLevel: 1 } },
    { text: "Lack of accurate, real-time passenger information", options: { bullet: true, indentLevel: 1 } },
    { text: "Inefficient crisis response mechanisms", options: { bullet: true, indentLevel: 1 } },
    { text: "Administrators lack real-time predictive insights into fleet health", options: { bullet: true, indentLevel: 1 } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 16, color: "363636", lineSpacing: 28 });

// Slide 3: The Solution
let slide3 = pptx.addSlide();
slide3.addText("The Solution: Metro Rail Scheduler", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide3.addText("A modern, scalable software framework that bridges the gap by introducing a unified, full-stack platform capable of processing dynamic transit metrics.", { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: "363636" });
slide3.addText([
    { text: "Enhances commuter experience via an interactive dashboard", options: { bullet: true } },
    { text: "Empowers authorities with a centralized command center", options: { bullet: true } },
    { text: "Leverages decoupled Client-Server architecture", options: { bullet: true } },
    { text: "Provides algorithmic predictive analytics", options: { bullet: true } }
], { x: 0.5, y: 2.8, w: '90%', fontSize: 16, color: "363636", lineSpacing: 28 });

// Slide 4: Passenger Ecosystem
let slide4 = pptx.addSlide();
slide4.addText("Passenger Ecosystem (Frontend)", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide4.addText([
    { text: "Algorithmic Journey Planner:", options: { bullet: true, bold: true } },
    { text: "Optimized routing considering weather and live status", options: { indentLevel: 1 } },
    { text: "Geospatial Tracking:", options: { bullet: true, bold: true } },
    { text: "Interactive satellite mapping via Leaflet", options: { indentLevel: 1 } },
    { text: "Smart Ticketing:", options: { bullet: true, bold: true } },
    { text: "Digital Passenger Pass with secure QR-code", options: { indentLevel: 1 } },
    { text: "Contextual Guides:", options: { bullet: true, bold: true } },
    { text: "Integrated Emergency & Medical routing", options: { indentLevel: 1 } },
    { text: "Sustainability Tracking:", options: { bullet: true, bold: true } },
    { text: "Eco-Stats visualizing carbon emissions saved", options: { indentLevel: 1 } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: "363636", lineSpacing: 20 });

// Slide 5: Command Center
let slide5 = pptx.addSlide();
slide5.addText("Command Center (Admin Portal)", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide5.addText([
    { text: "Predictive Fleet Analytics:", options: { bullet: true, bold: true } },
    { text: "Visualizes fleet health deterioration predictions", options: { indentLevel: 1 } },
    { text: "Dynamic Train Scheduling:", options: { bullet: true, bold: true } },
    { text: "CRUD interface for dispatch and platform assignment", options: { indentLevel: 1 } },
    { text: "Live Crowding Metrics:", options: { bullet: true, bold: true } },
    { text: "Tracks footfall across major hubs for preemptive control", options: { indentLevel: 1 } },
    { text: "Crisis Management:", options: { bullet: true, bold: true } },
    { text: "Global Broadcast system for overriding severity alerts", options: { indentLevel: 1 } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: "363636", lineSpacing: 24 });

// Slide 6: System Architecture
let slide6 = pptx.addSlide();
slide6.addText("System Architecture", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide6.addText([
    { text: "Presentation Layer (React + Vite):", options: { bullet: true, bold: true } },
    { text: "High-performance rendering without page reloads", options: { indentLevel: 1 } },
    { text: "Application Server (Node.js + Express):", options: { bullet: true, bold: true } },
    { text: "RESTful API, role-based JWT auth, Zod validation", options: { indentLevel: 1 } },
    { text: "Data Persistence:", options: { bullet: true, bold: true } },
    { text: "Localized JSON data structures (simulated NoSQL)", options: { indentLevel: 1 } },
    { text: "Algorithmic Simulation:", options: { bullet: true, bold: true } },
    { text: "Seeded deterministic algorithms for transit telemetry", options: { indentLevel: 1 } }
], { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: "363636", lineSpacing: 24 });

// Slide 7: Business Model
let slide7 = pptx.addSlide();
slide7.addText("Business Model & Commercialization", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide7.addText("Hybrid B2G and B2B2C Strategy", { x: 0.5, y: 1.2, w: '90%', fontSize: 16, bold: true, color: "006699" });
slide7.addText([
    { text: "Value Proposition:", options: { bullet: true, bold: true } },
    { text: "Transit Authorities: Reduced overhead, increased fleet lifespan", options: { indentLevel: 1 } },
    { text: "Passengers: Decreased wait times, safer travel, digital convenience", options: { indentLevel: 1 } },
    { text: "Revenue Streams:", options: { bullet: true, bold: true } },
    { text: "Enterprise SaaS Licensing (B2G/B2B)", options: { indentLevel: 1 } },
    { text: "Ticketing Commission (B2C)", options: { indentLevel: 1 } },
    { text: "In-App Sponsorships (Retail/Medical partners)", options: { indentLevel: 1 } }
], { x: 0.5, y: 1.8, w: '90%', fontSize: 14, color: "363636", lineSpacing: 20 });

// Slide 8: Conclusion
let slide8 = pptx.addSlide();
slide8.addText("Conclusion", { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: "003366" });
slide8.addText("The Metro Rail Scheduler demonstrates a forward-thinking paradigm for smart-city public transportation. By integrating predictive maintenance, dynamic scheduling, and commuter-centric features into a single cohesive platform, it offers a viable, commercially sound solution to the escalating challenges of urban mobility.", { x: 0.5, y: 1.5, w: '90%', fontSize: 18, color: "363636", lineSpacing: 24 });
slide8.addText("Thank You", { x: 1, y: 4, w: '80%', fontSize: 28, bold: true, align: "center", color: "003366" });

pptx.writeFile({ fileName: "Metro_Rail_Scheduler_Presentation.pptx" }).then(() => {
    console.log("PPTX created successfully!");
}).catch((err) => {
    console.error("Error creating PPTX:", err);
});
